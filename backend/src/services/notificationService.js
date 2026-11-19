import { Notification } from '../models/Notification.js';

export async function createNotification({ recipientId, type, title, body, link, relatedEntityType, relatedEntityId }) {
  try {
    return await Notification.create({
      recipientId,
      type: type || 'system',
      title,
      body,
      link: link || '',
      relatedEntityType: relatedEntityType || '',
      relatedEntityId: relatedEntityId ? String(relatedEntityId) : '',
      read: false,
    });
  } catch (err) {
    console.warn('[Notification Warning] Failed to dispatch notification:', err.message);
    return null;
  }
}

export async function getUserNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
  const query = { recipientId: userId };
  if (unreadOnly) {
    query.read = false;
  }
  return Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { read: true },
    { new: true }
  );
}

export async function markAllAsRead(userId) {
  return Notification.updateMany({ recipientId: userId, read: false }, { read: true });
}

