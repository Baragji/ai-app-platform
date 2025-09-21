// Real job queue implementation using packages/jobs
import { 
  addSampleJob as addSampleJobImpl, 
  getQueueHealth as getQueueHealthImpl,
  type SampleJobData as SampleJobDataImpl 
} from '@ai-app-platform/jobs';

export interface SampleJobData extends SampleJobDataImpl {}

export async function addSampleJob(data: SampleJobData) {
  try {
    const job = await addSampleJobImpl(data);
    console.log(`✅ Added job ${job.id} to queue: ${data.message}`);
    return job;
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    throw error;
  }
}

export async function getQueueHealth() {
  try {
    return await getQueueHealthImpl();
  } catch (error) {
    console.error('Failed to get queue health:', error);
    // Return fallback status on error
    return {
      queue: 'ai-app-platform',
      counts: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      connection: 'error',
    };
  }
}
