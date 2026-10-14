import { Router } from 'express';
import { sequelize } from '../../config/db.js';
import { registerOpenApi } from '../../openapi/registry.js';

export const saludRouter = Router();

// Verificación de disponibilidad para monitoreo y despliegue (RNF-010).
saludRouter.get('/', async (_req, res) => {
  let bd = 'ok';
  try {
    await sequelize.authenticate();
  } catch {
    bd = 'sin_conexion';
  }
  res.status(bd === 'ok' ? 200 : 503).json({ estado: bd === 'ok' ? 'ok' : 'degradado', bd, fecha: new Date().toISOString() });
});

registerOpenApi({
  tags: [{ name: 'Salud', description: 'Disponibilidad del servicio' }],
  paths: {
    '/salud': {
      get: {
        tags: ['Salud'],
        summary: 'Estado del servicio y de la base de datos',
        responses: {
          200: { description: 'Servicio y base de datos disponibles' },
          503: { description: 'Base de datos no disponible' },
        },
      },
    },
  },
});
