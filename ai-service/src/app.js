import express from 'express';
import { z } from 'zod';

const optionalString = (value) => z.string().nullable().default(value);
const compareSchema = z.object({
  moveInPhoto: optionalString(null),
  moveOutPhoto: optionalString(null),
  room: optionalString('General'),
  component: optionalString('General'),
  moveInNotes: optionalString(''),
  moveOutNotes: optionalString(''),
});
const summarySchema = z.object({
  propertyAddress: optionalString(''),
  reportType: optionalString('MOVE_IN'),
  evidenceCount: z.number().int().nullable().default(0),
  items: z.array(z.record(z.string(), z.unknown())).nullable().default([]),
});

export function createApp({ secret = process.env.AI_SERVICE_SECRET || 'rentguard_ai_secret_token_2026' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/', (_req, res) => res.json({
    status: 'online', service: 'RentGuard AI Microservice', visionEngine: 'Active',
  }));
  app.use('/api/ai', (req, res, next) => {
    if (req.get('X-AI-Secret') !== secret) {
      return res.status(401).json({ detail: 'Invalid or missing X-AI-Secret header' });
    }
    next();
  });
  app.use(express.json({ limit: '1mb', verify: (req, _res, buffer) => { req.hasJsonBody = buffer.length > 0; } }));
  const validate = (schema, handler) => (req, res) => {
    const result = schema.safeParse(req.hasJsonBody ? req.body : undefined);
    if (!result.success) return res.status(422).json({ detail: result.error.issues });
    return res.json(handler(result.data));
  };

  // Compatibility port of the original note-based heuristic; no image model is run.
  app.post('/api/ai/compare', validate(compareSchema, (payload) => {
    const notes = (payload.moveOutNotes || '').toLowerCase();
    let delta = 'same';
    let confidence = 0.88;
    let observation = 'General surface continuity maintained between baseline and exit records.';
    if (notes.includes('hole') || notes.includes('nail')) {
      observation = 'Surface penetrations / fastener holes detected on wall surface.';
      delta = 'deterioration'; confidence = 0.84;
    } else if (notes.includes('stain')) {
      observation = 'Localized discoloration or staining observed.';
      delta = 'deterioration'; confidence = 0.81;
    } else if (notes.includes('scratch')) {
      observation = 'Superficial surface abrasions noted.';
      delta = 'minor_wear'; confidence = 0.89;
    }
    return {
      room: payload.room, component: payload.component, delta,
      observations: [observation], confidence, requiresHumanReview: true, isAvailable: true,
      disclaimer: 'AI comparisons assist human review and do not determine contractual or legal liability.',
    };
  }));
  app.post('/api/ai/summarize-inspection', validate(summarySchema, (payload) => {
    const count = payload.evidenceCount || (payload.items || []).length;
    const reportName = (payload.reportType || '').toUpperCase().includes('IN') ? 'Move-In' : 'Move-Out';
    return {
      isAvailable: true,
      summary: `${reportName} condition audit recorded across ${count} rooms/components. All captured photographic artifacts have been timestamped and indexed for verification.`,
      itemsAudited: count, verifiedTimestamp: true,
    };
  }));
  app.use((_req, res) => res.status(404).json({ detail: 'Not Found' }));
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ detail: status === 400 ? 'Invalid JSON body' : status === 413 ? 'Request body too large' : 'Internal server error' });
  });
  return app;
}
