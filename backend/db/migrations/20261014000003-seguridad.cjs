'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("rol", {
        id: { type: Sequelize.SMALLINT, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del rol." },
        clave: { type: Sequelize.STRING(30), allowNull: false, unique: true, comment: "ADMIN, CALIDAD, SALUD, EVALUADOR_MECIC, PACIENTE, SISTEMA." },
        nombre: { type: Sequelize.STRING(80), allowNull: false, comment: "Nombre visible del rol." },
        descripcion: { type: Sequelize.STRING(255), allowNull: true, comment: "Descripción del rol." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Roles del sistema (RBAC)." });
  
      await queryInterface.createTable("permiso", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del permiso." },
        clave: { type: Sequelize.STRING(80), allowNull: false, unique: true, comment: "Clave modulo.recurso.accion, ej. srea.incidente.clasificar." },
        modulo: { type: Sequelize.STRING(30), allowNull: false, comment: "Módulo al que pertenece el permiso." },
        descripcion: { type: Sequelize.STRING(255), allowNull: true, comment: "Descripción del permiso." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Permisos granulares por módulo y acción." });
  
      await queryInterface.createTable("rol_permiso", {
        rol_id: { type: Sequelize.SMALLINT, primaryKey: true, allowNull: false, references: { model: "rol", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Rol." },
        permiso_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false, references: { model: "permiso", key: "id" }, onUpdate: 'CASCADE', onDelete: 'CASCADE', comment: "Permiso otorgado." },
      }, { transaction, comment: "Asignación de permisos a roles." });
      await queryInterface.sequelize.query("CREATE INDEX ix_rol_permiso_permiso_id ON rol_permiso (permiso_id)", { transaction });
  
      await queryInterface.createTable("usuario", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Identificador del usuario." },
        nombre: { type: Sequelize.STRING(80), allowNull: false, comment: "Nombre(s)." },
        apellido_paterno: { type: Sequelize.STRING(80), allowNull: false, comment: "Apellido paterno." },
        apellido_materno: { type: Sequelize.STRING(80), allowNull: true, comment: "Apellido materno." },
        correo: { type: Sequelize.STRING(120), allowNull: false, unique: true, comment: "Correo institucional; usado como nombre de usuario." },
        password_hash: { type: Sequelize.STRING(100), allowNull: false, comment: "Hash bcrypt (RNF-002)." },
        rol_id: { type: Sequelize.SMALLINT, allowNull: false, references: { model: "rol", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Rol asignado (un rol por usuario)." },
        servicio_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: "servicio", key: "id" }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', comment: "Área de adscripción; filtra acciones de mejora (CU-14)." },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Desactivación lógica (CU-08 A2)." },
        intentos_fallidos: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0, comment: "Intentos fallidos consecutivos (CU-07 A3)." },
        bloqueado_hasta: { type: Sequelize.DATE, allowNull: true, comment: "Fin del bloqueo temporal de 15 min." },
        debe_cambiar_password: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Obliga cambio en el primer ingreso (CU-08 A1)." },
        token_version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0, comment: "Se incrementa para invalidar sesiones activas (CU-08 A4)." },
        ultimo_acceso: { type: Sequelize.DATE, allowNull: true, comment: "Fecha del último inicio de sesión." },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de creación." },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now'), comment: "Fecha de última modificación." },
      }, { transaction, comment: "Cuentas de usuarios internos (RF-001, RF-002, CU-07, CU-08)." });
      await queryInterface.sequelize.query("CREATE INDEX ix_usuario_rol_id ON usuario (rol_id)", { transaction });
      await queryInterface.sequelize.query("CREATE INDEX ix_usuario_servicio_id ON usuario (servicio_id)", { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("usuario", { transaction });
      await queryInterface.dropTable("rol_permiso", { transaction });
      await queryInterface.dropTable("permiso", { transaction });
      await queryInterface.dropTable("rol", { transaction });
    });
  },
};
