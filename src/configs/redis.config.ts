import { ConnectionOptions } from 'bullmq';

export const connectionRedis: ConnectionOptions = {
  host: 'pollify-redis',
  port: 6379,
};

export enum QueueName {
  POLL_AI = 'pollAi',
}
