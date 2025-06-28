import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.headers['x-test-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - Missing user ID'
    });
  }

  try {
    await authenticate(userId);
    req.user = { id: userId };
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - Invalid user'
    });
  }
}
