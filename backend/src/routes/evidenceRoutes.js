import express from 'express';
import { getEvidence, createEvidence, reviewEvidence } from '../controllers/evidenceController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { uploadEvidencePhotos } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getEvidence);
router.post('/', uploadEvidencePhotos.array('photos', 10), createEvidence);
router.patch('/:evidenceId/status', requireRole('landlord', 'admin'), reviewEvidence);
router.post('/:evidenceId/reviews', requireRole('landlord', 'admin'), reviewEvidence);

export default router;

