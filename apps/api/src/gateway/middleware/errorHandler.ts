import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] [${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  if (err.details) {
    console.error(`[DETAILS]`, JSON.stringify(err.details, null, 2));
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: message,
    details: err.details || null,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
