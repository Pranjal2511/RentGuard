import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentguard',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'rentguard_jwt_access_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'rentguard_jwt_refresh_secret_key_2026',
  cookieSecret: process.env.COOKIE_SECRET || 'rentguard_cookie_signing_secret_key_2026',
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiServiceSecret: process.env.AI_SERVICE_SECRET || 'rentguard_ai_secret_token_2026',
};

