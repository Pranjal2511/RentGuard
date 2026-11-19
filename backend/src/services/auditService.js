import { AuditEvent } from '../models/AuditEvent.js';

export async function logAuditEvent({ actorId, action, entityType, entityId, metadata = {}, req }) {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers['user-agent'] || '';

    await AuditEvent.create({
      actorId,
      action,
      entityType,
      entityId: String(entityId || ''),
      metadata,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
    });
  } catch (err) {
    console.warn('[Audit Log Warning] Failed to record audit event:', err.message);
  }
}

