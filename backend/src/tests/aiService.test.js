import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../../../ai-service/src/app.js';
import { env } from '../config/env.js';
import { compareInspectionPhotos, generateInspectionSummary } from '../services/aiService.js';

test('backend client integrates with the Node service and falls back on failure', async () => {
  const server = createApp({ secret: env.aiServiceSecret }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const originalUrl = env.aiServiceUrl;
  const originalSecret = env.aiServiceSecret;
  env.aiServiceUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const comparison = await compareInspectionPhotos({ room: 'Kitchen', moveOutNotes: 'Stained counter' });
    assert.equal(comparison.isAvailable, true);
    assert.equal(comparison.delta, 'deterioration');
    assert.equal(comparison.room, 'Kitchen');
    const summary = await generateInspectionSummary({ reportType: 'MOVE_OUT', evidenceCount: 2 });
    assert.equal(summary.itemsAudited, 2);
    assert.match(summary.summary, /^Move-Out/);
    env.aiServiceSecret = 'incorrect';
    assert.equal((await compareInspectionPhotos({})).isAvailable, false);
    assert.equal((await generateInspectionSummary({})).isAvailable, false);
    await new Promise((resolve) => server.close(resolve));
    assert.equal((await compareInspectionPhotos({})).requiresHumanReview, true);
    assert.equal((await generateInspectionSummary({})).isAvailable, false);
  } finally {
    env.aiServiceUrl = originalUrl;
    env.aiServiceSecret = originalSecret;
    if (server.listening) await new Promise((resolve) => server.close(resolve));
  }
});
