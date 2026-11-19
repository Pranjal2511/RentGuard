import express from 'express';
import {
  getProperties,
  getProperty,
  postProperty,
  getRooms,
  postRoom,
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getProperties);
router.post('/', requireRole('landlord', 'admin'), postProperty);
router.get('/:propertyId', getProperty);
router.get('/:propertyId/rooms', getRooms);
router.post('/:propertyId/rooms', requireRole('landlord', 'admin'), postRoom);

export default router;

