// Simple job queue stub for build
export interface SampleJobData {
  message: string;
  userId?: string;
}

export async function addSampleJob(data: SampleJobData) {
  console.log('Would add sample job:', data);
  return { id: 'stub-job-id' };
}

export async function getQueueHealth() {
  return {
    queue: 'ai-app-platform',
    counts: {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    },
    connection: 'ready',
  };
}
