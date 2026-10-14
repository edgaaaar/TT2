'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("instrumento", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        clave: { type: Sequelize.STRING(30), allowNull: false, comment: "Ej. EGRESO, SESTAD_CE, SESTAD_HOSP, SESTAD_URG." },
        version: { type: Sequelize.SMALLINT, allowNull: false, comment: "Versión del formato." },
        nombre: { type: Sequelize.STRING(160), allowNull: false, comment: "Nombre del instrumento." },
        codigo_formato: { type: Sequelize.STRING(30), allowNull: true, comment: "Ej. MP-1021-214-04, MP-1021-107-01." },
        modulo: { type: Sequelize.STRING(10), allowNull: false, comment: "SUG, SESTAD." },
        vigente: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Versión en uso." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Formato de encuesta versionado (egreso, SESTAD CE, HOSP, URG)." });
      await queryInterface.sequelize.query("ALTER TABLE instrumento ADD CONSTRAINT ck_instrumento_modulo CHECK (modulo IN ('SUG', 'SESTAD'))", { transaction });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_instrumento_version ON instrumento (clave, version)", { transaction });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_instrumento_vigente ON instrumento (clave) WHERE vigente", { transaction });
  
      await queryInterface.createTable("instrumento_seccion", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        instrumento_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "instrumento", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Instrumento." },
        clave: { type: Sequelize.STRING(5), allowNull: true, comment: "Ej. A, B, C." },
        titulo: { type: Sequelize.STRING(255), allowNull: false, comment: "Título de la sección." },
        orden: { type: Sequelize.SMALLINT, allowNull: false, comment: "Orden." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Secciones del instrumento." });
      await queryInterface.sequelize.query("CREATE INDEX ix_instrumento_seccion_instrumento_id ON instrumento_seccion (instrumento_id)", { transaction });
  
      await queryInterface.createTable("pregunta", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        seccion_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "instrumento_seccion", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Sección." },
        numero: { type: Sequelize.STRING(10), allowNull: false, comment: "Número impreso en el formato." },
        texto: { type: Sequelize.TEXT, allowNull: false, comment: "Enunciado." },
        tipo_respuesta: { type: Sequelize.STRING(10), allowNull: false, comment: "UNICA, MULTIPLE, TEXTO, NUMERO." },
        obligatoria: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Si exige respuesta." },
        orden: { type: Sequelize.SMALLINT, allowNull: false, comment: "Orden." },
        condicion_pregunta_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "pregunta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Se muestra solo si esta pregunta..." },
        condicion_opcion_id: { type: Sequelize.INTEGER, allowNull: true, comment: "...tiene esta opción seleccionada." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Reactivos con lógica de salto." });
      await queryInterface.sequelize.query("ALTER TABLE pregunta ADD CONSTRAINT ck_pregunta_tipo_respuesta CHECK (tipo_respuesta IN ('UNICA', 'MULTIPLE', 'TEXTO', 'NUMERO'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_pregunta_seccion_id ON pregunta (seccion_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_pregunta_condicion_pregunta_id ON pregunta (condicion_pregunta_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_pregunta_condicion_opcion_id ON pregunta (condicion_opcion_id)", { transaction });
  
      await queryInterface.createTable("opcion_respuesta", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        pregunta_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "pregunta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Pregunta." },
        clave: { type: Sequelize.STRING(10), allowNull: false, comment: "Ej. a, b, SI, NO, NR." },
        texto: { type: Sequelize.STRING(255), allowNull: false, comment: "Texto visible." },
        valor: { type: Sequelize.DECIMAL(5, 2), allowNull: true, comment: "Valor numérico para cálculos." },
        es_favorable: { type: Sequelize.BOOLEAN, allowNull: true, comment: "Cuenta como respuesta positiva en indicadores." },
        orden: { type: Sequelize.SMALLINT, allowNull: true, comment: "Orden." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Opciones de respuesta por pregunta." });
      await queryInterface.sequelize.query("CREATE INDEX ix_opcion_respuesta_pregunta_id ON opcion_respuesta (pregunta_id)", { transaction });
  
      await queryInterface.createTable("encuesta", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        folio: { type: Sequelize.STRING(20), allowNull: false, unique: true, comment: "SES-AAAA-NNNN o EGR-AAAA-NNNN." },
        instrumento_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "instrumento", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Versión del instrumento aplicada." },
        fecha_aplicacion: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha de aplicación." },
        origen: { type: Sequelize.STRING(10), allowNull: false, comment: "KIOSCO, CAPTURA." },
        aplicador_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Encuestador; nulo en kiosco." },
        comentarios: { type: Sequelize.TEXT, allowNull: true, comment: "Observaciones o comentario libre." },
        estatus: { type: Sequelize.STRING(12), allowNull: false, defaultValue: "BORRADOR", comment: "BORRADOR, COMPLETA, DESCARTADA." },
        aviso_privacidad_aceptado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "RNF-006." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Encuesta aplicada (CU-03, CU-17)." });
      await queryInterface.sequelize.query("ALTER TABLE encuesta ADD CONSTRAINT ck_encuesta_origen CHECK (origen IN ('KIOSCO', 'CAPTURA'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE encuesta ADD CONSTRAINT ck_encuesta_estatus CHECK (estatus IN ('BORRADOR', 'COMPLETA', 'DESCARTADA'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_instrumento_id ON encuesta (instrumento_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_aplicador_id ON encuesta (aplicador_id)", { transaction });
  
      await queryInterface.createTable("respuesta", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        encuesta_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: "encuesta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Encuesta." },
        pregunta_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "pregunta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Pregunta." },
        opcion_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "opcion_respuesta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Opción elegida (varias filas si es MULTIPLE)." },
        valor_texto: { type: Sequelize.TEXT, allowNull: true, comment: "Respuesta abierta." },
        valor_numero: { type: Sequelize.DECIMAL(10, 2), allowNull: true, comment: "Respuesta numérica." },
      }, { transaction, comment: "Respuestas normalizadas; base del concentrado (RF-030)." });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_respuesta_opcion ON respuesta (encuesta_id, pregunta_id, COALESCE(opcion_id, 0))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_respuesta_encuesta_id ON respuesta (encuesta_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_respuesta_pregunta_id ON respuesta (pregunta_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_respuesta_opcion_id ON respuesta (opcion_id)", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("respuesta", { transaction });
      await queryInterface.dropTable("encuesta", { transaction });
      await queryInterface.dropTable("opcion_respuesta", { transaction });
      await queryInterface.dropTable("pregunta", { transaction });
      await queryInterface.dropTable("instrumento_seccion", { transaction });
      await queryInterface.dropTable("instrumento", { transaction });
    });
  },
};
