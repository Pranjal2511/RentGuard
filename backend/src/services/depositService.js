import { Deposit } from '../models/Deposit.js';
import { Property } from '../models/Property.js';

export async function getDepositSummary(propertyId) {
  let deposit = await Deposit.findOne({ propertyId }).lean();

  if (!deposit) {
    const property = await Property.findById(propertyId).lean();
    if (!property) return null;

    const newDeposit = await Deposit.create({
      propertyId: property._id,
      totalDeposit: property.deposit || 84000,
      deductions: [],
      totalDeducted: 0,
      refundAmount: property.deposit || 84000,
    });
    return newDeposit.toObject();
  }

  // Ensure computed fields are accurate
  const totalDeducted = (deposit.deductions || []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const refundAmount = Math.max(0, deposit.totalDeposit - totalDeducted);

  return {
    ...deposit,
    id: deposit._id,
    totalDeducted,
    refundAmount,
  };
}

export async function addDeduction(propertyId, { reason, amount, status, disputeId }) {
  let deposit = await Deposit.findOne({ propertyId });

  if (!deposit) {
    const property = await Property.findById(propertyId);
    deposit = await Deposit.create({
      propertyId,
      totalDeposit: property?.deposit || 84000,
      deductions: [],
    });
  }

  deposit.deductions.push({
    reason,
    amount: Number(amount) || 0,
    status: status || 'pending',
    disputeId: disputeId || null,
  });

  deposit.recalculate();
  await deposit.save();
  return deposit;
}

