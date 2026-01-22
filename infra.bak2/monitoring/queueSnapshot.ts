// We'll need to import these from your existing infrastructure
// Using relative paths

export async function snapshotQueues() {
  return {
    redis: await getRedisQueueStatus(),
    memory: getMemoryQueueStatus()
  }
}

async function getRedisQueueStatus() {
  try {
    // Import from the eventBus directory - note the singleton pattern
    const { eventQueue } = await import('../eventBus/queue')
    
    // Check if Redis queue is being used
    const queueType = (eventQueue as any).getQueueType ? 
      (eventQueue as any).getQueueType() : 'unknown';
    
    if (queueType === 'redis') {
      const stats = await eventQueue.getQueueStats()
      if (stats) {
        return { 
          size: stats.pending || 0, 
          deadLetter: stats.deadLetter || 0 
        }
      }
    }
  } catch (error) {
    // Redis queue not available or not enabled
    console.warn('Could not get Redis queue status:', error)
  }
  return undefined;
}

function getMemoryQueueStatus() {
  try {
    // Import from the eventBus directory
    const { eventQueue } = require('../eventBus/queue')
    
    // Check if memory queue is being used
    const queueType = eventQueue.getQueueType ? 
      eventQueue.getQueueType() : 'unknown';
    
    if (queueType === 'in-memory') {
      const stats = eventQueue.getQueueStats()
      if (stats) {
        return { 
          size: stats.pending || 0, 
          deadLetter: stats.deadLetter || 0 
        }
      }
    }
  } catch (error) {
    // Memory queue not available
    console.warn('Could not get memory queue status:', error)
  }
  return { size: 0, deadLetter: 0 }
}
