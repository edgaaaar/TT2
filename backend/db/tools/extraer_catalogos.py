"""Extrae y depura los catálogos de la hoja "Listas" de la Base de datos IRSP del HIMFG.

Uso: python3 -I backend/db/tools/extraer_catalogos.py "<ruta>/Base de datos IRSP Excel.xlsx"
Salida: backend/db/seed-data/catalogos.json, servicios.json, diagnosticos.json
Solo se leen catálogos (sin datos de pacientes). Las correcciones aplicadas quedan en CORRECCIONES.
"""
import json
import os
import re
import sys
import unicodedata

import openpyxl

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "seed-data")

CORRECCIONES = {
    "Camilllero": "Camillero",
    "Tenologías de la Información": "Tecnologías de la información",
    "Agresión secual": "Agresión sexual",
    "Otros": "Otros",
}

# Columna de la hoja Listas -> nombre del tipo de incidente (formato MP-6001-213-03)
TIPOS_INCIDENTE = [
    ("Administración_Clínica", "Administración clínica"),
    ("Proceso_Procedimiento_Clínico", "Proceso/procedimiento clínico"),
    ("Medicación_LíquidosIV", "Medicación/líquidos para administración IV"),
    ("Sangre_ProductosSanguíneos", "Sangre/productos sanguíneos"),
    ("Nutrición", "Nutrición"),
    ("Comportamiento", "Comportamiento"),
    ("Accidentes_Pacientes", "Accidentes de los pacientes"),
    ("Caídas", "Caídas"),
    ("IAAS", "Infección asociada a la atención de la salud (IAAS)"),
    ("Dispositivos_Médicos", "Dispositivos/equipos médicos"),
    ("Infraestructura_Instalaciones", "Infraestructuras/locales/instalaciones"),
    ("Documentación", "Documentación"),
    ("Recursos_Gestión", "Recursos/gestión de la organización"),
    ("Organización_Equipos_Personas", "Organización de equipos/personas"),
    ("Oxígeno_Gases", "Oxígeno/gases/vapores"),
]
FACTORES = [("Paciente", "Paciente"), ("Personal", "Personal de salud"), ("Cuidador", "Cuidador primario"),
            ("Herramientas_Tecnologías", "Herramientas y tecnologías")]


def limpiar(v):
    if v is None:
        return None
    s = re.sub(r"\s+", " ", str(v)).strip()
    s = re.sub(r"\s*/\s*", "/", s)
    s = CORRECCIONES.get(s, s)
    return s or None


def clave(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z0-9]+", "_", s.upper()).strip("_")[:50]


def es_otro(s):
    return s.lower().startswith(("otro", "otra", "falló"))


def main(xlsx):
    ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)["Listas"]
    rows = list(ws.iter_rows(values_only=True))
    hdr = [limpiar(h) for h in rows[0]]

    def col(nombre):
        j = hdr.index(nombre)
        vistos, out = set(), []
        for r in rows[1:]:
            v = limpiar(r[j]) if j < len(r) else None
            if v and v.lower() not in vistos:
                vistos.add(v.lower())
                out.append(v)
        return out

    def plano(clave_cat, nombre, items, excluir=()):
        return {"clave": clave_cat, "nombre": nombre, "jerarquico": False,
                "items": [{"nombre": i, "requiere_especificar": es_otro(i)} for i in items if i not in excluir]}

    catalogos = [
        plano("TURNO", "Turno", ["Matutino", "Vespertino", "Nocturno", "Jornada especial"]),
        plano("GENERO", "Género", ["Femenino", "Masculino"]),
        {"clave": "TIPO_INCIDENTE", "nombre": "Tipo de incidente (MP-6001-213-03)", "jerarquico": True,
         "items": [{"nombre": nombre, "hijos": [{"nombre": h, "requiere_especificar": es_otro(h)} for h in col(c)]}
                   for c, nombre in TIPOS_INCIDENTE]},
        plano("DANO_PACIENTE", "Daño atribuido al incidente", col("Daño al paciente")),
        {"clave": "FACTOR_CONTRIBUYENTE", "nombre": "Factores contribuyentes", "jerarquico": True,
         "items": [{"nombre": nombre, "hijos": [{"nombre": h, "requiere_especificar": es_otro(h)} for h in col(c)]}
                   for c, nombre in FACTORES]},
        plano("PERSONAL_INVOLUCRADO", "Personal involucrado", col("Personal_Involucrado"), excluir=("Ninguno",)),
        plano("CLASIFICACION_IRSP", "Clasificación del incidente (taxonomía OMS)",
              ["Factor contribuyente notificable", "Cuasifalla", "Evento adverso", "Evento centinela"]),
        plano("GRADO_DANO", "Grado de daño (Clasificación de Incidente IRSP)",
              ["Ninguno", "Leve", "Moderado", "Grave", "Muerte"]),
        plano("NIVEL_GRAVEDAD_ACR", "Nivel de gravedad del daño (MP-1021-237-05)",
              ["Sin daño", "Bajo", "Moderado", "Grave"]),
        plano("EVENTO_TRASCENDENTE", "Eventos trascendentes", col("Eventos Trascendentes"), excluir=("No Aplica",)),
        plano("TIPO_ACCION_MEJORA", "Tipo de acción de mejora", col("Tipos de Acciones de Mejora"),
              excluir=("Ninguna",)),
        plano("MEDIO_CAPTACION", "Medio de captación de QSF",
              ["Buzón físico", "Encuesta de egreso", "Atención presencial", "Kiosco digital", "Encuesta SESTAD"]),
        {"clave": "DIMENSION_CALIDAD", "nombre": "Dimensión de la calidad (QSF)", "jerarquico": False,
         "items": [], "pendiente": "Valores por confirmar con el Servicio de Calidad"},
        {"clave": "CLASIFICACION_QSF", "nombre": "Clasificación interna de QSF", "jerarquico": False,
         "items": [], "pendiente": "Valores por confirmar con el Servicio de Calidad"},
    ]
    # orden de ordenamiento estable y orden numérico
    for c in catalogos:
        for i, it in enumerate(c["items"], 1):
            it["orden"] = i
            for k, h in enumerate(it.get("hijos", []), 1):
                h["orden"] = k

    areas = col("Áreas")
    rel = col("Servicios Relacionados")
    servicios, vistos = [], {}
    for n in areas + rel:
        k = n.lower()
        if k in vistos:
            if n in areas:
                vistos[k]["es_area_atencion"] = True
            continue
        s = {"nombre": n, "es_area_atencion": n in areas}
        vistos[k] = s
        servicios.append(s)

    diagnosticos = col("Diagnóstico")

    os.makedirs(OUT, exist_ok=True)
    for nombre, data in (("catalogos", catalogos), ("servicios", servicios), ("diagnosticos", diagnosticos)):
        with open(os.path.join(OUT, f"{nombre}.json"), "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=1 if nombre != "diagnosticos" else None)
    print(f"catalogos={len(catalogos)} servicios={len(servicios)} "
          f"(areas={sum(s['es_area_atencion'] for s in servicios)}) diagnosticos={len(diagnosticos)}")


if __name__ == "__main__":
    main(sys.argv[1])
