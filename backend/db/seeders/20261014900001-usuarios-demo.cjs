'use strict';
// Usuarios de demostración, uno por rol con inicio de sesión. Solo desarrollo y pruebas.
// Requiere SEED_DEMO_PASSWORD; obliga a cambiar la contraseña en el primer ingreso (CU-08 A1).
const bcrypt = require('bcrypt');

const DEMO = [
  ['admin@pic.local', 'Administrador', 'Demo', 'ADMIN', null],
  ['calidad@pic.local', 'Personal', 'Calidad', 'CALIDAD', 'Servicio de Calidad'],
  ['salud@pic.local', 'Personal', 'Salud', 'SALUD', 'Departamento de Urgencias'],
  ['evaluador@pic.local', 'Evaluador', 'MECIC', 'EVALUADOR_MECIC', null],
];

module.exports = {
  async up(queryInterface) {
    const password = process.env.SEED_DEMO_PASSWORD;
    if (process.env.NODE_ENV === 'production' || !password) {
      console.log('Seeder de usuarios demo omitido (producción o SEED_DEMO_PASSWORD vacío).');
      return;
    }
    const hash = await bcrypt.hash(password, 12); // RNF-002
    const [roles] = await queryInterface.sequelize.query('SELECT id, clave FROM rol');
    const [servicios] = await queryInterface.sequelize.query('SELECT id, nombre FROM servicio');
    const rolId = Object.fromEntries(roles.map((r) => [r.clave, r.id]));
    const servId = Object.fromEntries(servicios.map((s) => [s.nombre, s.id]));
    const now = new Date();
    await queryInterface.bulkInsert(
      'usuario',
      DEMO.map(([correo, nombre, apellido, rol, servicio]) => ({
        correo,
        nombre,
        apellido_paterno: apellido,
        password_hash: hash,
        rol_id: rolId[rol],
        servicio_id: servicio ? (servId[servicio] ?? null) : null,
        debe_cambiar_password: true,
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuario', { correo: DEMO.map(([c]) => c) });
  },
};
