import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';

export async function listNotifications(req, res, next) {
  try {
    const unreadOnly = req.query.filter === 'unread';
    const notifications = await getUserNotifications(req.user._id, { unreadOnly });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    await markAsRead(req.params.notificationId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await markAllAsRead(req.user._id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
}

