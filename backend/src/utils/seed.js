import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { Lease } from '../models/Lease.js';
import { Room } from '../models/Room.js';
import { ConditionReport } from '../models/ConditionReport.js';
import { Evidence } from '../models/Evidence.js';
import { MaintenanceIssue } from '../models/MaintenanceIssue.js';
import { MaintenanceComment } from '../models/MaintenanceComment.js';
import { Dispute } from '../models/Dispute.js';
import { DisputeComment } from '../models/DisputeComment.js';
import { Deposit } from '../models/Deposit.js';
import { Document } from '../models/Document.js';
import { Notification } from '../models/Notification.js';

const wallPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><path d='M40 220 L160 140 L240 190 L320 120 L360 160 L360 260 L40 260 Z' fill='%23EAF3EC'/><circle cx='100' cy='80' r='25' fill='%23D8D4C9'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%237A7A70' text-anchor='middle'>North Wall — Clean Condition</text></svg>`;
const fanPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><circle cx='200' cy='140' r='24' fill='%23183B32'/><path d='M200 140 L120 70 M200 140 L280 70 M200 140 L200 230' stroke='%2324352E' stroke-width='8' stroke-linecap='round'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%237A7A70' text-anchor='middle'>Ceiling Fan Inspection</text></svg>`;
const nailHolesPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><circle cx='170' cy='130' r='3' fill='%23B5533C'/><circle cx='230' cy='135' r='3' fill='%23B5533C'/><circle cx='200' cy='133' r='45' fill='none' stroke='%23B5533C' stroke-width='1.5' stroke-dasharray='4'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%23B5533C' text-anchor='middle'>East Wall — 2 Minor Nail Holes</text></svg>`;

export async function seedDatabase() {
  console.log('[Seed] Starting RentGuard database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Lease.deleteMany({}),
    Room.deleteMany({}),
    ConditionReport.deleteMany({}),
    Evidence.deleteMany({}),
    MaintenanceIssue.deleteMany({}),
    MaintenanceComment.deleteMany({}),
    Dispute.deleteMany({}),
    DisputeComment.deleteMany({}),
    Deposit.deleteMany({}),
    Document.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. Seed Users
  const tenant = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    passwordHash: defaultPasswordHash,
    role: 'tenant',
    isEmailVerified: true,
  });

  const landlord = await User.create({
    name: 'Rajan Mehta',
    email: 'rajan@example.com',
    phone: '+91 98123 45678',
    passwordHash: defaultPasswordHash,
    role: 'landlord',
    isEmailVerified: true,
  });

  console.log(`[Seed] Created users: ${tenant.name} (Tenant), ${landlord.name} (Landlord)`);

  // 2. Seed Properties
  const prop1 = await Property.create({
    name: 'Bougainvillea Haven',
    address: '42 Bougainvillea Lane, Indiranagar, Bengaluru 560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    propertyType: '2BHK Apartment',
    floor: '3rd Floor',
    description: 'Bright and airy 2BHK with modern amenities, wooden flooring, and garden view balcony.',
    ownerId: landlord._id,
    monthlyRent: 28000,
    deposit: 84000,
    status: 'active',
  });

  const prop2 = await Property.create({
    name: 'Koramangala Studio',
    address: '15 Koramangala 5th Block, Bengaluru 560095',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560095',
    propertyType: '1BHK Studio',
    floor: '1st Floor',
    description: 'Compact studio flat in prime location close to tech parks.',
    ownerId: landlord._id,
    monthlyRent: 18000,
    deposit: 54000,
    status: 'vacant',
  });

  console.log(`[Seed] Created properties: ${prop1.address}, ${prop2.address}`);

  // 3. Seed Lease
  const lease1 = await Lease.create({
    propertyId: prop1._id,
    tenantId: tenant._id,
    landlordId: landlord._id,
    startDate: new Date('2026-04-01T00:00:00.000Z'),
    endDate: new Date('2027-03-31T23:59:59.000Z'),
    monthlyRent: 28000,
    securityDeposit: 84000,
    currency: 'INR',
    status: 'active',
  });

  // 4. Seed Rooms for prop1
  const roomsData = [
    { name: 'Living Room', roomType: 'living_room', order: 1, propertyId: prop1._id },
    { name: 'Master Bedroom', roomType: 'bedroom', order: 2, propertyId: prop1._id },
    { name: 'Bedroom 2', roomType: 'bedroom', order: 3, propertyId: prop1._id },
    { name: 'Kitchen', roomType: 'kitchen', order: 4, propertyId: prop1._id },
    { name: 'Bathroom 1', roomType: 'bathroom', order: 5, propertyId: prop1._id },
    { name: 'Bathroom 2', roomType: 'bathroom', order: 6, propertyId: prop1._id },
    { name: 'Balcony', roomType: 'balcony', order: 7, propertyId: prop1._id },
  ];
  const rooms = await Room.insertMany(roomsData);

  // 5. Seed Condition Reports
  const moveInReport = await ConditionReport.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    submittedBy: tenant._id,
    reportType: 'MOVE_IN',
    status: 'CONFIRMED',
    summary: 'Comprehensive move-in condition documentation completed upon handover.',
    submittedAt: new Date('2026-04-01T10:00:00.000Z'),
    reviewedAt: new Date('2026-04-02T15:00:00.000Z'),
    reviewedBy: landlord._id,
  });

  // 6. Seed Evidence Records
  const ev1 = await Evidence.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    reportId: moveInReport._id,
    roomId: rooms[0]._id, // Living room
    type: 'move-in',
    component: 'walls',
    condition: 'good',
    notes: 'Walls freshly painted, minor scuff near entrance door.',
    photos: [
      { url: wallPhotoSvg, caption: 'North wall', takenAt: new Date('2026-04-01T10:00:00Z'), uploadedBy: tenant._id },
      { url: fanPhotoSvg, caption: 'Ceiling fan', takenAt: new Date('2026-04-01T10:05:00Z'), uploadedBy: tenant._id },
    ],
    createdBy: tenant._id,
    confirmationStatus: 'confirmed',
  });

  const ev2 = await Evidence.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    reportId: moveInReport._id,
    roomId: rooms[1]._id, // Master bedroom
    type: 'move-in',
    component: 'flooring',
    condition: 'good',
    notes: 'New flooring, no damage observed.',
    photos: [
      { url: fanPhotoSvg, caption: 'Ceiling Fan Inspection', takenAt: new Date('2026-04-01T11:00:00Z'), uploadedBy: tenant._id },
    ],
    createdBy: tenant._id,
    confirmationStatus: 'confirmed',
  });

  // Move-out evidence for living room
  const ev3 = await Evidence.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    roomId: rooms[0]._id, // Living room
    type: 'move-out',
    component: 'walls',
    condition: 'fair',
    notes: 'Two small nail holes on east wall. Carpet has light staining.',
    photos: [
      { url: nailHolesPhotoSvg, caption: 'East wall close-up', takenAt: new Date('2026-09-15T09:00:00Z'), uploadedBy: tenant._id },
    ],
    createdBy: tenant._id,
    confirmationStatus: 'pending',
  });

  // 7. Seed Maintenance Issues & Comments
  const maint1 = await MaintenanceIssue.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    roomId: rooms[4]._id,
    title: 'Bathroom tap dripping constantly',
    description: 'The hot water tap in Bathroom 1 has been dripping for two weeks. Water wastage is noticeable.',
    category: 'plumbing',
    priority: 'high',
    status: 'open',
    reportedAt: new Date('2026-08-10T08:00:00Z'),
    createdBy: tenant._id,
  });

  await MaintenanceComment.create({
    issueId: maint1._id,
    userId: landlord._id,
    userName: landlord.name,
    text: 'Will send a plumber by Thursday.',
    createdAt: new Date('2026-08-11T10:00:00Z'),
  });

  const maint2 = await MaintenanceIssue.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    roomId: rooms[2]._id,
    title: 'Bedroom 2 ceiling fan making noise',
    description: 'The ceiling fan wobbles and makes a rattling noise at medium and high speed.',
    category: 'electrical',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Electrician',
    reportedAt: new Date('2026-07-20T09:00:00Z'),
    createdBy: tenant._id,
  });

  await MaintenanceComment.create({
    issueId: maint2._id,
    userId: landlord._id,
    userName: landlord.name,
    text: 'Electrician will visit on 25th July.',
    createdAt: new Date('2026-07-22T11:00:00Z'),
  });

  await MaintenanceComment.create({
    issueId: maint2._id,
    userId: tenant._id,
    userName: tenant.name,
    text: 'Is there an update? No one came on 25th.',
    createdAt: new Date('2026-07-26T08:00:00Z'),
  });

  // 8. Seed Disputes & Comments
  const disp1 = await Dispute.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    title: 'Deduction for nail holes claimed excessive',
    description: 'Landlord is claiming ₹8,000 for two small nail holes in the living room. Standard repair cost is under ₹500.',
    amount: 8000,
    status: 'disputed',
    raisedBy: tenant._id,
    timeline: [
      { event: 'Dispute raised by tenant', date: new Date('2026-09-20T10:00:00Z'), userId: tenant._id },
      { event: 'Landlord notified', date: new Date('2026-09-20T10:05:00Z'), userId: null },
      { event: 'Landlord responded: Deduction is for complete wall repainting', date: new Date('2026-09-22T14:00:00Z'), userId: landlord._id },
    ],
    raisedAt: new Date('2026-09-20T10:00:00Z'),
  });

  await DisputeComment.create({
    disputeId: disp1._id,
    authorId: tenant._id,
    userName: tenant.name,
    text: "I've attached photos showing the holes are minor. Requesting reconsideration.",
    createdAt: new Date('2026-09-20T10:30:00Z'),
  });

  await DisputeComment.create({
    disputeId: disp1._id,
    authorId: landlord._id,
    userName: landlord.name,
    text: 'The wall paint is damaged beyond spot repair. Full repaint required.',
    createdAt: new Date('2026-09-22T14:00:00Z'),
  });

  const disp2 = await Dispute.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    title: 'Carpet cleaning deduction',
    description: '₹3,500 deducted for carpet cleaning. Carpet was in similar condition at move-in per evidence report.',
    amount: 3500,
    status: 'pending',
    raisedBy: tenant._id,
    timeline: [
      { event: 'Dispute raised by tenant', date: new Date('2026-09-21T11:00:00Z'), userId: tenant._id },
      { event: 'Awaiting landlord response', date: new Date('2026-09-21T11:05:00Z'), userId: null },
    ],
    raisedAt: new Date('2026-09-21T11:00:00Z'),
  });

  // 9. Seed Security Deposit
  await Deposit.create({
    propertyId: prop1._id,
    leaseId: lease1._id,
    totalDeposit: 84000,
    currency: 'INR',
    deductions: [
      { reason: 'Nail holes in living room wall', amount: 8000, status: 'disputed', disputeId: disp1._id },
      { reason: 'Carpet cleaning', amount: 3500, status: 'pending', disputeId: disp2._id },
    ],
    totalDeducted: 11500,
    refundAmount: 72500,
    status: 'disputed',
  });

  // 10. Seed Documents
  await Document.insertMany([
    {
      propertyId: prop1._id,
      leaseId: lease1._id,
      name: 'Lease Agreement - 42 Bougainvillea',
      type: 'lease',
      fileType: 'pdf',
      size: '1.2 MB',
      url: '/uploads/documents/lease_agreement_signed.pdf',
      uploadedBy: landlord._id,
      uploadedAt: new Date('2026-04-01T08:00:00Z'),
    },
    {
      propertyId: prop1._id,
      leaseId: lease1._id,
      name: 'Move-In Condition Report',
      type: 'condition_report',
      fileType: 'pdf',
      size: '3.4 MB',
      url: '/uploads/documents/move_in_report_certified.pdf',
      uploadedBy: tenant._id,
      uploadedAt: new Date('2026-04-01T14:00:00Z'),
    },
    {
      propertyId: prop1._id,
      leaseId: lease1._id,
      name: 'Rent Receipts - April 2026',
      type: 'receipt',
      fileType: 'pdf',
      size: '0.3 MB',
      url: '/uploads/documents/rent_receipt_apr2026.pdf',
      uploadedBy: landlord._id,
      uploadedAt: new Date('2026-05-05T10:00:00Z'),
    },
  ]);

  // 11. Seed Notifications
  await Notification.insertMany([
    {
      recipientId: tenant._id,
      type: 'dispute',
      title: 'Landlord responded to your dispute',
      body: 'Rajan Mehta has replied to: Deduction for nail holes claimed excessive',
      read: false,
      link: `/tenant/disputes/${disp1._id}`,
      createdAt: new Date('2026-09-22T14:05:00Z'),
    },
    {
      recipientId: tenant._id,
      type: 'maintenance',
      title: 'Maintenance issue updated',
      body: 'Status changed to In Progress: Bedroom 2 ceiling fan making noise',
      read: false,
      link: '/tenant/maintenance',
      createdAt: new Date('2026-07-22T11:05:00Z'),
    },
    {
      recipientId: landlord._id,
      type: 'dispute',
      title: 'New Dispute Raised',
      body: 'Priya Sharma raised a dispute for: Carpet cleaning deduction (₹3,500)',
      read: false,
      link: '/landlord/confirmations',
      createdAt: new Date('2026-09-21T11:05:00Z'),
    },
  ]);

  console.log('[Seed] Database successfully seeded with full rental lifecycle data!');
  await disconnectDB();
}

// Auto-run if executed directly via node src/utils/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

