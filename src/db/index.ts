import { Pool } from 'pg';
import { AsyncLocalStorage } from 'async_hooks';

type UserContext = {
  id: string;
};

const userContext = new AsyncLocalStorage<UserContext>();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function withUser<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  return userContext.run({ id: userId }, fn);
}

import { QueryConfig, QueryResult, QueryResultRow } from 'pg';

export async function withTransaction<T>(
  fn: (client: { 
    query: <R extends QueryResultRow = any>(query: string | QueryConfig, values?: any[]) => Promise<QueryResult<R>>
  }) => Promise<T>,
  userId?: string
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Set the current user ID for RLS
    const userIdToSet = userId || userContext.getStore()?.id;
    if (userIdToSet) {
      await client.query(
        `SELECT set_config('app.current_user_id', $1, true)`,
        [userIdToSet]
      );
    }

    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function authenticate(userId: string): Promise<void> {
  return withUser(userId, async () => {
    // Verify user exists (for tests)
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    if (rows.length === 0) {
      throw new Error('User not found');
    }
  });
}
