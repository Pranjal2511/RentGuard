import { Dispute } from '../models/Dispute.js';
import { DisputeComment } from '../models/DisputeComment.js';
import { Property } from '../models/Property.js';
import { createNotification } from './notificationService.js';

export async function getDisputes(propertyId, { status } = {}) {
  const filter = {};
  if (propertyId) filter.propertyId = propertyId;
  if (status && status !== 'all') filter.status = status;

  const disputes = await Dispute.find(filter)
    .populate('raisedBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  const disputeIds = disputes.map((d) => d._id);
  const comments = await DisputeComment.find({ disputeId: { $in: disputeIds } })
    .sort({ createdAt: 1 })
    .lean();

  const commentsMap = new Map();
  comments.forEach((c) => {
    const arr = commentsMap.get(String(c.disputeId)) || [];
    arr.push({
      id: c._id,
      userId: c.authorId,
      userName: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    });
    commentsMap.set(String(c.disputeId), arr);
  });

  return disputes.map((d) => ({
    ...d,
    id: d._id,
    comments: commentsMap.get(String(d._id)) || [],
  }));
}

export async function getDisputeById(disputeId) {
  const dispute = await Dispute.findById(disputeId)
    .populate('raisedBy', 'name email role')
    .populate('evidenceIds')
    .lean();

  if (!dispute) return null;

  const comments = await DisputeComment.find({ disputeId: dispute._id })
    .sort({ createdAt: 1 })
    .lean();

  return {
    ...dispute,
    id: dispute._id,
    comments: comments.map((c) => ({
      id: c._id,
      userId: c.authorId,
      userName: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    })),
  };
}

export async function createDispute({ propertyId, title, description, amount, evidenceIds }, user) {
  const dispute = await Dispute.create({
    propertyId,
    title,
    description,
    amount: Number(amount) || 0,
    raisedBy: user._id,
    status: 'pending',
    evidenceIds: evidenceIds || [],
    timeline: [
      {
        event: 'Dispute raised by tenant',
        date: new Date(),
        userId: user._id,
      },
    ],
    raisedAt: new Date(),
  });

  // Notify landlord
  const property = await Property.findById(propertyId);
  if (property && property.ownerId) {
    await createNotification({
      recipientId: property.ownerId,
      type: 'dispute',
      title: 'Dispute / Claim Raised',
      body: `${user.name} raised a claim: "${title}" (₹${amount || 0} at stake)`,
      link: '/landlord/confirmations',
      relatedEntityType: 'Dispute',
      relatedEntityId: dispute._id,
    });
  }

  return {
    ...dispute.toObject(),
    id: dispute._id,
    comments: [],
  };
}

export async function addDisputeComment(disputeId, { text, attachments }, user) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    const error = new Error('Dispute record not found.');
    error.statusCode = 404;
    throw error;
  }

  const comment = await DisputeComment.create({
    disputeId: dispute._id,
    authorId: user._id,
    userName: user.name || 'User',
    text,
    attachments: attachments || [],
  });

  // Notify counterparty
  const property = await Property.findById(dispute.propertyId);
  const recipientId = String(user._id) === String(dispute.raisedBy)
    ? property?.ownerId
    : dispute.raisedBy;

  if (recipientId && String(recipientId) !== String(user._id)) {
    await createNotification({
      recipientId,
      type: 'dispute',
      title: 'New Dispute Response',
      body: `${user.name} added a comment to: "${dispute.title}"`,
      link: user.role === 'landlord' ? `/tenant/disputes/${dispute._id}` : '/landlord/confirmations',
      relatedEntityType: 'Dispute',
      relatedEntityId: dispute._id,
    });
  }

  return {
    id: comment._id,
    userId: comment.authorId,
    userName: comment.userName,
    text: comment.text,
    createdAt: comment.createdAt,
  };
}

export async function respondToDispute(disputeId, responseText, user) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    const error = new Error('Dispute record not found.');
    error.statusCode = 404;
    throw error;
  }

  const snippet = responseText.slice(0, 60) + (responseText.length > 60 ? '...' : '');

  dispute.status = 'disputed';
  dispute.timeline.push({
    event: `Landlord responded: ${snippet}`,
    date: new Date(),
    userId: user._id,
  });

  await dispute.save();

  // Create dispute comment record
  await DisputeComment.create({
    disputeId: dispute._id,
    authorId: user._id,
    userName: user.name || 'Landlord',
    text: responseText,
  });

  // Notify tenant
  if (dispute.raisedBy) {
    await createNotification({
      recipientId: dispute.raisedBy,
      type: 'dispute',
      title: 'Landlord Responded to Dispute',
      body: `${user.name} responded to: "${dispute.title}"`,
      link: `/tenant/disputes/${dispute._id}`,
      relatedEntityType: 'Dispute',
      relatedEntityId: dispute._id,
    });
  }

  return dispute;
}

