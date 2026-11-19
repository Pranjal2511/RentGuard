import express from 'express';
import {
  getIssues,
  createIssue,
  postComment,
  updateStatus,
} from '../controllers/maintenanceController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getIssues);
router.post('/', createIssue);
router.post('/:issueId/comments', postComment);
router.patch('/:issueId/status', updateStatus);

export default router;

