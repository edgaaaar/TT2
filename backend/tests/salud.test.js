import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { sequelize } from '../src/config/db.js';

const app = createApp();

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/v1/salud', () => {
  it('responde 200 con la base de datos disponible', async () => {
    const res = await request(app).get('/api/v1/salud');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ estado: 'ok', bd: 'ok' });
  });

  it('aplica cabeceras de seguridad de Helmet y oculta X-Powered-By', async () => {
    const res = await request(app).get('/api/v1/salud');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Errores', () => {
  it('devuelve 404 con formato uniforme', async () => {
    const res = await request(app).get('/api/v1/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.codigo).toBe('NO_ENCONTRADO');
  });

  it('rechaza JSON malformado con 400', async () => {
    const res = await request(app).post('/api/v1/salud').set('Content-Type', 'application/json').send('{"a":');
    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('JSON_INVALIDO');
  });
});
