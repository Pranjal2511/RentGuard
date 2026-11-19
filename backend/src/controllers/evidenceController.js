import { getEvidenceByProperty, createEvidenceEntry, reviewEvidence as reviewEvidenceService } from '../services/evidenceService.js';
import { logAuditEvent } from '../services/auditService.js';

export async function getEvidence(req, res, next) {
  try {
    const propertyId = req.query.propertyId || req.params.propertyId;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId query parameter required' });
    }

    const evidence = await getEvidenceByProperty(propertyId, {
      roomId: req.query.roomId,
      type: req.query.type,
    });

    res.status(200).json({
      success: true,
      data: evidence,
    });
  } catch (err) {
    next(err);
  }
}

export async function createEvidence(req, res, next) {
  try {
    const { propertyId, roomId, type, condition, notes, component } = req.body;

    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map((file, idx) => ({
        url: `/uploads/evidence/${file.filename}`,
        caption: file.originalname,
        takenAt: new Date(),
        uploadedBy: req.user._id,
      }));
    } else if (req.body.photos && Array.isArray(req.body.photos)) {
      photos = req.body.photos;
    }

    const evidence = await createEvidenceEntry({
      propertyId,
      roomId,
      type: type || 'move-in',
      condition: condition || 'good',
      component: component || 'general',
      notes: notes || '',
      photos,
      createdBy: req.user._id,
    });

    await logAuditEvent({
      actorId: req.user._id,
      action: 'EVIDENCE_UPLOAD',
      entityType: 'Evidence',
      entityId: evidence._id,
      metadata: { propertyId, roomId, condition, photoCount: photos.length },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Evidence submitted successfully',
      data: evidence,
      evidence,
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewEvidence(req, res, next) {
  try {
    const { decision, reason } = req.body;
    const evidence = await reviewEvidenceService(
      req.params.evidenceId,
      { decision: decision || req.body.status, reason },
      req.user
    );

    await logAuditEvent({
      actorId: req.user._id,
      action: 'EVIDENCE_REVIEW',
      entityType: 'Evidence',
      entityId: evidence._id,
      metadata: { decision, reason },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Evidence marked as ${evidence.confirmationStatus}`,
      data: evidence,
    });
  } catch (err) {
    next(err);
  }
}

