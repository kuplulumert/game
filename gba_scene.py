from __future__ import annotations

from PIL import Image, ImageDraw
import random


# --- Canvas ---
WIDTH, HEIGHT = 240, 160  # GBA native resolution


# --- Palette (saturated but soft, GBA-esque) ---
PALETTE = {
    "grass_light": (123, 193, 66),      # bright grass green (GBA-esque)
    "grass_dark": (103, 171, 56),       # checker alt
    "grass_accent": (90, 150, 52),      # tiny tufts
    "path": (226, 191, 92),             # yellow dirt path
    "path_edge": (184, 156, 70),        # edge accent for path
    "path_speck": (200, 168, 82),       # dirt speckle
    "tree_mid": (36, 146, 84),          # evergreen mid
    "tree_light": (56, 168, 104),       # evergreen light block
    "tree_dark": (18, 96, 60),          # evergreen dark block
    "outline": (16, 40, 32),            # dark outline (near-black green)
    "trunk": (110, 82, 50),             # small trunk hint
    "flower_red": (214, 54, 54),        # red flowers
    "flower_yellow": (245, 220, 82),    # flower center
    "shadow": (22, 22, 22),             # subtle character shadow (solid color block)
    "box_white": (248, 248, 248),       # dialogue box fill
    "box_border": (60, 90, 166),        # gba-style blue border
    "box_shadow": (40, 40, 40),         # drop shadow for box
    "npc_hat_red": (212, 60, 60),
    "skin": (250, 216, 160),
    "cloth_blue": (76, 124, 188),
    "cloth_green": (86, 160, 102),
    "black": (0, 0, 0),
    "white": (255, 255, 255),
}


# --- Minimal 5x7 Pixel Font (only required glyphs) ---
# Glyphs defined as 5 columns x 7 rows of 0/1 bits (strings for readability)
GLYPHS = {
    "A": [
        "01110",
        "10001",
        "10001",
        "11111",
        "10001",
        "10001",
        "10001",
    ],
    "B": [
        "11110",
        "10001",
        "11110",
        "10001",
        "10001",
        "10001",
        "11110",
    ],
    "C": [
        "01110",
        "10001",
        "10000",
        "10000",
        "10000",
        "10001",
        "01110",
    ],
    "E": [
        "11111",
        "10000",
        "11110",
        "10000",
        "10000",
        "10000",
        "11111",
    ],
    "G": [
        "01110",
        "10001",
        "10000",
        "10111",
        "10001",
        "10001",
        "01110",
    ],
    "H": [
        "10001",
        "10001",
        "11111",
        "10001",
        "10001",
        "10001",
        "10001",
    ],
    "I": [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "11111",
    ],
    "K": [
        "10001",
        "10010",
        "10100",
        "11000",
        "10100",
        "10010",
        "10001",
    ],
    "M": [
        "10001",
        "11011",
        "10101",
        "10101",
        "10001",
        "10001",
        "10001",
    ],
    "N": [
        "10001",
        "11001",
        "10101",
        "10011",
        "10001",
        "10001",
        "10001",
    ],
    "O": [
        "01110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110",
    ],
    "P": [
        "11110",
        "10001",
        "10001",
        "11110",
        "10000",
        "10000",
        "10000",
    ],
    "S": [
        "01111",
        "10000",
        "01110",
        "00001",
        "00001",
        "10001",
        "01110",
    ],
    "T": [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
    ],
    "U": [
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110",
    ],
    "W": [
        "10001",
        "10001",
        "10001",
        "10101",
        "10101",
        "11011",
        "10001",
    ],
    "Y": [
        "10001",
        "10001",
        "01010",
        "00100",
        "00100",
        "00100",
        "00100",
    ],
    " ": [
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
    ],
    ".": [
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "01100",
        "01100",
    ],
    "'": [  # ASCII apostrophe
        "00100",
        "00100",
        "01000",
        "00000",
        "00000",
        "00000",
        "00000",
    ],
}

# Right single quotation mark (U+2019) – map to same as ASCII apostrophe but slightly higher
GLYPHS["’"] = [
    "00100",
    "00100",
    "01000",
    "00000",
    "00000",
    "00000",
    "00000",
]


def draw_pixel_glyph(draw: ImageDraw.ImageDraw, ch: str, x: int, y: int, color: tuple[int, int, int], bold: bool = False) -> int:
    """Draw a 5x7 glyph at (x, y). Returns advance width including 1px spacing.

    Bold is simulated by drawing the same glyph twice with 1px horizontal offset.
    """
    glyph = GLYPHS.get(ch.upper())
    if glyph is None:
        # Fallback to space width if glyph missing
        glyph = GLYPHS[" "]
    for pass_index in (0, 1) if bold else (0,):
        x_offset = x + pass_index  # widen strokes horizontally
        for row_idx, row_bits in enumerate(glyph):
            for col_idx, bit in enumerate(row_bits):
                if bit == "1":
                    draw.point((x_offset + col_idx, y + row_idx), fill=color)
    return 6 if not bold else 7  # 5px glyph + 1px space; bold advances slightly more


def draw_text(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, max_width: int, bold_words: set[str] | None = None, line_spacing: int = 3) -> None:
    """Render text in all-caps 5x7 with simple wrapping. Bold words are spaced wider and drawn thicker.

    Bold words are matched exactly in uppercase. For "BAG’S", only the leading "BAG" is bolded.
    """
    if bold_words is None:
        bold_words = set()

    words = text.upper().split(" ")
    cursor_x, cursor_y = x, y
    for word in words:
        # Determine if this word needs bolding (full or partial for BAG’S)
        is_bold_full = word in bold_words

        segments: list[tuple[str, bool]] = []
        if word.startswith("BAG"):  # handle BAG’S as mixed bold/normal
            segments.append(("BAG", True))
            remainder = word[3:]
            if remainder:
                segments.append((remainder, False))
        else:
            segments.append((word, is_bold_full))

        # Measure width
        measure_width = 0
        for seg_text, seg_bold in segments:
            for ch in seg_text:
                advance = 7 if seg_bold else 6
                measure_width += advance

        # include a space after word
        total_word_width = measure_width + 6
        if cursor_x + total_word_width > x + max_width:
            cursor_x = x
            cursor_y += 7 + line_spacing

        # Draw segments
        for seg_text, seg_bold in segments:
            for ch in seg_text:
                cursor_x += draw_pixel_glyph(draw, ch, cursor_x, cursor_y, PALETTE["black"], bold=seg_bold) - 1
            # add tighter spacing between segments within the same word
            cursor_x += 2

        # space between words
        cursor_x += 4


def draw_grass_and_path(base: Image.Image, path_y: int, path_h: int) -> None:
    draw = ImageDraw.Draw(base)
    # Grass checker pattern (8x8 tiles) with accents
    for ty in range(0, HEIGHT, 8):
        for tx in range(0, WIDTH, 8):
            use_dark = ((tx // 8) + (ty // 8)) % 2 == 1
            color = PALETTE["grass_dark"] if use_dark else PALETTE["grass_light"]
            draw.rectangle((tx, ty, tx + 7, ty + 7), fill=color)
            # tiny accents in select tiles for texture
            if ((tx // 8) % 2 == 0) and ((ty // 8) % 2 == 1):
                draw.point((tx + 3, ty + 2), fill=PALETTE["grass_accent"]) 
                draw.point((tx + 6, ty + 5), fill=PALETTE["grass_accent"]) 

    # Dirt path horizontally
    y0, y1 = path_y, path_y + path_h - 1
    draw.rectangle((0, y0, WIDTH - 1, y1), fill=PALETTE["path"])
    # Path edges (double lined for GBA vibe)
    draw.line((0, y0, WIDTH - 1, y0), fill=PALETTE["path_edge"])  
    draw.line((0, y0 + 1, WIDTH - 1, y0 + 1), fill=PALETTE["path_speck"]) 
    draw.line((0, y1, WIDTH - 1, y1), fill=PALETTE["path_edge"])  
    draw.line((0, y1 - 1, WIDTH - 1, y1 - 1), fill=PALETTE["path_speck"]) 
    # Path speckles
    for x in range(2, WIDTH - 2, 8):
        draw.rectangle((x, y0 + 6, x + 1, y0 + 7), fill=PALETTE["path_speck"]) 
        draw.rectangle((x + 3, y0 + path_h // 2, x + 4, y0 + path_h // 2 + 1), fill=PALETTE["path_speck"]) 
        draw.rectangle((x + 6, y1 - 6, x + 7, y1 - 5), fill=PALETTE["path_speck"]) 


def draw_tree(img: Image.Image, x: int, y: int) -> None:
    """Draw a more authentic evergreen with layered canopy and dark outline. ~28x30."""
    d = ImageDraw.Draw(img)
    # Canopy layers (bottom to top) using stepped trapezoids with outline
    layers = [
        (PALETTE["tree_dark"],  (x + 2,  y + 20,  x + 26, y + 20,  x + 22, y + 26,  x + 6,  y + 26)),
        (PALETTE["tree_mid"],   (x + 4,  y + 14,  x + 24, y + 14,  x + 21, y + 20,  x + 7,  y + 20)),
        (PALETTE["tree_light"], (x + 6,  y + 9,   x + 22, y + 9,   x + 20, y + 14,  x + 8,  y + 14)),
        (PALETTE["tree_light"], (x + 8,  y + 5,   x + 20, y + 5,   x + 18, y + 9,   x + 10, y + 9)),
        (PALETTE["tree_mid"],   (x + 10, y + 2,   x + 18, y + 2,   x + 17, y + 5,   x + 11, y + 5)),
    ]
    for fill, coords in layers:
        poly = [(coords[i], coords[i + 1]) for i in range(0, len(coords), 2)]
        d.polygon(poly, fill=fill, outline=PALETTE["outline"]) 

    # Side leaf lumps for a fuller silhouette
    d.polygon([(x + 1, y + 16), (x + 6, y + 12), (x + 6, y + 18)], fill=PALETTE["tree_mid"], outline=PALETTE["outline"]) 
    d.polygon([(x + 26, y + 16), (x + 21, y + 12), (x + 21, y + 18)], fill=PALETTE["tree_mid"], outline=PALETTE["outline"]) 

    # Trunk (subtle)
    d.rectangle((x + 12, y + 26, x + 16, y + 28), fill=PALETTE["trunk"], outline=PALETTE["outline"]) 


def scatter_flowers(img: Image.Image, regions: list[tuple[int, int, int, int]], seed: int = 1337, density: int = 14) -> None:
    random.seed(seed)
    d = ImageDraw.Draw(img)
    for (x0, y0, x1, y1) in regions:
        # Normalize coordinates and validate usable area
        x_low, x_high = (x0, x1) if x0 <= x1 else (x1, x0)
        y_low, y_high = (y0, y1) if y0 <= y1 else (y1, y0)
        # Leave a 2px inset for 3x3 flowers
        fx_min, fx_max = x_low + 2, x_high - 3
        fy_min, fy_max = y_low + 2, y_high - 3
        if fx_min > fx_max or fy_min > fy_max:
            continue  # skip invalid or too-small regions

        area = max(1, (x_high - x_low) * (y_high - y_low))
        count = max(4, area // (density * 200))
        for _ in range(count):
            fx = random.randint(fx_min, fx_max)
            fy = random.randint(fy_min, fy_max)
            # 3x3 flower with center
            d.rectangle((fx, fy, fx + 2, fy + 2), fill=PALETTE["flower_red"]) 
            d.point((fx + 1, fy + 1), fill=PALETTE["flower_yellow"]) 


def draw_shadow(img: Image.Image, x: int, y: int, w: int, h: int) -> None:
    d = ImageDraw.Draw(img)
    # Simple flat oval shadow
    d.ellipse((x, y, x + w, y + h), fill=PALETTE["shadow"]) 


def draw_player_back(img: Image.Image, cx: int, cy: int) -> None:
    """Top-down player (back view) with cap and backpack, outlined."""
    d = ImageDraw.Draw(img)
    w, h = 16, 24
    left, top = cx - w // 2, cy - h // 2

    # Shadow
    draw_shadow(img, left + 2, top + h - 6, 12, 4)

    # Cap (blue) back and brim
    d.rectangle((left + 3, top + 1, left + 12, top + 4), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 
    d.rectangle((left + 4, top + 4, left + 11, top + 5), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 
    # Head (back)
    d.rectangle((left + 4, top + 6, left + 11, top + 11), fill=PALETTE["skin"], outline=PALETTE["outline"]) 
    # Backpack (green)
    d.rectangle((left + 5, top + 11, left + 10, top + 20), fill=PALETTE["cloth_green"], outline=PALETTE["outline"]) 
    # Shoulder straps
    d.rectangle((left + 4, top + 12, left + 5, top + 15), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 
    d.rectangle((left + 10, top + 12, left + 11, top + 15), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 
    # Legs
    d.rectangle((left + 6, top + 20, left + 9, top + 22), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 


def draw_npc_front(img: Image.Image, cx: int, cy: int) -> None:
    """Top-down NPC (front) with red hat and glasses, outlined."""
    d = ImageDraw.Draw(img)
    w, h = 16, 24
    left, top = cx - w // 2, cy - h // 2

    # Shadow
    draw_shadow(img, left + 2, top + h - 6, 12, 4)

    # Hat crown and brim
    d.rectangle((left + 3, top + 1, left + 12, top + 4), fill=PALETTE["npc_hat_red"], outline=PALETTE["outline"]) 
    d.rectangle((left + 2, top + 3, left + 13, top + 4), fill=PALETTE["npc_hat_red"], outline=PALETTE["outline"]) 
    # Face
    d.rectangle((left + 4, top + 5, left + 11, top + 11), fill=PALETTE["skin"], outline=PALETTE["outline"]) 
    # Glasses (two squares with a bridge)
    d.rectangle((left + 5, top + 7, left + 6, top + 9), outline=PALETTE["black"]) 
    d.rectangle((left + 9, top + 7, left + 10, top + 9), outline=PALETTE["black"]) 
    d.point((left + 7, top + 8), fill=PALETTE["black"]) 
    # Torso (blue shirt)
    d.rectangle((left + 4, top + 11, left + 11, top + 19), fill=PALETTE["cloth_blue"], outline=PALETTE["outline"]) 
    # Legs/shoes
    d.rectangle((left + 6, top + 19, left + 9, top + 22), fill=PALETTE["outline"], outline=PALETTE["outline"]) 


def draw_dialogue_box(img: Image.Image, text: str) -> None:
    d = ImageDraw.Draw(img)
    box_h = 56
    margin_x = 8
    radius = 6
    x0, y0 = 4, HEIGHT - box_h - 4
    x1, y1 = WIDTH - 4, HEIGHT - 4

    # Drop shadow (offset 2px)
    d.rounded_rectangle((x0 + 2, y0 + 2, x1 + 2, y1 + 2), radius=radius, fill=PALETTE["box_shadow"]) 

    # Box
    d.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=PALETTE["box_white"], outline=PALETTE["box_border"], width=3)
    # Little advance arrow at bottom-right
    arrow_x, arrow_y = x1 - 14, y1 - 10
    d.polygon([(arrow_x, arrow_y), (arrow_x + 4, arrow_y), (arrow_x + 2, arrow_y + 3)], fill=PALETTE["box_border"]) 

    # Text area
    text_x = x0 + margin_x + 2
    text_y = y0 + 10
    max_w = (x1 - x0) - (2 * margin_x)

    bold_words = {"POTION", "BAG"}
    draw_text(d, text, text_x, text_y, max_width=max_w, bold_words=bold_words)


def compose_scene() -> Image.Image:
    base = Image.new("RGB", (WIDTH, HEIGHT), PALETTE["grass_light"])  # base color will be overridden by tiles

    # Ground
    path_y = 64
    path_h = 32
    draw_grass_and_path(base, path_y, path_h)

    # Trees: dense rows above and below path edges
    top_band_bottom = path_y - 4
    bottom_band_top = path_y + path_h + 4
    # Top rows
    for row_y in (8, 24, 40):
        if row_y >= top_band_bottom - 24:
            continue
        for x in range(4, WIDTH - 28, 22):
            draw_tree(base, x, row_y)
    # Close to path top edge
    for x in range(6, WIDTH - 28, 24):
        draw_tree(base, x, top_band_bottom - 26)
    # Bottom rows
    for x in range(12, WIDTH - 28, 24):
        draw_tree(base, x, bottom_band_top + 2)
    for x in range(2, WIDTH - 28, 22):
        draw_tree(base, x, HEIGHT - 34)

    # Flowers near tree bands
    flower_regions = [
        (0, 0, WIDTH, top_band_bottom - 2),
        (0, bottom_band_top + 2, WIDTH, HEIGHT - 60),
    ]
    scatter_flowers(base, flower_regions)

    # Characters at center along the path
    center_x = WIDTH // 2
    npc_y = path_y + path_h // 2 - 8
    player_y = npc_y + 20
    draw_npc_front(base, center_x, npc_y)
    draw_player_back(base, center_x, player_y)

    # Dialogue box
    text = "MAGE PUT THE POTION AWAY IN THE BAG’S ITEMS POCKET."
    draw_dialogue_box(base, text)

    return base


def save_scaled(img: Image.Image, base_path: str) -> None:
    img.save(f"{base_path}.png")
    img.resize((WIDTH * 2, HEIGHT * 2), resample=Image.NEAREST).save(f"{base_path}_x2.png")
    img.resize((WIDTH * 3, HEIGHT * 3), resample=Image.NEAREST).save(f"{base_path}_x3.png")


def main() -> None:
    scene = compose_scene()
    save_scaled(scene, "/workspace/gba_scene")


if __name__ == "__main__":
    main()

