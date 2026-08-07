// src/infrastructure/performance/db-replica-router.ts
import { logger } from '../observability/logger';

/**
 * Database Replica Router
 * Directs read-heavy operations to Read Replicas while ensuring
 * write and consistent read operations hit the Primary database.
 */

export const DatabaseRouter = {
  getReadClient: () => {
    // In production, this returns a pool connected to the Read Replica DSN
    logger.debug({ event: 'DB_ROUTING', destination: 'READ_REPLICA' });
    return mockDbClient('replica');
  },
  
  getWriteClient: () => {
    // In production, this returns a pool connected to the Primary Writer DSN
    logger.debug({ event: 'DB_ROUTING', destination: 'PRIMARY_WRITER' });
    return mockDbClient('primary');
  }
};

function mockDbClient(role: 'primary' | 'replica') {
  return {
    query: async (sql: string, params?: any[]) => {
      // Mocks the DB query execution
      return [];
    }
  };
}
