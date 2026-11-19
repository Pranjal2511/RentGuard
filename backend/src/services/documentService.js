import { Document } from '../models/Document.js';
import { Property } from '../models/Property.js';
import { createNotification } from './notificationService.js';

export async function getDocuments(propertyId, { type, search } = {}) {
  const filter = {};
  if (propertyId) filter.propertyId = propertyId;
  if (type && type !== 'all') filter.type = type;
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const docs = await Document.find(filter)
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((d) => ({
    ...d,
    id: d._id,
  }));
}

export async function createDocument({ propertyId, name, type, fileType, url, size, fileSizeBytes }, user) {
  const doc = await Document.create({
    propertyId,
    name,
    type: type || 'lease',
    fileType: fileType || 'pdf',
    url,
    size: size || '1.0 MB',
    fileSizeBytes: fileSizeBytes || 0,
    uploadedBy: user._id,
    uploadedAt: new Date(),
  });

  // Notify counterparty
  const property = await Property.findById(propertyId);
  const recipientId = String(user._id) === String(property?.ownerId)
    ? null // Landlord uploaded: we can notify active tenant
    : property?.ownerId;

  if (recipientId) {
    await createNotification({
      recipientId,
      type: 'document',
      title: 'New Document Uploaded',
      body: `${user.name} shared a document: "${name}"`,
      link: '/documents',
      relatedEntityType: 'Document',
      relatedEntityId: doc._id,
    });
  }

  return {
    ...doc.toObject(),
    id: doc._id,
  };
}

export async function deleteDocument(documentId, user) {
  const doc = await Document.findById(documentId);
  if (!doc) {
    const error = new Error('Document not found.');
    error.statusCode = 404;
    throw error;
  }

  if (String(doc.uploadedBy) !== String(user._id) && user.role !== 'admin') {
    const error = new Error('Unauthorized to delete this document.');
    error.statusCode = 403;
    throw error;
  }

  await doc.deleteOne();
  return { success: true };
}

