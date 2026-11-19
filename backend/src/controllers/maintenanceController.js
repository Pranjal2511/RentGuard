import {
  getMaintenanceIssues,
  createMaintenanceIssue,
  addMaintenanceComment,
  updateMaintenanceStatus,
} from '../services/maintenanceService.js';
import { logAuditEvent } from '../services/auditService.js';

export async function getIssues(req, res, next) {
  try {
    const propertyId = req.query.propertyId || req.params.propertyId;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId is required' });
    }

    const issues = await getMaintenanceIssues(propertyId, req.query);
    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (err) {
    next(err);
  }
}

export async function createIssue(req, res, next) {
  try {
    const issue = await createMaintenanceIssue(req.body, req.user);

    await logAuditEvent({
      actorId: req.user._id,
      action: 'MAINTENANCE_CREATE',
      entityType: 'MaintenanceIssue',
      entityId: issue.id,
      metadata: { title: issue.title, priority: issue.priority },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance issue reported successfully',
      data: issue,
      issue,
    });
  } catch (err) {
    next(err);
  }
}

export async function postComment(req, res, next) {
  try {
    const comment = await addMaintenanceComment(req.params.issueId, req.body, req.user);

    res.status(201).json({
      success: true,
      data: comment,
      comment,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const updated = await updateMaintenanceStatus(req.params.issueId, req.body, req.user);

    await logAuditEvent({
      actorId: req.user._id,
      action: 'MAINTENANCE_STATUS_UPDATE',
      entityType: 'MaintenanceIssue',
      entityId: updated._id,
      metadata: { status: req.body.status },
      req,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

