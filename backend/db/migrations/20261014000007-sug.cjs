'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("qsf", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        folio: { type: Sequelize.STRING(20), allowNull: false, unique: true, comment: "SUG-AAAA-NNNN." },
        tipo: { type: Sequelize.STRING(12), allowNull: false, comment: "QUEJA, SUGERENCIA, RECLAMO, FELICITACION." },
        medio_captacion_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "BUZON, EGRESO, PRESENCIAL, KIOSCO, SESTAD." },
        origen: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "DIRECTA", comment: "DIRECTA, ENCUESTA." },
        encuesta_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: "encuesta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Encuesta de origen (RF-032, CU-17 A2)." },
        fecha_manifestacion: { type: Sequelize.DATEONLY, allowNull: true, comment: "Fecha anotada por el usuario." },
        hora: { type: Sequelize.TIME, allowNull: true, comment: "Hora de la manifestación." },
        fecha_recepcion: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha de recepción en Calidad." },
        servicio_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Servicio señalado por el usuario." },
        nombre_manifestante: { type: Sequelize.STRING(160), allowNull: true, comment: "Nulo si es anónima." },
        numero_registro: { type: Sequelize.STRING(20), allowNull: true, comment: "Registro del paciente (sin validar)." },
        domicilio: { type: Sequelize.STRING(255), allowNull: true, comment: "Contacto (CU-06 A1)." },
        telefono: { type: Sequelize.STRING(20), allowNull: true, comment: "Contacto (CU-06 A1)." },
        anonimo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "Solo sugerencias y felicitaciones (CU-06 A3)." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Manifestación del usuario." },
        solicita_respuesta: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "CU-16 A3." },
        aviso_privacidad_aceptado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "RNF-006." },
        capturado_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Nulo si proviene del kiosco." },
        estatus: { type: Sequelize.STRING(25), allowNull: false, defaultValue: "PENDIENTE_CLASIFICACION", comment: "PENDIENTE_CLASIFICACION, REQUIERE_INFORMACION, CLASIFICADA, EN_SEGUIMIENTO, RESUELTA, ARCHIVADA." },
        servicio_clasif_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Servicio involucrado según Calidad." },
        dimension_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "DIMENSION_CALIDAD (pendiente del hospital)." },
        clasificacion_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "CLASIFICACION_QSF (pendiente del hospital)." },
        clasificado_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que clasifica." },
        clasificado_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de clasificación." },
        resolucion: { type: Sequelize.TEXT, allowNull: true, comment: "Resolución registrada." },
        resuelto_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de cierre." },
        capturado_dgces: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "Capturado en la plataforma federal SUG." },
        folio_dgces: { type: Sequelize.STRING(30), allowNull: true, comment: "Folio federal." },
        capturado_dgces_en: { type: Sequelize.DATEONLY, allowNull: true, comment: "Fecha de captura federal." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Queja, sugerencia, reclamo o felicitación (CU-06, CU-15, CU-16)." });
      await queryInterface.sequelize.query("ALTER TABLE qsf ADD CONSTRAINT ck_qsf_tipo CHECK (tipo IN ('QUEJA', 'SUGERENCIA', 'RECLAMO', 'FELICITACION'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE qsf ADD CONSTRAINT ck_qsf_origen CHECK (origen IN ('DIRECTA', 'ENCUESTA'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE qsf ADD CONSTRAINT ck_qsf_estatus CHECK (estatus IN ('PENDIENTE_CLASIFICACION', 'REQUIERE_INFORMACION', 'CLASIFICADA', 'EN_SEGUIMIENTO', 'RESUELTA', 'ARCHIVADA'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE qsf ADD CONSTRAINT ck_qsf_anonimo_tipo CHECK (NOT anonimo OR tipo IN ('SUGERENCIA','FELICITACION'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE qsf ADD CONSTRAINT ck_qsf_origen_encuesta CHECK (origen <> 'ENCUESTA' OR encuesta_id IS NOT NULL)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_medio_captacion_id ON qsf (medio_captacion_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_encuesta_id ON qsf (encuesta_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_servicio_id ON qsf (servicio_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_capturado_por ON qsf (capturado_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_servicio_clasif_id ON qsf (servicio_clasif_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_dimension_id ON qsf (dimension_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_clasificacion_id ON qsf (clasificacion_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_clasificado_por ON qsf (clasificado_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_estatus ON qsf (estatus)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_fecha ON qsf (fecha_recepcion)", { transaction });
  
      await queryInterface.createTable("qsf_seguimiento", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        qsf_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "qsf", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "QSF." },
        tipo: { type: Sequelize.STRING(20), allowNull: false, comment: "OFICIO_ENVIADO, RESPUESTA_RECIBIDA, NOTA, CIERRE." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Detalle." },
        usuario_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que registra." },
        fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha del movimiento." },
      }, { transaction, comment: "Historial de seguimiento de la QSF (CU-16)." });
      await queryInterface.sequelize.query("ALTER TABLE qsf_seguimiento ADD CONSTRAINT ck_qsf_seguimiento_tipo CHECK (tipo IN ('OFICIO_ENVIADO', 'RESPUESTA_RECIBIDA', 'NOTA', 'CIERRE'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_seguimiento_qsf_id ON qsf_seguimiento (qsf_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_seguimiento_usuario_id ON qsf_seguimiento (usuario_id)", { transaction });
  
      await queryInterface.createTable("qsf_oficio", {
        qsf_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "qsf", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "QSF." },
        oficio_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "oficio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Oficio." },
      }, { transaction, comment: "Oficios asociados a una QSF." });
      await queryInterface.sequelize.query("CREATE INDEX ix_qsf_oficio_oficio_id ON qsf_oficio (oficio_id)", { transaction });
  
      await queryInterface.createTable("encuesta_egreso", {
        encuesta_id: { type: Sequelize.BIGINT, primaryKey: true, allowNull: false, references: { model: "encuesta", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Encuesta (1:1)." },
        numero_registro: { type: Sequelize.STRING(20), allowNull: true, comment: "Registro del paciente." },
        servicio_internamiento_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Servicio de internamiento." },
        diagnostico_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "diagnostico", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Diagnóstico." },
        domicilio: { type: Sequelize.STRING(255), allowNull: true, comment: "Domicilio." },
        telefono: { type: Sequelize.STRING(20), allowNull: true, comment: "Teléfono." },
      }, { transaction, comment: "Datos propios de la encuesta de egreso MP-1021-107-01 (RF-023)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_egreso_servicio_internamiento_id ON encuesta_egreso (servicio_internamiento_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_encuesta_egreso_diagnostico_id ON encuesta_egreso (diagnostico_id)", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("encuesta_egreso", { transaction });
      await queryInterface.dropTable("qsf_oficio", { transaction });
      await queryInterface.dropTable("qsf_seguimiento", { transaction });
      await queryInterface.dropTable("qsf", { transaction });
    });
  },
};
