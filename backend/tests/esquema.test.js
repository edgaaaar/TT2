// Pruebas de integración del esquema contra PostgreSQL real (plan de pruebas 4.6.2, primer nivel).
// Requieren la base de pruebas migrada: npm run db:migrate con NODE_ENV=test.
import { afterAll, describe, expect, it } from 'vitest';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../src/config/db.js';

const one = (sql, replacements) => sequelize.query(sql, { type: QueryTypes.SELECT, plain: true, replacements });

afterAll(async () => {
  await sequelize.close();
});

describe('Esquema base TT2', () => {
  it('contiene las 46 tablas del modelo entidad-relación', async () => {
    const r = await one(
      "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT LIKE 'sequelize%'",
    );
    expect(r.n).toBe(46);
  });

  it('contiene las 86 llaves foráneas del diccionario de datos', async () => {
    const r = await one(
      "SELECT count(*)::int AS n FROM pg_constraint c JOIN pg_namespace s ON s.oid = c.connamespace WHERE s.nspname = 'public' AND c.contype = 'f'",
    );
    expect(r.n).toBe(86);
  });

  it('la bitácora es de solo inserción (RF-007, DEC-04)', async () => {
    await sequelize.transaction(async (transaction) => {
      await sequelize.query("INSERT INTO bitacora (accion, modulo) VALUES ('PRUEBA', 'TEST')", { transaction });
      await expect(
        sequelize.query("UPDATE bitacora SET modulo = 'ALTERADO' WHERE accion = 'PRUEBA'", { transaction }),
      ).rejects.toThrow(/solo insercion/);
      throw new Error('rollback');
    }).catch((e) => {
      if (e.message !== 'rollback') throw e;
    });
  });

  it('impide QSF anónimas de tipo queja (CU-06 A3)', async () => {
    await expect(
      sequelize.query(
        `INSERT INTO qsf (folio, tipo, medio_captacion_id, fecha_recepcion, descripcion, anonimo)
         VALUES ('SUG-TEST-0001', 'QUEJA', 1, CURRENT_DATE, 'x', true)`,
      ),
    ).rejects.toThrow(/ck_qsf_anonimo_tipo/);
  });

  it('exige número de serie para dispositivos médicos (RF-012)', async () => {
    const r = await one(
      "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'ck_medicamento_insumo_dispositivo_serie'",
    );
    expect(r.def).toMatch(/numero_serie IS NOT NULL/);
  });
});
