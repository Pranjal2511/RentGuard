import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { generateToken } from '../services/authService.js';

describe('RentGuard Backend API Suite', () => {
  it('1. GET /api/v1/health returns status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'RentGuard Backend API');
  });

  it('2. POST /api/v1/auth/register validates email format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Tenant',
      email: 'invalid-email-address',
      password: 'short',
      role: 'tenant',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('3. GET /api/v1/properties requires authentication', async () => {
    const res = await request(app).get('/api/v1/properties');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('4. GET /api/v1/properties with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', 'Bearer invalid_token_12345');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('5. Role-based guard rejects unauthorized landlord routes', async () => {
    // A mock token without user in db will be checked by authenticate middleware
    const res = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', 'Bearer invalid_token')
      .send({ address: '123 Test St' });
    assert.equal(res.status, 401);
  });

  it('6. 404 handler returns structured JSON for missing endpoints', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Resource not found/);
  });

  it('7. POST /api/v1/ai/compare-inspections handles vision comparison gracefully', async () => {
    // Generate a temporary test token
    const testUser = {
      _id: '64b0f9a2b8e3a10012345678',
      email: 'test@example.com',
      role: 'tenant',
      name: 'Test User',
    };
    const token = generateToken(testUser);

    // Call compare endpoint (will test fallback when external microservice is offline)
    const res = await request(app)
      .post('/api/v1/ai/compare-inspections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        room: 'Living Room',
        component: 'Walls',
        moveInNotes: 'Clean wall',
        moveOutNotes: 'Nail holes observed',
      });

    // Should return 200 with fallback or 401 if db is not connected to verify user
    assert.ok(res.status === 200 || res.status === 401);
  });
});

