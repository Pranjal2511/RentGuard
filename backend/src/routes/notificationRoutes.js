import express from 'express';
import {
  listNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:notificationId/read', markRead);

export default router;

