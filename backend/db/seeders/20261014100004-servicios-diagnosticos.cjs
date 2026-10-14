'use strict';
// Servicios (áreas de atención y servicios relacionados) y diagnósticos de la Base de datos IRSP.
const servicios = require('../seed-data/servicios.json');
const diagnosticos = require('../seed-data/diagnosticos.json');

const LOTE = 2000;

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const ts = { created_at: now, updated_at: now };
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'servicio',
        servicios.map((s) => ({ nombre: s.nombre, es_area_atencion: s.es_area_atencion, activo: true, ...ts })),
        { transaction },
      );
      for (let i = 0; i < diagnosticos.length; i += LOTE) {
        await queryInterface.bulkInsert(
          'diagnostico',
          diagnosticos.slice(i, i + LOTE).map((descripcion) => ({ descripcion, activo: true, ...ts })),
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('diagnostico', null, {});
    await queryInterface.bulkDelete('servicio', null, {});
  },
};
