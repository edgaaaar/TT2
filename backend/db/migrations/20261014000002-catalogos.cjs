'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("catalogo", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del catálogo." },
        clave: { type: Sequelize.STRING(50), allowNull: false, unique: true, comment: "Ej. TIPO_INCIDENTE, TURNO, DANO_PACIENTE." },
        nombre: { type: Sequelize.STRING(120), allowNull: false, comment: "Nombre visible." },
        jerarquico: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "Indica si los elementos admiten padre." },
        editable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Si el Administrador puede modificarlo." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Definición de catálogos parametrizables (RF-003, DEC-11)." });
  
      await queryInterface.createTable("catalogo_item", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del elemento." },
        catalogo_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "catalogo", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Catálogo al que pertenece." },
        padre_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Elemento padre (ej. tipo de incidente de un subtipo)." },
        clave: { type: Sequelize.STRING(50), allowNull: true, comment: "Clave técnica opcional." },
        nombre: { type: Sequelize.STRING(255), allowNull: false, comment: "Texto visible." },
        orden: { type: Sequelize.SMALLINT, allowNull: true, comment: "Orden de presentación." },
        requiere_especificar: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "Habilita campo 'Otros, especifique'." },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Desactivación lógica (CU-09 A1)." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Elementos de catálogo; jerarquía mediante padre_id." });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_catalogo_item_nombre ON catalogo_item (catalogo_id, COALESCE(padre_id, 0), lower(nombre))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_catalogo_item_catalogo_id ON catalogo_item (catalogo_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_catalogo_item_padre_id ON catalogo_item (padre_id)", { transaction });
  
      await queryInterface.createTable("servicio", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del servicio." },
        clave: { type: Sequelize.STRING(30), allowNull: true, unique: true, comment: "Clave interna." },
        nombre: { type: Sequelize.STRING(160), allowNull: false, unique: true, comment: "Nombre oficial del servicio o departamento." },
        es_area_atencion: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "True si puede ser lugar de ocurrencia de un incidente." },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Desactivación lógica." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Unidades organizacionales: áreas de atención y servicios relacionados." });
  
      await queryInterface.createTable("diagnostico", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        codigo_cie10: { type: Sequelize.STRING(10), allowNull: true, comment: "Código CIE-10; pendiente, la fuente no lo incluye." },
        descripcion: { type: Sequelize.STRING(255), allowNull: false, comment: "Descripción; índice pg_trgm para autocompletado." },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Desactivación lógica." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Catálogo de diagnósticos (aprox. 14,000 registros)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_diagnostico_descripcion_trgm ON diagnostico USING gin (descripcion gin_trgm_ops)", { transaction });
  
      await queryInterface.createTable("paciente", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        numero_registro: { type: Sequelize.STRING(20), allowNull: false, unique: true, comment: "Número de expediente del HIMFG." },
        nombre: { type: Sequelize.STRING(80), allowNull: true, comment: "Nombre(s)." },
        apellido_paterno: { type: Sequelize.STRING(80), allowNull: true, comment: "Apellido paterno." },
        apellido_materno: { type: Sequelize.STRING(80), allowNull: true, comment: "Apellido materno." },
        fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: true, comment: "Base para el cálculo de edad (no se almacena la edad)." },
        genero_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Catálogo GENERO." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Identificación mínima del paciente (dato personal sensible, RNF-006)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_paciente_genero_id ON paciente (genero_id)", { transaction });
  
      await queryInterface.createTable("establecimiento", {
        id: { type: Sequelize.SMALLINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador (registro único)." },
        nombre: { type: Sequelize.STRING(160), allowNull: false, comment: "Nombre del establecimiento." },
        clues: { type: Sequelize.STRING(20), allowNull: false, comment: "Clave Única de Establecimientos de Salud." },
        institucion: { type: Sequelize.STRING(120), allowNull: true, comment: "Institución." },
        municipio: { type: Sequelize.STRING(80), allowNull: true, comment: "Municipio o alcaldía." },
        estado: { type: Sequelize.STRING(60), allowNull: true, comment: "Entidad federativa." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Datos del establecimiento precargados en SESTAD (RF-028)." });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("establecimiento", { transaction });
      await queryInterface.dropTable("paciente", { transaction });
      await queryInterface.dropTable("diagnostico", { transaction });
      await queryInterface.dropTable("servicio", { transaction });
      await queryInterface.dropTable("catalogo_item", { transaction });
      await queryInterface.dropTable("catalogo", { transaction });
    });
  },
};
