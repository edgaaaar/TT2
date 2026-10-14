import winston from 'winston';
import { env } from '../config/env.js';

export const logger = winston.createLogger({
  level: env.logLevel,
  silent: env.isTest,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isProd ? winston.format.json() : winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});
