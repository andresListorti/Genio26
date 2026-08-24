import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('[error]', err);
  // In production, hide raw error.message from the response — it can leak
  // internal details (Firestore/gRPC errors, file paths, third-party SDK
  // internals). The full error is still logged above and captured by Sentry.
  // In dev, keep exposing it since it speeds up debugging.
  const message =
    env.nodeEnv === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';
  res.status(500).json({ error: message });
}
