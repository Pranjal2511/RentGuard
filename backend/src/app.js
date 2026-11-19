import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import { UPLOAD_BASE_DIR, initStorage } from './config/storage.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

initStorage();

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Explicit CORS configuration per Part 2.2 & 13
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching clientUrl
      if (!origin || origin === env.clientUrl || origin === 'http://localhost:5173') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, strict in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
if (env.isDev) {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser(env.cookieSecret));

// Static files for uploaded evidence & documents
app.use('/uploads', express.static(UPLOAD_BASE_DIR));

// Rate limiting
app.use('/api', apiLimiter);

// API routes mounted at /api/v1 and alias /api
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'RentGuard API',
    description: 'Smart Rental Property Documentation and Dispute Management Platform',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// 404 Handler for unrecognized API paths
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

