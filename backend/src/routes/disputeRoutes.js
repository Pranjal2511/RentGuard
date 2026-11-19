import express from 'express';
import {
  listDisputes,
  getDispute,
  postDispute,
  postComment,
  respond,
} from '../controllers/disputeController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listDisputes);
router.post('/', postDispute);
router.get('/:disputeId', getDispute);
router.post('/:disputeId/comments', postComment);
router.post('/:disputeId/respond', respond);

export default router;

