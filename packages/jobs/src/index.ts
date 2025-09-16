import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Get config directly from environment
const config = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Create Redis connection
const connection = new Redis(config.REDIS_URL);

// Job types
export interface SampleJobData {
  message: string;
  userId?: string;
}

export interface JobTypes {
  'sample-job': SampleJobData;
}

// Create queue
export const jobQueue = new Queue('ai-app-platform', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job processors
const jobProcessors = {
  'sample-job': async (job: Job<SampleJobData>) => {
    console.log(`Processing sample job: ${job.data.message}`);

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(
      `Completed sample job for user: ${job.data.userId || 'anonymous'}`
    );

    return {
      success: true,
      processedAt: new Date().toISOString(),
      message: job.data.message,
    };
  },
};

// Worker instance (singleton)
let worker: Worker | null = null;

export function createWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    'ai-app-platform',
    async (job) => {
      const processor = jobProcessors[job.name as keyof JobTypes];
      if (!processor) {
        throw new Error(`No processor found for job type: ${job.name}`);
      }
      return await processor(job as any);
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} (${job?.name}) failed:`, err.message);
  });

  return worker;
}

// Helper functions
export async function addSampleJob(data: SampleJobData) {
  return await jobQueue.add('sample-job', data);
}

export async function getQueueHealth() {
  const waiting = await jobQueue.getWaiting();
  const active = await jobQueue.getActive();
  const completed = await jobQueue.getCompleted();
  const failed = await jobQueue.getFailed();

  return {
    queue: 'ai-app-platform',
    counts: {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    },
    connection: connection.status,
  };
}

// Cleanup function
export async function closeConnections() {
  if (worker) {
    await worker.close();
  }
  await jobQueue.close();
  connection.disconnect();
}
