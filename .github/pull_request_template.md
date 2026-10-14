## Descripción

<!-- Qué cambia y por qué. -->

## Trazabilidad

- RF / RNF:
- Casos de uso:
- Decisiones (DEC-xx):

## Verificación de alcance

- [ ] El cambio pertenece a SREA, SUG, SESTAD o a los servicios transversales.
- [ ] No implementa funcionalidad de MECIC ni INDICAS II más allá de sus puntos de extensión (DEC-15).
- [ ] No agrega funcionalidades fuera de la línea base del TT1 (si aplica, se registró como trabajo futuro).

## Calidad

- [ ] `npm run lint` sin errores.
- [ ] `npm test` en verde; se agregaron pruebas para la lógica nueva.
- [ ] Los cambios de esquema van en una migración nueva (no se editaron migraciones aplicadas).
- [ ] La especificación OpenAPI se actualizó si cambió la API.
- [ ] No se incluyen secretos ni archivos `.env`.
