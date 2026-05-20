"""
Genera los íconos de la app para Expo:
  - assets/icon.png           1024 × 1024   (iOS + Android base)
  - assets/adaptive-icon.png  1024 × 1024   (Android adaptive — solo foreground, fondo en app.json)
  - assets/favicon.png          48 ×   48   (web)
  - store_assets/icon_preview.png  512 × 512  (preview para Google Play)
"""

from PIL import Image, ImageDraw, ImageFilter
import math, os

# ── Paleta ────────────────────────────────────────────────────────────────────
BG_DARK   = (26,  26,  46)    # #1a1a2e
BG_MID    = (22,  33,  62)    # #16213e
BG_LIGHT  = (15,  52,  96)    # #0f3460
ACCENT    = (233, 69,  96)    # #e94560
BLUE      = (66, 133, 244)    # #4285F4
GREEN     = (52, 168,  83)    # #34A853
WHITE     = (255,255,255)
OFFWHITE  = (240,240,250)
DARK_PENT = (18,  18,  35)    # casi negro para los pentagonos

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
STORE_DIR  = os.path.join(os.path.dirname(__file__), '..', 'store_assets')
os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(STORE_DIR,  exist_ok=True)

# ── Utilidades ────────────────────────────────────────────────────────────────
def poly_pts(cx, cy, r, n, angle_offset_deg=0):
    pts = []
    for i in range(n):
        a = math.radians(angle_offset_deg + i * 360 / n)
        pts.append((cx + r * math.sin(a), cy - r * math.cos(a)))
    return pts

def draw_star(draw, cx, cy, r_outer, r_inner, n, color, angle_offset_deg=0):
    pts = []
    for i in range(n * 2):
        a   = math.radians(angle_offset_deg + i * 180 / n)
        rad = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + rad * math.sin(a), cy - rad * math.cos(a)))
    draw.polygon(pts, fill=color)

def draw_soccer_ball(draw, cx, cy, r, ball_color=OFFWHITE, pent_color=DARK_PENT,
                     border_color=(180,180,200), border_w=3):
    """Dibuja una pelota de futbol clasica con hexagono central y 5 pentagones."""
    # Sombra suave
    for sr in range(r + 18, r - 1, -2):
        a = max(0, int(40 * (sr - r) / 18))
        draw.ellipse([cx-sr, cy-sr, cx+sr, cy+sr], fill=(10, 10, 25, a) if False else (10,10,25))
    # Circulo blanco base
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=ball_color)

    # --- Hexagono central ---
    hex_r = r * 0.245
    draw.polygon(poly_pts(cx, cy, hex_r, 6, 0), fill=pent_color)

    # --- 5 pentagones alrededor ---
    orbit_r = r * 0.525
    for i in range(5):
        angle = i * 72
        px = cx + orbit_r * math.sin(math.radians(angle))
        py = cy - orbit_r * math.cos(math.radians(angle))
        pent_draw_r = r * 0.195
        draw.polygon(poly_pts(px, py, pent_draw_r, 5, angle + 18), fill=pent_color)

    # --- Borde exterior ---
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=border_color, width=border_w)

def radial_gradient(img, cx, cy, r_inner, r_outer, color_inner, color_outer):
    """Aplica un gradiente radial sobre la imagen existente."""
    draw = ImageDraw.Draw(img)
    steps = 80
    for i in range(steps, -1, -1):
        t   = i / steps
        rad = int(r_inner + (r_outer - r_inner) * t)
        col = tuple(int(color_inner[c] + (color_outer[c] - color_inner[c]) * t) for c in range(3))
        draw.ellipse([cx-rad, cy-rad, cx+rad, cy+rad], fill=col)

# ══════════════════════════════════════════════════════════════════════════════
def make_icon(size, path, adaptive=False):
    """
    adaptive=True → fondo transparente (solo se dibuja el contenido central),
                    pensado para el adaptive-icon donde el fondo lo pone app.json.
    adaptive=False → fondo completo con gradiente.
    """
    W = H = size
    cx = cy = size // 2

    if adaptive:
        img  = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    else:
        img  = Image.new("RGB",  (W, H), BG_DARK)

    draw = ImageDraw.Draw(img)

    if not adaptive:
        # ── Gradiente radial de fondo ─────────────────────────────────────────
        radial_gradient(img, cx, cy, 0, W * 0.85, BG_MID, BG_DARK)
        draw = ImageDraw.Draw(img)   # redibujar sobre el gradiente

        # ── Borde de acento (arco superior izquierdo) ─────────────────────────
        arc_r = int(W * 0.46)
        draw.arc([cx-arc_r, cy-arc_r, cx+arc_r, cy+arc_r],
                 start=200, end=310, fill=ACCENT, width=max(4, size//80))

        # ── Anillo decorativo exterior ────────────────────────────────────────
        ring_r = int(W * 0.44)
        draw.ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r],
                     outline=BG_LIGHT, width=max(2, size//150))

        # ── Estrellas en las esquinas ─────────────────────────────────────────
        star_r = max(4, size // 48)
        positions = [
            (int(W*0.18), int(H*0.18)),
            (int(W*0.82), int(H*0.18)),
            (int(W*0.14), int(H*0.80)),
            (int(W*0.86), int(H*0.80)),
        ]
        for sx, sy in positions:
            draw_star(draw, sx, sy, star_r, star_r*0.42, 4, ACCENT, angle_offset_deg=0)

    # ── Pelota de fútbol central ──────────────────────────────────────────────
    ball_r   = int(W * 0.335)
    ball_pad = int(W * 0.01)

    if not adaptive:
        # Sombra difusa detras de la pelota
        shadow_img  = Image.new("RGBA", (W, H), (0,0,0,0))
        shadow_draw = ImageDraw.Draw(shadow_img)
        for sr in range(ball_r + int(W*0.06), ball_r - 1, -1):
            alpha = int(90 * (1 - (sr - ball_r) / (W*0.06)))
            shadow_draw.ellipse(
                [cx-sr+ball_pad*2, cy-sr+ball_pad*3,
                 cx+sr+ball_pad*2, cy+sr+ball_pad*3],
                fill=(0,0,0, max(0,alpha))
            )
        img.paste(shadow_img, (0,0), shadow_img)
        draw = ImageDraw.Draw(img)

    draw_soccer_ball(draw, cx, cy - int(W * 0.012), ball_r,
                     ball_color=OFFWHITE,
                     pent_color=DARK_PENT,
                     border_color=(160,160,185),
                     border_w=max(2, size//200))

    if not adaptive:
        # ── Franja inferior con texto "FWC 2026" ──────────────────────────────
        band_h = int(H * 0.175)
        band_y = H - band_h
        # Fondo semitransparente de la franja
        overlay = Image.new("RGBA", (W, H), (0,0,0,0))
        ov_draw = ImageDraw.Draw(overlay)
        ov_draw.rectangle([0, band_y, W, H], fill=(15,18,40, 210))
        img = img.convert("RGBA")
        img = Image.alpha_composite(img, overlay)
        img = img.convert("RGB")
        draw = ImageDraw.Draw(img)

        # Línea separadora con gradiente de color
        line_y = band_y
        for lx in range(W):
            t = lx / W
            r_col = int(ACCENT[0] * (1-t) + BLUE[0] * t)
            g_col = int(ACCENT[1] * (1-t) + BLUE[1] * t)
            b_col = int(ACCENT[2] * (1-t) + BLUE[2] * t)
            draw.point((lx, line_y), fill=(r_col, g_col, b_col))
            draw.point((lx, line_y+1), fill=(r_col, g_col, b_col))

        # Texto "FWC 2026"
        try:
            from PIL import ImageFont
            try:
                f_big  = ImageFont.truetype("arialbd.ttf", max(8, size//9))
                f_small= ImageFont.truetype("arial.ttf",   max(6, size//16))
            except OSError:
                f_big  = ImageFont.load_default(max(8, size//9))
                f_small= ImageFont.load_default(max(6, size//16))
        except Exception:
            from PIL import ImageFont
            f_big  = ImageFont.load_default()
            f_small= ImageFont.load_default()

        text_cy = band_y + band_h // 2
        draw.text((cx, text_cy - size//28), "FWC 2026",
                  font=f_big, fill=WHITE, anchor="mm")
        draw.text((cx, text_cy + size//16), "Album Panini",
                  font=f_small, fill=BLUE, anchor="mm")

    img.save(path, "PNG", optimize=True)
    kb = os.path.getsize(path) // 1024
    name = os.path.basename(path)
    print(f"  {name:35s}  {W}x{H}  {kb} KB")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\nGenerando iconos...\n")

    make_icon(1024, os.path.join(ASSETS_DIR,  "icon.png"),          adaptive=False)
    make_icon(1024, os.path.join(ASSETS_DIR,  "adaptive-icon.png"), adaptive=True)
    make_icon(48,   os.path.join(ASSETS_DIR,  "favicon.png"),       adaptive=False)
    make_icon(512,  os.path.join(STORE_DIR,   "icon_preview.png"),  adaptive=False)

    print("\nListo. Archivos guardados en assets/ y store_assets/")
