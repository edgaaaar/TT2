'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addConstraint("pregunta", { fields: ["condicion_opcion_id"], type: 'foreign key', name: "fk_pregunta_condicion_opcion_id", references: { table: "opcion_respuesta", field: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint("pregunta", "fk_pregunta_condicion_opcion_id", { transaction });
    });
  },
};
