import html, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from schema import T, ZONAS, REL

W = 270          # ancho de tabla
HDR = 26         # alto encabezado
LH = 16          # alto por renglón
GAPY = 28        # separación vertical entre tablas
GAPX = 40        # separación horizontal entre columnas
PADZ = 24        # margen interno de zona
ZTITLE = 34      # alto del título de zona

COLORS = {
    "transversal": dict(zfill="#FFF8E1", zstroke="#D6B656", hfill="#FFE599", hstroke="#B8962E"),
    "modulo": dict(zfill="#F2F7FD", zstroke="#6C8EBF", hfill="#DAE8FC", hstroke="#6C8EBF"),
}

# Distribución: zona -> columnas -> tablas
LAYOUT = {
    "SEG": [["rol_permiso"], ["rol", "permiso"], ["usuario"]],
    "CAT": [["catalogo", "catalogo_item"], ["servicio", "diagnostico", "establecimiento"], ["paciente"]],
    "TRA": [["bitacora", "notificacion"], ["archivo_adjunto", "reporte_generado"], ["oficio", "borrador"], ["folio_secuencia", "modulo_sistema"]],
    "SREA": [["incidente_tipo", "incidente_dano", "incidente_factor", "incidente_personal", "incidente_servicio_rel"],
             ["incidente"], ["medicamento_insumo", "accion_reduccion_riesgo", "analisis_causa_raiz", "accion_mejora"],
             ["acr_cronologia", "acr_causa", "evidencia", "accion_mejora_oficio"]],
    "SUG": [["qsf"], ["qsf_seguimiento", "qsf_oficio", "encuesta_egreso"]],
    "ENC": [["instrumento", "encuesta"], ["instrumento_seccion", "respuesta"], ["pregunta", "opcion_respuesta"]],
    "SES": [["periodo", "periodo_variable"], ["encuesta_sestad", "concentrado"]],
}

def body_h(t):
    return len(T[t]["cols"]) * LH + 16


def zone_size(z):
    cols = LAYOUT[z]
    w = len(cols) * W + (len(cols) - 1) * GAPX + 2 * PADZ
    h = max(sum(HDR + body_h(t) for t in c) + GAPY * (len(c) - 1) for c in cols) + 2 * PADZ + ZTITLE
    return w, h


cells, edges = [], []
pos = {}   # tabla -> (x, y, w, h)
nid = [2]


def new_id(p):
    nid[0] += 1
    return f"{p}{nid[0]}"


def esc(s):
    return html.escape(s, quote=True)


def add_cell(cid, value, style, x, y, w, h, vertex=True):
    cells.append(f'<mxCell id="{cid}" value="{esc(value)}" style="{style}" vertex="1" parent="1">'
                 f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def field_rows(t):
    rows = []
    for name, typ, flags, ref, _ in T[t]["cols"]:
        f = [x for x in flags.split(",") if x]
        key = " ".join(k for k in f if k in ("PK", "FK", "UQ"))
        if "UQc" in f and "UQ" not in f:
            key = (key + " UQ*").strip()
        nm = f"<b>{name}</b>" if ("NN" in f or "PK" in f) else name
        if "PK" in f:
            nm = f"<u>{nm}</u>"
        rows.append(f'<tr style="height:16px"><td style="width:46px;color:#7a3e00;font-size:9px;padding:0">{key}</td>'
                    f'<td style="padding:0">{nm}</td><td style="text-align:right;color:#666;padding:0">{typ}</td></tr>')
    return '<table style="width:100%;font-size:10px;border-collapse:collapse;line-height:16px">' + "".join(rows) + "</table>"


def place_zone(z, x0, y0):
    w, h = zone_size(z)
    name, kind = ZONAS[z]
    c = COLORS[kind]
    add_cell(new_id("z"), name,
             f"rounded=1;arcSize=2;whiteSpace=wrap;html=1;fillColor={c['zfill']};strokeColor={c['zstroke']};"
             f"verticalAlign=top;align=left;spacingLeft=12;spacingTop=6;fontSize=15;fontStyle=1;fontColor=#333333;",
             x0, y0, w, h)
    for ci, col in enumerate(LAYOUT[z]):
        x = x0 + PADZ + ci * (W + GAPX)
        y = y0 + PADZ + ZTITLE
        for t in col:
            bh = body_h(t)
            hid = f"h_{t}"
            add_cell(hid, t, f"rounded=0;whiteSpace=wrap;html=1;fillColor={c['hfill']};strokeColor={c['hstroke']};"
                     "fontStyle=1;fontSize=12;", x, y, W, HDR)
            add_cell(f"b_{t}", field_rows(t), f"rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor={c['hstroke']};"
                     "align=left;verticalAlign=top;spacingLeft=6;spacingRight=6;spacingTop=3;overflow=hidden;",
                     x, y + HDR, W, bh)
            pos[t] = (x, y, W, HDR + bh)
            y += HDR + bh + GAPY
    return w, h


def place_ext(x0, y0, h):
    w = 2 * W + GAPX + 2 * PADZ
    txt = ("<b>Módulos escalables (no implementados en TT2, DEC-15)</b><br><br>"
           "<b>MECIC</b>: evaluación por dominios D0 a D23 se modelará como <i>instrumento</i> "
           "(dominio = sección, criterio = pregunta, Sí/No/No aplica = opción) y reutilizará <i>periodo</i>.<br><br>"
           "<b>INDICAS II</b>: los 6 indicadores se modelarán como <i>instrumento</i> (variables F1 = preguntas), "
           "con muestra y resultado por <i>periodo</i>; concentrado F2 en <i>concentrado</i>.<br><br>"
           "Ambos se activan mediante <i>modulo_sistema.habilitado</i> sin cambios estructurales (RNF-017).")
    add_cell(new_id("x"), txt, "rounded=1;arcSize=3;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 4;"
             "fillColor=#F5F5F5;strokeColor=#999999;fontColor=#555555;align=left;verticalAlign=top;"
             "spacing=14;fontSize=12;", x0, y0, w, min(h, 300))
    ly = y0 + min(h, 300) + 30
    leg = ("<b>Convenciones</b><br>"
           "<u><b>campo</b></u> llave primaria &nbsp; <b>campo</b> obligatorio (NOT NULL)<br>"
           "PK llave primaria, FK llave foránea, UQ único, UQ* parte de única compuesta<br>"
           "Notación pata de gallo: | uno, o| cero o uno, &lt; muchos<br>"
           "Todas las tablas incluyen created_at y updated_at, salvo tablas de relación, bitacora, respuesta, "
           "concentrado y qsf_seguimiento.<br>"
           "Las FK hacia usuario, catalogo_item, servicio, paciente, diagnostico, archivo_adjunto y oficio desde otras zonas "
           "se indican en los atributos; solo se dibujan las relaciones estructurales.<br>"
           "Línea roja punteada: derivación entre módulos (QSF a incidente, encuesta a QSF).<br>"
           "Amarillo: servicios transversales. Azul: módulos implementados. Gris punteado: escalables.")
    add_cell(new_id("l"), leg, "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#666666;"
             "align=left;verticalAlign=top;spacing=12;fontSize=11;", x0, ly, w, 190)
    return w


ARROW = {"many": "ERmany", "one": "ERmandOne", "zeroone": "ERzeroToOne"}

# Título
add_cell("title", "Modelo Entidad-Relación P.I.C. | TT2 2026-B060 | PostgreSQL 14+",
         "text;html=1;fontSize=22;fontStyle=1;align=left;verticalAlign=middle;fillColor=none;strokeColor=none;", 40, 10, 1200, 40)

y = 70
x = 40
hrow = max(zone_size(z)[1] for z in ["SEG", "CAT", "TRA"])
for z in ["SEG", "CAT", "TRA"]:
    w, h = place_zone(z, x, y)
    x += w + 60
y += hrow + 60
xs = 40
yrow2 = y
w, h2 = place_zone("SREA", xs, y)
xsug = xs + w + 60
place_zone("SUG", xsug, y)
y += max(h2, zone_size("SUG")[1]) + 60
# fila 3: ENC alineado bajo SUG, SES a su izquierda
wsug, hsug = zone_size("SUG")
place_ext(xsug + wsug + 60, yrow2, hsug)
we, he = zone_size("ENC")
place_zone("ENC", xsug, y)
ws, hs = zone_size("SES")
place_zone("SES", xsug - 60 - ws, y)
y += max(he, hs) + 60

DERIVA = {("incidente", "qsf"), ("qsf", "encuesta")}
for h, p, ch, cp in REL:
    eid = new_id("e")
    if (h, p) in DERIVA:
        st = (f"edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;strokeColor=#B85450;strokeWidth=1.4;fontSize=11;"
              f"fontColor=#B85450;startArrow={ARROW[ch]};endArrow={ARROW[cp]};startFill=0;endFill=0;startSize=10;endSize=10;")
        hx, hy, hw, hh = pos[h]; px, py, pw, ph = pos[p]
        if h == "incidente":
            yy = hy - 14
            st += "exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
            pts = [(hx + hw / 2, yy), (px + pw / 2, yy)]
            src, tgt = f"h_{h}", f"h_{p}"
        else:  # qsf -> encuesta: baja por el hueco entre columnas del motor y entra por la derecha
            gx = px + pw + GAPX / 2
            st += "exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;"
            ymid = hy + hh + 40
            pts = [(hx + hw / 2, ymid), (gx, ymid), (gx, py + ph / 2)]
            src, tgt = f"b_{h}", f"b_{p}"
        arr = "".join(f'<mxPoint x="{x}" y="{y}"/>' for x, y in pts)
        edges.append(f'<mxCell id="{eid}" value="deriva a" style="{st}" edge="1" parent="1" source="{src}" target="{tgt}">'
                     f'<mxGeometry relative="1" as="geometry"><Array as="points">{arr}</Array></mxGeometry></mxCell>')
        continue
    style = (f"edgeStyle=entityRelationEdgeStyle;rounded=0;html=1;fontSize=10;"
             f"startArrow={ARROW[ch]};endArrow={ARROW[cp]};startFill=0;endFill=0;startSize=10;endSize=10;"
             f"strokeColor=#555555;strokeWidth=1.2;")
    edges.append(f'<mxCell id="{eid}" style="{style}" edge="1" parent="1" source="b_{h}" target="b_{p}">'
                 f'<mxGeometry relative="1" as="geometry"/></mxCell>')

xml = ('<mxfile host="app.diagrams.net"><diagram id="er-tt2" name="Modelo ER TT2">'
       '<mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" '
       'fold="1" page="0" pageScale="1" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>'
       + "".join(cells) + "".join(edges) + "</root></mxGraphModel></diagram></mxfile>")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "modelo_er_tt2.drawio"), "w", encoding="utf-8").write(xml)

import json
json.dump(pos, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_pos.json"), "w"))
print("tablas", len(pos), "relaciones", len(REL), "alto total", y)
