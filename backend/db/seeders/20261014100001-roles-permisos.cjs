'use strict';
// Roles (actores del TT1, tabla 2) y matriz de permisos (RNF-005).
// ADMIN es un rol técnico: no tiene acceso a datos clínicos (RNF-006).
// EVALUADOR_MECIC no recibe permisos mientras MECIC esté deshabilitado (DEC-15).
// PACIENTE y SISTEMA son actores lógicos sin inicio de sesión (DEC-05).

const ROLES = [
  ['ADMIN', 'Administrador del Sistema', 'Gestión de usuarios, catálogos y bitácora.'],
  ['CALIDAD', 'Personal de Calidad', 'Gestión de SREA, SUG y SESTAD; reportes y exportaciones.'],
  ['SALUD', 'Personal de Salud', 'Notificación de incidentes y carga de evidencias.'],
  ['EVALUADOR_MECIC', 'Evaluador MECIC', 'Módulo escalable; sin permisos en TT2.'],
  ['PACIENTE', 'Paciente / Familiar', 'Actor externo; usa el kiosco sin sesión.'],
  ['SISTEMA', 'Sistema', 'Acciones automáticas de la plataforma.'],
];

const PERMISOS = [
  ['admin.usuarios.gestionar', 'ADMIN', 'Crear, modificar y desactivar usuarios (CU-08)'],
  ['admin.catalogos.gestionar', 'ADMIN', 'Mantener catálogos (CU-09)'],
  ['admin.bitacora.consultar', 'ADMIN', 'Consultar la bitácora de auditoría (CU-10)'],
  ['dashboard.ver', 'TRANSVERSAL', 'Ver el tablero principal (CU-11)'],
  ['srea.incidente.crear', 'SREA', 'Notificar incidentes (CU-01)'],
  ['srea.incidente.leer_propios', 'SREA', 'Consultar incidentes propios'],
  ['srea.incidente.leer', 'SREA', 'Consultar todos los incidentes'],
  ['srea.incidente.clasificar', 'SREA', 'Clasificar incidentes (CU-02)'],
  ['srea.acr.gestionar', 'SREA', 'Elaborar análisis causa-raíz (CU-02 A1)'],
  ['srea.accion.gestionar', 'SREA', 'Gestionar acciones de mejora y oficios (CU-13)'],
  ['srea.evidencia.cargar', 'SREA', 'Cargar evidencia de cumplimiento (CU-14)'],
  ['srea.evidencia.validar', 'SREA', 'Validar evidencia (CU-13 A1)'],
  ['sug.qsf.registrar', 'SUG', 'Capturar QSF de buzón o presencial'],
  ['sug.qsf.leer', 'SUG', 'Consultar QSF'],
  ['sug.qsf.clasificar', 'SUG', 'Clasificar QSF y derivar a SREA (CU-15)'],
  ['sug.qsf.seguimiento', 'SUG', 'Dar seguimiento a QSF (CU-16)'],
  ['sestad.encuesta.aplicar', 'SESTAD', 'Aplicar encuestas SESTAD (CU-03)'],
  ['sestad.encuesta.leer', 'SESTAD', 'Consultar encuestas y concentrados'],
  ['sestad.periodo.gestionar', 'SESTAD', 'Abrir y cerrar periodos cuatrimestrales'],
  ['reportes.generar', 'REPORTES', 'Generar reportes y estadísticas (CU-12)'],
  ['reportes.exportar_dgces', 'REPORTES', 'Exportar archivos para plataformas DGCES (CU-12 A1)'],
];

const MATRIZ = {
  ADMIN: ['admin.usuarios.gestionar', 'admin.catalogos.gestionar', 'admin.bitacora.consultar', 'dashboard.ver'],
  CALIDAD: PERMISOS.map(([c]) => c).filter(
    (c) => !c.startsWith('admin.') && c !== 'srea.evidencia.cargar' && c !== 'srea.incidente.leer_propios',
  ),
  SALUD: ['srea.incidente.crear', 'srea.incidente.leer_propios', 'srea.evidencia.cargar'],
  EVALUADOR_MECIC: [],
  PACIENTE: [],
  SISTEMA: [],
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'rol',
        ROLES.map(([clave, nombre, descripcion]) => ({ clave, nombre, descripcion, created_at: now, updated_at: now })),
        { transaction },
      );
      await queryInterface.bulkInsert(
        'permiso',
        PERMISOS.map(([clave, modulo, descripcion]) => ({ clave, modulo, descripcion, created_at: now, updated_at: now })),
        { transaction },
      );
      const [roles] = await queryInterface.sequelize.query('SELECT id, clave FROM rol', { transaction });
      const [permisos] = await queryInterface.sequelize.query('SELECT id, clave FROM permiso', { transaction });
      const rolId = Object.fromEntries(roles.map((r) => [r.clave, r.id]));
      const permId = Object.fromEntries(permisos.map((p) => [p.clave, p.id]));
      const filas = Object.entries(MATRIZ).flatMap(([rol, lista]) =>
        lista.map((p) => ({ rol_id: rolId[rol], permiso_id: permId[p] })),
      );
      await queryInterface.bulkInsert('rol_permiso', filas, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('rol_permiso', null, { transaction });
      await queryInterface.bulkDelete('permiso', null, { transaction });
      await queryInterface.bulkDelete('rol', null, { transaction });
    });
  },
};
