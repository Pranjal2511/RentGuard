import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { UPLOAD_DIRS, initStorage } from '../config/storage.js';

initStorage();

function createStorage(subDirectory) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = subDirectory || UPLOAD_DIRS.evidence;
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${Date.now()}-${uniqueSuffix}-${sanitizedBase}${ext}`);
    },
  });
}

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed.'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and images are allowed for documents.'));
  }
};

export const uploadEvidencePhotos = multer({
  storage: createStorage(UPLOAD_DIRS.evidence),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
});

export const uploadPropertyDocument = multer({
  storage: createStorage(UPLOAD_DIRS.documents),
  fileFilter: documentFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 5,
  },
});

export const uploadPropertyImages = multer({
  storage: createStorage(UPLOAD_DIRS.properties),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 8,
  },
});

