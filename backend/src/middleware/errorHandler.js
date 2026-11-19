import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate entry for ${field}. Value already exists.`,
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for ${err.path}: ${err.value}`,
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload Error: ${err.message}`,
    });
  }

  if (env.isDev) {
    console.error('[RentGuard Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env.isDev ? { stack: err.stack } : {}),
  });
}

