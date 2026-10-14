# Registro de decisiones técnicas TT2 (2026-B060)

Versión 1.1 | Aprobado: 13/10/2026 | Ajuste DEC-08: prefijo EGR | Fuentes: Reporte Técnico Final TT1, Cronograma Maestro, Base de datos IRSP Excel.xlsx

| ID | Tema | Decisión | Justificación / impacto |
|---|---|---|---|
| DEC-01 | Repositorio | Monorepo nuevo con npm workspaces: `frontend/`, `backend/`, `docs/` (ADR, .drawio, diccionario). El módulo auth/RBAC/usuarios del repositorio previo se migra manualmente con revisión. Ramas `main`, `develop`, `feature/*`; `main` protegida. | RNF-018. Evita reescribir trabajo existente. |
| DEC-02 | Frontend | React 18 + Vite; Material UI como único sistema de componentes (se elimina Tailwind); React Router; React Hook Form. El prototipo estático es solo referencia visual y de flujo. | Corrige incongruencia entre 4.1.3 y 4.2.3/5 del reporte. CRA está descontinuado. |
| DEC-03 | Esquema | Migraciones y seeders con `sequelize-cli`. `sync` prohibido fuera de pruebas. | Trazabilidad y reproducibilidad del esquema. |
| DEC-04 | Bitácora | Dentro del alcance. Tabla de solo inserción, escrita desde la capa de servicio en la misma transacción; guarda estado antes/después en JSONB. | RF-007, CU-10, CU-02 A3, CU-08. Corrige 4.3.2 del reporte. |
| DEC-05 | Kiosco / Paciente | Sin cuentas de paciente. Solo dos endpoints públicos de creación (QSF y encuesta de egreso) con rate limit por IP, validación estricta y campo honeypot. Ruta `/kiosco` aislada, con aviso de privacidad y de no represalia. PACIENTE se conserva como actor lógico sin login. | RNF-005, RNF-006, CU-06, CU-17. Sin captcha externo por privacidad y RNF-020. |
| DEC-06 | Sesión y CSRF | JWT en cookie `httpOnly`, `secure`, `SameSite=Strict`, expiración deslizante de 30 min. CSRF por doble envío (cookie legible + encabezado `X-CSRF-Token`) en métodos mutables. No se usa `csurf` (obsoleto). | RNF-003, RNF-004. |
| DEC-07 | Borradores | Tabla `borrador` (usuario, tipo de formulario, contenido JSONB, fecha). Autoguardado con debounce en formularios autenticados (SREA, ACR, SESTAD). El kiosco no guarda borradores. Recorte posible: solo SREA. | RNF-012, R-05, CU-17 A1. |
| DEC-08 | Folios | Formato interno `SREA-AAAA-NNNN`, `SUG-AAAA-NNNN`, `SES-AAAA-NNNN` y `EGR-AAAA-NNNN` (encuesta de egreso), generado en transacción con tabla de secuencia bloqueada por fila. Campos adicionales `folio_dgces` y `capturado_dgces` (con fecha). | RF-016. La base IRSP actual registra "Capturado en SREA" y "Folio SREA". Reinicio anual por validar. |
| DEC-09 | Oficios | La plataforma genera el borrador del oficio en PDF (PDFKit). El número oficial y el número de oficio de respuesta se capturan como texto. Sin envío de correo; avisos por notificación interna. | CU-13, CU-16. Numeración real asignada por el hospital (ej. 1021/0935/2025). |
| DEC-10 | Exportación DGCES | Excel/CSV con ExcelJS. Mapeo de columnas por módulo en archivo de configuración. Layout SREA derivado de la base IRSP; SUG y SESTAD pendientes de entrega por el hospital. | RF-020, CU-12, R-03. |
| DEC-11 | Catálogos | Tablas genéricas `catalogo` y `catalogo_item` con `padre_id` para jerarquías. Carga inicial desde la hoja "Listas" depurada. Diagnósticos con búsqueda en servidor. | RF-003, CU-09, RNF-017, R-02. |
| DEC-12 | Datos históricos | No se migran registros 2023 a 2026 a producción. Se usa un subconjunto anonimizado para pruebas y demostración. Migración completa como trabajo futuro. | R-12. RNF-006 (las descripciones contienen nombres y registros). |
| DEC-13 | Archivos adjuntos | Multer 2.x, almacenamiento en disco fuera del webroot, metadatos en BD, 10 MB máx., lista blanca PDF/JPG/PNG/DOCX con verificación de firma, descarga por endpoint autorizado. | RF-015, CU-14, RNF-009. |
| DEC-14 | Pruebas | Vitest (frontend y backend), Supertest (API), Cypress (E2E). Cobertura mínima 70% en auth, SREA y SUG. | Plan de pruebas 4.6. |
| DEC-15 | MECIC / INDICAS II | Entrada de menú con pantalla "módulo escalable, no habilitado". Sin tablas propias en las migraciones de TT2; diseño solo en el modelo conceptual y en la estructura genérica de catálogos. | Alcance del protocolo y del TT1. |

## Pendientes de validación con el Servicio de Calidad

1. Reinicio anual o numeración continua del folio.
2. Layouts de captura de las plataformas federales SUG y SESTAD.
3. Responsable y formato de la numeración de oficios.
