import { Request, Response, NextFunction } from 'express';

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
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
}
