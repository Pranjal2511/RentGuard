import { getDepositSummary, addDeduction } from '../services/depositService.js';

export async function getDeposit(req, res, next) {
  try {
    const deposit = await getDepositSummary(req.params.propertyId);
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit summary not found' });
    }
    res.status(200).json({
      success: true,
      data: deposit,
    });
  } catch (err) {
    next(err);
  }
}

export async function postDeduction(req, res, next) {
  try {
    const deposit = await addDeduction(req.params.propertyId, req.body);
    res.status(201).json({
      success: true,
      data: deposit,
    });
  } catch (err) {
    next(err);
  }
}

