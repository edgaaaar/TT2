'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("incidente", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        folio: { type: Sequelize.STRING(20), allowNull: false, unique: true, comment: "SREA-AAAA-NNNN (RF-016)." },
        estatus: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "PENDIENTE_CLASIFICACION", comment: "PENDIENTE_CLASIFICACION, REQUIERE_INFORMACION, CLASIFICADO, EN_ANALISIS, PENDIENTE_EVIDENCIA, CERRADO." },
        origen: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "DIRECTO", comment: "DIRECTO, QSF." },
        qsf_id: { type: Sequelize.INTEGER, allowNull: true, unique: true, references: { model: "qsf", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "QSF de la que deriva (RF-026)." },
        notificante_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que notifica." },
        fecha_incidente: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha de ocurrencia." },
        hora_incidente: { type: Sequelize.TIME, allowNull: true, comment: "Hora de ocurrencia." },
        fecha_notificacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Momento del registro." },
        servicio_ocurrencia_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Servicio donde ocurrió." },
        turno_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Catálogo TURNO." },
        paciente_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "paciente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Nulo en factores contribuyentes sin paciente." },
        peso_kg: { type: Sequelize.DECIMAL(5, 2), allowNull: true, comment: "Peso al momento del incidente." },
        talla_m: { type: Sequelize.DECIMAL(4, 2), allowNull: true, comment: "Talla al momento del incidente." },
        diagnostico_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "diagnostico", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Diagnóstico actual." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Narración cronológica de los hechos." },
        descripcion_dano: { type: Sequelize.TEXT, allowNull: true, comment: "Descripción del daño o consecuencias." },
        otro_personal: { type: Sequelize.STRING(255), allowNull: true, comment: "Personal involucrado no catalogado." },
        recibido_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Personal de Calidad que recibe." },
        recibido_en: { type: Sequelize.DATE, allowNull: true, comment: "Recepción de la notificación." },
        es_irsp: { type: Sequelize.BOOLEAN, allowNull: true, comment: "Determinación de Calidad." },
        clasificacion_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "CLASIFICACION_IRSP: FCN, cuasifalla, adverso, centinela." },
        grado_dano_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "GRADO_DANO: ninguno, leve, moderado, grave, muerte." },
        evento_trascendente_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "EVENTO_TRASCENDENTE." },
        observaciones_clasificacion: { type: Sequelize.TEXT, allowNull: true, comment: "Observaciones del Servicio de Calidad." },
        clasificado_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Usuario que clasifica." },
        clasificado_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de clasificación." },
        capturado_dgces: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, comment: "Capturado en la plataforma federal SREA." },
        folio_dgces: { type: Sequelize.STRING(30), allowNull: true, comment: "Folio asignado por la plataforma federal." },
        capturado_dgces_en: { type: Sequelize.DATEONLY, allowNull: true, comment: "Fecha de captura federal." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Notificación de IRSP, formato MP-6001-213-03 (CU-01, CU-02)." });
      await queryInterface.sequelize.query("ALTER TABLE incidente ADD CONSTRAINT ck_incidente_estatus CHECK (estatus IN ('PENDIENTE_CLASIFICACION', 'REQUIERE_INFORMACION', 'CLASIFICADO', 'EN_ANALISIS', 'PENDIENTE_EVIDENCIA', 'CERRADO'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE incidente ADD CONSTRAINT ck_incidente_origen CHECK (origen IN ('DIRECTO', 'QSF'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE incidente ADD CONSTRAINT ck_incidente_origen_qsf CHECK (origen <> 'QSF' OR qsf_id IS NOT NULL)", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE incidente ADD CONSTRAINT ck_incidente_peso_talla CHECK ((peso_kg IS NULL OR peso_kg > 0) AND (talla_m IS NULL OR talla_m > 0))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_notificante_id ON incidente (notificante_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_servicio_ocurrencia_id ON incidente (servicio_ocurrencia_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_turno_id ON incidente (turno_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_paciente_id ON incidente (paciente_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_diagnostico_id ON incidente (diagnostico_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_recibido_por ON incidente (recibido_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_clasificacion_id ON incidente (clasificacion_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_grado_dano_id ON incidente (grado_dano_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_evento_trascendente_id ON incidente (evento_trascendente_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_clasificado_por ON incidente (clasificado_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_estatus ON incidente (estatus)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_fecha ON incidente (fecha_incidente)", { transaction });
  
      await queryInterface.createTable("incidente_tipo", {
        incidente_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        tipo_item_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Subtipo de TIPO_INCIDENTE (padre = tipo)." },
        orden: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 1, comment: "Prioridad del tipo." },
        especificacion: { type: Sequelize.STRING(255), allowNull: true, comment: "Texto para 'Otros, especifique'." },
      }, { transaction, comment: "Tipo y subtipo de incidente (RF-010); orden 1 y 2 como en la base IRSP." });
      await queryInterface.sequelize.query("ALTER TABLE incidente_tipo ADD CONSTRAINT ck_incidente_tipo_orden CHECK (orden >= 1)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_tipo_tipo_item_id ON incidente_tipo (tipo_item_id)", { transaction });
  
      await queryInterface.createTable("incidente_dano", {
        incidente_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        dano_item_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Catálogo DANO_PACIENTE." },
        especificacion: { type: Sequelize.STRING(255), allowNull: true, comment: "Texto para 'Otro'." },
      }, { transaction, comment: "Daño atribuido al incidente (RF-011)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_dano_dano_item_id ON incidente_dano (dano_item_id)", { transaction });
  
      await queryInterface.createTable("incidente_factor", {
        incidente_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        factor_item_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "FACTOR_CONTRIBUYENTE (padre: paciente, personal, cuidador, herramientas)." },
        especificacion: { type: Sequelize.STRING(255), allowNull: true, comment: "Texto para 'Otro'." },
      }, { transaction, comment: "Factores contribuyentes (RF-011)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_factor_factor_item_id ON incidente_factor (factor_item_id)", { transaction });
  
      await queryInterface.createTable("incidente_personal", {
        incidente_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        perfil_item_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Catálogo PERSONAL_INVOLUCRADO." },
        especificacion: { type: Sequelize.STRING(255), allowNull: true, comment: "Texto para 'Otros'." },
      }, { transaction, comment: "Perfil del personal involucrado (RF-014)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_personal_perfil_item_id ON incidente_personal (perfil_item_id)", { transaction });
  
      await queryInterface.createTable("incidente_servicio_rel", {
        incidente_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        servicio_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Servicio relacionado." },
      }, { transaction, comment: "Servicios relacionados con el incidente." });
      await queryInterface.sequelize.query("CREATE INDEX ix_incidente_servicio_rel_servicio_id ON incidente_servicio_rel (servicio_id)", { transaction });
  
      await queryInterface.createTable("medicamento_insumo", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        incidente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        tipo: { type: Sequelize.STRING(12), allowNull: false, comment: "MEDICAMENTO, DISPOSITIVO." },
        nombre: { type: Sequelize.STRING(160), allowNull: false, comment: "Nombre del producto." },
        lote: { type: Sequelize.STRING(40), allowNull: false, comment: "Número de lote." },
        fecha_caducidad: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha de caducidad." },
        numero_serie: { type: Sequelize.STRING(60), allowNull: true, comment: "CHECK: obligatorio si tipo = DISPOSITIVO." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Medicamento o dispositivo involucrado (RF-012, CU-01 A1)." });
      await queryInterface.sequelize.query("ALTER TABLE medicamento_insumo ADD CONSTRAINT ck_medicamento_insumo_tipo CHECK (tipo IN ('MEDICAMENTO', 'DISPOSITIVO'))", { transaction });
      await queryInterface.sequelize.query("ALTER TABLE medicamento_insumo ADD CONSTRAINT ck_medicamento_insumo_dispositivo_serie CHECK (tipo <> 'DISPOSITIVO' OR numero_serie IS NOT NULL)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_medicamento_insumo_incidente_id ON medicamento_insumo (incidente_id)", { transaction });
  
      await queryInterface.createTable("accion_reduccion_riesgo", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        incidente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Incidente." },
        plazo: { type: Sequelize.STRING(8), allowNull: false, comment: "CORTO (<24 h), MEDIANO (>24 h)." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Acción implementada." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Acciones de reducción de riesgos (RF-013)." });
      await queryInterface.sequelize.query("ALTER TABLE accion_reduccion_riesgo ADD CONSTRAINT ck_accion_reduccion_riesgo_plazo CHECK (plazo IN ('CORTO', 'MEDIANO'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_reduccion_riesgo_incidente_id ON accion_reduccion_riesgo (incidente_id)", { transaction });
  
      await queryInterface.createTable("analisis_causa_raiz", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        incidente_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Incidente analizado (1:1)." },
        problema: { type: Sequelize.STRING(255), allowNull: false, comment: "Definición del problema en una oración (efecto)." },
        nivel_gravedad_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "NIVEL_GRAVEDAD_ACR: sin daño, bajo, moderado, grave." },
        conclusion: { type: Sequelize.TEXT, allowNull: true, comment: "Conclusión del análisis." },
        estatus: { type: Sequelize.STRING(12), allowNull: false, defaultValue: "BORRADOR", comment: "BORRADOR, COMPLETO." },
        elaborado_por: { type: Sequelize.INTEGER, allowNull: false, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Responsable del análisis." },
        completado_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de cierre del análisis." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Análisis causa-efecto, formato MP-1021-237-05 (RF-018, CU-02 A1)." });
      await queryInterface.sequelize.query("ALTER TABLE analisis_causa_raiz ADD CONSTRAINT ck_analisis_causa_raiz_estatus CHECK (estatus IN ('BORRADOR', 'COMPLETO'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_analisis_causa_raiz_nivel_gravedad_id ON analisis_causa_raiz (nivel_gravedad_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_analisis_causa_raiz_elaborado_por ON analisis_causa_raiz (elaborado_por)", { transaction });
  
      await queryInterface.createTable("acr_cronologia", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        acr_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "analisis_causa_raiz", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Análisis." },
        fecha_hora: { type: Sequelize.DATE, allowNull: false, comment: "Fecha y hora del hecho." },
        lugar: { type: Sequelize.STRING(160), allowNull: true, comment: "Lugar." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Descripción del hecho." },
        orden: { type: Sequelize.SMALLINT, allowNull: false, comment: "Secuencia." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Cronología narrativa del ACR." });
      await queryInterface.sequelize.query("CREATE INDEX ix_acr_cronologia_acr_id ON acr_cronologia (acr_id)", { transaction });
  
      await queryInterface.createTable("acr_causa", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        acr_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "analisis_causa_raiz", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Análisis." },
        categoria: { type: Sequelize.STRING(10), allowNull: false, comment: "POLITICAS, PROCESO, PERSONAL, PACIENTE." },
        descripcion: { type: Sequelize.STRING(500), allowNull: false, comment: "Causa identificada." },
        orden: { type: Sequelize.SMALLINT, allowNull: true, comment: "Orden dentro de la categoría." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Causas del diagrama de Ishikawa." });
      await queryInterface.sequelize.query("ALTER TABLE acr_causa ADD CONSTRAINT ck_acr_causa_categoria CHECK (categoria IN ('POLITICAS', 'PROCESO', 'PERSONAL', 'PACIENTE'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_acr_causa_acr_id ON acr_causa (acr_id)", { transaction });
  
      await queryInterface.createTable("accion_mejora", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        incidente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "incidente", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Incidente de origen." },
        acr_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "analisis_causa_raiz", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "ACR de origen, si existe." },
        tipo_accion_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "catalogo_item", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "TIPO_ACCION_MEJORA." },
        descripcion: { type: Sequelize.TEXT, allowNull: false, comment: "Acción requerida." },
        responsable: { type: Sequelize.STRING(160), allowNull: true, comment: "Persona responsable." },
        servicio_responsable_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Área responsable (CU-14)." },
        fecha_compromiso: { type: Sequelize.DATEONLY, allowNull: false, comment: "Fecha compromiso (CU-13 A3)." },
        estatus: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "PENDIENTE", comment: "PENDIENTE, EVIDENCIA_ENTREGADA, CUMPLIDA, RECHAZADA." },
        fecha_cierre: { type: Sequelize.DATEONLY, allowNull: true, comment: "Cierre de la acción." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Acciones de mejora con responsable y fecha (RF-019, CU-13)." });
      await queryInterface.sequelize.query("ALTER TABLE accion_mejora ADD CONSTRAINT ck_accion_mejora_estatus CHECK (estatus IN ('PENDIENTE', 'EVIDENCIA_ENTREGADA', 'CUMPLIDA', 'RECHAZADA'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_incidente_id ON accion_mejora (incidente_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_acr_id ON accion_mejora (acr_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_tipo_accion_id ON accion_mejora (tipo_accion_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_servicio_responsable_id ON accion_mejora (servicio_responsable_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_compromiso ON accion_mejora (estatus, fecha_compromiso)", { transaction });
  
      await queryInterface.createTable("accion_mejora_oficio", {
        accion_mejora_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "accion_mejora", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Acción." },
        oficio_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "oficio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Oficio." },
      }, { transaction, comment: "Oficios asociados a acciones de mejora." });
      await queryInterface.sequelize.query("CREATE INDEX ix_accion_mejora_oficio_oficio_id ON accion_mejora_oficio (oficio_id)", { transaction });
  
      await queryInterface.createTable("evidencia", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador." },
        accion_mejora_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: "accion_mejora", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Acción atendida." },
        observaciones: { type: Sequelize.TEXT, allowNull: true, comment: "Observaciones del área." },
        estatus: { type: Sequelize.STRING(12), allowNull: false, defaultValue: "BORRADOR", comment: "BORRADOR, ENTREGADA, ACEPTADA, RECHAZADA." },
        entregada_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Personal de Salud que entrega." },
        entregada_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de entrega." },
        revisada_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: "usuario", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Personal de Calidad que valida." },
        revisada_en: { type: Sequelize.DATE, allowNull: true, comment: "Fecha de revisión." },
        motivo_rechazo: { type: Sequelize.TEXT, allowNull: true, comment: "CU-13 A2." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Evidencia de cumplimiento; archivos en archivo_adjunto (CU-14)." });
      await queryInterface.sequelize.query("ALTER TABLE evidencia ADD CONSTRAINT ck_evidencia_estatus CHECK (estatus IN ('BORRADOR', 'ENTREGADA', 'ACEPTADA', 'RECHAZADA'))", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_evidencia_accion_mejora_id ON evidencia (accion_mejora_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_evidencia_entregada_por ON evidencia (entregada_por)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_evidencia_revisada_por ON evidencia (revisada_por)", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("evidencia", { transaction });
      await queryInterface.dropTable("accion_mejora_oficio", { transaction });
      await queryInterface.dropTable("accion_mejora", { transaction });
      await queryInterface.dropTable("acr_causa", { transaction });
      await queryInterface.dropTable("acr_cronologia", { transaction });
      await queryInterface.dropTable("analisis_causa_raiz", { transaction });
      await queryInterface.dropTable("accion_reduccion_riesgo", { transaction });
      await queryInterface.dropTable("medicamento_insumo", { transaction });
      await queryInterface.dropTable("incidente_servicio_rel", { transaction });
      await queryInterface.dropTable("incidente_personal", { transaction });
      await queryInterface.dropTable("incidente_factor", { transaction });
      await queryInterface.dropTable("incidente_dano", { transaction });
      await queryInterface.dropTable("incidente_tipo", { transaction });
      await queryInterface.dropTable("incidente", { transaction });
    });
  },
};
