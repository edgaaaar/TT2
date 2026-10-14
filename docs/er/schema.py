"""Fuente única del modelo de datos TT2 (P.I.C., 2026-B060).
Columna: (nombre, tipo, flags, referencia, descripcion)
flags: PK, FK, UQ, NN (separados por coma). UQc = parte de una restricción única compuesta.
"""

T = {}   # nombre -> dict(zona, desc, cols, ts)


def tabla(nombre, zona, desc, cols, ts=True):
    T[nombre] = dict(zona=zona, desc=desc, cols=cols, ts=ts)


# ---------------- Seguridad y usuarios ----------------
tabla("rol", "SEG", "Roles del sistema (RBAC).", [
    ("id", "SMALLINT", "PK", "", "Identificador del rol."),
    ("clave", "VARCHAR(30)", "UQ,NN", "", "ADMIN, CALIDAD, SALUD, EVALUADOR_MECIC, PACIENTE, SISTEMA."),
    ("nombre", "VARCHAR(80)", "NN", "", "Nombre visible del rol."),
    ("descripcion", "VARCHAR(255)", "", "", "Descripción del rol."),
])
tabla("permiso", "SEG", "Permisos granulares por módulo y acción.", [
    ("id", "INTEGER", "PK", "", "Identificador del permiso."),
    ("clave", "VARCHAR(80)", "UQ,NN", "", "Clave modulo.recurso.accion, ej. srea.incidente.clasificar."),
    ("modulo", "VARCHAR(30)", "NN", "", "Módulo al que pertenece el permiso."),
    ("descripcion", "VARCHAR(255)", "", "", "Descripción del permiso."),
])
tabla("rol_permiso", "SEG", "Asignación de permisos a roles.", [
    ("rol_id", "SMALLINT", "PK,FK", "rol.id", "Rol."),
    ("permiso_id", "INTEGER", "PK,FK", "permiso.id", "Permiso otorgado."),
], ts=False)
tabla("usuario", "SEG", "Cuentas de usuarios internos (RF-001, RF-002, CU-07, CU-08).", [
    ("id", "INTEGER", "PK", "", "Identificador del usuario."),
    ("nombre", "VARCHAR(80)", "NN", "", "Nombre(s)."),
    ("apellido_paterno", "VARCHAR(80)", "NN", "", "Apellido paterno."),
    ("apellido_materno", "VARCHAR(80)", "", "", "Apellido materno."),
    ("correo", "VARCHAR(120)", "UQ,NN", "", "Correo institucional; usado como nombre de usuario."),
    ("password_hash", "VARCHAR(100)", "NN", "", "Hash bcrypt (RNF-002)."),
    ("rol_id", "SMALLINT", "FK,NN", "rol.id", "Rol asignado (un rol por usuario)."),
    ("servicio_id", "INTEGER", "FK", "servicio.id", "Área de adscripción; filtra acciones de mejora (CU-14)."),
    ("activo", "BOOLEAN", "NN", "", "Desactivación lógica (CU-08 A2)."),
    ("intentos_fallidos", "SMALLINT", "NN", "", "Intentos fallidos consecutivos (CU-07 A3)."),
    ("bloqueado_hasta", "TIMESTAMPTZ", "", "", "Fin del bloqueo temporal de 15 min."),
    ("debe_cambiar_password", "BOOLEAN", "NN", "", "Obliga cambio en el primer ingreso (CU-08 A1)."),
    ("token_version", "INTEGER", "NN", "", "Se incrementa para invalidar sesiones activas (CU-08 A4)."),
    ("ultimo_acceso", "TIMESTAMPTZ", "", "", "Fecha del último inicio de sesión."),
])

# ---------------- Catálogos y datos maestros ----------------
tabla("catalogo", "CAT", "Definición de catálogos parametrizables (RF-003, DEC-11).", [
    ("id", "INTEGER", "PK", "", "Identificador del catálogo."),
    ("clave", "VARCHAR(50)", "UQ,NN", "", "Ej. TIPO_INCIDENTE, TURNO, DANO_PACIENTE."),
    ("nombre", "VARCHAR(120)", "NN", "", "Nombre visible."),
    ("jerarquico", "BOOLEAN", "NN", "", "Indica si los elementos admiten padre."),
    ("editable", "BOOLEAN", "NN", "", "Si el Administrador puede modificarlo."),
])
tabla("catalogo_item", "CAT", "Elementos de catálogo; jerarquía mediante padre_id.", [
    ("id", "INTEGER", "PK", "", "Identificador del elemento."),
    ("catalogo_id", "INTEGER", "FK,NN,UQc", "catalogo.id", "Catálogo al que pertenece."),
    ("padre_id", "INTEGER", "FK,UQc", "catalogo_item.id", "Elemento padre (ej. tipo de incidente de un subtipo)."),
    ("clave", "VARCHAR(50)", "", "", "Clave técnica opcional."),
    ("nombre", "VARCHAR(255)", "NN,UQc", "", "Texto visible."),
    ("orden", "SMALLINT", "", "", "Orden de presentación."),
    ("requiere_especificar", "BOOLEAN", "NN", "", "Habilita campo 'Otros, especifique'."),
    ("activo", "BOOLEAN", "NN", "", "Desactivación lógica (CU-09 A1)."),
])
tabla("servicio", "CAT", "Unidades organizacionales: áreas de atención y servicios relacionados.", [
    ("id", "INTEGER", "PK", "", "Identificador del servicio."),
    ("clave", "VARCHAR(30)", "UQ", "", "Clave interna."),
    ("nombre", "VARCHAR(160)", "UQ,NN", "", "Nombre oficial del servicio o departamento."),
    ("es_area_atencion", "BOOLEAN", "NN", "", "True si puede ser lugar de ocurrencia de un incidente."),
    ("activo", "BOOLEAN", "NN", "", "Desactivación lógica."),
])
tabla("diagnostico", "CAT", "Catálogo de diagnósticos (aprox. 14,000 registros).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("codigo_cie10", "VARCHAR(10)", "", "", "Código CIE-10; pendiente, la fuente no lo incluye."),
    ("descripcion", "VARCHAR(255)", "NN", "", "Descripción; índice pg_trgm para autocompletado."),
    ("activo", "BOOLEAN", "NN", "", "Desactivación lógica."),
])
tabla("paciente", "CAT", "Identificación mínima del paciente (dato personal sensible, RNF-006).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("numero_registro", "VARCHAR(20)", "UQ,NN", "", "Número de expediente del HIMFG."),
    ("nombre", "VARCHAR(80)", "", "", "Nombre(s)."),
    ("apellido_paterno", "VARCHAR(80)", "", "", "Apellido paterno."),
    ("apellido_materno", "VARCHAR(80)", "", "", "Apellido materno."),
    ("fecha_nacimiento", "DATE", "", "", "Base para el cálculo de edad (no se almacena la edad)."),
    ("genero_id", "INTEGER", "FK", "catalogo_item.id", "Catálogo GENERO."),
])
tabla("establecimiento", "CAT", "Datos del establecimiento precargados en SESTAD (RF-028).", [
    ("id", "SMALLINT", "PK", "", "Identificador (registro único)."),
    ("nombre", "VARCHAR(160)", "NN", "", "Nombre del establecimiento."),
    ("clues", "VARCHAR(20)", "NN", "", "Clave Única de Establecimientos de Salud."),
    ("institucion", "VARCHAR(120)", "", "", "Institución."),
    ("municipio", "VARCHAR(80)", "", "", "Municipio o alcaldía."),
    ("estado", "VARCHAR(60)", "", "", "Entidad federativa."),
])

# ---------------- Servicios transversales ----------------
tabla("bitacora", "TRA", "Bitácora de auditoría de solo inserción (RF-007, CU-10, DEC-04).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("fecha", "TIMESTAMPTZ", "NN", "", "Momento del evento."),
    ("usuario_id", "INTEGER", "FK", "usuario.id", "Actor; nulo para acciones del actor Sistema o públicas."),
    ("accion", "VARCHAR(30)", "NN", "", "CREAR, ACTUALIZAR, ELIMINAR, LOGIN, LOGIN_FALLIDO, BLOQUEO, EXPORTAR, CONSULTAR."),
    ("modulo", "VARCHAR(30)", "NN", "", "Módulo de origen."),
    ("entidad", "VARCHAR(50)", "", "", "Tabla afectada."),
    ("entidad_id", "BIGINT", "", "", "Registro afectado."),
    ("datos_antes", "JSONB", "", "", "Estado previo."),
    ("datos_despues", "JSONB", "", "", "Estado posterior."),
    ("ip", "INET", "", "", "Dirección IP de origen."),
    ("user_agent", "VARCHAR(255)", "", "", "Agente de usuario."),
], ts=False)
tabla("notificacion", "TRA", "Notificaciones internas, una fila por destinatario (RF-008).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("usuario_id", "INTEGER", "FK,NN", "usuario.id", "Destinatario."),
    ("tipo", "VARCHAR(40)", "NN", "", "Ej. NUEVO_INCIDENTE, QSF_PENDIENTE, EVIDENCIA_ENTREGADA."),
    ("titulo", "VARCHAR(160)", "NN", "", "Título."),
    ("mensaje", "TEXT", "", "", "Cuerpo."),
    ("entidad", "VARCHAR(50)", "", "", "Entidad relacionada para navegación."),
    ("entidad_id", "BIGINT", "", "", "Registro relacionado."),
    ("leida_en", "TIMESTAMPTZ", "", "", "Nulo mientras no se lee."),
])
tabla("archivo_adjunto", "TRA", "Metadatos de archivos en disco; relación polimórfica (DEC-13).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("nombre_original", "VARCHAR(255)", "NN", "", "Nombre del archivo cargado."),
    ("nombre_almacenado", "VARCHAR(100)", "UQ,NN", "", "Nombre aleatorio en disco."),
    ("mime_type", "VARCHAR(100)", "NN", "", "Tipo verificado por firma."),
    ("tamano_bytes", "INTEGER", "NN", "", "Máximo 10 MB."),
    ("hash_sha256", "CHAR(64)", "NN", "", "Integridad del archivo."),
    ("entidad", "VARCHAR(50)", "NN", "", "CHECK: incidente, evidencia, oficio, reporte_generado, qsf."),
    ("entidad_id", "BIGINT", "NN", "", "Registro propietario."),
    ("subido_por", "INTEGER", "FK", "usuario.id", "Usuario que cargó el archivo."),
])
tabla("borrador", "TRA", "Borradores de formularios con autoguardado (RNF-012, DEC-07).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("usuario_id", "INTEGER", "FK,NN,UQc", "usuario.id", "Propietario."),
    ("tipo_formulario", "VARCHAR(40)", "NN,UQc", "", "SREA_INCIDENTE, SREA_ACR, SESTAD."),
    ("entidad_id", "BIGINT", "UQc", "", "Registro asociado (ej. incidente del ACR)."),
    ("contenido", "JSONB", "NN", "", "Estado del formulario."),
])
tabla("folio_secuencia", "TRA", "Consecutivos de folio por módulo y año (DEC-08).", [
    ("modulo", "VARCHAR(10)", "PK", "", "SREA, SUG, SES, EGR."),
    ("anio", "SMALLINT", "PK", "", "Año del folio."),
    ("ultimo_valor", "INTEGER", "NN", "", "Último consecutivo emitido (SELECT ... FOR UPDATE)."),
], ts=False)
tabla("modulo_sistema", "TRA", "Módulos y su habilitación (MECIC e INDICAS II en falso, DEC-15).", [
    ("id", "SMALLINT", "PK", "", "Identificador."),
    ("clave", "VARCHAR(20)", "UQ,NN", "", "SREA, SUG, SESTAD, MECIC, INDICAS."),
    ("nombre", "VARCHAR(80)", "NN", "", "Nombre visible."),
    ("habilitado", "BOOLEAN", "NN", "", "Controla visibilidad funcional."),
])
tabla("reporte_generado", "TRA", "Historial de reportes y exportaciones DGCES (CU-12).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("tipo", "VARCHAR(50)", "NN", "", "Ej. ESTADISTICA_SREA, EXPORT_DGCES_SREA."),
    ("modulo", "VARCHAR(20)", "NN", "", "Módulo de origen."),
    ("filtros", "JSONB", "", "", "Filtros aplicados."),
    ("formato", "VARCHAR(10)", "NN", "", "PDF, XLSX, CSV."),
    ("archivo_id", "BIGINT", "FK", "archivo_adjunto.id", "Archivo resultante."),
    ("generado_por", "INTEGER", "FK,NN", "usuario.id", "Usuario que lo generó."),
])
tabla("oficio", "TRA", "Oficios de solicitud y respuesta, compartidos por SREA y SUG (DEC-09).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("numero_oficio", "VARCHAR(40)", "", "", "Número oficial asignado por el hospital."),
    ("tipo", "VARCHAR(12)", "NN", "", "SOLICITUD, RESPUESTA."),
    ("modulo", "VARCHAR(10)", "NN", "", "SREA, SUG."),
    ("fecha_emision", "DATE", "NN", "", "Fecha del oficio."),
    ("servicio_destino_id", "INTEGER", "FK", "servicio.id", "Área destinataria."),
    ("asunto", "VARCHAR(255)", "NN", "", "Asunto."),
    ("cuerpo", "TEXT", "", "", "Contenido para el PDF generado."),
    ("archivo_id", "BIGINT", "FK", "archivo_adjunto.id", "PDF generado o escaneado."),
    ("oficio_origen_id", "INTEGER", "FK", "oficio.id", "Oficio al que responde."),
    ("creado_por", "INTEGER", "FK,NN", "usuario.id", "Usuario que lo registra."),
])

# ---------------- SREA ----------------
tabla("incidente", "SREA", "Notificación de IRSP, formato MP-6001-213-03 (CU-01, CU-02).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("folio", "VARCHAR(20)", "UQ,NN", "", "SREA-AAAA-NNNN (RF-016)."),
    ("estatus", "VARCHAR(30)", "NN", "", "PENDIENTE_CLASIFICACION, REQUIERE_INFORMACION, CLASIFICADO, EN_ANALISIS, PENDIENTE_EVIDENCIA, CERRADO."),
    ("origen", "VARCHAR(10)", "NN", "", "DIRECTO, QSF."),
    ("qsf_id", "INTEGER", "FK,UQ", "qsf.id", "QSF de la que deriva (RF-026)."),
    ("notificante_id", "INTEGER", "FK,NN", "usuario.id", "Usuario que notifica."),
    ("fecha_incidente", "DATE", "NN", "", "Fecha de ocurrencia."),
    ("hora_incidente", "TIME", "", "", "Hora de ocurrencia."),
    ("fecha_notificacion", "TIMESTAMPTZ", "NN", "", "Momento del registro."),
    ("servicio_ocurrencia_id", "INTEGER", "FK,NN", "servicio.id", "Servicio donde ocurrió."),
    ("turno_id", "INTEGER", "FK", "catalogo_item.id", "Catálogo TURNO."),
    ("paciente_id", "INTEGER", "FK", "paciente.id", "Nulo en factores contribuyentes sin paciente."),
    ("peso_kg", "NUMERIC(5,2)", "", "", "Peso al momento del incidente."),
    ("talla_m", "NUMERIC(4,2)", "", "", "Talla al momento del incidente."),
    ("diagnostico_id", "INTEGER", "FK", "diagnostico.id", "Diagnóstico actual."),
    ("descripcion", "TEXT", "NN", "", "Narración cronológica de los hechos."),
    ("descripcion_dano", "TEXT", "", "", "Descripción del daño o consecuencias."),
    ("otro_personal", "VARCHAR(255)", "", "", "Personal involucrado no catalogado."),
    ("recibido_por", "INTEGER", "FK", "usuario.id", "Personal de Calidad que recibe."),
    ("recibido_en", "TIMESTAMPTZ", "", "", "Recepción de la notificación."),
    ("es_irsp", "BOOLEAN", "", "", "Determinación de Calidad."),
    ("clasificacion_id", "INTEGER", "FK", "catalogo_item.id", "CLASIFICACION_IRSP: FCN, cuasifalla, adverso, centinela."),
    ("grado_dano_id", "INTEGER", "FK", "catalogo_item.id", "GRADO_DANO: ninguno, leve, moderado, grave, muerte."),
    ("evento_trascendente_id", "INTEGER", "FK", "catalogo_item.id", "EVENTO_TRASCENDENTE."),
    ("observaciones_clasificacion", "TEXT", "", "", "Observaciones del Servicio de Calidad."),
    ("clasificado_por", "INTEGER", "FK", "usuario.id", "Usuario que clasifica."),
    ("clasificado_en", "TIMESTAMPTZ", "", "", "Fecha de clasificación."),
    ("capturado_dgces", "BOOLEAN", "NN", "", "Capturado en la plataforma federal SREA."),
    ("folio_dgces", "VARCHAR(30)", "", "", "Folio asignado por la plataforma federal."),
    ("capturado_dgces_en", "DATE", "", "", "Fecha de captura federal."),
])
tabla("incidente_tipo", "SREA", "Tipo y subtipo de incidente (RF-010); orden 1 y 2 como en la base IRSP.", [
    ("incidente_id", "INTEGER", "PK,FK", "incidente.id", "Incidente."),
    ("tipo_item_id", "INTEGER", "PK,FK", "catalogo_item.id", "Subtipo de TIPO_INCIDENTE (padre = tipo)."),
    ("orden", "SMALLINT", "NN", "", "Prioridad del tipo."),
    ("especificacion", "VARCHAR(255)", "", "", "Texto para 'Otros, especifique'."),
], ts=False)
tabla("incidente_dano", "SREA", "Daño atribuido al incidente (RF-011).", [
    ("incidente_id", "INTEGER", "PK,FK", "incidente.id", "Incidente."),
    ("dano_item_id", "INTEGER", "PK,FK", "catalogo_item.id", "Catálogo DANO_PACIENTE."),
    ("especificacion", "VARCHAR(255)", "", "", "Texto para 'Otro'."),
], ts=False)
tabla("incidente_factor", "SREA", "Factores contribuyentes (RF-011).", [
    ("incidente_id", "INTEGER", "PK,FK", "incidente.id", "Incidente."),
    ("factor_item_id", "INTEGER", "PK,FK", "catalogo_item.id", "FACTOR_CONTRIBUYENTE (padre: paciente, personal, cuidador, herramientas)."),
    ("especificacion", "VARCHAR(255)", "", "", "Texto para 'Otro'."),
], ts=False)
tabla("incidente_personal", "SREA", "Perfil del personal involucrado (RF-014).", [
    ("incidente_id", "INTEGER", "PK,FK", "incidente.id", "Incidente."),
    ("perfil_item_id", "INTEGER", "PK,FK", "catalogo_item.id", "Catálogo PERSONAL_INVOLUCRADO."),
    ("especificacion", "VARCHAR(255)", "", "", "Texto para 'Otros'."),
], ts=False)
tabla("incidente_servicio_rel", "SREA", "Servicios relacionados con el incidente.", [
    ("incidente_id", "INTEGER", "PK,FK", "incidente.id", "Incidente."),
    ("servicio_id", "INTEGER", "PK,FK", "servicio.id", "Servicio relacionado."),
], ts=False)
tabla("medicamento_insumo", "SREA", "Medicamento o dispositivo involucrado (RF-012, CU-01 A1).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("incidente_id", "INTEGER", "FK,NN", "incidente.id", "Incidente."),
    ("tipo", "VARCHAR(12)", "NN", "", "MEDICAMENTO, DISPOSITIVO."),
    ("nombre", "VARCHAR(160)", "NN", "", "Nombre del producto."),
    ("lote", "VARCHAR(40)", "NN", "", "Número de lote."),
    ("fecha_caducidad", "DATE", "NN", "", "Fecha de caducidad."),
    ("numero_serie", "VARCHAR(60)", "", "", "CHECK: obligatorio si tipo = DISPOSITIVO."),
])
tabla("accion_reduccion_riesgo", "SREA", "Acciones de reducción de riesgos (RF-013).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("incidente_id", "INTEGER", "FK,NN", "incidente.id", "Incidente."),
    ("plazo", "VARCHAR(8)", "NN", "", "CORTO (<24 h), MEDIANO (>24 h)."),
    ("descripcion", "TEXT", "NN", "", "Acción implementada."),
])
tabla("analisis_causa_raiz", "SREA", "Análisis causa-efecto, formato MP-1021-237-05 (RF-018, CU-02 A1).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("incidente_id", "INTEGER", "FK,UQ,NN", "incidente.id", "Incidente analizado (1:1)."),
    ("problema", "VARCHAR(255)", "NN", "", "Definición del problema en una oración (efecto)."),
    ("nivel_gravedad_id", "INTEGER", "FK", "catalogo_item.id", "NIVEL_GRAVEDAD_ACR: sin daño, bajo, moderado, grave."),
    ("conclusion", "TEXT", "", "", "Conclusión del análisis."),
    ("estatus", "VARCHAR(12)", "NN", "", "BORRADOR, COMPLETO."),
    ("elaborado_por", "INTEGER", "FK,NN", "usuario.id", "Responsable del análisis."),
    ("completado_en", "TIMESTAMPTZ", "", "", "Fecha de cierre del análisis."),
])
tabla("acr_cronologia", "SREA", "Cronología narrativa del ACR.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("acr_id", "INTEGER", "FK,NN", "analisis_causa_raiz.id", "Análisis."),
    ("fecha_hora", "TIMESTAMPTZ", "NN", "", "Fecha y hora del hecho."),
    ("lugar", "VARCHAR(160)", "", "", "Lugar."),
    ("descripcion", "TEXT", "NN", "", "Descripción del hecho."),
    ("orden", "SMALLINT", "NN", "", "Secuencia."),
])
tabla("acr_causa", "SREA", "Causas del diagrama de Ishikawa.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("acr_id", "INTEGER", "FK,NN", "analisis_causa_raiz.id", "Análisis."),
    ("categoria", "VARCHAR(10)", "NN", "", "POLITICAS, PROCESO, PERSONAL, PACIENTE."),
    ("descripcion", "VARCHAR(500)", "NN", "", "Causa identificada."),
    ("orden", "SMALLINT", "", "", "Orden dentro de la categoría."),
])
tabla("accion_mejora", "SREA", "Acciones de mejora con responsable y fecha (RF-019, CU-13).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("incidente_id", "INTEGER", "FK,NN", "incidente.id", "Incidente de origen."),
    ("acr_id", "INTEGER", "FK", "analisis_causa_raiz.id", "ACR de origen, si existe."),
    ("tipo_accion_id", "INTEGER", "FK", "catalogo_item.id", "TIPO_ACCION_MEJORA."),
    ("descripcion", "TEXT", "NN", "", "Acción requerida."),
    ("responsable", "VARCHAR(160)", "", "", "Persona responsable."),
    ("servicio_responsable_id", "INTEGER", "FK,NN", "servicio.id", "Área responsable (CU-14)."),
    ("fecha_compromiso", "DATE", "NN", "", "Fecha compromiso (CU-13 A3)."),
    ("estatus", "VARCHAR(20)", "NN", "", "PENDIENTE, EVIDENCIA_ENTREGADA, CUMPLIDA, RECHAZADA."),
    ("fecha_cierre", "DATE", "", "", "Cierre de la acción."),
])
tabla("accion_mejora_oficio", "SREA", "Oficios asociados a acciones de mejora.", [
    ("accion_mejora_id", "INTEGER", "PK,FK", "accion_mejora.id", "Acción."),
    ("oficio_id", "INTEGER", "PK,FK", "oficio.id", "Oficio."),
], ts=False)
tabla("evidencia", "SREA", "Evidencia de cumplimiento; archivos en archivo_adjunto (CU-14).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("accion_mejora_id", "INTEGER", "FK,NN", "accion_mejora.id", "Acción atendida."),
    ("observaciones", "TEXT", "", "", "Observaciones del área."),
    ("estatus", "VARCHAR(12)", "NN", "", "BORRADOR, ENTREGADA, ACEPTADA, RECHAZADA."),
    ("entregada_por", "INTEGER", "FK", "usuario.id", "Personal de Salud que entrega."),
    ("entregada_en", "TIMESTAMPTZ", "", "", "Fecha de entrega."),
    ("revisada_por", "INTEGER", "FK", "usuario.id", "Personal de Calidad que valida."),
    ("revisada_en", "TIMESTAMPTZ", "", "", "Fecha de revisión."),
    ("motivo_rechazo", "TEXT", "", "", "CU-13 A2."),
])

# ---------------- Motor de encuestas ----------------
tabla("instrumento", "ENC", "Formato de encuesta versionado (egreso, SESTAD CE, HOSP, URG).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("clave", "VARCHAR(30)", "NN,UQc", "", "Ej. EGRESO, SESTAD_CE, SESTAD_HOSP, SESTAD_URG."),
    ("version", "SMALLINT", "NN,UQc", "", "Versión del formato."),
    ("nombre", "VARCHAR(160)", "NN", "", "Nombre del instrumento."),
    ("codigo_formato", "VARCHAR(30)", "", "", "Ej. MP-1021-214-04, MP-1021-107-01."),
    ("modulo", "VARCHAR(10)", "NN", "", "SUG, SESTAD."),
    ("vigente", "BOOLEAN", "NN", "", "Versión en uso."),
])
tabla("instrumento_seccion", "ENC", "Secciones del instrumento.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("instrumento_id", "INTEGER", "FK,NN", "instrumento.id", "Instrumento."),
    ("clave", "VARCHAR(5)", "", "", "Ej. A, B, C."),
    ("titulo", "VARCHAR(255)", "NN", "", "Título de la sección."),
    ("orden", "SMALLINT", "NN", "", "Orden."),
])
tabla("pregunta", "ENC", "Reactivos con lógica de salto.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("seccion_id", "INTEGER", "FK,NN", "instrumento_seccion.id", "Sección."),
    ("numero", "VARCHAR(10)", "NN", "", "Número impreso en el formato."),
    ("texto", "TEXT", "NN", "", "Enunciado."),
    ("tipo_respuesta", "VARCHAR(10)", "NN", "", "UNICA, MULTIPLE, TEXTO, NUMERO."),
    ("obligatoria", "BOOLEAN", "NN", "", "Si exige respuesta."),
    ("orden", "SMALLINT", "NN", "", "Orden."),
    ("condicion_pregunta_id", "INTEGER", "FK", "pregunta.id", "Se muestra solo si esta pregunta..."),
    ("condicion_opcion_id", "INTEGER", "FK", "opcion_respuesta.id", "...tiene esta opción seleccionada."),
])
tabla("opcion_respuesta", "ENC", "Opciones de respuesta por pregunta.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("pregunta_id", "INTEGER", "FK,NN", "pregunta.id", "Pregunta."),
    ("clave", "VARCHAR(10)", "NN", "", "Ej. a, b, SI, NO, NR."),
    ("texto", "VARCHAR(255)", "NN", "", "Texto visible."),
    ("valor", "NUMERIC(5,2)", "", "", "Valor numérico para cálculos."),
    ("es_favorable", "BOOLEAN", "", "", "Cuenta como respuesta positiva en indicadores."),
    ("orden", "SMALLINT", "", "", "Orden."),
])
tabla("encuesta", "ENC", "Encuesta aplicada (CU-03, CU-17).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("folio", "VARCHAR(20)", "UQ,NN", "", "SES-AAAA-NNNN o EGR-AAAA-NNNN."),
    ("instrumento_id", "INTEGER", "FK,NN", "instrumento.id", "Versión del instrumento aplicada."),
    ("fecha_aplicacion", "DATE", "NN", "", "Fecha de aplicación."),
    ("origen", "VARCHAR(10)", "NN", "", "KIOSCO, CAPTURA."),
    ("aplicador_id", "INTEGER", "FK", "usuario.id", "Encuestador; nulo en kiosco."),
    ("comentarios", "TEXT", "", "", "Observaciones o comentario libre."),
    ("estatus", "VARCHAR(12)", "NN", "", "BORRADOR, COMPLETA, DESCARTADA."),
    ("aviso_privacidad_aceptado", "BOOLEAN", "NN", "", "RNF-006."),
])
tabla("respuesta", "ENC", "Respuestas normalizadas; base del concentrado (RF-030).", [
    ("id", "BIGINT", "PK", "", "Identificador."),
    ("encuesta_id", "BIGINT", "FK,NN,UQc", "encuesta.id", "Encuesta."),
    ("pregunta_id", "INTEGER", "FK,NN,UQc", "pregunta.id", "Pregunta."),
    ("opcion_id", "INTEGER", "FK,UQc", "opcion_respuesta.id", "Opción elegida (varias filas si es MULTIPLE)."),
    ("valor_texto", "TEXT", "", "", "Respuesta abierta."),
    ("valor_numero", "NUMERIC(10,2)", "", "", "Respuesta numérica."),
], ts=False)

# ---------------- SESTAD ----------------
tabla("encuesta_sestad", "SES", "Datos propios de la encuesta SESTAD (RF-028).", [
    ("encuesta_id", "BIGINT", "PK,FK", "encuesta.id", "Encuesta (1:1)."),
    ("periodo_id", "INTEGER", "FK,NN", "periodo.id", "Cuatrimestre."),
    ("area", "VARCHAR(4)", "NN", "", "CE, HOSP, URG."),
    ("servicio_id", "INTEGER", "FK", "servicio.id", "Especialidad o servicio."),
    ("numero_registro", "VARCHAR(20)", "", "", "Registro del paciente."),
], ts=False)
tabla("periodo", "SES", "Periodos cuatrimestrales; reutilizable por MECIC e INDICAS.", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("modulo", "VARCHAR(10)", "NN,UQc", "", "SESTAD (MECIC, INDICAS a futuro)."),
    ("anio", "SMALLINT", "NN,UQc", "", "Año."),
    ("cuatrimestre", "SMALLINT", "NN,UQc", "", "1 a 3."),
    ("fecha_inicio", "DATE", "NN", "", "Inicio."),
    ("fecha_fin", "DATE", "NN", "", "Fin."),
    ("estatus", "VARCHAR(8)", "NN", "", "ABIERTO, CERRADO."),
])
tabla("periodo_variable", "SES", "Variables institucionales del periodo (RF-029).", [
    ("periodo_id", "INTEGER", "PK,FK", "periodo.id", "Periodo."),
    ("clave", "VARCHAR(30)", "PK", "", "EGRESOS_HOSP, CONSULTAS_EXT, ALTAS_URG."),
    ("valor", "INTEGER", "NN", "", "Valor reportado."),
])
tabla("concentrado", "SES", "Instantánea del concentrado al cierre del periodo (RF-030).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("periodo_id", "INTEGER", "FK,NN", "periodo.id", "Periodo."),
    ("instrumento_id", "INTEGER", "FK,NN", "instrumento.id", "Instrumento concentrado."),
    ("datos", "JSONB", "NN", "", "Conteos por pregunta y opción."),
    ("generado_por", "INTEGER", "FK,NN", "usuario.id", "Usuario que cierra."),
    ("generado_en", "TIMESTAMPTZ", "NN", "", "Fecha de generación."),
], ts=False)

# ---------------- SUG ----------------
tabla("qsf", "SUG", "Queja, sugerencia, reclamo o felicitación (CU-06, CU-15, CU-16).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("folio", "VARCHAR(20)", "UQ,NN", "", "SUG-AAAA-NNNN."),
    ("tipo", "VARCHAR(12)", "NN", "", "QUEJA, SUGERENCIA, RECLAMO, FELICITACION."),
    ("medio_captacion_id", "INTEGER", "FK,NN", "catalogo_item.id", "BUZON, EGRESO, PRESENCIAL, KIOSCO, SESTAD."),
    ("origen", "VARCHAR(10)", "NN", "", "DIRECTA, ENCUESTA."),
    ("encuesta_id", "BIGINT", "FK", "encuesta.id", "Encuesta de origen (RF-032, CU-17 A2)."),
    ("fecha_manifestacion", "DATE", "", "", "Fecha anotada por el usuario."),
    ("hora", "TIME", "", "", "Hora de la manifestación."),
    ("fecha_recepcion", "DATE", "NN", "", "Fecha de recepción en Calidad."),
    ("servicio_id", "INTEGER", "FK", "servicio.id", "Servicio señalado por el usuario."),
    ("nombre_manifestante", "VARCHAR(160)", "", "", "Nulo si es anónima."),
    ("numero_registro", "VARCHAR(20)", "", "", "Registro del paciente (sin validar)."),
    ("domicilio", "VARCHAR(255)", "", "", "Contacto (CU-06 A1)."),
    ("telefono", "VARCHAR(20)", "", "", "Contacto (CU-06 A1)."),
    ("anonimo", "BOOLEAN", "NN", "", "Solo sugerencias y felicitaciones (CU-06 A3)."),
    ("descripcion", "TEXT", "NN", "", "Manifestación del usuario."),
    ("solicita_respuesta", "BOOLEAN", "NN", "", "CU-16 A3."),
    ("aviso_privacidad_aceptado", "BOOLEAN", "NN", "", "RNF-006."),
    ("capturado_por", "INTEGER", "FK", "usuario.id", "Nulo si proviene del kiosco."),
    ("estatus", "VARCHAR(25)", "NN", "", "PENDIENTE_CLASIFICACION, REQUIERE_INFORMACION, CLASIFICADA, EN_SEGUIMIENTO, RESUELTA, ARCHIVADA."),
    ("servicio_clasif_id", "INTEGER", "FK", "servicio.id", "Servicio involucrado según Calidad."),
    ("dimension_id", "INTEGER", "FK", "catalogo_item.id", "DIMENSION_CALIDAD (pendiente del hospital)."),
    ("clasificacion_id", "INTEGER", "FK", "catalogo_item.id", "CLASIFICACION_QSF (pendiente del hospital)."),
    ("clasificado_por", "INTEGER", "FK", "usuario.id", "Usuario que clasifica."),
    ("clasificado_en", "TIMESTAMPTZ", "", "", "Fecha de clasificación."),
    ("resolucion", "TEXT", "", "", "Resolución registrada."),
    ("resuelto_en", "TIMESTAMPTZ", "", "", "Fecha de cierre."),
    ("capturado_dgces", "BOOLEAN", "NN", "", "Capturado en la plataforma federal SUG."),
    ("folio_dgces", "VARCHAR(30)", "", "", "Folio federal."),
    ("capturado_dgces_en", "DATE", "", "", "Fecha de captura federal."),
])
tabla("qsf_seguimiento", "SUG", "Historial de seguimiento de la QSF (CU-16).", [
    ("id", "INTEGER", "PK", "", "Identificador."),
    ("qsf_id", "INTEGER", "FK,NN", "qsf.id", "QSF."),
    ("tipo", "VARCHAR(20)", "NN", "", "OFICIO_ENVIADO, RESPUESTA_RECIBIDA, NOTA, CIERRE."),
    ("descripcion", "TEXT", "NN", "", "Detalle."),
    ("usuario_id", "INTEGER", "FK,NN", "usuario.id", "Usuario que registra."),
    ("fecha", "TIMESTAMPTZ", "NN", "", "Fecha del movimiento."),
], ts=False)
tabla("qsf_oficio", "SUG", "Oficios asociados a una QSF.", [
    ("qsf_id", "INTEGER", "PK,FK", "qsf.id", "QSF."),
    ("oficio_id", "INTEGER", "PK,FK", "oficio.id", "Oficio."),
], ts=False)
tabla("encuesta_egreso", "SUG", "Datos propios de la encuesta de egreso MP-1021-107-01 (RF-023).", [
    ("encuesta_id", "BIGINT", "PK,FK", "encuesta.id", "Encuesta (1:1)."),
    ("numero_registro", "VARCHAR(20)", "", "", "Registro del paciente."),
    ("servicio_internamiento_id", "INTEGER", "FK", "servicio.id", "Servicio de internamiento."),
    ("diagnostico_id", "INTEGER", "FK", "diagnostico.id", "Diagnóstico."),
    ("domicilio", "VARCHAR(255)", "", "", "Domicilio."),
    ("telefono", "VARCHAR(20)", "", "", "Teléfono."),
], ts=False)

ZONAS = {
    "SEG": ("Seguridad y usuarios", "transversal"),
    "CAT": ("Catálogos y datos maestros", "transversal"),
    "TRA": ("Servicios transversales", "transversal"),
    "SREA": ("SREA: Notificación de incidentes", "modulo"),
    "ENC": ("Motor de encuestas (SUG y SESTAD)", "modulo"),
    "SES": ("SESTAD: Encuestas de satisfacción", "modulo"),
    "SUG": ("SUG: Quejas, sugerencias y felicitaciones", "modulo"),
}

# Relaciones dibujadas: (hija, padre, card_hija, card_padre)
# card: many, one, zeroone
REL = [
    ("rol_permiso", "rol", "many", "one"), ("rol_permiso", "permiso", "many", "one"),
    ("usuario", "rol", "many", "one"), 
    ("catalogo_item", "catalogo", "many", "one"),
    ("reporte_generado", "archivo_adjunto", "zeroone", "zeroone"),
    ("oficio", "archivo_adjunto", "zeroone", "zeroone"),
    ("incidente", "qsf", "zeroone", "zeroone"),
    ("incidente_tipo", "incidente", "many", "one"), ("incidente_dano", "incidente", "many", "one"),
    ("incidente_factor", "incidente", "many", "one"), ("incidente_personal", "incidente", "many", "one"),
    ("incidente_servicio_rel", "incidente", "many", "one"),
    ("medicamento_insumo", "incidente", "many", "one"), ("accion_reduccion_riesgo", "incidente", "many", "one"),
    ("analisis_causa_raiz", "incidente", "zeroone", "one"),
    ("acr_cronologia", "analisis_causa_raiz", "many", "one"), ("acr_causa", "analisis_causa_raiz", "many", "one"),
    ("accion_mejora", "incidente", "many", "one"), ("accion_mejora", "analisis_causa_raiz", "many", "zeroone"),
    ("accion_mejora_oficio", "accion_mejora", "many", "one"),
    ("evidencia", "accion_mejora", "many", "one"),
    ("instrumento_seccion", "instrumento", "many", "one"), ("pregunta", "instrumento_seccion", "many", "one"),
    ("opcion_respuesta", "pregunta", "many", "one"), ("encuesta", "instrumento", "many", "one"),
    ("respuesta", "encuesta", "many", "one"), ("respuesta", "pregunta", "many", "one"),
    ("respuesta", "opcion_respuesta", "many", "zeroone"),
    ("encuesta_sestad", "encuesta", "zeroone", "one"), ("encuesta_sestad", "periodo", "many", "one"),
    ("periodo_variable", "periodo", "many", "one"), ("concentrado", "periodo", "many", "one"),
    ("encuesta_egreso", "encuesta", "zeroone", "one"),
    ("qsf", "encuesta", "many", "zeroone"), ("qsf_seguimiento", "qsf", "many", "one"),
    ("qsf_oficio", "qsf", "many", "one"),
]

for h, p, *_ in REL:
    assert h in T and p in T, (h, p)
for n, t in T.items():
    for c in t["cols"]:
        if c[3]:
            assert c[3].split(".")[0] in T, (n, c)
