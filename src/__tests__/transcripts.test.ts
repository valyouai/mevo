import request from 'supertest';
import app from '../server';
import { TEST_USER_ID } from './setup';
import { pool } from '../db';

describe('POST /api/transcripts', () => {
  const testTranscript = {
    rawTranscript: 'This is a test transcript',
    title: 'Test Transcript',
    advancedFields: {
      tags: ['test', 'demo'],
      problem: 'Testing the API',
      solution: 'Implement proper tests'
    }
  };

  afterAll(async () => {
    await pool.query('DELETE FROM transcripts WHERE user_id = $1', [TEST_USER_ID]);
  });

  it('should create a new transcript', async () => {
    const response = await request(app)
      .post('/api/transcripts')
      .set('x-test-user-id', '11111111-1111-1111-1111-111111111111')
      .send(testTranscript);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'Transcript created',
      id: expect.any(String)
    });

    // Verify the transcript can be retrieved
    const getResponse = await request(app)
      .get(`/api/transcripts/${response.body.id}`)
      .set('x-test-user-id', '11111111-1111-1111-1111-111111111111');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data).toMatchObject({
      id: response.body.id,
      title: testTranscript.title,
      rawTranscript: testTranscript.rawTranscript
    });
  });

  it('should enforce RLS policies', async () => {
    // Create a transcript as test user
    const createResponse = await request(app)
      .post('/api/transcripts')
      .set('x-test-user-id', '11111111-1111-1111-1111-111111111111')
      .send(testTranscript);

    // Try to access it as a different user
    const getResponse = await request(app)
      .get(`/api/transcripts/${createResponse.body.id}`)
      .set('x-test-user-id', '22222222-2222-2222-2222-222222222222');

    expect(getResponse.status).toBe(404);
  });

  it('should require rawTranscript', async () => {
    const response = await request(app)
      .post('/api/transcripts')
      .set('x-test-user-id', '11111111-1111-1111-1111-111111111111')
      .send({
        title: 'Invalid transcript',
        advancedFields: {}
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('rawTranscript is required');
  });
});
