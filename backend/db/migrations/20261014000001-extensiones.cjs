'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm', { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pg_trgm', { transaction });
    });
  },
};
