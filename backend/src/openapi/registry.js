// Registro incremental de la especificación OpenAPI 3. Cada módulo aporta sus rutas y esquemas
// mediante registerOpenApi(), y la especificación completa se sirve en /docs.
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'API P.I.C. | Plataforma Integrada de Calidad HIMFG',
    version: '0.1.0',
    description: 'API REST de soporte para los módulos SREA, SUG y SESTAD. Trabajo Terminal 2026-B060.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [],
  paths: {},
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'pic_sesion' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              codigo: { type: 'string' },
              mensaje: { type: 'string' },
              detalles: {},
            },
          },
        },
      },
    },
  },
};

export function registerOpenApi({ tags = [], paths = {}, schemas = {} }) {
  spec.tags.push(...tags);
  Object.assign(spec.paths, paths);
  Object.assign(spec.components.schemas, schemas);
}

export function getOpenApiSpec() {
  return spec;
}
