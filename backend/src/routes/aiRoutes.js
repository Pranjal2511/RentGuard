import express from 'express';
import { compare, summarize } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.post('/compare-inspections', compare);
router.post('/generate-inspection-summary', summarize);

export default router;

