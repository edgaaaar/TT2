'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("archivo_adjunto", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        nombre_original: { type: Sequelize.STRING(255), allowNull: false, comment: "Nombre del archivo cargado." },
        nombre_almacenado: { type: Sequelize.STRING(100), allowNull: false, unique: true, comment: "Nombre aleatorio en disco." },
        mime_type: { type: Sequelize.STRING(100), allowNull: false, comment: "Tipo verificado por firma." },
        tamano_bytes: { type: Sequelize.INTEGER, allowNull: false, comment: "Máximo 10 MB." },
        hash_sha256: { type: Sequelize.CHAR(64), allowNull: false, comment: "Integridad del archivo." },
        entidad: { type: Sequelize.STRING(50), allowNull: false, comment: "CHECK: incidente, evidencia, oficio, reporte_generado, qsf." },
        entidad_id: { type: Sequelize.BIGINT, allowNull: false, comment: "Registro propietario." },
        subido_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que cargó el archivo." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Metadatos de archivos en disco; relación polimórfica (DEC-13)." });
      await queryInterface.sequelize.query("ALTER TABLE archivo_adjunto ADD CONSTRAINT ck_archivo_adjunto_entidad CHECK (entidad IN ('incidente', 'evidencia', 'oficio', 'reporte_generado', 'qsf'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE archivo_adjunto ADD CONSTRAINT ck_archivo_adjunto_tamano CHECK (tamano_bytes > 0 AND tamano_bytes <= 10485760)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_archivo_adjunto_subido_por ON archivo_adjunto (subido_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_archivo_entidad ON archivo_adjunto (entidad, entidad_id)", { transaction });
  
      await queryInterface.createTable("bitacora", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Momento del evento." },
        usuario_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Actor; nulo para acciones del actor Sistema o públicas." },
        accion: { type: Sequelize.STRING(30), allowNull: false, comment: "CREAR, ACTUALIZAR, ELIMINAR, LOGIN, LOGIN_FALLIDO, BLOQUEO, EXPORTAR, CONSULTAR." },
        modulo: { type: Sequelize.STRING(30), allowNull: false, comment: "Módulo de origen." },
        entidad: { type: Sequelize.STRING(50), allowNull: true, comment: "Tabla afectada." },
        entidad_id: { type: Sequelize.BIGINT, allowNull: true, comment: "Registro afectado." },
        datos_antes: { type: Sequelize.JSONB, allowNull: true, comment: "Estado previo." },
        datos_despues: { type: Sequelize.JSONB, allowNull: true, comment: "Estado posterior." },
        ip: { type: Sequelize.INET, allowNull: true, comment: "Dirección IP de origen." },
        user_agent: { type: Sequelize.STRING(255), allowNull: true, comment: "Agente de usuario." },
      }, { transaction, comment: "Bitácora de auditoría de solo inserción (RF-007, CU-10, DEC-04)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_bitacora_usuario_id ON bitacora (usuario_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_bitacora_fecha ON bitacora (fecha DESC)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_bitacora_entidad ON bitacora (entidad, entidad_id)", { transaction });
  
      await queryInterface.createTable("notificacion", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        usuario_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Destinatario." },
        tipo: { type: Sequelize.STRING(40), allowNull: false, comment: "Ej. NUEVO_INCIDENTE, QSF_PENDIENTE, EVIDENCIA_ENTREGADA." },
        titulo: { type: Sequelize.STRING(160), allowNull: false, comment: "Título." },
        mensaje: { type: Sequelize.TEXT, allowNull: true, comment: "Cuerpo." },
        entidad: { type: Sequelize.STRING(50), allowNull: true, comment: "Entidad relacionada para navegación." },
        entidad_id: { type: Sequelize.BIGINT, allowNull: true, comment: "Registro relacionado." },
        leida_en: { type: Sequelize.DATE, allowNull: true, comment: "Nulo mientras no se lee." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Notificaciones internas, una fila por destinatario (RF-008)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_notificacion_usuario_id ON notificacion (usuario_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_notificacion_no_leidas ON notificacion (usuario_id, created_at DESC) WHERE leida_en IS NULL", { transaction });
  
      await queryInterface.createTable("borrador", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        usuario_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Propietario." },
        tipo_formulario: { type: Sequelize.STRING(40), allowNull: false, comment: "SREA_INCIDENTE, SREA_ACR, SESTAD." },
        entidad_id: { type: Sequelize.BIGINT, allowNull: true, comment: "Registro asociado (ej. incidente del ACR)." },
        contenido: { type: Sequelize.JSONB, allowNull: false, comment: "Estado del formulario." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Borradores de formularios con autoguardado (RNF-012, DEC-07)." });
      await queryInterface.sequelize.query("CREATE UNIQUE INDEX uq_borrador_formulario ON borrador (usuario_id, tipo_formulario, COALESCE(entidad_id, 0))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_borrador_usuario_id ON borrador (usuario_id)", { transaction });
  
      await queryInterface.createTable("folio_secuencia", {
        modulo: { type: Sequelize.STRING(10), primaryKey: true, allowNull: false, comment: "SREA, SUG, SES, EGR." },
        anio: { type: Sequelize.SMALLINT, primaryKey: true, allowNull: false, comment: "Año del folio." },
        ultimo_valor: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0, comment: "Último consecutivo emitido (SELECT ... FOR UPDATE)." },
      }, { transaction, comment: "Consecutivos de folio por módulo y año (DEC-08)." });
      await queryInterface.sequelize.query("ALTER TABLE folio_secuencia ADD CONSTRAINT ck_folio_secuencia_modulo CHECK (modulo IN ('SREA', 'SUG', 'SES', 'EGR'))", { transaction });
  
      await queryInterface.createTable("modulo_sistema", {
        id: { type: Sequelize.SMALLINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        clave: { type: Sequelize.STRING(20), allowNull: false, unique: true, comment: "SREA, SUG, SESTAD, MECIC, INDICAS." },
        nombre: { type: Sequelize.STRING(80), allowNull: false, comment: "Nombre visible." },
        habilitado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Controla visibilidad funcional." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Módulos y su habilitación (MECIC e INDICAS II en falso, DEC-15)." });
  
      await queryInterface.createTable("reporte_generado", {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        tipo: { type: Sequelize.STRING(50), allowNull: false, comment: "Ej. ESTADISTICA_SREA, EXPORT_DGCES_SREA." },
        modulo: { type: Sequelize.STRING(20), allowNull: false, comment: "Módulo de origen." },
        filtros: { type: Sequelize.JSONB, allowNull: true, comment: "Filtros aplicados." },
        formato: { type: Sequelize.STRING(10), allowNull: false, comment: "PDF, XLSX, CSV." },
        archivo_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: "archivo_adjunto", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Archivo resultante." },
        generado_por: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que lo generó." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Historial de reportes y exportaciones DGCES (CU-12)." });
      await queryInterface.sequelize.query("ALTER TABLE reporte_generado ADD CONSTRAINT ck_reporte_generado_formato CHECK (formato IN ('PDF', 'XLSX', 'CSV'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_reporte_generado_archivo_id ON reporte_generado (archivo_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_reporte_generado_generado_por ON reporte_generado (generado_por)", { transaction });
  
      await queryInterface.createTable("oficio", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        numero_oficio: { type: Sequelize.STRING(40), allowNull: true, comment: "Número oficial asignado por el hospital." },
        tipo: { type: Sequelize.STRING(12), allowNull: false, comment: "SOLICITUD, RESPUESTA." },
        modulo: { type: Sequelize.STRING(10), allowNull: false, comment: "SREA, SUG." },
        fecha_emision: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha del oficio." },
        servicio_destino_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Área destinataria." },
        asunto: { type: Sequelize.STRING(255), allowNull: false, comment: "Asunto." },
        cuerpo: { type: Sequelize.TEXT, allowNull: true, comment: "Contenido para el PDF generado." },
        archivo_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: "archivo_adjunto", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "PDF generado o escaneado." },
        oficio_origen_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "oficio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Oficio al que responde." },
        creado_por: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que lo registra." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Oficios de solicitud y respuesta, compartidos por SREA y SUG (DEC-09)." });
      await queryInterface.sequelize.query("ALTER TABLE oficio ADD CONSTRAINT ck_oficio_tipo CHECK (tipo IN ('SOLICITUD', 'RESPUESTA'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE oficio ADD CONSTRAINT ck_oficio_modulo CHECK (modulo IN ('SREA', 'SUG'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_oficio_servicio_destino_id ON oficio (servicio_destino_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_oficio_archivo_id ON oficio (archivo_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_oficio_oficio_origen_id ON oficio (oficio_origen_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_oficio_creado_por ON oficio (creado_por)", { transaction });
  
      await queryInterface.sequelize.query("CREATE OR REPLACE FUNCTION fn_bitacora_inmutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'La bitacora es de solo insercion (RF-007, DEC-04)'; END; $$", { transaction });
  
      await queryInterface.sequelize.query("CREATE TRIGGER trg_bitacora_inmutable BEFORE UPDATE OR DELETE ON bitacora FOR EACH ROW EXECUTE FUNCTION fn_bitacora_inmutable()", { transaction });
  
      await queryInterface.sequelize.query("CREATE TRIGGER trg_bitacora_no_truncate BEFORE TRUNCATE ON bitacora FOR EACH STATEMENT EXECUTE FUNCTION fn_bitacora_inmutable()", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("oficio", { transaction });
      await queryInterface.dropTable("reporte_generado", { transaction });
      await queryInterface.dropTable("modulo_sistema", { transaction });
      await queryInterface.dropTable("folio_secuencia", { transaction });
      await queryInterface.dropTable("borrador", { transaction });
      await queryInterface.dropTable("notificacion", { transaction });
      await queryInterface.dropTable("bitacora", { transaction });
      await queryInterface.dropTable("archivo_adjunto", { transaction });
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_bitacora_inmutable()', { transaction });
    });
  },
};
