import express from 'express';
import {
  listDocuments,
  uploadDoc,
  removeDocument,
  downloadDoc,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadPropertyDocument } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listDocuments);
router.post('/', uploadPropertyDocument.single('file'), uploadDoc);
router.delete('/:documentId', removeDocument);
router.get('/:documentId/download', downloadDoc);

export default router;

