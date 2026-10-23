import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect, String

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_PUBLIC = BASE_DIR / "frontend" / "public"
BRAND_DIR = FRONTEND_PUBLIC / "assets" / "brand"
SAMPLES_DIR = FRONTEND_PUBLIC / "assets" / "samples"

for d in [FRONTEND_PUBLIC, BRAND_DIR, SAMPLES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Brand Colors: Deep Slate (#0B1120), Emerald (#10B981, #064E3B), Gold (#F59E0B)
DARK_BG = (11, 17, 32)
EMERALD = (16, 185, 129)
EMERALD_DARK = (6, 78, 59)
GOLD = (245, 158, 11)
WHITE = (255, 255, 255)
MUTED_SLATE = (148, 163, 184)

def draw_emblem(draw, x_center, y_center, size):
    half = size / 2
    # Hexagonal base / Shield
    points = [
        (x_center, y_center - half),
        (x_center + half * 0.866, y_center - half * 0.5),
        (x_center + half * 0.866, y_center + half * 0.5),
        (x_center, y_center + half),
        (x_center - half * 0.866, y_center + half * 0.5),
        (x_center - half * 0.866, y_center - half * 0.5),
    ]
    draw.polygon(points, fill=EMERALD_DARK, outline=EMERALD)
    
    # Cargo container / Ship Bow
    inner_half = half * 0.6
    draw.rectangle([x_center - inner_half * 0.6, y_center - inner_half * 0.4, 
                    x_center + inner_half * 0.6, y_center + inner_half * 0.4], 
                   fill=EMERALD, outline=GOLD)
    
    # Neural node / Compass star
    draw.line([(x_center, y_center - half * 0.7), (x_center, y_center + half * 0.7)], fill=GOLD, width=max(1, int(size * 0.05)))
    draw.line([(x_center - half * 0.7, y_center), (x_center + half * 0.7, y_center)], fill=GOLD, width=max(1, int(size * 0.05)))
    draw.ellipse([x_center - size * 0.08, y_center - size * 0.08, 
                  x_center + size * 0.08, y_center + size * 0.08], fill=WHITE)

def generate_icons():
    print("Generating favicons and PWA icons...")
    # 512x512 Master Icon
    img_512 = Image.new("RGBA", (512, 512), DARK_BG + (255,))
    draw = ImageDraw.Draw(img_512)
    draw_emblem(draw, 256, 256, 320)
    img_512.save(FRONTEND_PUBLIC / "pwa-512x512.png", "PNG")

    # 192x192
    img_192 = img_512.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(FRONTEND_PUBLIC / "pwa-192x192.png", "PNG")

    # 180x180 Apple Touch Icon
    img_180 = img_512.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(FRONTEND_PUBLIC / "apple-touch-icon.png", "PNG")

    # 32x32 and 16x16
    img_32 = img_512.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save(FRONTEND_PUBLIC / "favicon-32x32.png", "PNG")

    img_16 = img_512.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save(FRONTEND_PUBLIC / "favicon-16x16.png", "PNG")

    # Multi-resolution ICO (16, 32, 48)
    img_48 = img_512.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save(FRONTEND_PUBLIC / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

def generate_svg_logos():
    print("Generating SVG logos...")
    logo_dark_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="380" height="84" viewBox="0 0 380 84" fill="none">
  <defs>
    <linearGradient id="em_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <!-- Hexagonal Globe Emblem -->
  <g transform="translate(10, 10)">
    <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" fill="url(#em_grad)" stroke="#10B981" stroke-width="2"/>
    <path d="M16 26 L48 26 L42 44 L22 44 Z" fill="#0B1120" stroke="#F59E0B" stroke-width="1.5"/>
    <line x1="32" y1="12" x2="32" y2="52" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="2,2"/>
    <circle cx="32" cy="32" r="4" fill="#FFFFFF"/>
    <circle cx="48" cy="20" r="3" fill="#10B981"/>
    <circle cx="16" cy="40" r="3" fill="#10B981"/>
  </g>
  <!-- Brand Text -->
  <text x="82" y="44" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">ExportPilot <tspan fill="#10B981">AI</tspan></text>
  <!-- Pill Badge: গ্লোবাল-ব্যাপারী -->
  <rect x="82" y="52" width="124" height="20" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
  <text x="144" y="66" font-family="'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" font-size="11" font-weight="600" fill="#F59E0B" text-anchor="middle">গ্লোবাল-ব্যাপারী</text>
  <rect x="214" y="52" width="145" height="20" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
  <text x="286.5" y="66" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#94A3B8" text-anchor="middle">SOVEREIGN TRADE 5.0</text>
</svg>"""

    with open(BRAND_DIR / "logo-dark.svg", "w", encoding="utf-8") as f:
        f.write(logo_dark_svg)

    logo_light_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="380" height="84" viewBox="0 0 380 84" fill="none">
  <defs>
    <linearGradient id="em_grad_l" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
  </defs>
  <g transform="translate(10, 10)">
    <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" fill="url(#em_grad_l)" stroke="#047857" stroke-width="2"/>
    <path d="M16 26 L48 26 L42 44 L22 44 Z" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/>
    <line x1="32" y1="12" x2="32" y2="52" stroke="#D97706" stroke-width="1.5" stroke-dasharray="2,2"/>
    <circle cx="32" cy="32" r="4" fill="#064E3B"/>
    <circle cx="48" cy="20" r="3" fill="#059669"/>
    <circle cx="16" cy="40" r="3" fill="#059669"/>
  </g>
  <text x="82" y="44" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-size="26" font-weight="800" fill="#0F172A">ExportPilot <tspan fill="#059669">AI</tspan></text>
  <rect x="82" y="52" width="124" height="20" rx="10" fill="#ECFDF5" stroke="#059669" stroke-width="1"/>
  <text x="144" y="66" font-family="'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" font-size="11" font-weight="600" fill="#B45309" text-anchor="middle">গ্লোবাল-ব্যাপারী</text>
  <rect x="214" y="52" width="145" height="20" rx="10" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
  <text x="286.5" y="66" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">SOVEREIGN TRADE 5.0</text>
</svg>"""

    with open(BRAND_DIR / "logo-light.svg", "w", encoding="utf-8") as f:
        f.write(logo_light_svg)

def generate_og_image():
    print("Generating OpenGraph banner (1200x630)...")
    img = Image.new("RGBA", (1200, 630), DARK_BG + (255,))
    draw = ImageDraw.Draw(img)

    # Ambient background glow
    glow = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([800, 100, 1300, 600], fill=(6, 78, 59, 120))
    gdraw.ellipse([100, 400, 500, 800], fill=(245, 158, 11, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)

    # Draw left-side typography & branding
    draw_emblem(draw, 140, 120, 100)
    draw.text((220, 95), "ExportPilot AI", fill=WHITE)
    draw.text((220, 135), "গ্লোবাল-ব্যাপারী • GlobalBepari", fill=GOLD)

    draw.rectangle([80, 220, 680, 360], fill=(15, 23, 42, 220), outline=EMERALD_DARK)
    draw.text((105, 245), "From 1 Photo & Voice to Global Export Deals", fill=WHITE)
    draw.text((105, 280), "8-Digit HS Code Matching + EU CBAM Carbon Audit in 60s", fill=EMERALD)
    draw.text((105, 315), "Loss Aversion: Direct FOB Export vs 32% Middleman Loss", fill=MUTED_SLATE)

    # Right side: Interactive Knowledge Graph illustration
    nodes = [
        (850, 180, "Bangladesh (Origin)", EMERALD),
        (1050, 130, "Germany (0% EBA)", GOLD),
        (1080, 260, "Japan (0% DFQF)", GOLD),
        (1020, 390, "UK (0% DCTS)", GOLD),
        (860, 320, "HS 4202.22.10", WHITE),
        (880, 470, "Scope 2 CBAM Pass", EMERALD),
    ]
    edges = [
        (nodes[0], nodes[4]),
        (nodes[4], nodes[1]),
        (nodes[4], nodes[2]),
        (nodes[4], nodes[3]),
        (nodes[4], nodes[5]),
    ]
    for n1, n2 in edges:
        draw.line([(n1[0], n1[1]), (n2[0], n2[1])], fill=(16, 185, 129, 160), width=3)

    for nx, ny, label, col in nodes:
        draw.ellipse([nx - 14, ny - 14, nx + 14, ny + 14], fill=col, outline=WHITE)
        draw.text((nx - 40, ny + 18), label, fill=WHITE)

    # Footer banner
    draw.rectangle([0, 570, 1200, 630], fill=(6, 78, 59, 240))
    draw.text((80, 590), "International AI Builders Congress 2026 • Idea to Unicorn Track • Ashulia Campus, DIU", fill=WHITE)

    img.save(FRONTEND_PUBLIC / "og-image.png", "PNG")

def generate_sample_products():
    print("Generating sample product photos (800x800)...")

    # 1. Jute Bag
    jute = Image.new("RGB", (800, 800), (245, 245, 240))
    jdraw = ImageDraw.Draw(jute)
    # Studio table shadow
    jdraw.ellipse([150, 680, 650, 750], fill=(210, 210, 205))
    # Bag body (Golden Hessian texture)
    jdraw.rectangle([220, 280, 580, 690], fill=(212, 175, 110), outline=(180, 140, 80), width=4)
    # Stitched weave patterns
    for y in range(300, 680, 25):
        jdraw.line([(230, y), (570, y)], fill=(195, 160, 95), width=2)
    # Leather handles
    jdraw.arc([280, 130, 400, 360], 180, 360, fill=(101, 55, 25), width=18)
    jdraw.arc([400, 130, 520, 360], 180, 360, fill=(101, 55, 25), width=18)
    # Badge: Made in Bangladesh
    jdraw.rectangle([280, 450, 520, 520], fill=(6, 78, 59), outline=(16, 185, 129), width=2)
    jdraw.text((310, 475), "ECO JUTE • BANGLADESH", fill=(255, 255, 255))
    # Stamp
    jdraw.rectangle([50, 50, 320, 110], fill=(11, 17, 32), outline=(245, 158, 11), width=2)
    jdraw.text((70, 65), "HS CODE: 4202.22.10", fill=(245, 158, 11))
    jdraw.text((70, 85), "EU CBAM: 0.31 kg CO2e (PASS)", fill=(16, 185, 129))
    jute.save(SAMPLES_DIR / "jute-tote-bag.png", "PNG")

    # 2. Denim Jacket
    denim = Image.new("RGB", (800, 800), (242, 244, 247))
    ddraw = ImageDraw.Draw(denim)
    ddraw.ellipse([180, 690, 620, 750], fill=(215, 218, 224))
    # Indigo jacket silhouette
    ddraw.polygon([(260, 180), (540, 180), (680, 320), (600, 400), (540, 340), 
                   (540, 680), (260, 680), (260, 340), (200, 400), (120, 320)], 
                  fill=(30, 58, 138), outline=(24, 43, 98), width=4)
    # Collar & chest pockets
    ddraw.polygon([(340, 180), (400, 260), (460, 180)], fill=(24, 43, 98))
    ddraw.rectangle([300, 320, 380, 400], fill=(35, 68, 160), outline=(245, 158, 11), width=2)
    ddraw.rectangle([420, 320, 500, 400], fill=(35, 68, 160), outline=(245, 158, 11), width=2)
    # Brass buttons
    for by in [280, 360, 440, 520, 600]:
        ddraw.ellipse([392, by - 8, 408, by + 8], fill=(245, 158, 11))
    # Stamp
    ddraw.rectangle([50, 50, 320, 110], fill=(11, 17, 32), outline=(245, 158, 11), width=2)
    ddraw.text((70, 65), "HS CODE: 6201.40.10", fill=(245, 158, 11))
    ddraw.text((70, 85), "GAZIPUR SUSTAINABLE RMG", fill=(16, 185, 129))
    denim.save(SAMPLES_DIR / "denim-jacket-rmg.png", "PNG")

    # 3. Leather Boot
    boot = Image.new("RGB", (800, 800), (248, 248, 246))
    bdraw = ImageDraw.Draw(boot)
    bdraw.ellipse([140, 670, 680, 740], fill=(220, 220, 215))
    # Chelsea boot profile (Chestnut brown)
    bdraw.polygon([(260, 260), (420, 260), (450, 440), (620, 540), (650, 660), 
                   (200, 660), (200, 540), (240, 420)], 
                  fill=(120, 53, 15), outline=(69, 26, 3), width=4)
    # Sole (Rubber lug)
    bdraw.rectangle([190, 650, 660, 680], fill=(20, 20, 20))
    # Elastic side gusset
    bdraw.polygon([(320, 280), (380, 280), (370, 420), (330, 420)], fill=(30, 30, 30))
    # Stamp
    bdraw.rectangle([50, 50, 340, 110], fill=(11, 17, 32), outline=(245, 158, 11), width=2)
    bdraw.text((70, 65), "HS CODE: 6403.91.60", fill=(245, 158, 11))
    bdraw.text((70, 85), "SAVAR CHROME-FREE LEATHER", fill=(16, 185, 129))
    boot.save(SAMPLES_DIR / "leather-chelsea-boot.png", "PNG")

    # 4. Terracotta Set
    terra = Image.new("RGB", (800, 800), (246, 244, 240))
    tdraw = ImageDraw.Draw(terra)
    tdraw.ellipse([160, 680, 660, 750], fill=(215, 210, 205))
    # Glazed pitcher / Vase
    tdraw.polygon([(340, 220), (460, 220), (520, 440), (480, 660), (320, 660), (280, 440)],
                  fill=(180, 83, 9), outline=(120, 53, 15), width=4)
    # Handle
    tdraw.arc([460, 280, 580, 500], 270, 90, fill=(120, 53, 15), width=16)
    # Plate beside pitcher
    tdraw.ellipse([140, 500, 360, 670], fill=(194, 65, 12), outline=(120, 53, 15), width=3)
    tdraw.ellipse([170, 530, 330, 640], fill=(217, 119, 6), outline=(120, 53, 15), width=2)
    # Stamp
    tdraw.rectangle([50, 50, 320, 110], fill=(11, 17, 32), outline=(245, 158, 11), width=2)
    tdraw.text((70, 65), "HS CODE: 6912.00.20", fill=(245, 158, 11))
    tdraw.text((70, 85), "BOGURA ARTISAN CERAMICS", fill=(16, 185, 129))
    terra.save(SAMPLES_DIR / "terracotta-tableware.png", "PNG")

def generate_sample_pdfs():
    print("Generating sample REB electricity bill and Trade License PDFs...")
    styles = getSampleStyleSheet()

    # 1. REB Electricity Bill
    reb_pdf = SAMPLES_DIR / "sample-reb-electricity-bill.pdf"
    doc = SimpleDocTemplate(str(reb_pdf), pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    title_style = ParagraphStyle('REBTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#064E3B'), alignment=1)
    sub_style = ParagraphStyle('REBSub', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#334155'), alignment=1)
    h2_style = ParagraphStyle('REBH2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor('#0B1120'))
    normal = styles['Normal']

    story.append(Paragraph("BANGLADESH RURAL ELECTRIFICATION BOARD (BREB)", title_style))
    story.append(Paragraph("DHAKA POLLI BIDDYUT SAMITY-3 | SAVAR INDUSTRIAL ZONE", sub_style))
    story.append(Spacer(1, 15))

    # Bill Info Table
    bill_info = [
        ["Consumer Name:", "Savar Golden Jute & Eco-Crafts Ltd.", "Billing Month:", "September 2026"],
        ["Premise Address:", "Plot 42, Kornopara, Savar, Dhaka", "Meter No:", "REB-SAV-884920"],
        ["Tariff Category:", "E-1 (Medium Industrial 11kV)", "Sanctioned Load:", "150 kW"],
        ["TIN Reference:", "558492011234", "NID Reference:", "19882694812004512"],
        ["Contact Phone:", "+8801712984920", "BIN:", "004192837-0101"]
    ]
    t_info = Table(bill_info, colWidths=[110, 160, 100, 150])
    t_info.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#064E3B')),
        ('TEXTCOLOR', (2,0), (2,-1), colors.HexColor('#064E3B')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    story.append(Paragraph("ENERGY CONSUMPTION & CHARGES BREAKDOWN", h2_style))
    story.append(Spacer(1, 6))

    cons_data = [
        ["Reading Type", "Previous (kWh)", "Present (kWh)", "Difference", "Rate (BDT)", "Total (BDT)"],
        ["Peak Hours (17:00-23:00)", "48,200", "52,400", "4,200", "14.50", "60,900.00"],
        ["Off-Peak Hours", "112,000", "123,800", "11,800", "9.80", "1,15,640.00"],
        ["Total Active Energy", "-", "-", "16,000 kWh", "-", "1,76,540.00"],
        ["Demand Charge (150 kW @ 75 BDT)", "-", "-", "-", "-", "11,250.00"],
        ["Power Factor (PF): 0.89", "Penalty (< 0.95)", "-", "-", "-", "4,500.00"],
        ["VAT (5%)", "-", "-", "-", "-", "9,614.50"],
        ["NET PAYABLE AMOUNT (BDT)", "-", "-", "-", "-", "2,01,904.50"]
    ]
    t_cons = Table(cons_data, colWidths=[140, 75, 75, 75, 75, 80])
    t_cons.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#064E3B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#F1F5F9')]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#FEF3C7')),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,-1), (-1,-1), colors.HexColor('#92400E')),
    ]))
    story.append(t_cons)
    story.append(Spacer(1, 20))

    # Carbon scope notice
    notice = [
        ["EU CBAM & ESG Scope 2 Footprint Summary (ExportPilot AI Verified):"],
        ["• Total Monthly Electricity Consumption: 16,000 kWh"],
        ["• Bangladesh Grid Emission Factor: 0.637 kg CO2e / kWh"],
        ["• Scope 2 Gross Emissions: 10,192 kg CO2e (10.19 Metric Tons CO2e)"],
        ["• Monthly Production Capacity: 10,000 Jute Units -> Scope 2 Intensity: 0.31 kg CO2e / unit (EU Limit: 1.45 kg CO2e)"]
    ]
    t_notice = Table(notice, colWidths=[520])
    t_notice.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#064E3B')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10B981')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_notice)
    doc.build(story)

    # 2. Trade License PDF
    trade_pdf = SAMPLES_DIR / "sample-trade-license-bd.pdf"
    doc2 = SimpleDocTemplate(str(trade_pdf), pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story2 = []

    story2.append(Paragraph("GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH", title_style))
    story2.append(Paragraph("SAVAR MUNICIPALITY • COMMERCIAL TRADE & EXPORT REGISTRATION", sub_style))
    story2.append(Spacer(1, 15))

    license_info = [
        ["Trade License Number:", "TRAD/SAV/2026/009481", "Issuance Date:", "12 July 2026"],
        ["Business Enterprise:", "Savar Golden Jute & Eco-Crafts Ltd.", "Validity Period:", "2026-2027 FY"],
        ["Proprietor / MD:", "Mr. Rahim Uddin", "NID Reference:", "19882694812004512"],
        ["Factory Address:", "Plot 42, Kornopara, Savar, Dhaka", "Phone / Mobile:", "+8801712984920"],
        ["TIN Reference:", "558492011234", "BIN / VAT Reg:", "004192837-0101"],
        ["ERC Number (Export Reg):", "BD-ERC-449102", "Authorized Categories:", "HS 4202, 5310, 6403, 6912"]
    ]
    t_lic = Table(license_info, colWidths=[140, 160, 100, 120])
    t_lic.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F8FAFC')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story2.append(t_lic)
    story2.append(Spacer(1, 20))

    story2.append(Paragraph("EXPORT ACCREDITATION & COMPLIANCE ENDORSEMENT", h2_style))
    story2.append(Spacer(1, 8))

    accred_data = [
        ["Accreditation Type", "Certifying Authority", "Certificate Ref", "Expiry / Status"],
        ["Export Registration Certificate (ERC)", "Chief Controller of Imports & Exports", "CCIE-ERC-2026-9921", "Active (Valid till 2029)"],
        ["REX (Registered Exporter)", "Export Promotion Bureau (EPB)", "BDREX2026001429", "EU EBA / GSP+ 0% Duty"],
        ["Fire & Building Safety License", "Bangladesh Fire Service & Civil Defence", "FSCD-SAV-11942", "Compliant (A-Grade)"],
        ["Environmental Clearance (ECC)", "Department of Environment (DoE)", "DOE-DH-ORANGE-49", "Valid (Eco-Effluent Pass)"]
    ]
    t_accred = Table(accred_data, colWidths=[150, 140, 110, 120])
    t_accred.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story2.append(t_accred)
    doc2.build(story2)

if __name__ == "__main__":
    generate_icons()
    generate_svg_logos()
    generate_og_image()
    generate_sample_products()
    generate_sample_pdfs()
    print("All visual assets and sample documents successfully generated!")
