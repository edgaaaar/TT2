'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("periodo", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        modulo: { type: Sequelize.STRING(10), allowNull: false, comment: "SESTAD (MECIC, INDICAS a futuro)." },
        anio: { type: Sequelize.SMALLINT, allowNull: false, comment: "Año." },
        cuatrimestre: { type: Sequelize.SMALLINT, allowNull: false, comment: "1 a 3." },
        fecha_inicio: { type: Sequelize.DATEONLY, allowNull: false, comment: "Inicio." },
        fecha_fin: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fin." },
        estatus: { type: Sequelize.STRING(8), allowNull: false, defaultValue: "ABIERTO", comment: "ABIERTO, CERRADO." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Periodos cuatrimestrales; reutilizable por MECIC e INDICAS." });
      await queryInterface.sequelize.query("ALTER TABLE periodo ADD CONSTRAINT ck_periodo_estatus CHECK (estatus IN ('ABIERTO', 'CERRADO'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE periodo ADD CONSTRAINT ck_periodo_cuatrimestre CHECK (cuatrimestre BETWEEN 1 AND 3)", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE periodo ADD CONSTRAINT ck_periodo_fechas CHECK (fecha_fin >= fecha_inicio)", { transaction });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_periodo ON periodo (modulo, anio, cuatrimestre)", { transaction });
  
      await queryInterface.createTable("periodo_variable", {
        periodo_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "periodo", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Periodo." },
        clave: { type: Sequelize.STRING(30), primaryKey: true, allowNull: false, comment: "EGRESOS_HOSP, CONSULTAS_EXT, ALTAS_URG." },
        valor: { type: Sequelize.INTEGER, allowNull: false, comment: "Valor reportado." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Variables institucionales del periodo (RF-029)." });
  
      await queryInterface.createTable("encuesta_sestad", {
        encuesta_id: { type: Sequelize.BIGINT, primaryKey: true, allowNull: false, references: { model: "encuesta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Encuesta (1:1)." },
        periodo_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "periodo", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Cuatrimestre." },
        area: { type: Sequelize.STRING(4), allowNull: false, comment: "CE, HOSP, URG." },
        servicio_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Especialidad o servicio." },
        numero_registro: { type: Sequelize.STRING(20), allowNull: true, comment: "Registro del paciente." },
      }, { transaction, comment: "Datos propios de la encuesta SESTAD (RF-028)." });
      await queryInterface.sequelize.query("ALTER TABLE encuesta_sestad ADD CONSTRAINT ck_encuesta_sestad_area CHECK (area IN ('CE', 'HOSP', 'URG'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_sestad_periodo_id ON encuesta_sestad (periodo_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_sestad_servicio_id ON encuesta_sestad (servicio_id)", { transaction });
  
      await queryInterface.createTable("concentrado", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        periodo_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "periodo", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Periodo." },
        instrumento_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "instrumento", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Instrumento concentrado." },
        datos: { type: Sequelize.JSONB, allowNull: false, comment: "Conteos por pregunta y opción." },
        generado_por: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que cierra." },
        generado_en: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de generación." },
      }, { transaction, comment: "Instantánea del concentrado al cierre del periodo (RF-030)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_concentrado_periodo_id ON concentrado (periodo_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_concentrado_instrumento_id ON concentrado (instrumento_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_concentrado_generado_por ON concentrado (generado_por)", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("concentrado", { transaction });
      await queryInterface.dropTable("encuesta_sestad", { transaction });
      await queryInterface.dropTable("periodo_variable", { transaction });
      await queryInterface.dropTable("periodo", { transaction });
    });
  },
};
