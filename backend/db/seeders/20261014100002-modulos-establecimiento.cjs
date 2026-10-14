'use strict';
// Módulos del Sistema Integrado de Calidad (MECIC e INDICAS II deshabilitados, DEC-15)
// y datos del establecimiento para SESTAD (RF-028).

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const ts = { created_at: now, updated_at: now };
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'modulo_sistema',
        [
          { clave: 'SREA', nombre: 'Notificación de Incidentes Relacionados con la Seguridad del Paciente', habilitado: true, ...ts },
          { clave: 'SUG', nombre: 'Atención de Quejas, Sugerencias y Felicitaciones', habilitado: true, ...ts },
          { clave: 'SESTAD', nombre: 'Encuesta de Satisfacción, Trato Adecuado y Digno', habilitado: true, ...ts },
          { clave: 'MECIC', nombre: 'Modelo de Evaluación del Expediente Clínico', habilitado: false, ...ts },
          { clave: 'INDICAS', nombre: 'Sistema Nacional de Indicadores de Calidad en Salud', habilitado: false, ...ts },
        ],
        { transaction },
      );
      // La CLUES se confirma con el Servicio de Calidad antes del despliegue.
      await queryInterface.bulkInsert(
        'establecimiento',
        [
          {
            nombre: 'Hospital Infantil de México Federico Gómez',
            clues: 'PENDIENTE',
            institucion: 'Secretaría de Salud',
            municipio: 'Cuauhtémoc',
            estado: 'Ciudad de México',
            ...ts,
          },
        ],
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('establecimiento', null, {});
    await queryInterface.bulkDelete('modulo_sistema', null, {});
  },
};
