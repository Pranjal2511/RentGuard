import { MaintenanceIssue } from '../models/MaintenanceIssue.js';
import { MaintenanceComment } from '../models/MaintenanceComment.js';
import { Property } from '../models/Property.js';
import { createNotification } from './notificationService.js';

export async function getMaintenanceIssues(propertyId, { status, priority, category } = {}) {
  const filter = { propertyId };
  if (status && status !== 'all') filter.status = status;
  if (priority && priority !== 'all') filter.priority = priority;
  if (category && category !== 'all') filter.category = category;

  const issues = await MaintenanceIssue.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  // Populate comments for each issue
  const issueIds = issues.map((i) => i._id);
  const comments = await MaintenanceComment.find({ issueId: { $in: issueIds } })
    .sort({ createdAt: 1 })
    .lean();

  const commentsMap = new Map();
  comments.forEach((c) => {
    const arr = commentsMap.get(String(c.issueId)) || [];
    arr.push({
      id: c._id,
      userId: c.userId,
      userName: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    });
    commentsMap.set(String(c.issueId), arr);
  });

  return issues.map((issue) => ({
    ...issue,
    id: issue._id,
    comments: commentsMap.get(String(issue._id)) || [],
  }));
}

export async function createMaintenanceIssue({ propertyId, roomId, title, description, category, priority, attachments }, user) {
  const issue = await MaintenanceIssue.create({
    propertyId,
    roomId: roomId || null,
    title,
    description: description || '',
    category: category || 'general',
    priority: priority || 'medium',
    status: 'open',
    createdBy: user._id,
    attachments: attachments || [],
    reportedAt: new Date(),
  });

  // Notify landlord
  const property = await Property.findById(propertyId);
  if (property && property.ownerId && String(property.ownerId) !== String(user._id)) {
    await createNotification({
      recipientId: property.ownerId,
      type: 'maintenance',
      title: 'New Maintenance Request',
      body: `${user.name} reported: "${title}" (${priority || 'medium'} priority)`,
      link: '/landlord/dashboard',
      relatedEntityType: 'MaintenanceIssue',
      relatedEntityId: issue._id,
    });
  }

  return {
    ...issue.toObject(),
    id: issue._id,
    comments: [],
  };
}

export async function addMaintenanceComment(issueId, { text, attachments }, user) {
  const issue = await MaintenanceIssue.findById(issueId);
  if (!issue) {
    const error = new Error('Maintenance issue not found.');
    error.statusCode = 404;
    throw error;
  }

  const comment = await MaintenanceComment.create({
    issueId: issue._id,
    userId: user._id,
    userName: user.name || 'User',
    text,
    attachments: attachments || [],
  });

  // Notify the other party
  const property = await Property.findById(issue.propertyId);
  const recipientId = String(user._id) === String(issue.createdBy)
    ? property?.ownerId
    : issue.createdBy;

  if (recipientId && String(recipientId) !== String(user._id)) {
    await createNotification({
      recipientId,
      type: 'maintenance',
      title: 'New Maintenance Update',
      body: `${user.name} commented on: "${issue.title}"`,
      link: user.role === 'landlord' ? '/tenant/maintenance' : '/landlord/dashboard',
      relatedEntityType: 'MaintenanceIssue',
      relatedEntityId: issue._id,
    });
  }

  return {
    id: comment._id,
    userId: comment.userId,
    userName: comment.userName,
    text: comment.text,
    createdAt: comment.createdAt,
  };
}

export async function updateMaintenanceStatus(issueId, { status, assignedTo, resolutionNotes }, user) {
  const issue = await MaintenanceIssue.findById(issueId);
  if (!issue) {
    const error = new Error('Maintenance issue not found.');
    error.statusCode = 404;
    throw error;
  }

  const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  if (status && !allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (status) issue.status = status;
  if (assignedTo !== undefined) issue.assignedTo = assignedTo;
  if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
  if (status === 'resolved' || status === 'closed') {
    issue.resolvedAt = new Date();
  }

  await issue.save();

  // Notify tenant
  if (issue.createdBy && String(issue.createdBy) !== String(user._id)) {
    await createNotification({
      recipientId: issue.createdBy,
      type: 'maintenance',
      title: 'Maintenance Status Updated',
      body: `Status changed to ${(status || issue.status).replace('_', ' ').toUpperCase()}: "${issue.title}"`,
      link: '/tenant/maintenance',
      relatedEntityType: 'MaintenanceIssue',
      relatedEntityId: issue._id,
    });
  }

  return issue;
}

