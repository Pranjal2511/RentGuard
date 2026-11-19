import express from 'express';
import { getDeposit, postDeduction } from '../controllers/depositController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/:propertyId', getDeposit);
router.post('/:propertyId/deductions', postDeduction);

export default router;

