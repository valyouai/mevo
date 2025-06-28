import { Router } from 'express';
import { pool, withTransaction } from '../db';
import { authMiddleware } from '../middleware/auth';
import { Transcript } from '../types';

function toCamel<T extends Record<string, any>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).map(([key, val]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      val
    ])
  ) as T;
}

const router = Router();

router.use(authMiddleware);

// Create new transcript
router.post('/', async (req, res) => {
  const { rawTranscript, title, advancedFields } = req.body;
  const userId = req.user!.id;

  if (!rawTranscript) {
    return res.status(400).json({
      success: false,
      message: 'rawTranscript is required'
    });
  }

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query<{ id: string }>({
        text: `
        INSERT INTO transcripts (
          user_id,
          raw_transcript,
          title,
          advanced_fields
        ) VALUES ($1, $2, $3, $4)
        RETURNING id`,
        values: [
          userId,
          rawTranscript,
          title || null,
          advancedFields || {}
        ]
      }
      );
      return rows[0];
    });

    return res.status(201).json({
      success: true,
      message: 'Transcript created',
      id: result.id
    });
  } catch (err: any) {
    if (err.code === '42501') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Row Level Security violation'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create transcript'
    });
  }
});

// Get single transcript
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query<Transcript>({
        text: `SELECT * FROM transcripts WHERE id = $1 AND user_id = $2`,
        values: [id, userId]
      });
      return rows;
    }, userId);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    const transcript = toCamel(result[0]);
    return res.json({
      success: true,
      message: 'Transcript retrieved',
      data: transcript
    });
  } catch (err: any) {
    if (err.code === '42501') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Row Level Security violation'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to get transcript'
    });
  }
});

// List transcripts
router.get('/', async (req, res) => {
  const userId = req.user!.id;

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query<Transcript>({
        text: `
          SELECT id, title, hook, timestamp 
          FROM transcripts 
          WHERE user_id = $1
          ORDER BY timestamp DESC`,
        values: [userId]
      });
      return rows;
    }, userId);

    const data = result.map(toCamel);
    return res.json({
      success: true,
      message: 'Transcripts retrieved',
      data
    });
  } catch (err: any) {
    if (err.code === '42501') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Row Level Security violation'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to list transcripts'
    });
  }
});

export default router;
