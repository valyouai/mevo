import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { pool } from '../db';
import * as dbmigrate from 'db-migrate';

const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

async function setupTestDatabase() {
  // First ensure Postgres recognizes the RLS parameter
  await pool.query(`ALTER DATABASE ${process.env.TEST_DB_NAME} SET app.current_user_id = ''`);

  if (process.env.SKIP_MIGRATIONS !== 'true') {
    const dbmigrateInstance = dbmigrate.getInstance(true, {
      config: {
        test: {
          driver: 'pg',
          user: process.env.TEST_DB_USER,
          password: process.env.TEST_DB_PASSWORD,
          host: process.env.TEST_DB_HOST,
          database: process.env.TEST_DB_NAME,
          port: process.env.TEST_DB_PORT
        }
      },
      env: 'test'
    });
    await dbmigrateInstance.up();
  }

  // Set test user context and verify user exists
  await pool.query('SET app.current_user_id = $1', [TEST_USER_ID]);
  const { rows } = await pool.query(
    'SELECT 1 FROM users WHERE id = $1 LIMIT 1',
    [TEST_USER_ID]
  );
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO users (id, email) 
       VALUES ($1, 'testuser@example.com')`,
      [TEST_USER_ID]
    );
  }
}

async function globalSetup() {
  try {
    await setupTestDatabase();
    console.log('Test database setup complete');
  } catch (err) {
    console.error('Test database setup failed:', err);
    process.exit(1);
  }
}

async function globalTeardown() {
  try {
    await pool.end();
  } catch (err) {
    console.error('Failed to clean up database pool:', err);
  }
}

test('setup verifies database connection', async () => {
  expect(process.env.DATABASE_URL).toBeDefined();
  expect(process.env.TEST_DB_NAME).toBeDefined();
});

export { 
  TEST_USER_ID,
  globalSetup,
  globalTeardown 
};
