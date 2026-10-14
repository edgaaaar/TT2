# P.I.C. | Plataforma Integrada de Calidad

Plataforma web para la gestión del Sistema Integrado de Calidad del Hospital Infantil de México
"Federico Gómez" (HIMFG). Trabajo Terminal 2026-B060, ESCOM-IPN.

| Módulo | Proceso | Estado en TT2 |
|---|---|---|
| SREA | Notificación de incidentes relacionados con la seguridad del paciente | Implementación completa |
| SUG | Atención de quejas, sugerencias y felicitaciones | Implementación completa |
| SESTAD | Encuesta de satisfacción, trato adecuado y digno | Implementación completa |
| MECIC | Evaluación del expediente clínico | Módulo escalable (solo punto de extensión) |
| INDICAS II | Indicadores de calidad | Módulo escalable (solo punto de extensión) |

## Stack

- **Frontend:** React 18, Material UI, React Router, Axios, Vite.
- **Backend:** Node.js 22 LTS, Express, Sequelize, PostgreSQL 14+, JavaScript ES2022 (ESM).
- **Seguridad:** JWT en cookie httpOnly, bcrypt, RBAC, Helmet, CORS, rate limit.
- **Pruebas:** Vitest, Supertest, Testing Library (Cypress para E2E en el Sprint F).

## Estructura

```
backend/            API REST (src/), migraciones y seeders (db/), pruebas (tests/)
frontend/           SPA (src/)
docs/               Decisiones técnicas, modelo entidad-relación y diccionario de datos
docs/er/schema.py   Fuente única del modelo de datos
```

## Puesta en marcha

Requisitos: Node.js 22 y PostgreSQL 14 o superior.

```bash
npm install
cp backend/.env.example backend/.env       # ajustar credenciales y JWT_SECRET
createdb pic_dev                           # o crear la base desde pgAdmin
npm run db:migrate
npm run db:seed                            # usuarios demo solo si SEED_DEMO_PASSWORD tiene valor
npm run dev:api                            # http://localhost:3000, documentación en /docs
npm run dev:web                            # http://localhost:5173
```

Comandos de verificación: `npm run lint`, `npm test` (requiere la base de pruebas migrada con
`NODE_ENV=test`), `npm run build`.

## Base de datos

- El esquema se gobierna exclusivamente con migraciones (`sequelize-cli`). No se usa `sync`.
- Las migraciones base (`20261014*`) se generaron desde `docs/er/schema.py` con
  `python3 docs/er/gen_migraciones.py`. Una vez aplicadas en un entorno compartido son inmutables:
  todo cambio posterior va en una migración nueva.
- Los catálogos iniciales se extrajeron y depuraron de la hoja "Listas" de la Base de datos IRSP con
  `backend/db/tools/extraer_catalogos.py`.
- `docs/er/gen_drawio.py` y `docs/er/gen_diccionario.py` regeneran el diagrama y el diccionario.

## Flujo de trabajo

Ramas `main` (protegida), `develop` y `feature/*`. Todo cambio entra por pull request con la
plantilla de verificación de alcance. La integración continua ejecuta lint, migraciones (subir,
revertir, subir), seeders, pruebas, build y auditoría de dependencias.

## Documentación

- [Registro de decisiones técnicas](docs/decisiones-tt2.md)
- [Modelo entidad-relación](docs/er/modelo_er_tt2.drawio)
- [Diccionario de datos](docs/er/diccionario_datos_tt2.xlsx)
