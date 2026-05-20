"""
Genera los assets para la ficha de Google Play:
  - feature_graphic.png   1024 × 500   (imagen destacada)
  - screenshot_home.png   1080 × 1920  (pantalla principal)
  - screenshot_sticker.png 1080 × 1920  (pantalla de fichas)
"""

from PIL import Image, ImageDraw, ImageFont
import math, os

# ── Paleta ────────────────────────────────────────────────────────────────────
BG       = (26,  26,  46)   # #1a1a2e
BG2      = (22,  33,  62)   # #16213e
BG3      = (15,  52,  96)   # #0f3460
ACCENT   = (233, 69,  96)   # #e94560
BLUE     = (66, 133, 244)   # #4285F4
GREEN    = (52, 168,  83)   # #34A853
WHITE    = (255,255,255)
GRAY     = (100,116,139)    # #64748b
LGRAY    = (226,232,240)    # #e2e8f0
DGBG     = (30,  41,  59)   # #1e293b
DARKGREEN= (13,  72,  31)   # #0d4818
DKGBRD   = (51,  65,  85)   # #334155

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'store_assets')
os.makedirs(OUT_DIR, exist_ok=True)

def font(size, bold=False):
    """Carga una fuente del sistema; cae a default si no existe."""
    candidates_bold   = ["arialbd.ttf","Arial Bold.ttf","DejaVuSans-Bold.ttf","NotoSans-Bold.ttf"]
    candidates_regular= ["arial.ttf",  "Arial.ttf",     "DejaVuSans.ttf",     "NotoSans-Regular.ttf"]
    for name in (candidates_bold if bold else candidates_regular):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default(size)

def round_rect(draw, xy, radius, fill=None, outline=None, width=1):
    x0,y0,x1,y1 = xy
    draw.rounded_rectangle([x0,y0,x1,y1], radius=radius, fill=fill, outline=outline, width=width)

# ── Helpers ───────────────────────────────────────────────────────────────────
def progress_bar(draw, x, y, w, h, pct, bg=BG3, fill=BLUE, radius=4):
    round_rect(draw, [x,y,x+w,y+h], radius, fill=bg)
    if pct > 0:
        filled_w = max(int(w * pct), radius*2)
        round_rect(draw, [x,y,x+filled_w,y+h], radius, fill=fill)

def status_bar(draw, w, fg=LGRAY):
    """Simula la barra de estado del teléfono."""
    draw.text((28, 20), "9:41", font=font(28, bold=True), fill=fg)
    # señal + wifi + batería (simple)
    for i in range(4):
        h = 10 + i * 4
        draw.rectangle([w-110+i*14, 36-h, w-110+i*14+10, 36], fill=fg)
    draw.rectangle([w-52, 24, w-28, 38], outline=fg, width=2)
    draw.rectangle([w-50, 26, w-36, 36], fill=fg)
    draw.rectangle([w-28, 28, w-26, 34], fill=fg)

# ══════════════════════════════════════════════════════════════════════════════
# 1. FEATURE GRAPHIC  1024 × 500
# ══════════════════════════════════════════════════════════════════════════════
def make_feature_graphic():
    W, H = 1024, 500
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # ── Fondo degradado (círculos de luz) ────────────────────────────────────
    for r in range(320, 0, -4):
        alpha = int(30 * (1 - r/320))
        c = tuple(min(255, BG[i]+alpha) for i in range(3))
        draw.ellipse([W//2-r, H//2-r, W//2+r, H//2+r], fill=c)

    # ── Líneas decorativas del campo de fútbol ───────────────────────────────
    for i in range(-6, 8):
        x = 80 + i * 140
        draw.line([(x, 0),(x+60, H)], fill=(30,35,65), width=1)

    # ── Círculo central decorativo ───────────────────────────────────────────
    cx, cy = W//2, H//2
    draw.ellipse([cx-220,cy-220,cx+220,cy+220], outline=BG3, width=2)
    draw.ellipse([cx-110,cy-110,cx+110,cy+110], outline=BG3, width=1)

    # ── Acento de color superior ─────────────────────────────────────────────
    draw.rectangle([0, 0, W, 6], fill=ACCENT)

    # ── Pelota de fútbol (dibujada geometricamente) ──────────────────────────
    def draw_soccer_ball(d, cx, cy, r):
        # Círculo blanco base
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=(200,200,200), width=2)
        # Pentágono central negro
        def poly(cx, cy, r, n, angle_offset=0):
            pts = []
            for i in range(n):
                a = math.radians(angle_offset + i * 360 / n)
                pts.append((cx + r*math.sin(a), cy - r*math.cos(a)))
            return pts
        # Hexágono central
        d.polygon(poly(cx, cy, r*0.28, 6, 0), fill=(30,30,30))
        # 5 pentágonos alrededor
        for i in range(5):
            a = math.radians(i * 72)
            px = cx + r*0.58*math.sin(a)
            py = cy - r*0.58*math.cos(a)
            d.polygon(poly(px, py, r*0.22, 5, i*72+18), fill=(30,30,30))
        # Re-dibuja el borde
        d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=GRAY, width=3)

    draw_soccer_ball(draw, W//2, H//2+10, 92)

    # ── Título ───────────────────────────────────────────────────────────────
    draw.text((W//2, 72), "ALBUM PANINI", font=font(68, bold=True), fill=WHITE, anchor="mm")
    draw.text((W//2, 148), "FIFA WORLD CUP 2026", font=font(32, bold=True), fill=BLUE, anchor="mm")

    # ── Subtítulo ────────────────────────────────────────────────────────────
    draw.text((W//2, H - 90), "Colecciona · Organiza · Completa tu album", font=font(26), fill=GRAY, anchor="mm")

    # ── SiTechNi ─────────────────────────────────────────────────────────────
    draw.text((W//2, H - 48), "SiTechNi", font=font(22, bold=True), fill=(40,50,80), anchor="mm")

    # ── Estrellas decorativas (dibujadas, no emoji) ───────────────────────────
    def draw_star(d, cx, cy, r, color):
        pts = []
        for i in range(10):
            a = math.radians(-90 + i * 36)
            ri = r if i % 2 == 0 else r * 0.45
            pts.append((cx + ri*math.cos(a), cy + ri*math.sin(a)))
        d.polygon(pts, fill=color)
    for sx, sy, ss in [(90,80,12),(940,70,10),(60,420,8),(970,430,11),(180,460,7),(860,460,7)]:
        draw_star(draw, sx, sy, ss, ACCENT)

    img.save(os.path.join(OUT_DIR, "feature_graphic.png"))
    print("✅  feature_graphic.png  (1024×500)")

# ══════════════════════════════════════════════════════════════════════════════
# 2. SCREENSHOT HOME  1080 × 1920
# ══════════════════════════════════════════════════════════════════════════════
def make_screenshot_home():
    W, H = 1080, 1920
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # ── Status bar ────────────────────────────────────────────────────────────
    status_bar(draw, W)

    # ── Header ────────────────────────────────────────────────────────────────
    draw.rectangle([0, 60, W, 192], fill=BG2)
    draw.rectangle([0, 192, W, 196], fill=BG3)
    draw.text((52, 88),  "Album Panini", font=font(60, bold=True), fill=WHITE)
    draw.text((54, 158), "FWC 2026",     font=font(34, bold=True), fill=BLUE)
    # menú ⋮
    for dy in [0, 16, 32]:
        draw.ellipse([W-76, 108+dy, W-56, 128+dy], fill=WHITE)

    # ── Barra de progreso global ──────────────────────────────────────────────
    draw.rectangle([0, 196, W, 330], fill=BG2)
    draw.text((52, 208), "Progreso total", font=font(34), fill=GRAY)
    draw.text((W-52, 208), "68%", font=font(34, bold=True), fill=BLUE, anchor="ra")
    progress_bar(draw, 52, 264, W-104, 14, 0.68, fill=GREEN)
    draw.text((52, 296), "481 de 708 fichas completadas", font=font(28), fill=GRAY)

    draw.rectangle([0, 330, W, 334], fill=BG3)

    # ── Secciones ─────────────────────────────────────────────────────────────
    sections = [
        ("Introduccion y Trofeo",  22, 22, 1.00, True),
        ("Grupos A-D",            120,160, 0.75, False),
        ("Grupos E-H",             80,160, 0.50, False),
        ("Grupos I-L",             40,160, 0.25, False),
        ("Argentina",              22, 22, 1.00, True),
        ("Brasil",                 18, 22, 0.82, False),
        ("Francia",                14, 22, 0.64, False),
        ("Album Historico",         9, 20, 0.45, False),
    ]

    y = 354
    for title, filled, total, pct, complete in sections:
        bg_row  = (13, 40, 25) if complete else DGBG
        brd_col = GREEN if complete else DKGBRD
        round_rect(draw, [28, y, W-28, y+114], 18,
                   fill=bg_row, outline=brd_col, width=2)
        # barra lateral
        ind_col = GREEN if complete else LGRAY
        round_rect(draw, [28, y, 44, y+114], 9, fill=ind_col)
        # texto
        title_col = (74,222,128) if complete else LGRAY
        draw.text((70, y+22), title, font=font(36, bold=True), fill=title_col)
        draw.text((70, y+72), f"{filled}/{total} fichas", font=font(28), fill=GRAY)
        # mini barra progreso
        progress_bar(draw, W-200, y+52, 140, 10, pct,
                     fill=GREEN if complete else BLUE)
        # flecha / check
        icon = "✅" if complete else "›"
        draw.text((W-48, y+57), icon, font=font(40, bold=True),
                  fill=GRAY, anchor="mm")
        y += 130

    # ── Banner de publicidad simulado ─────────────────────────────────────────
    draw.rectangle([0, H-110, W, H], fill=(10,10,20))
    draw.rectangle([0, H-110, W, H-108], fill=BG3)
    draw.text((W//2, H-56), "Publicidad", font=font(30), fill=GRAY, anchor="mm")
    round_rect(draw, [W//2-180, H-98, W//2+180, H-18], 8,
               fill=BG3, outline=(50,60,90))
    draw.text((W//2, H-58), "Anuncio de AdMob", font=font(26), fill=GRAY, anchor="mm")

    img.save(os.path.join(OUT_DIR, "screenshot_home.png"))
    print("✅  screenshot_home.png   (1080×1920)")

# ══════════════════════════════════════════════════════════════════════════════
# 3. SCREENSHOT STICKER PAGE  1080 × 1920
# ══════════════════════════════════════════════════════════════════════════════
def make_screenshot_sticker():
    W, H = 1080, 1920
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # ── Status bar ────────────────────────────────────────────────────────────
    status_bar(draw, W)

    # ── Header ────────────────────────────────────────────────────────────────
    draw.rectangle([0, 60, W, 178], fill=BG2)
    draw.rectangle([0, 178, W, 182], fill=BG3)
    # Botón volver
    draw.text((30, 106), "‹", font=font(80), fill=BLUE)
    draw.text((90, 118), "Volver", font=font(36, bold=True), fill=BLUE)
    # Título
    draw.text((W//2, 118), "Argentina", font=font(40, bold=True),
              fill=WHITE, anchor="mm")
    # Botón guardar
    round_rect(draw, [W-180, 94, W-28, 152], 12, fill=BLUE)
    draw.text((W-104, 123), "Guardar", font=font(32, bold=True),
              fill=WHITE, anchor="mm")

    # ── Stats bar ─────────────────────────────────────────────────────────────
    draw.rectangle([0, 182, W, 314], fill=BG3)
    stats = [("22", "Encontradas", BLUE), ("0", "Faltantes", GRAY), ("100%", "Completado", BLUE)]
    for i,(num,lbl,col) in enumerate(stats):
        x = 180 + i * 360
        draw.text((x, 212), num, font=font(64, bold=True), fill=col, anchor="mm")
        draw.text((x, 278), lbl, font=font(26), fill=GRAY, anchor="mm")
    # badge completo
    round_rect(draw, [W-270, 230, W-28, 284], 10, fill=GREEN)
    draw.text((W-149, 257), "COMPLETO!", font=font(24, bold=True),
              fill=WHITE, anchor="mm")

    # ── Instrucciones ─────────────────────────────────────────────────────────
    draw.rectangle([0, 314, W, 374], fill=DGBG)
    draw.rectangle([0, 374, W, 378], fill=DKGBRD)
    draw.text((W//2, 344), "Toca cada ficha para marcarla como  encontrada  o  pendiente",
              font=font(26), fill=GRAY, anchor="mm")

    # ── Grid de fichas ────────────────────────────────────────────────────────
    COLS      = 5
    BOX_W     = 170
    BOX_H     = 200
    GAP       = 22
    START_X   = (W - (COLS * BOX_W + (COLS-1)*GAP)) // 2
    START_Y   = 406
    labels    = ["ARG1","ARG2","ARG3","ARG4","ARG5",
                 "ARG6","ARG7","ARG8","ARG9","ARG10",
                 "ARG11","ARG12","ARG13","ARG14","ARG15",
                 "ARG16","ARG17","ARG18","ARG19","ARG20",
                 "ARG21","ARG22"]
    filled_set = set(range(22))  # todas completas

    for idx, lbl in enumerate(labels):
        col = idx % COLS
        row = idx // COLS
        x = START_X + col * (BOX_W + GAP)
        y = START_Y + row * (BOX_H + GAP)
        filled = idx in filled_set
        bg_box  = DARKGREEN if filled else DGBG
        brd_box = GREEN      if filled else DKGBRD
        round_rect(draw, [x,y,x+BOX_W,y+BOX_H], 16,
                   fill=bg_box, outline=brd_box, width=3)
        lbl_col = (74,222,128) if filled else GRAY
        draw.text((x+BOX_W//2, y+58), lbl, font=font(28, bold=True),
                  fill=lbl_col, anchor="mm")
        if filled:
            # Dibuja un check geometrico
            cx2, cy2 = x+BOX_W//2, y+130
            draw.line([(cx2-22, cy2+2),(cx2-6, cy2+20),(cx2+22, cy2-18)],
                      fill=GREEN, width=8, joint="curve")

    # ── Acciones rápidas ──────────────────────────────────────────────────────
    action_y = START_Y + 5 * (BOX_H + GAP) + 20
    round_rect(draw, [28, action_y, W//2-14, action_y+90], 14,
               fill=DARKGREEN, outline=GREEN, width=2)
    draw.text((W//4+14, action_y+45), "✓ Marcar todas", font=font(32, bold=True),
              fill=(74,222,128), anchor="mm")
    round_rect(draw, [W//2+14, action_y, W-28, action_y+90], 14,
               fill=(45,21,21), outline=(248,113,113), width=2)
    draw.text((W*3//4-14, action_y+45), "✕ Limpiar todas", font=font(32, bold=True),
              fill=(248,113,113), anchor="mm")

    img.save(os.path.join(OUT_DIR, "screenshot_sticker.png"))
    print("✅  screenshot_sticker.png (1080×1920)")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    make_feature_graphic()
    make_screenshot_home()
    make_screenshot_sticker()
    print("\n📁 Archivos guardados en: store_assets/")
