// [DATA PROVENANCE]
// Data Source: apps/api/src/index.ts
// Classification: INTEGRATION SMOKE TEST (API Health & Gateway Routing)
// Citations: WEFES Nepal System Architecture & Gateway Specification

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('API Gateway Smoke Tests', () => {
  it('GET /health returns 200 and operational status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBeDefined();
    expect(Array.isArray(res.body.domains)).toBe(true);
    expect(res.body.domains.length).toBeGreaterThanOrEqual(4);
  });

  it('GET /unknown-route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/non-existent-domain');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(404);
  });
});
