#!/usr/bin/env node

import { createWorker } from './index';

async function main() {
  console.log('🚀 Starting job worker...');
  
  const worker = createWorker();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down worker...');
    await worker.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down worker...');
    await worker.close();
    process.exit(0);
  });
  
  console.log('✅ Worker started and listening for jobs');
}

main().catch((error) => {
  console.error('❌ Failed to start worker:', error);
  process.exit(1);
});