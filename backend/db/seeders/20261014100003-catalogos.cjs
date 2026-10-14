'use strict';
// Catálogos depurados de la hoja "Listas" de la Base de datos IRSP (db/tools/extraer_catalogos.py).
const catalogos = require('../seed-data/catalogos.json');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const ts = { created_at: now, updated_at: now };
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const cat of catalogos) {
        const [[{ id: catalogoId }]] = await queryInterface.sequelize.query(
          `INSERT INTO catalogo (clave, nombre, jerarquico, editable, created_at, updated_at)
           VALUES (:clave, :nombre, :jerarquico, true, :now, :now) RETURNING id`,
          { replacements: { clave: cat.clave, nombre: cat.nombre, jerarquico: cat.jerarquico, now }, transaction },
        );
        for (const item of cat.items) {
          const [[{ id: padreId }]] = await queryInterface.sequelize.query(
            `INSERT INTO catalogo_item (catalogo_id, nombre, orden, requiere_especificar, activo, created_at, updated_at)
             VALUES (:catalogoId, :nombre, :orden, :req, true, :now, :now) RETURNING id`,
            {
              replacements: { catalogoId, nombre: item.nombre, orden: item.orden, req: Boolean(item.requiere_especificar), now },
              transaction,
            },
          );
          if (item.hijos?.length) {
            await queryInterface.bulkInsert(
              'catalogo_item',
              item.hijos.map((h) => ({
                catalogo_id: catalogoId,
                padre_id: padreId,
                nombre: h.nombre,
                orden: h.orden,
                requiere_especificar: Boolean(h.requiere_especificar),
                activo: true,
                ...ts,
              })),
              { transaction },
            );
          }
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('catalogo_item', null, { transaction });
      await queryInterface.bulkDelete('catalogo', null, { transaction });
    });
  },
};
