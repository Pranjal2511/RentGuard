import {
  getDisputes,
  getDisputeById,
  createDispute,
  addDisputeComment,
  respondToDispute,
} from '../services/disputeService.js';
import { logAuditEvent } from '../services/auditService.js';

export async function listDisputes(req, res, next) {
  try {
    const propertyId = req.query.propertyId || req.params.propertyId;
    const disputes = await getDisputes(propertyId, req.query);
    res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDispute(req, res, next) {
  try {
    const dispute = await getDisputeById(req.params.disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute record not found',
      });
    }
    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
}

export async function postDispute(req, res, next) {
  try {
    const dispute = await createDispute(req.body, req.user);

    await logAuditEvent({
      actorId: req.user._id,
      action: 'DISPUTE_RAISE',
      entityType: 'Dispute',
      entityId: dispute.id,
      metadata: { title: dispute.title, amount: dispute.amount },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully',
      data: dispute,
      dispute,
    });
  } catch (err) {
    next(err);
  }
}

export async function postComment(req, res, next) {
  try {
    const comment = await addDisputeComment(req.params.disputeId, req.body, req.user);
    res.status(201).json({
      success: true,
      data: comment,
      comment,
    });
  } catch (err) {
    next(err);
  }
}

export async function respond(req, res, next) {
  try {
    const { responseText } = req.body;
    if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
      return res.status(400).json({ success: false, message: 'responseText is required' });
    }
    const dispute = await respondToDispute(req.params.disputeId, responseText, req.user);

    await logAuditEvent({
      actorId: req.user._id,
      action: 'DISPUTE_RESPOND',
      entityType: 'Dispute',
      entityId: dispute._id,
      metadata: { snippet: responseText.slice(0, 50) },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Response posted successfully',
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
}

