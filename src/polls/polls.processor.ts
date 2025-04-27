import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GeneratePollDto, RequestPollDto } from './dto/create-poll.dto';
import { GoogleGenAI, Type } from '@google/genai';
import { connectionRedis, QueueName } from 'src/configs/redis.config';

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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Create a poll about "${messagePrompt}" with exactly ${numberQuestion} questions. 
      Each question should have 3-5 answer options. 
      Generate a clear, engaging title for the poll and make sure each question is relevant to the topic.
      The questions should be diverse and cover different aspects of the topic.
      Each answer option should be concise and distinct from others.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Title of the poll',
              nullable: false,
            },
            questions: {
              type: Type.ARRAY,
              description: 'List of questions with options',
              minItems: numberQuestion.toString(),
              maxItems: numberQuestion.toString(),
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: 'The question text',
                    nullable: false,
                  },
                  options: {
                    type: Type.ARRAY,
                    description: 'List of possible answer options',
                    minItems: '3',
                    maxItems: '5',
                    items: {
                      type: Type.STRING,
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

    if (!response.text) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response.text) as RequestPollDto;
  }
}
