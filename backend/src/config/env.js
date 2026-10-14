// Configuración externalizada (RNF-019). Ningún secreto vive en el código.
const required = (name, fallbackForTest) => {
  const value = process.env[name] ?? (process.env.NODE_ENV === 'test' ? fallbackForTest : undefined);
  if (value === undefined || value === '') {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const env = Object.freeze({
  nodeEnv,
  isProd: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    name: required('DB_NAME', 'pic_test'),
    user: required('DB_USER', 'pic'),
    password: required('DB_PASSWORD', 'pic_dev'),
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: required('JWT_SECRET', 'test-secret-no-usar-en-produccion'),
    expiresMinutes: Number(process.env.JWT_EXPIRES_MINUTES ?? 30),
  },
  storageDir: process.env.STORAGE_DIR ?? './storage',
  logLevel: process.env.LOG_LEVEL ?? (nodeEnv === 'production' ? 'info' : 'debug'),
});
