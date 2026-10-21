import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "frontend" / "public"
ASSETS_DIR = PUBLIC_DIR / "assets"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

def draw_master_logo_symbol(draw, center_x, center_y, size):
    """
    Draws a precision geometric aerodynamic trade compass & supersonic export wing.
    Colors: Emerald (#10B981, #059669), Cyber Teal (#06B6D4), Golden Star (#F59E0B).
    """
    # Outer subtle glow ring
    r_outer = size * 0.48
    draw.ellipse(
        [center_x - r_outer, center_y - r_outer, center_x + r_outer, center_y + r_outer],
        outline=(16, 185, 129, 60),
        width=int(size * 0.02)
    )

    # Aerodynamic Wing 1 (Left / Lower forward sweep)
    # Emerald gradient tones
    wing_left = [
        (center_x, center_y - size * 0.38),           # Peak tip
        (center_x - size * 0.38, center_y + size * 0.28), # Outer wing tip
        (center_x - size * 0.16, center_y + size * 0.18), # Inset notch
        (center_x, center_y + size * 0.36)            # Bottom keel
    ]
    draw.polygon(wing_left, fill=(5, 150, 105, 255))

    # Aerodynamic Wing 2 (Right / Dynamic lift sweep)
    wing_right = [
        (center_x, center_y - size * 0.38),           # Peak tip
        (center_x + size * 0.38, center_y + size * 0.28), # Outer wing tip
        (center_x + size * 0.16, center_y + size * 0.18), # Inset notch
        (center_x, center_y + size * 0.36)            # Bottom keel
    ]
    draw.polygon(wing_right, fill=(16, 185, 129, 255))

    # Center Navigational Needle / Jet Core
    core_needle = [
        (center_x, center_y - size * 0.44),           # Sharp apex
        (center_x + size * 0.10, center_y + size * 0.08),
        (center_x, center_y + size * 0.26),
        (center_x - size * 0.10, center_y + size * 0.08)
    ]
    draw.polygon(core_needle, fill=(6, 182, 212, 255))

    # Golden Trade Star at Apex
    star_r = size * 0.08
    star_cy = center_y - size * 0.38
    draw.ellipse(
        [center_x - star_r, star_cy - star_r, center_x + star_r, star_cy + star_r],
        fill=(245, 158, 11, 255)
    )

def create_master_1024_logo():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Sleek dark circular pill background
    bg_pad = 24
    draw.rounded_rectangle(
        [bg_pad, bg_pad, size - bg_pad, size - bg_pad],
        radius=220,
        fill=(11, 19, 38, 255),
        outline=(16, 185, 129, 180),
        width=12
    )

    draw_master_logo_symbol(draw, size // 2, size // 2, size * 0.82)
    master_path = PUBLIC_DIR / "master-logo-1024.png"
    img.save(master_path, "PNG")
    print(f"Master logo created: {master_path}")
    return img

def derive_all_icons_from_master(master_img):
    # Favicons & Touch icons
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "apple-touch-icon.png": 180,
        "icon-192x192.png": 192,
        "icon-512x512.png": 512,
    }

    for name, s in sizes.items():
        resized = master_img.resize((s, s), Image.Resampling.LANCZOS)
        out_p = PUBLIC_DIR / name
        resized.save(out_p, "PNG")
        print(f"Saved icon: {out_p}")

    # Generate multi-size favicon.ico
    ico_p = PUBLIC_DIR / "favicon.ico"
    master_img.save(ico_p, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Saved multi-res favicon.ico: {ico_p}")

def generate_safe_zone_og_image(master_img):
    """
    1200x630 OpenGraph / WhatsApp preview card.
    CRITICAL: WhatsApp crops to square (1:1) in chat previews.
    All important content must stay inside the central 630x630 box (x: 285 to 915).
    """
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), (7, 11, 20, 255)) # Deep Obsidian Slate
    draw = ImageDraw.Draw(img)

    # Elegant subtle ambient background gradients (Cyber grid lines)
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(15, 23, 42, 100), width=1)
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(15, 23, 42, 100), width=1)

    # Highlight Central Square Safe Zone (x: 285 to 915)
    safe_left = (w - h) // 2 # 285
    safe_right = safe_left + h # 915

    # Safe zone circular ambient glow
    glow_r = 260
    center_x = w // 2 # 600
    center_y = 220
    draw.ellipse(
        [center_x - glow_r, center_y - glow_r, center_x + glow_r, center_y + glow_r],
        fill=(16, 185, 129, 25)
    )

    # Paste master logo in center
    logo_size = 180
    logo_resized = master_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    img.paste(logo_resized, (center_x - logo_size // 2, 80), logo_resized)

    # Load high quality system font or fallback
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 52)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_badge = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Brand Title: "ExportPilot AI"
    title_text = "ExportPilot AI"
    bbox_t = draw.textbbox((0, 0), title_text, font=font_title)
    tw = bbox_t[2] - bbox_t[0]
    draw.text((center_x - tw // 2, 280), title_text, fill=(248, 250, 252), font=font_title)

    # Category Pill: "Sovereign Trade Intelligence 5.0"
    tag_text = "SOVEREIGN TRADE INTELLIGENCE 5.0"
    bbox_tag = draw.textbbox((0, 0), tag_text, font=font_badge)
    tag_w = bbox_tag[2] - bbox_tag[0]
    pill_pad_x = 20
    pill_pad_y = 6
    pill_box = [
        center_x - tag_w // 2 - pill_pad_x,
        345 - pill_pad_y,
        center_x + tag_w // 2 + pill_pad_x,
        345 + (bbox_tag[3] - bbox_tag[1]) + pill_pad_y
    ]
    draw.rounded_rectangle(pill_box, radius=12, fill=(16, 185, 129, 40), outline=(16, 185, 129, 180), width=1)
    draw.text((center_x - tag_w // 2, 345), tag_text, fill=(52, 211, 153), font=font_badge)

    # Core Value Prop (Centered strictly within the 630px safe zone)
    line1 = "1 Photo & Bangla Voice to Verified Global Buyers"
    line2 = "EU CBAM Audit & Direct FOB Export in 60 Seconds"
    
    bbox_l1 = draw.textbbox((0, 0), line1, font=font_sub)
    bbox_l2 = draw.textbbox((0, 0), line2, font=font_sub)
    draw.text((center_x - (bbox_l1[2] - bbox_l1[0]) // 2, 395), line1, fill=(203, 213, 225), font=font_sub)
    draw.text((center_x - (bbox_l2[2] - bbox_l2[0]) // 2, 435), line2, fill=(148, 163, 184), font=font_sub)

    # Bottom Proof Chips (All within 285 to 915)
    chips = ["0% Tariff Match", "Deepgram Voice", "NetworkX GraphRAG", "ReportLab PDF"]
    total_chips_w = 0
    chip_widths = []
    for c in chips:
        bb = draw.textbbox((0, 0), c, font=font_badge)
        cw = bb[2] - bb[0] + 28
        chip_widths.append(cw)
        total_chips_w += cw + 12
    total_chips_w -= 12

    cur_x = center_x - total_chips_w // 2
    for i, c in enumerate(chips):
        cw = chip_widths[i]
        cbox = [cur_x, 500, cur_x + cw, 536]
        draw.rounded_rectangle(cbox, radius=8, fill=(15, 23, 42, 200), outline=(51, 65, 85, 160), width=1)
        bb = draw.textbbox((0, 0), c, font=font_badge)
        text_w = bb[2] - bb[0]
        draw.text((cur_x + (cw - text_w) // 2, 507), c, fill=(241, 245, 249), font=font_badge)
        cur_x += cw + 12

    og_path = PUBLIC_DIR / "og-image.png"
    img.save(og_path, "PNG")
    print(f"Saved WhatsApp-safe 1:1 centered OG Image: {og_path}")

def generate_svg_logos():
    # Master vector mark
    svg_mark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="46" fill="#0B1326" stroke="#10B981" stroke-width="2.5" stroke-opacity="0.8"/>
  <polygon points="50,16 16,74 36,66 50,82" fill="#059669"/>
  <polygon points="50,16 84,74 64,66 50,82" fill="#10B981"/>
  <polygon points="50,12 59,58 50,72 41,58" fill="#06B6D4"/>
  <circle cx="50" cy="16" r="6" fill="#F59E0B"/>
</svg>'''
    
    (PUBLIC_DIR / "logo-mark.svg").write_text(svg_mark, encoding="utf-8")

    # Horizontal brand logo (dark theme)
    svg_dark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 56" fill="none">
  <g transform="translate(4, 4)">
    <circle cx="24" cy="24" r="23" fill="#0B1326" stroke="#10B981" stroke-width="1.8"/>
    <polygon points="24,8 8,36 18,32 24,40" fill="#059669"/>
    <polygon points="24,8 40,36 30,32 24,40" fill="#10B981"/>
    <polygon points="24,6 28.5,28 24,35 19.5,28" fill="#06B6D4"/>
    <circle cx="24" cy="8" r="3" fill="#F59E0B"/>
  </g>
  <text x="62" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="21" font-weight="800" fill="#F8FAFC" letter-spacing="-0.5">ExportPilot <tspan fill="#10B981">AI</tspan></text>
  <text x="63" y="46" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#94A3B8" letter-spacing="1.2">SOVEREIGN TRADE INTELLIGENCE</text>
</svg>'''
    (PUBLIC_DIR / "logo-dark.svg").write_text(svg_dark, encoding="utf-8")

    # Horizontal brand logo (light theme)
    svg_light = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 56" fill="none">
  <g transform="translate(4, 4)">
    <circle cx="24" cy="24" r="23" fill="#F0FDF4" stroke="#059669" stroke-width="1.8"/>
    <polygon points="24,8 8,36 18,32 24,40" fill="#059669"/>
    <polygon points="24,8 40,36 30,32 24,40" fill="#10B981"/>
    <polygon points="24,6 28.5,28 24,35 19.5,28" fill="#0284C7"/>
    <circle cx="24" cy="8" r="3" fill="#D97706"/>
  </g>
  <text x="62" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="21" font-weight="800" fill="#0F172A" letter-spacing="-0.5">ExportPilot <tspan fill="#059669">AI</tspan></text>
  <text x="63" y="46" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#64748B" letter-spacing="1.2">SOVEREIGN TRADE INTELLIGENCE</text>
</svg>'''
    (PUBLIC_DIR / "logo-light.svg").write_text(svg_light, encoding="utf-8")
    print("Generated all vector SVG logos.")

if __name__ == "__main__":
    master = create_master_1024_logo()
    derive_all_icons_from_master(master)
    generate_safe_zone_og_image(master)
    generate_svg_logos()
    print("ALL BRAND ASSETS COMPLETED WITH MATHEMATICAL PRECISION.")
