import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GeneratePollDto, RequestPollDto } from './dto/create-poll.dto';
import { connectionRedis, QueueName } from 'src/configs/redis.config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as https from 'https';

@Processor(QueueName.POLL_AI, {
  connection: connectionRedis,
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 4200,
  },
})
export class AiConsumer extends WorkerHost {
  async process(job: Job<GeneratePollDto>): Promise<RequestPollDto> {
    const { messagePrompt, numberQuestion } = job.data;

    const aiProxyUrl = process.env.AI_PROXY_URL;
    const apiKey = process.env.GEMINI_API_KEY;

    const agent = aiProxyUrl ? new HttpsProxyAgent(aiProxyUrl) : undefined;
    console.log('Using proxy:', aiProxyUrl || 'none');

    const requestData = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Create a poll about "${messagePrompt}" with exactly ${numberQuestion} questions. 
            Each question should have 3-5 answer options. 
            Generate a clear, engaging title for the poll and make sure each question is relevant to the topic.
            The questions should be diverse and cover different aspects of the topic.
            Each answer option should be concise and distinct from others.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the poll',
            },
            questions: {
              type: 'array',
              description: 'List of questions with options',
              minItems: numberQuestion,
              maxItems: numberQuestion,
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'The question text',
                  },
                  options: {
                    type: 'array',
                    description: 'List of possible answer options',
                    minItems: 3,
                    maxItems: 5,
                    items: {
                      type: 'string',
                    },
                  },
                },
                required: ['text', 'options'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
          },
          ...(agent && { agent }),
        },
        (res) => {
          console.log('"response" event!', res.statusCode, res.headers);

          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              if (res.statusCode !== 200) {
                reject(
                  new Error(
                    `AI API error: ${res.statusCode} ${res.statusMessage}`,
                  ),
                );
                return;
              }

              const responseData = JSON.parse(data);

              if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
                reject(new Error('No response from AI'));
                return;
              }

              const result = JSON.parse(
                responseData.candidates[0].content.parts[0].text,
              ) as RequestPollDto;
              resolve(result);
            } catch (error) {
              reject(new Error(error));
            }
          });
        },
      );

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(requestData);
      req.end();
    });
  }
}
