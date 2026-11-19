import {
  getPropertiesForUser,
  getPropertyById,
  createProperty,
  getRoomsByProperty,
  createRoom,
} from '../services/propertyService.js';
import { logAuditEvent } from '../services/auditService.js';

export async function getProperties(req, res, next) {
  try {
    const properties = await getPropertiesForUser(req.user);
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProperty(req, res, next) {
  try {
    const property = await getPropertyById(req.params.propertyId, req.user);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
}

export async function postProperty(req, res, next) {
  try {
    const property = await createProperty(req.body, req.user);

    await logAuditEvent({
      actorId: req.user._id,
      action: 'PROPERTY_CREATE',
      entityType: 'Property',
      entityId: property._id,
      metadata: { address: property.address },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRooms(req, res, next) {
  try {
    const rooms = await getRoomsByProperty(req.params.propertyId);
    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
}

export async function postRoom(req, res, next) {
  try {
    const room = await createRoom(req.params.propertyId, req.body);
    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
}

