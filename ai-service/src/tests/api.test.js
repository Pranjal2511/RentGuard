import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp({ secret: 'test-secret' });
const post = (route, body) => request(app).post(`/api/ai/${route}`).set('X-AI-Secret', 'test-secret').send(body);

test('health is public', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'online');
});
test('both endpoints require the correct secret', async () => {
  for (const route of ['compare', 'summarize-inspection']) {
    for (const secret of ['', 'wrong']) {
      const res = await request(app).post(`/api/ai/${route}`).set('X-AI-Secret', secret).send({});
      assert.equal(res.status, 401);
    }
  }
});
for (const [notes, delta, confidence] of [
  ['', 'same', 0.88], [null, 'same', 0.88], ['NAIL holes and stains', 'deterioration', 0.84],
  ['stain and scratch', 'deterioration', 0.81], ['scratches', 'minor_wear', 0.89],
]) {
  test(`comparison preserves heuristic for ${notes}`, async () => {
    const res = await post('compare', { moveOutNotes: notes });
    assert.equal(res.status, 200);
    assert.equal(res.body.delta, delta);
    assert.equal(res.body.confidence, confidence);
    assert.equal(res.body.room, 'General');
    assert.equal(res.body.requiresHumanReview, true);
  });
}
test('summary defaults, explicit counts and item fallback', async () => {
  for (const [body, count, name] of [[{}, 0, 'Move-In'], [{ reportType: 'MOVE_OUT', items: [{ room: 'Kitchen' }] }, 1, 'Move-Out'], [{ evidenceCount: 3, items: [{}] }, 3, 'Move-In'], [{ items: null, reportType: null }, 0, 'Move-Out']]) {
    const res = await post('summarize-inspection', body);
    assert.equal(res.status, 200);
    assert.equal(res.body.itemsAudited, count);
    assert.ok(res.body.summary.startsWith(name));
  }
});
test('invalid fields and missing body are rejected', async () => {
  for (const [route, body] of [['compare', { moveOutNotes: 42 }], ['compare', undefined], ['summarize-inspection', { items: ['invalid'] }], ['summarize-inspection', { evidenceCount: 1.5 }]]) {
    assert.equal((await post(route, body)).status, 422);
  }
});
test('malformed JSON and unknown routes return JSON errors', async () => {
  const res = await request(app).post('/api/ai/compare').set('X-AI-Secret', 'test-secret').set('Content-Type', 'application/json').send('{');
  assert.equal(res.status, 400);
  assert.equal(res.body.detail, 'Invalid JSON body');
  assert.equal((await request(app).get('/missing')).status, 404);
});
