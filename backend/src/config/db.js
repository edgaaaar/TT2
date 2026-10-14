import { Sequelize } from 'sequelize';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Instancia única de Sequelize. El esquema lo gobiernan las migraciones (DEC-03): nunca usar sync().
export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: (sql) => logger.debug(sql),
  define: { underscored: true, timestamps: true },
  pool: { max: 10, min: 0, idle: 10000 },
  dialectOptions: env.db.ssl ? { ssl: { require: true, rejectUnauthorized: true } } : {},
});
