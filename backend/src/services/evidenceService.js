import { Evidence } from '../models/Evidence.js';
import { EvidenceReview } from '../models/EvidenceReview.js';
import { createNotification } from './notificationService.js';
import { Property } from '../models/Property.js';

export async function getEvidenceByProperty(propertyId, { roomId, type } = {}) {
  const filter = { propertyId };
  if (roomId) filter.roomId = roomId;
  if (type) filter.type = type;

  return Evidence.find(filter)
    .populate('roomId', 'name roomType order')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createEvidenceEntry({ propertyId, roomId, type, condition, notes, component, photos, createdBy }) {
  const evidence = await Evidence.create({
    propertyId,
    roomId,
    type: type || 'move-in',
    condition: condition || 'good',
    component: component || 'general',
    notes: notes || '',
    photos: (photos || []).map((p, idx) => ({
      url: p.url,
      caption: p.caption || p.name || `Photo ${idx + 1}`,
      takenAt: p.takenAt || new Date(),
      uploadedBy: createdBy,
    })),
    createdBy,
    confirmationStatus: 'pending',
  });

  // Notify landlord of new inspection evidence
  const property = await Property.findById(propertyId);
  if (property && property.ownerId && String(property.ownerId) !== String(createdBy)) {
    await createNotification({
      recipientId: property.ownerId,
      type: 'inspection',
      title: 'New Inspection Evidence Submitted',
      body: `New ${type || 'move-in'} condition report added for inspection.`,
      link: '/landlord/confirmations',
      relatedEntityType: 'Evidence',
      relatedEntityId: evidence._id,
    });
  }

  return evidence;
}

export async function reviewEvidence(evidenceId, { decision, reason }, reviewer) {
  const evidence = await Evidence.findById(evidenceId);
  if (!evidence) {
    const error = new Error('Evidence record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!decision || typeof decision !== 'string') {
    const error = new Error('A review decision (confirmed or flagged) is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedDecision = decision.toLowerCase() === 'confirmed' ? 'confirmed' : 'flagged';
  evidence.confirmationStatus = normalizedDecision;
  await evidence.save();

  await EvidenceReview.create({
    evidenceId: evidence._id,
    reviewerId: reviewer._id,
    decision: normalizedDecision.toUpperCase(),
    reason: reason || '',
  });

  // Notify submitting tenant
  if (evidence.createdBy) {
    await createNotification({
      recipientId: evidence.createdBy,
      type: 'inspection',
      title: normalizedDecision === 'confirmed' ? 'Inspection Evidence Approved' : 'Inspection Evidence Flagged',
      body: normalizedDecision === 'confirmed'
        ? 'Your landlord reviewed and confirmed your property evidence.'
        : `Your landlord flagged an item: ${reason || 'Requires discussion'}`,
      link: '/tenant/move-in',
      relatedEntityType: 'Evidence',
      relatedEntityId: evidence._id,
    });
  }

  return evidence;
}

