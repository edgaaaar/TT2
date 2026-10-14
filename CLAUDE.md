# Memoria del proyecto P.I.C. (TT 2026-B060)

## Alcance (no negociable)
- SREA, SUG y SESTAD se implementan completos.
- MECIC e INDICAS II solo como puntos de extensión: entrada de menú con pantalla "módulo escalable",
  `modulo_sistema.habilitado = false`. No crear tablas, endpoints ni pantallas funcionales para ellos.
- Integración DGCES solo por exportación Excel/CSV; no existe API pública.
- Toda decisión técnica está en `docs/decisiones-tt2.md` (DEC-01 a DEC-15). Respetarlas.

## Convenciones
- JavaScript ES2022 con ESM. No TypeScript.
- Backend por módulo: model, repository, service, controller, routes, validation, openapi
  (`registerOpenApi()` publica la especificación en `/docs`).
- Esquema solo por migraciones nuevas en `backend/db/migrations` (CommonJS `.cjs`). Nunca `sync`.
  No editar migraciones ya aplicadas.
- Nombres de tablas y columnas en español, snake_case, singular.
- La bitácora se escribe desde la capa de servicios dentro de la misma transacción.
- Respuestas de error con forma `{ error: { codigo, mensaje, detalles } }`.
- Frontend: Material UI como único sistema de componentes; pantallas primero, endpoints como soporte.
- Mensajes de interfaz y comentarios en español.

## Seguridad
- No leer ni versionar archivos `.env`.
- JWT en cookie httpOnly, SameSite=Strict, 30 min deslizantes; CSRF por doble envío.
- bcrypt costo 12; bloqueo tras 5 intentos por 15 min; mensajes de login genéricos.
- Datos de pacientes solo para roles autorizados (RNF-006). ADMIN no ve datos clínicos.

## Verificación antes de cerrar una tarea
`npm run lint`, `npm test`, `npm run build`.
