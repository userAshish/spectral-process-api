import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);

  // Handle multer file upload errors
  if (err.message.includes('Only JSON and YAML files are allowed')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.message.includes('File too large')) {
    return res.status(413).json({
      error: 'File too large',
      message: 'Maximum file size is 5MB',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle validation errors
  if (err.message.includes('Validation failed')) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Generic error handler
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
};
