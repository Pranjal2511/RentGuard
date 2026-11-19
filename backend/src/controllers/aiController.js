import { compareInspectionPhotos, generateInspectionSummary } from '../services/aiService.js';

export async function compare(req, res, next) {
  try {
    const result = await compareInspectionPhotos(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function summarize(req, res, next) {
  try {
    const result = await generateInspectionSummary(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

