// Configuración de conexión para sequelize-cli (migraciones y seeders).
// Debe ser CommonJS porque sequelize-cli la carga con require().
const base = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false,
  migrationStorageTableName: 'sequelize_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_data',
  define: { underscored: true },
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME || 'pic_test' },
  production: base,
};
