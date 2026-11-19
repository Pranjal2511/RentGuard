import { Property } from '../models/Property.js';
import { Lease } from '../models/Lease.js';
import { Room } from '../models/Room.js';

export async function getPropertiesForUser(user) {
  if (user.role === 'landlord' || user.role === 'admin') {
    return Property.find({ ownerId: user._id }).sort({ createdAt: -1 }).lean();
  }

  // Tenant: query leases where tenantId is this user and active
  const leases = await Lease.find({ tenantId: user._id, status: { $in: ['active', 'pending'] } })
    .populate('propertyId')
    .lean();

  // Extract distinct properties
  const propertyMap = new Map();
  leases.forEach((l) => {
    if (l.propertyId && l.propertyId._id) {
      propertyMap.set(String(l.propertyId._id), {
        ...l.propertyId,
        leaseStart: l.startDate,
        leaseEnd: l.endDate,
        monthlyRent: l.monthlyRent,
        deposit: l.securityDeposit,
        leaseStatus: l.status,
      });
    }
  });

  return Array.from(propertyMap.values());
}

export async function getPropertyById(propertyId, user) {
  const property = await Property.findById(propertyId).lean();
  if (!property) return null;

  // Authorization check: landlord owner or tenant with lease
  if (user.role === 'landlord' && String(property.ownerId) !== String(user._id)) {
    const error = new Error('Unauthorized access to this property.');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'tenant') {
    const hasLease = await Lease.exists({ propertyId, tenantId: user._id });
    if (!hasLease && user.role !== 'admin') {
      const error = new Error('Unauthorized access to this property.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Attach active lease info if present
  const activeLease = await Lease.findOne({ propertyId, status: 'active' }).populate('tenantId', 'name email phone avatar').lean();
  if (activeLease) {
    property.activeLease = activeLease;
    property.leaseStart = activeLease.startDate;
    property.leaseEnd = activeLease.endDate;
    property.monthlyRent = activeLease.monthlyRent;
    property.deposit = activeLease.securityDeposit;
    property.tenant = activeLease.tenantId;
  }

  return property;
}

export async function createProperty(data, landlordUser) {
  const newProperty = await Property.create({
    ...data,
    ownerId: landlordUser._id,
  });

  // Automatically create standard default rooms
  const defaultRooms = [
    { name: 'Living Room', roomType: 'living_room', order: 1 },
    { name: 'Master Bedroom', roomType: 'bedroom', order: 2 },
    { name: 'Kitchen', roomType: 'kitchen', order: 3 },
    { name: 'Bathroom', roomType: 'bathroom', order: 4 },
    { name: 'Balcony', roomType: 'balcony', order: 5 },
  ];

  await Room.insertMany(defaultRooms.map((r) => ({ ...r, propertyId: newProperty._id })));

  return newProperty;
}

export async function getRoomsByProperty(propertyId) {
  return Room.find({ propertyId }).sort({ order: 1, name: 1 }).lean();
}

export async function createRoom(propertyId, roomData) {
  return Room.create({ ...roomData, propertyId });
}

