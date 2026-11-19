import express from 'express';
import authRoutes from './authRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import evidenceRoutes from './evidenceRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import depositRoutes from './depositRoutes.js';
import documentRoutes from './documentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/disputes', disputeRoutes);
router.use('/deposit', depositRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'RentGuard Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;

