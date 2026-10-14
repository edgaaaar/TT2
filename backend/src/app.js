import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { saludRouter } from './modules/salud/salud.routes.js';
import { getOpenApiSpec } from './openapi/registry.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Fábrica de la aplicación: separada de server.js para poder probarla con Supertest.
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // detrás de Nginx en producción
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false }),
  );

  const api = express.Router();
  api.use('/salud', saludRouter);
  // Los módulos de negocio se montan aquí: auth, usuarios, catalogos, srea, sug, sestad, reportes.
  app.use('/api/v1', api);

  if (!env.isProd) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));
    app.get('/docs.json', (_req, res) => res.json(getOpenApiSpec()));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
