"""
ExportPilot AI - Master Sovereign Brand Identity & Asset Generator
Complies with Hallmark anti-AI-slop design standards:
- Zero generic purple-cyan gradients, zero floating 3D spheres, zero amateur cyber glow.
- Strict WhatsApp & Social Media Open Graph (OG) Safe Zone Architecture:
  Full resolution: 1200 x 630 px.
  Central Square Safe Zone (WhatsApp 1:1 crop): x=285 to 915, y=0 to 630.
  All critical branding, headline, value prop, and badges are centered within x=310 to 890.
  Left & Right wings carry institutional maritime logistics & compliance metadata for 16:9 cards.
"""

import os
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "frontend" / "public"
DIST_DIR = BASE_DIR / "frontend" / "dist"
BRAND_DIR = PUBLIC_DIR / "assets" / "brand"

PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
BRAND_DIR.mkdir(parents=True, exist_ok=True)

# Try loading Windows Segoe UI / Arial fonts
def get_fonts():
    fonts_dir = Path(r"C:\Windows\Fonts")
    try:
        f_display = ImageFont.truetype(str(fonts_dir / "segoeuib.ttf"), 42)
        f_sub = ImageFont.truetype(str(fonts_dir / "segoeui.ttf"), 20)
        f_prop_bold = ImageFont.truetype(str(fonts_dir / "segoeuib.ttf"), 22)
        f_prop = ImageFont.truetype(str(fonts_dir / "segoeui.ttf"), 21)
        f_badge = ImageFont.truetype(str(fonts_dir / "segoeuib.ttf"), 14)
        f_mono = ImageFont.truetype(str(fonts_dir / "consola.ttf"), 13)
        f_wing_head = ImageFont.truetype(str(fonts_dir / "segoeuib.ttf"), 12)
        f_wing_body = ImageFont.truetype(str(fonts_dir / "consola.ttf"), 11)
        return {
            "display": f_display,
            "sub": f_sub,
            "prop_bold": f_prop_bold,
            "prop": f_prop,
            "badge": f_badge,
            "mono": f_mono,
            "wing_head": f_wing_head,
            "wing_body": f_wing_body,
        }
    except Exception as e:
        print(f"Fallback to default font: {e}")
        f_def = ImageFont.load_default()
        return {k: f_def for k in ["display", "sub", "prop_bold", "prop", "badge", "mono", "wing_head", "wing_body"]}

def draw_sovereign_emblem(draw, cx, cy, size):
    """
    Draws a mathematical sovereign maritime trade emblem:
    - Outer hairline nautical meridian ring
    - Interlocking bilateral export arrows (Sovereign Blue & Verified Emerald)
    - Golden North Star at pinnacle
    """
    r_outer = size * 0.46
    # Outer double boundary ring
    draw.ellipse(
        [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
        outline=(30, 58, 95, 200),
        width=max(2, int(size * 0.022))
    )
    r_inner = size * 0.41
    draw.ellipse(
        [cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
        outline=(16, 185, 129, 90),
        width=max(1, int(size * 0.012))
    )

    # 4 Cardinal Tick Marks (N, S, E, W)
    tick_len = size * 0.05
    draw.line([(cx, cy - r_outer - 4), (cx, cy - r_outer + tick_len)], fill=(217, 119, 6, 240), width=max(1, int(size * 0.015)))
    draw.line([(cx, cy + r_outer + 4), (cx, cy + r_outer - tick_len)], fill=(16, 185, 129, 180), width=max(1, int(size * 0.015)))
    draw.line([(cx - r_outer - 4, cy), (cx - r_outer + tick_len, cy)], fill=(30, 58, 95, 200), width=max(1, int(size * 0.015)))
    draw.line([(cx + r_outer + 4, cy), (cx + r_outer - tick_len, cy)], fill=(30, 58, 95, 200), width=max(1, int(size * 0.015)))

    # Left Export Arrow (Deep Maritime Navy / Slate)
    left_poly = [
        (cx, cy - size * 0.34),            # Pinnacle
        (cx - size * 0.30, cy + size * 0.22), # Wing outer
        (cx - size * 0.12, cy + size * 0.14), # Notch
        (cx, cy + size * 0.30)             # Bottom Keel
    ]
    draw.polygon(left_poly, fill=(15, 39, 68, 255), outline=(30, 58, 95, 255))

    # Right Export Arrow (Sovereign Verified Emerald)
    right_poly = [
        (cx, cy - size * 0.34),            # Pinnacle
        (cx + size * 0.30, cy + size * 0.22), # Wing outer
        (cx + size * 0.12, cy + size * 0.14), # Notch
        (cx, cy + size * 0.30)             # Bottom Keel
    ]
    draw.polygon(right_poly, fill=(5, 150, 105, 255), outline=(16, 185, 129, 255))

    # Central Navigational Needle (Core Sovereign Spine)
    spine_poly = [
        (cx, cy - size * 0.38),
        (cx + size * 0.06, cy + size * 0.06),
        (cx, cy + size * 0.22),
        (cx - size * 0.06, cy + size * 0.06)
    ]
    draw.polygon(spine_poly, fill=(241, 245, 249, 255))

    # Golden North Star at Pinnacle
    star_r = size * 0.06
    star_cy = cy - size * 0.34
    draw.ellipse(
        [cx - star_r, star_cy - star_r, cx + star_r, star_cy + star_r],
        fill=(217, 119, 6, 255),
        outline=(251, 191, 36, 255),
        width=max(1, int(size * 0.01))
    )

def create_master_1024():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Architectural rounded container with hairline sovereign border
    pad = 32
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=200,
        fill=(9, 14, 23, 255),
        outline=(30, 58, 95, 220),
        width=8
    )

    draw_sovereign_emblem(draw, size // 2, size // 2, size * 0.80)
    out_path = PUBLIC_DIR / "master-logo-1024.png"
    img.save(out_path, "PNG")
    print(f"Master logo (1024x1024) saved: {out_path}")
    return img

def create_all_icon_derivatives(master_img):
    icon_map = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "apple-touch-icon.png": 180,
        "icon-192x192.png": 192,
        "icon-512x512.png": 512,
        "pwa-192x192.png": 192,
        "pwa-512x512.png": 512,
    }

    for fname, sz in icon_map.items():
        res = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
        out_f = PUBLIC_DIR / fname
        res.save(out_f, "PNG")
        print(f"Generated icon: {fname} ({sz}x{sz})")

    # Generate multi-size favicon.ico
    ico_path = PUBLIC_DIR / "favicon.ico"
    master_img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated multi-resolution favicon.ico")

def generate_whatsapp_safe_og_image(master_img):
    """
    Creates an authoritative 1200x630 OpenGraph card designed for human psychology.
    Safe-zone engineering:
    - WhatsApp crops to a 1:1 square thumbnail (630x630, x: 285 to 915).
    - Every crucial piece of text, badge, and insignia is strictly inside x: 310 to 890.
    - Outer wings (x < 285 and x > 915) display institutional logistics telemetry
      for 16:9 Twitter/LinkedIn previews.
    """
    w, h = 1200, 630
    fonts = get_fonts()

    # Base surface: Deep sovereign maritime navy
    img = Image.new("RGBA", (w, h), (9, 14, 23, 255))
    draw = ImageDraw.Draw(img)

    # 1. Architectural perimeter frame with hairline boundary
    border_pad = 16
    draw.rectangle(
        [border_pad, border_pad, w - border_pad, h - border_pad],
        outline=(26, 44, 76, 255),
        width=1
    )
    # Corner registration marks
    cr_len = 12
    draw.line([(border_pad, border_pad + cr_len), (border_pad, border_pad), (border_pad + cr_len, border_pad)], fill=(16, 185, 129, 200), width=2)
    draw.line([(w - border_pad, border_pad + cr_len), (w - border_pad, border_pad), (w - border_pad - cr_len, border_pad)], fill=(16, 185, 129, 200), width=2)
    draw.line([(border_pad, h - border_pad - cr_len), (border_pad, h - border_pad), (border_pad + cr_len, h - border_pad)], fill=(16, 185, 129, 200), width=2)
    draw.line([(w - border_pad, h - border_pad - cr_len), (w - border_pad, h - border_pad), (w - border_pad - cr_len, h - border_pad)], fill=(16, 185, 129, 200), width=2)

    # Subtle vertical dividing rules marking the WhatsApp 1:1 safe boundary (x: 285 and 915)
    safe_left = 285
    safe_right = 915
    for y_dash in range(30, h - 30, 14):
        draw.line([(safe_left, y_dash), (safe_left, y_dash + 6)], fill=(20, 35, 60, 180), width=1)
        draw.line([(safe_right, y_dash), (safe_right, y_dash + 6)], fill=(20, 35, 60, 180), width=1)

    # 2. LEFT WING (x: 35 to 265) - Maritime Logistics Telemetry (Desktop only)
    lx = 38
    draw.text((lx, 45), "PORT DEPARTURE", fill=(16, 185, 129), font=fonts["wing_head"])
    draw.line([(lx, 62), (lx + 200, 62)], fill=(26, 44, 76), width=1)

    telemetry_items = [
        ("Chattogram Port", "22.3° N, 91.8° E"),
        ("Mongla Port", "22.5° N, 89.6° E"),
        ("Dhaka Air Cargo", "DAC / Terminal 3"),
        ("Active Nodes", "5 FastMCP Agents"),
        ("Sovereign Redactor", "Local PII Masker"),
    ]
    y_tel = 75
    for label, val in telemetry_items:
        draw.text((lx, y_tel), label, fill=(148, 163, 184), font=fonts["wing_head"])
        draw.text((lx, y_tel + 15), val, fill=(203, 213, 225), font=fonts["wing_body"])
        y_tel += 38

    draw.text((lx, 305), "FOB DIRECT TRADE", fill=(217, 119, 6), font=fonts["wing_head"])
    draw.line([(lx, 322), (lx + 200, 322)], fill=(26, 44, 76), width=1)
    trade_routes = [
        ("EU EBA Route", "0% Customs Duty"),
        ("Japan DFQF", "Zero Tariff Entry"),
        ("UK DCTS Tier", "Direct L/C Escrow"),
    ]
    y_tr = 335
    for r_name, r_sub in trade_routes:
        draw.text((lx, y_tr), r_name, fill=(148, 163, 184), font=fonts["wing_head"])
        draw.text((lx, y_tr + 15), r_sub, fill=(16, 185, 129), font=fonts["wing_body"])
        y_tr += 38

    draw.text((lx, 550), "EQUISAAS-BD INFRASTRUCTURE", fill=(71, 85, 105), font=fonts["mono"])

    # 3. RIGHT WING (x: 935 to 1165) - International Compliance Standards (Desktop only)
    rx = 935
    draw.text((rx, 45), "COMPLIANCE & AUDIT", fill=(16, 185, 129), font=fonts["wing_head"])
    draw.line([(rx, 62), (rx + 225, 62)], fill=(26, 44, 76), width=1)

    compliance_items = [
        ("WCO Harmonized System", "8-Digit Tariff 2026"),
        ("EU CBAM Regulation", "EU 2023/956 Scope 2"),
        ("Energy Utility Parsing", "PyMuPDF REB kWh"),
        ("Audio Transcription", "Deepgram Nova-3 BN"),
        ("Vector Invoices", "ReportLab PDF Engine"),
    ]
    y_comp = 75
    for c_title, c_desc in compliance_items:
        draw.text((rx, y_comp), c_title, fill=(148, 163, 184), font=fonts["wing_head"])
        draw.text((rx, y_comp + 15), c_desc, fill=(203, 213, 225), font=fonts["wing_body"])
        y_comp += 38

    draw.text((rx, 305), "ENTERPRISE SECURITY", fill=(56, 189, 248), font=fonts["wing_head"])
    draw.line([(rx, 322), (rx + 225, 322)], fill=(26, 44, 76), width=1)
    sec_items = [
        ("National ID (NID)", "10, 13, 17-Digit Masked"),
        ("Tax Identification", "12-Digit TIN Strip"),
        ("Bank Swift & IBAN", "Zero Overseas Leak"),
    ]
    y_sec = 335
    for s_title, s_desc in sec_items:
        draw.text((rx, y_sec), s_title, fill=(148, 163, 184), font=fonts["wing_head"])
        draw.text((rx, y_sec + 15), s_desc, fill=(148, 163, 184), font=fonts["wing_body"])
        y_sec += 38

    draw.text((rx, 550), "ISO 14064-1 CARBON AUDITED", fill=(71, 85, 105), font=fonts["mono"])

    # 4. CENTRAL SQUARE SAFE ZONE (x: 285 to 915) - 100% WhatsApp Crop Safe
    cx = w // 2 # 600

    # Draw Emblem in center (size: 130px)
    logo_sz = 130
    logo_resized = master_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
    img.paste(logo_resized, (cx - logo_sz // 2, 48), logo_resized)

    # Brand Title: "ExportPilot AI"
    title_text = "ExportPilot AI"
    bbox_t = draw.textbbox((0, 0), title_text, font=fonts["display"])
    tw = bbox_t[2] - bbox_t[0]
    draw.text((cx - tw // 2, 192), title_text, fill=(248, 250, 252), font=fonts["display"])

    # Category Subtitle with wide letter spacing
    sub_text = "SOVEREIGN TRADE INTELLIGENCE"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=fonts["sub"])
    sw = bbox_sub[2] - bbox_sub[0]
    draw.text((cx - sw // 2, 246), sub_text, fill=(148, 163, 184), font=fonts["sub"])

    # Thin separator line in safe zone
    draw.line([(cx - 160, 282), (cx + 160, 282)], fill=(30, 58, 95), width=1)
    draw.ellipse([(cx - 3, 279), (cx + 3, 285)], fill=(16, 185, 129))

    # Core Value Proposition Line 1:
    line1 = "Bangla Voice & Photo to Verified Global Buyers"
    bbox_l1 = draw.textbbox((0, 0), line1, font=fonts["prop_bold"])
    l1_w = bbox_l1[2] - bbox_l1[0]
    draw.text((cx - l1_w // 2, 300), line1, fill=(241, 245, 249), font=fonts["prop_bold"])

    # Core Value Proposition Line 2:
    line2 = "EU CBAM Scope 2 Audit & Direct Export Deals in 60s"
    bbox_l2 = draw.textbbox((0, 0), line2, font=fonts["prop"])
    l2_w = bbox_l2[2] - bbox_l2[0]
    draw.text((cx - l2_w // 2, 334), line2, fill=(16, 185, 129), font=fonts["prop"])

    # Authority Chips Container (Clean rectangular pill, centered)
    chip_y = 380
    chip_h = 36
    chips = ["0% Tariff Match", "Deepgram Voice", "GraphRAG Rerank", "ReportLab Vector PDF"]
    # Calculate widths
    chip_padding = 18
    rendered_chips = []
    total_w = 0
    for c in chips:
        bb = draw.textbbox((0, 0), c, font=fonts["mono"])
        cw = (bb[2] - bb[0]) + chip_padding * 2
        rendered_chips.append((c, cw))
        total_w += cw + 10
    total_w -= 10

    chip_start_x = cx - total_w // 2
    for c_text, c_w in rendered_chips:
        c_rect = [chip_start_x, chip_y, chip_start_x + c_w, chip_y + chip_h]
        draw.rounded_rectangle(c_rect, radius=6, fill=(15, 27, 46, 240), outline=(30, 58, 95, 220), width=1)
        bb = draw.textbbox((0, 0), c_text, font=fonts["mono"])
        tw_c = bb[2] - bb[0]
        draw.text((chip_start_x + (c_w - tw_c) // 2, chip_y + 10), c_text, fill=(203, 213, 225), font=fonts["mono"])
        chip_start_x += c_w + 10

    # Institutional Endorsement Badge: DIU Idea to Unicorn 2026
    badge_y = 440
    badge_text = "DIU IDEA TO UNICORN 2026  |  NATIONAL TRADE INFRASTRUCTURE"
    bbox_b = draw.textbbox((0, 0), badge_text, font=fonts["badge"])
    bw = bbox_b[2] - bbox_b[0] + 32
    bh = 32
    b_rect = [cx - bw // 2, badge_y, cx + bw // 2, badge_y + bh]
    draw.rounded_rectangle(b_rect, radius=16, fill=(12, 22, 38, 255), outline=(16, 185, 129, 180), width=1)
    draw.text((cx - (bbox_b[2] - bbox_b[0]) // 2, badge_y + 8), badge_text, fill=(52, 211, 153), font=fonts["badge"])

    # Bottom Trust Statement:
    trust_text = "Local Data Sovereignty Guard  *  Zero Middleware Leakage  *  Official B2B Gateway"
    bbox_tr = draw.textbbox((0, 0), trust_text, font=fonts["mono"])
    tr_w = bbox_tr[2] - bbox_tr[0]
    draw.text((cx - tr_w // 2, 495), trust_text, fill=(100, 116, 139), font=fonts["mono"])

    # Save to public and dist
    out_public = PUBLIC_DIR / "og-image.png"
    img.save(out_public, "PNG")
    print(f"Generated WhatsApp-safe 1:1 & 16:9 OG Image: {out_public}")

    if DIST_DIR.exists():
        out_dist = DIST_DIR / "og-image.png"
        img.save(out_dist, "PNG")
        print(f"Synced OG Image to dist: {out_dist}")

def generate_vector_logos():
    """
    Emits authentic, scalable SVG logos with Hallmark-compliant typography.
    Zero fake drop shadows, zero cartoon styles.
    """
    # 1. Clean Vector Emblem
    svg_mark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <!-- Outer Double Meridian Ring -->
  <circle cx="50" cy="50" r="46" fill="#090E17" stroke="#1E3A5F" stroke-width="2"/>
  <circle cx="50" cy="50" r="41" stroke="#10B981" stroke-width="1" stroke-opacity="0.4"/>
  
  <!-- Cardinal Tick Marks -->
  <line x1="50" y1="2" x2="50" y2="8" stroke="#D97706" stroke-width="2"/>
  <line x1="50" y1="92" x2="50" y2="98" stroke="#10B981" stroke-width="2"/>
  <line x1="2" y1="50" x2="8" y2="50" stroke="#1E3A5F" stroke-width="2"/>
  <line x1="92" y1="50" x2="98" y2="50" stroke="#1E3A5F" stroke-width="2"/>
  
  <!-- Bilateral Interlocking Export Arrows -->
  <polygon points="50,18 20,72 38,64 50,80" fill="#0F2744" stroke="#1E3A5F" stroke-width="1.2"/>
  <polygon points="50,18 80,72 62,64 50,80" fill="#059669" stroke="#10B981" stroke-width="1.2"/>
  
  <!-- Central Sovereign Spine -->
  <polygon points="50,14 56,56 50,72 44,56" fill="#F8FAFC"/>
  
  <!-- Golden Latitude Star -->
  <circle cx="50" cy="18" r="5" fill="#D97706" stroke="#FBBF24" stroke-width="1"/>
</svg>'''
    (PUBLIC_DIR / "logo-mark.svg").write_text(svg_mark, encoding="utf-8")
    (BRAND_DIR / "logo-mark.svg").write_text(svg_mark, encoding="utf-8")

    # 2. Horizontal Brand Logo (Dark Theme)
    svg_dark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" fill="none">
  <g transform="translate(4, 4)">
    <circle cx="24" cy="24" r="23" fill="#090E17" stroke="#1E3A5F" stroke-width="1.5"/>
    <circle cx="24" cy="24" r="20" stroke="#10B981" stroke-width="0.8" stroke-opacity="0.5"/>
    <line x1="24" y1="0" x2="24" y2="4" stroke="#D97706" stroke-width="1.5"/>
    <polygon points="24,9 9,35 18,31 24,39" fill="#0F2744" stroke="#1E3A5F" stroke-width="0.8"/>
    <polygon points="24,9 39,35 30,31 24,39" fill="#059669" stroke="#10B981" stroke-width="0.8"/>
    <polygon points="24,7 27,27 24,35 21,27" fill="#F8FAFC"/>
    <circle cx="24" cy="9" r="2.5" fill="#D97706"/>
  </g>
  <text x="64" y="31" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="800" fill="#F8FAFC" letter-spacing="-0.4">ExportPilot <tspan fill="#10B981">AI</tspan></text>
  <text x="64.5" y="45" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="600" fill="#94A3B8" letter-spacing="1.5">SOVEREIGN TRADE INTELLIGENCE</text>
</svg>'''
    (PUBLIC_DIR / "logo-dark.svg").write_text(svg_dark, encoding="utf-8")
    (BRAND_DIR / "logo-dark.svg").write_text(svg_dark, encoding="utf-8")

    # 3. Horizontal Brand Logo (Light Theme)
    svg_light = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" fill="none">
  <g transform="translate(4, 4)">
    <circle cx="24" cy="24" r="23" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <circle cx="24" cy="24" r="20" stroke="#059669" stroke-width="0.8" stroke-opacity="0.5"/>
    <line x1="24" y1="0" x2="24" y2="4" stroke="#D97706" stroke-width="1.5"/>
    <polygon points="24,9 9,35 18,31 24,39" fill="#0F2744" stroke="#0F2744" stroke-width="0.8"/>
    <polygon points="24,9 39,35 30,31 24,39" fill="#059669" stroke="#10B981" stroke-width="0.8"/>
    <polygon points="24,7 27,27 24,35 21,27" fill="#090E17"/>
    <circle cx="24" cy="9" r="2.5" fill="#D97706"/>
  </g>
  <text x="64" y="31" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="800" fill="#090E17" letter-spacing="-0.4">ExportPilot <tspan fill="#059669">AI</tspan></text>
  <text x="64.5" y="45" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="600" fill="#64748B" letter-spacing="1.5">SOVEREIGN TRADE INTELLIGENCE</text>
</svg>'''
    (PUBLIC_DIR / "logo-light.svg").write_text(svg_light, encoding="utf-8")
    (BRAND_DIR / "logo-light.svg").write_text(svg_light, encoding="utf-8")
    print("Generated all vector SVG logos in public and brand folders.")

def sync_assets_to_dist():
    """Sync newly created assets to frontend/dist if dist exists."""
    if not DIST_DIR.exists():
        return
    for item in PUBLIC_DIR.glob("*.*"):
        if item.is_file():
            shutil.copy2(item, DIST_DIR / item.name)
    
    dist_brand = DIST_DIR / "assets" / "brand"
    dist_brand.mkdir(parents=True, exist_ok=True)
    for item in BRAND_DIR.glob("*.*"):
        if item.is_file():
            shutil.copy2(item, dist_brand / item.name)
    print("Synced all brand assets to frontend/dist.")

if __name__ == "__main__":
    master = create_master_1024()
    create_all_icon_derivatives(master)
    generate_whatsapp_safe_og_image(master)
    generate_vector_logos()
    sync_assets_to_dist()
    print("MASTER BRAND ASSETS & WHATSAPP-SAFE OG IMAGE GENERATED SUCCESSFULLY.")
