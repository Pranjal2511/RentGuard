import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_BASE_DIR = path.resolve(__dirname, '../../uploads');

export const UPLOAD_DIRS = {
  evidence: path.join(UPLOAD_BASE_DIR, 'evidence'),
  documents: path.join(UPLOAD_BASE_DIR, 'documents'),
  properties: path.join(UPLOAD_BASE_DIR, 'properties'),
  avatars: path.join(UPLOAD_BASE_DIR, 'avatars'),
};

export function initStorage() {
  if (!fs.existsSync(UPLOAD_BASE_DIR)) {
    fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
  }
  Object.values(UPLOAD_DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

