import { createApp } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './config/db.js';
import { logger } from './utils/logger.js';

const app = createApp();

try {
  await sequelize.authenticate();
  logger.info(`Conexión a PostgreSQL establecida (${env.db.host}:${env.db.port}/${env.db.name})`);
} catch (err) {
  logger.error('No fue posible conectar a PostgreSQL', { err });
  process.exit(1);
}

const server = app.listen(env.port, () => {
  logger.info(`API P.I.C. escuchando en http://localhost:${env.port} (docs en /docs)`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} recibido, cerrando`);
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
