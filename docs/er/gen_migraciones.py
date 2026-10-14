"""Genera las migraciones base (sequelize-cli, CommonJS) a partir de schema.py.

Uso: python3 docs/er/gen_migraciones.py
Solo se usa para la línea base del esquema. Una vez aplicadas en un entorno compartido,
las migraciones son inmutables: todo cambio posterior va en una migración nueva escrita a mano.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from schema import T  # noqa: E402

OUT = os.path.join(HERE, "..", "..", "backend", "db", "migrations")
PREFIX = "20261014"

ORDEN = [
    ("000002", "catalogos", ["catalogo", "catalogo_item", "servicio", "diagnostico", "paciente", "establecimiento"]),
    ("000003", "seguridad", ["rol", "permiso", "rol_permiso", "usuario"]),
    ("000004", "transversales", ["archivo_adjunto", "bitacora", "notificacion", "borrador", "folio_secuencia",
                                 "modulo_sistema", "reporte_generado", "oficio"]),
    ("000005", "motor-encuestas", ["instrumento", "instrumento_seccion", "pregunta", "opcion_respuesta",
                                   "encuesta", "respuesta"]),
    ("000006", "sestad", ["periodo", "periodo_variable", "encuesta_sestad", "concentrado"]),
    ("000007", "sug", ["qsf", "qsf_seguimiento", "qsf_oficio", "encuesta_egreso"]),
    ("000008", "srea", ["incidente", "incidente_tipo", "incidente_dano", "incidente_factor", "incidente_personal",
                        "incidente_servicio_rel", "medicamento_insumo", "accion_reduccion_riesgo",
                        "analisis_causa_raiz", "acr_cronologia", "acr_causa", "accion_mejora",
                        "accion_mejora_oficio", "evidencia"]),
]
assert sorted(t for _, _, ts in ORDEN for t in ts) == sorted(T), "ORDEN no cubre todas las tablas"

NOW = "__NOW__"
DEFAULTS = {
    "activo": True, "capturado_dgces": False, "intentos_fallidos": 0, "token_version": 0,
    "debe_cambiar_password": True, "requiere_especificar": False, "anonimo": False,
    "created_at": NOW, "updated_at": NOW,
    "solicita_respuesta": False, "aviso_privacidad_aceptado": False, "vigente": True, "habilitado": True,
    "editable": True, "jerarquico": False, "es_area_atencion": False, "obligatoria": True, "ultimo_valor": 0,
    ("bitacora", "fecha"): NOW, ("incidente", "fecha_notificacion"): NOW, ("qsf_seguimiento", "fecha"): NOW,
    ("concentrado", "generado_en"): NOW,
    ("incidente", "estatus"): "PENDIENTE_CLASIFICACION", ("incidente", "origen"): "DIRECTO",
    ("qsf", "estatus"): "PENDIENTE_CLASIFICACION", ("qsf", "origen"): "DIRECTA",
    ("analisis_causa_raiz", "estatus"): "BORRADOR", ("accion_mejora", "estatus"): "PENDIENTE",
    ("evidencia", "estatus"): "BORRADOR", ("encuesta", "estatus"): "BORRADOR",
    ("periodo", "estatus"): "ABIERTO", ("incidente_tipo", "orden"): 1,
}

ENUMS = {
    ("incidente", "estatus"): ["PENDIENTE_CLASIFICACION", "REQUIERE_INFORMACION", "CLASIFICADO", "EN_ANALISIS",
                               "PENDIENTE_EVIDENCIA", "CERRADO"],
    ("incidente", "origen"): ["DIRECTO", "QSF"],
    ("medicamento_insumo", "tipo"): ["MEDICAMENTO", "DISPOSITIVO"],
    ("accion_reduccion_riesgo", "plazo"): ["CORTO", "MEDIANO"],
    ("analisis_causa_raiz", "estatus"): ["BORRADOR", "COMPLETO"],
    ("acr_causa", "categoria"): ["POLITICAS", "PROCESO", "PERSONAL", "PACIENTE"],
    ("accion_mejora", "estatus"): ["PENDIENTE", "EVIDENCIA_ENTREGADA", "CUMPLIDA", "RECHAZADA"],
    ("evidencia", "estatus"): ["BORRADOR", "ENTREGADA", "ACEPTADA", "RECHAZADA"],
    ("oficio", "tipo"): ["SOLICITUD", "RESPUESTA"],
    ("oficio", "modulo"): ["SREA", "SUG"],
    ("instrumento", "modulo"): ["SUG", "SESTAD"],
    ("pregunta", "tipo_respuesta"): ["UNICA", "MULTIPLE", "TEXTO", "NUMERO"],
    ("encuesta", "origen"): ["KIOSCO", "CAPTURA"],
    ("encuesta", "estatus"): ["BORRADOR", "COMPLETA", "DESCARTADA"],
    ("encuesta_sestad", "area"): ["CE", "HOSP", "URG"],
    ("periodo", "estatus"): ["ABIERTO", "CERRADO"],
    ("qsf", "tipo"): ["QUEJA", "SUGERENCIA", "RECLAMO", "FELICITACION"],
    ("qsf", "origen"): ["DIRECTA", "ENCUESTA"],
    ("qsf", "estatus"): ["PENDIENTE_CLASIFICACION", "REQUIERE_INFORMACION", "CLASIFICADA", "EN_SEGUIMIENTO",
                         "RESUELTA", "ARCHIVADA"],
    ("qsf_seguimiento", "tipo"): ["OFICIO_ENVIADO", "RESPUESTA_RECIBIDA", "NOTA", "CIERRE"],
    ("archivo_adjunto", "entidad"): ["incidente", "evidencia", "oficio", "reporte_generado", "qsf"],
    ("folio_secuencia", "modulo"): ["SREA", "SUG", "SES", "EGR"],
    ("reporte_generado", "formato"): ["PDF", "XLSX", "CSV"],
}

RAW_CHECKS = {
    "medicamento_insumo": [("dispositivo_serie", "tipo <> 'DISPOSITIVO' OR numero_serie IS NOT NULL")],
    "qsf": [("anonimo_tipo", "NOT anonimo OR tipo IN ('SUGERENCIA','FELICITACION')"),
            ("origen_encuesta", "origen <> 'ENCUESTA' OR encuesta_id IS NOT NULL")],
    "incidente": [("origen_qsf", "origen <> 'QSF' OR qsf_id IS NOT NULL"),
                  ("peso_talla", "(peso_kg IS NULL OR peso_kg > 0) AND (talla_m IS NULL OR talla_m > 0)")],
    "periodo": [("cuatrimestre", "cuatrimestre BETWEEN 1 AND 3"), ("fechas", "fecha_fin >= fecha_inicio")],
    "incidente_tipo": [("orden", "orden >= 1")],
    "archivo_adjunto": [("tamano", "tamano_bytes > 0 AND tamano_bytes <= 10485760")],
}

# Únicos compuestos (expresiones con COALESCE para que NULL no evada la unicidad en PostgreSQL 14).
UNIQUE_IDX = {
    "catalogo_item": [("uq_catalogo_item_nombre", "(catalogo_id, COALESCE(padre_id, 0), lower(nombre))", None)],
    "borrador": [("uq_borrador_formulario", "(usuario_id, tipo_formulario, COALESCE(entidad_id, 0))", None)],
    "respuesta": [("uq_respuesta_opcion", "(encuesta_id, pregunta_id, COALESCE(opcion_id, 0))", None)],
    "instrumento": [("uq_instrumento_version", "(clave, version)", None),
                    ("uq_instrumento_vigente", "(clave)", "vigente")],
    "periodo": [("uq_periodo", "(modulo, anio, cuatrimestre)", None)],
}

EXTRA_IDX = {
    "diagnostico": [("ix_diagnostico_descripcion_trgm", "USING gin (descripcion gin_trgm_ops)", None)],
    "bitacora": [("ix_bitacora_fecha", "(fecha DESC)", None), ("ix_bitacora_entidad", "(entidad, entidad_id)", None)],
    "notificacion": [("ix_notificacion_no_leidas", "(usuario_id, created_at DESC)", "leida_en IS NULL")],
    "archivo_adjunto": [("ix_archivo_entidad", "(entidad, entidad_id)", None)],
    "incidente": [("ix_incidente_estatus", "(estatus)", None), ("ix_incidente_fecha", "(fecha_incidente)", None)],
    "qsf": [("ix_qsf_estatus", "(estatus)", None), ("ix_qsf_fecha", "(fecha_recepcion)", None)],
    "accion_mejora": [("ix_accion_mejora_compromiso", "(estatus, fecha_compromiso)", None)],
}

CASCADE = {
    ("rol_permiso", "rol_id"), ("rol_permiso", "permiso_id"), ("catalogo_item", "catalogo_id"),
    ("incidente_tipo", "incidente_id"), ("incidente_dano", "incidente_id"), ("incidente_factor", "incidente_id"),
    ("incidente_personal", "incidente_id"), ("incidente_servicio_rel", "incidente_id"),
    ("medicamento_insumo", "incidente_id"), ("accion_reduccion_riesgo", "incidente_id"),
    ("acr_cronologia", "acr_id"), ("acr_causa", "acr_id"), ("accion_mejora_oficio", "accion_mejora_id"),
    ("accion_mejora_oficio", "oficio_id"), ("qsf_oficio", "qsf_id"), ("qsf_oficio", "oficio_id"),
    ("instrumento_seccion", "instrumento_id"), ("pregunta", "seccion_id"), ("opcion_respuesta", "pregunta_id"),
    ("respuesta", "encuesta_id"), ("encuesta_sestad", "encuesta_id"), ("encuesta_egreso", "encuesta_id"),
    ("periodo_variable", "periodo_id"),
}


def js_type(t):
    if t == "SMALLINT": return "Sequelize.SMALLINT"
    if t == "INTEGER": return "Sequelize.INTEGER"
    if t == "BIGINT": return "Sequelize.BIGINT"
    if t == "TEXT": return "Sequelize.TEXT"
    if t == "BOOLEAN": return "Sequelize.BOOLEAN"
    if t == "DATE": return "Sequelize.DATEONLY"
    if t == "TIMESTAMPTZ": return "Sequelize.DATE"
    if t == "TIME": return "Sequelize.TIME"
    if t == "JSONB": return "Sequelize.JSONB"
    if t == "INET": return "Sequelize.INET"
    m = re.fullmatch(r"VARCHAR\((\d+)\)", t)
    if m: return f"Sequelize.STRING({m.group(1)})"
    m = re.fullmatch(r"CHAR\((\d+)\)", t)
    if m: return f"Sequelize.CHAR({m.group(1)})"
    m = re.fullmatch(r"NUMERIC\((\d+),(\d+)\)", t)
    if m: return f"Sequelize.DECIMAL({m.group(1)}, {m.group(2)})"
    raise ValueError(t)


def js_val(v):
    if v == NOW:
        return "Sequelize.fn('now')"
    return json.dumps(v, ensure_ascii=False)


def q(s):
    return json.dumps(s, ensure_ascii=False)


TS = [("created_at", "TIMESTAMPTZ", "NN", "", "Fecha de creación."),
      ("updated_at", "TIMESTAMPTZ", "NN", "", "Fecha de última modificación.")]

created = set()
deferred = []  # (tabla, columna, ref_tabla, ref_col, nulo)


def column_js(t, col, typ, flags, ref):
    f = [x for x in flags.split(",") if x]
    pks = [c for c in T[t]["cols"] if "PK" in c[2]]
    props = [f"type: {js_type(typ)}"]
    if "PK" in f:
        props.append("primaryKey: true")
        if col == "id" and len(pks) == 1:
            props.append("autoIncrement: true")
    props.append(f"allowNull: {'false' if ('NN' in f or 'PK' in f) else 'true'}")
    if "UQ" in f:
        props.append("unique: true")
    d = DEFAULTS.get((t, col), DEFAULTS.get(col))
    if d is not None and col not in ("id",):
        props.append(f"defaultValue: {js_val(d)}")
    if ref:
        rt, rc = ref.split(".")
        if rt in created or rt == t:
            on_delete = "CASCADE" if (t, col) in CASCADE else "RESTRICT"
            props.append(f"references: {{ model: {q(rt)}, key: {q(rc)} }}")
            props.append("onUpdate: 'CASCADE'")
            props.append(f"onDelete: '{on_delete}'")
        else:
            deferred.append((t, col, rt, rc))
    return props


def table_block(t):
    d = T[t]
    cols = d["cols"] + (TS if d["ts"] else [])
    lines = [f"    await queryInterface.createTable({q(t)}, {{"]
    for col, typ, flags, ref, desc in cols:
        props = column_js(t, col, typ, flags, ref)
        props.append(f"comment: {q(desc)}")
        lines.append(f"      {col}: {{ " + ", ".join(props) + " },")
    lines.append(f"    }}, {{ transaction, comment: {q(d['desc'])} }});")
    sql = []
    for (tt, col), vals in ENUMS.items():
        if tt == t:
            lst = ", ".join("'" + v + "'" for v in vals)
            sql.append(f"ALTER TABLE {t} ADD CONSTRAINT ck_{t}_{col} CHECK ({col} IN ({lst}))")
    for name, expr in RAW_CHECKS.get(t, []):
        sql.append(f"ALTER TABLE {t} ADD CONSTRAINT ck_{t}_{name} CHECK ({expr})")
    for name, expr, where in UNIQUE_IDX.get(t, []):
        sql.append(f"CREATE UNIQUE INDEX {name} ON {t} {expr}" + (f" WHERE {where}" if where else ""))
    # Índices sobre FK (PostgreSQL no los crea automáticamente), salvo si la FK encabeza la PK.
    pk_first = next((c[0] for c in d["cols"] if "PK" in c[2]), None)
    for col, typ, flags, ref, _ in d["cols"]:
        if ref and col != pk_first and "UQ" not in flags.split(","):
            sql.append(f"CREATE INDEX ix_{t}_{col} ON {t} ({col})")
    for name, expr, where in EXTRA_IDX.get(t, []):
        sql.append(f"CREATE INDEX {name} ON {t} {expr}" + (f" WHERE {where}" if where else ""))
    for s in sql:
        lines.append(f"    await queryInterface.sequelize.query({q(s)}, {{ transaction }});")
    created.add(t)
    return "\n".join(lines)


HEADER = """'use strict';
// Migración generada desde docs/er/schema.py (gen_migraciones.py). Línea base del esquema TT2.
// No editar una vez aplicada en un entorno compartido: crear una migración nueva.
"""


def write(name, up_body, down_body):
    path = os.path.join(OUT, f"{PREFIX}{name}.cjs")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(HEADER)
        fh.write("/** @type {import('sequelize-cli').Migration} */\nmodule.exports = {\n")
        fh.write("  async up(queryInterface" + (", Sequelize" if "Sequelize." in up_body else "") + ") {\n")
        fh.write("    await queryInterface.sequelize.transaction(async (transaction) => {\n")
        fh.write("\n".join("  " + ln for ln in up_body.split("\n")) + "\n")
        fh.write("    });\n  },\n\n  async down(queryInterface) {\n")
        fh.write("    await queryInterface.sequelize.transaction(async (transaction) => {\n")
        fh.write("\n".join("  " + ln for ln in down_body.split("\n")) + "\n")
        fh.write("    });\n  },\n};\n")
    return path


os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith(PREFIX) and f.endswith(".cjs"):
        os.remove(os.path.join(OUT, f))

# 01: extensiones
write("000001-extensiones",
      "    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm', { transaction });",
      "    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pg_trgm', { transaction });")

BITACORA_SQL = [
    "CREATE OR REPLACE FUNCTION fn_bitacora_inmutable() RETURNS trigger LANGUAGE plpgsql AS $$ "
    "BEGIN RAISE EXCEPTION 'La bitacora es de solo insercion (RF-007, DEC-04)'; END; $$",
    "CREATE TRIGGER trg_bitacora_inmutable BEFORE UPDATE OR DELETE ON bitacora "
    "FOR EACH ROW EXECUTE FUNCTION fn_bitacora_inmutable()",
    "CREATE TRIGGER trg_bitacora_no_truncate BEFORE TRUNCATE ON bitacora "
    "FOR EACH STATEMENT EXECUTE FUNCTION fn_bitacora_inmutable()",
]

for num, nombre, tablas in ORDEN:
    blocks = [table_block(t) for t in tablas]
    if "bitacora" in tablas:
        blocks += [f"    await queryInterface.sequelize.query({q(s)}, {{ transaction }});" for s in BITACORA_SQL]
    down = [f"    await queryInterface.dropTable({q(t)}, {{ transaction }});" for t in reversed(tablas)]
    if "bitacora" in tablas:
        down.append("    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_bitacora_inmutable()', { transaction });")
    write(f"{num}-{nombre}", "\n\n".join(blocks), "\n".join(down))

# 09: llaves foráneas diferidas (ciclos y referencias hacia tablas creadas después)
up, down = [], []
for t, col, rt, rc in deferred:
    cname = f"fk_{t}_{col}"
    on_delete = "CASCADE" if (t, col) in CASCADE else "RESTRICT"
    up.append(f"    await queryInterface.addConstraint({q(t)}, {{ fields: [{q(col)}], type: 'foreign key', name: {q(cname)}, "
              f"references: {{ table: {q(rt)}, field: {q(rc)} }}, onUpdate: 'CASCADE', onDelete: '{on_delete}', transaction }});")
    down.append(f"    await queryInterface.removeConstraint({q(t)}, {q(cname)}, {{ transaction }});")
write("000009-fk-diferidas", "\n".join(up) or "    // Sin llaves diferidas", "\n".join(reversed(down)) or "    // Sin llaves diferidas")

print("migraciones generadas en", os.path.normpath(OUT))
print("llaves diferidas:", deferred)
