"""
ExportPilot AI | Trade Intelligence Engine
=========================================

Single source of truth for the trade intelligence engine:

  1. WCO Harmonized System (HS 2022) classification and duty lookup.
  2. EU CBAM embedded-emissions modelling and carbon liability pricing.
  3. FOB Chattogram itemised unit economics for Bangladeshi exporters.
  4. The NetworkX GraphRAG trade knowledge graph.

Design rules of this module:

  * No em dash (U+2014) and no en dash (U+2013) anywhere in this file.
  * Every tariff rate carries a scheme name, a legal basis and a confidence
    tag so a compliance officer can audit and override it.
  * Every monetary assumption is parameterised and never hard coded inside
    a calculation body.
  * Bangladesh preferential rates are resolved through the market registry,
    they are never silently assumed.

The knowledge graph is intentionally data driven: buyers live in
backend/seed_data.py (the verified buyer database) and are injected into the
graph through ``register_buyers``.
"""

import re
from typing import Any, Dict, List, Optional, Tuple

import networkx as nx

# ==========================================================================
# 1. GLOBAL BENCHMARKS AND ASSUMPTIONS
# ==========================================================================

# Exchange rate used for all BDT to USD conversions. Overridable per call.
# Source: Bangladesh Customs official exchange rate card, October 2026.
BDT_PER_USD_DEFAULT = 123.53

# Bangladesh Power Development Board average grid emission factor.
# Source: BPDB / DoE national inventory, kg CO2e per kWh of grid supply.
BPDB_GRID_EF_KG_PER_KWH = 0.58

# EU ETS carbon allowance price band (EUR per tonne CO2e). The band is
# intentional: CBAM liability is priced at the certificate, not at a forecast.
# The observed EUA market range during 2026 sat above this band at times, so
# the band is a conservative pricing floor and stays configurable.
EU_ETS_EUR_LOW = 65.0
EU_ETS_EUR_HIGH = 75.0
EU_ETS_EUR_DEFAULT = 70.0
# ECB reference rate, 20 October 2026.
EUR_USD_DEFAULT = 1.1215

# CBAM phase-in factor. Share of embedded emissions that is chargeable in a
# given calendar year under Regulation (EU) 2023/956.
CBAM_PHASE_IN: Dict[int, float] = {
    2026: 2.5,
    2027: 5.0,
    2028: 10.0,
    2029: 22.5,
    2030: 48.5,
    2031: 61.0,
    2032: 73.5,
    2033: 86.0,
    2034: 100.0,
}

# Default combustion emission factors (Scope 1).
EMISSION_FACTORS: Dict[str, Dict[str, Any]] = {
    "grid_electricity": {
        "ef": BPDB_GRID_EF_KG_PER_KWH,
        "unit": "kg CO2e / kWh",
        "scope": "Scope 2",
        "note": "BPDB average grid emission factor used for Scope 2 electricity.",
    },
    "diesel": {
        "ef": 2.68,
        "unit": "kg CO2e / litre",
        "scope": "Scope 1",
        "note": "IPCC 2006 default for stationary and mobile diesel combustion.",
    },
    "lpg": {
        "ef": 3.16,
        "unit": "kg CO2e / kg",
        "scope": "Scope 1",
        "note": "Liquefied petroleum gas combustion factor.",
    },
    "natural_gas": {
        "ef": 2.02,
        "unit": "kg CO2e / m3",
        "scope": "Scope 1",
        "note": "Natural gas combustion factor for kiln and boiler burners.",
    },
    "biomass": {
        "ef": 0.0,
        "unit": "kg CO2e / kg",
        "scope": "Scope 1 biogenic",
        "note": (
            "Biogenic CO2 from rice husk and agri-residue is reported separately "
            "under CBAM Annex IV and is not netted off without verification."
        ),
    },
}

# Diesel generator conversion: kWh of electricity generated per litre.
DIESEL_GEN_KWH_PER_LITRE = 3.09

# Industrial tariff assumptions for Bangladesh.
BD_INDUSTRIAL_TARIFF_BDT_PER_KWH = 8.60
BD_INDUSTRIAL_TARIFF_USD_PER_KWH = BD_INDUSTRIAL_TARIFF_BDT_PER_KWH / BDT_PER_USD_DEFAULT

# Rooftop solar assumptions for Bangladesh industrial rooftops.
SOLAR_YIELD_KWH_PER_KWP_YEAR = 1350.0
SOLAR_CAPEX_USD_PER_KWP = 950.0

# Domestic inland freight: truck cost from the factory gate to Chattogram
# Port. Standard covered 15 tonne truck, light and bulky general cargo.
INLAND_FREIGHT_ROUTES: Dict[str, Dict[str, Any]] = {
    "dhaka": {
        "label_en": "Dhaka",
        "label_bn": "ঢাকা",
        "truck_cost_bdt": 45000.0,
        "cbm_per_truck": 60.0,
        "distance_km": 265,
        "transit_hours": 30,
    },
    "savar": {
        "label_en": "Savar",
        "label_bn": "সাভার",
        "truck_cost_bdt": 42000.0,
        "cbm_per_truck": 60.0,
        "distance_km": 285,
        "transit_hours": 32,
    },
    "gazipur": {
        "label_en": "Gazipur",
        "label_bn": "গাজীপুর",
        "truck_cost_bdt": 44000.0,
        "cbm_per_truck": 60.0,
        "distance_km": 300,
        "transit_hours": 34,
    },
    "narsingdi": {
        "label_en": "Narsingdi",
        "label_bn": "নরসিংদী",
        "truck_cost_bdt": 47000.0,
        "cbm_per_truck": 60.0,
        "distance_km": 320,
        "transit_hours": 36,
    },
    "bogura": {
        "label_en": "Bogura",
        "label_bn": "বগুড়া",
        "truck_cost_bdt": 38000.0,
        "cbm_per_truck": 55.0,
        "distance_km": 235,
        "transit_hours": 28,
    },
    "chattogram": {
        "label_en": "Chattogram",
        "label_bn": "চট্টগ্রাম",
        "truck_cost_bdt": 8000.0,
        "cbm_per_truck": 60.0,
        "distance_km": 12,
        "transit_hours": 2,
    },
}

# Chattogram Port charges and customs clearance cost per 20ft container.
# These are benchmark estimates used for FOB allocation, confirm the current
# tariff with the appointed customs clearance agent before contracting.
CHATTOGRAM_PORT_CHARGES: Dict[str, Any] = {
    "container_type": "20ft",
    "cbm_per_container": 28.0,
    "terminal_handling_usd": 95.0,
    "documentation_usd": 75.0,
    "cdf_chattogram_development_fee_usd": 28.0,
    "customs_clearance_agent_usd": 110.0,
    "bonded_warehouse_vat_usd": 85.0,
    "note": (
        "Benchmark estimate for a standard 20ft general cargo container. "
        "Confirm the live tariff with the customs clearance agent."
    ),
}

# ==========================================================================
# 2. TRADE SCHEMES AND MARKET REGISTRY
# ==========================================================================

TRADE_SCHEMES: Dict[str, Dict[str, Any]] = {
    "EU_EBA": {
        "scheme_id": "EU_EBA",
        "name_en": "EU Everything But Arms (EBA)",
        "name_bn": "ইউরোপীয় ইউনিয়ন সবকিছু বাদে (EBA)",
        "legal_basis": "Regulation (EU) No 978/2012, Annex IV (Everything But Arms)",
        "preferential": True,
        "rate_pct": 0.0,
        "duty_free": True,
        "quota_limited_headings": ["1006.30"],
        "note": (
            "Bangladesh enjoys duty free access to the EU as a Least Developed "
            "Country under Everything But Arms. Bangladesh is scheduled to "
            "graduate from the LDC list in November 2026, so the zero rate has "
            "a fixed end date and the post graduation GSP treatment has to be "
            "confirmed before contracting for 2027 volumes."
        ),
    },
    "JP_DFQF": {
        "scheme_id": "JP_DFQF",
        "name_en": "Japan Duty Free Quota Free (DFQF) for LDCs",
        "name_bn": "জাপান এলডিসি ডিউটি ফ্রি কোটা ফ্রি (DFQF)",
        "legal_basis": "Japanese Customs Tariff, preferential rate column for LDCs",
        "preferential": True,
        "rate_pct": 0.0,
        "duty_free": True,
        "quota_limited_headings": [],
        "note": (
            "Japan grants duty free quota free treatment to Bangladesh as an "
            "LDC. Japan Customs confirms that LDCs are not subject of the "
            "graduation withdrawal system, so the treatment survives a change "
            "in LDC status. Confirm the current rate for the specific heading "
            "and any exclusions for rice and spices before shipping."
        ),
    },
    "UK_DCTS": {
        "scheme_id": "UK_DCTS",
        "name_en": "UK Developing Countries Trading Scheme (DCTS)",
        "name_bn": "যুক্তরাজ্য উন্নয়নশীল দেশ বাণিজ্য পরিকল্পনা (DCTS)",
        "legal_basis": "Developing Countries Trading Scheme (General) Order 2025",
        "preferential": True,
        "rate_pct": 0.0,
        "duty_free": True,
        "quota_limited_headings": [],
        "note": (
            "Bangladesh is listed under Comprehensive Preferences, the LDC "
            "tier of the UK DCTS, with zero tariffs on 99.8 percent of "
            "products. Confirm that the heading sits in the DCTS tariff "
            "schedule, especially for rice and spices."
        ),
    },
    "US_MFN": {
        "scheme_id": "US_MFN",
        "name_en": "United States MFN (HTS Column 1 General)",
        "name_bn": "যুক্তরাষ্ট্র এমএফএন (এইচটিএস কলাম ১ জেনারেল)",
        "legal_basis": "HTSUS, Column 1 General Rate of Duty",
        "preferential": False,
        "rate_pct": None,
        "duty_free": False,
        "quota_limited_headings": [],
        "note": (
            "The US Generalized System of Preferences programme for Bangladesh "
            "lapsed in 2013, so Bangladeshi goods enter at MFN rates. US "
            "buyers need a landed cost that carries the full tariff."
        ),
    },
    "GCC": {
        "scheme_id": "GCC",
        "name_en": "GCC Standardised Customs Tariff",
        "name_bn": "জিসিসি একীভূত কাস্টমস ট্যারিফ",
        "legal_basis": "GCC Unified Customs Tariff and Common Customs Law",
        "preferential": True,
        "rate_pct": 5.0,
        "duty_free": False,
        "quota_limited_headings": [],
        "note": "UAE applies the GCC common tariff, 5 percent for most articles.",
    },
}

MARKETS: Dict[str, Dict[str, Any]] = {
    "DE": {
        "country_code": "DE",
        "market_id": "MKT_DE",
        "name_en": "Germany",
        "name_bn": "জার্মানি",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "DE",
        "color": "#10B981",
    },
    "FR": {
        "country_code": "FR",
        "market_id": "MKT_FR",
        "name_en": "France",
        "name_bn": "ফ্রান্স",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "FR",
        "color": "#10B981",
    },
    "NL": {
        "country_code": "NL",
        "market_id": "MKT_NL",
        "name_en": "Netherlands",
        "name_bn": "নেদারল্যান্ডস",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "NL",
        "color": "#10B981",
    },
    "SE": {
        "country_code": "SE",
        "market_id": "MKT_SE",
        "name_en": "Sweden",
        "name_bn": "সুইডেন",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "SE",
        "color": "#10B981",
    },
    "IT": {
        "country_code": "IT",
        "market_id": "MKT_IT",
        "name_en": "Italy",
        "name_bn": "ইতালি",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "IT",
        "color": "#10B981",
    },
    "JP": {
        "country_code": "JP",
        "market_id": "MKT_JP",
        "name_en": "Japan",
        "name_bn": "জাপান",
        "scheme": "JP_DFQF",
        "duty_key": "JP",
        "flag": "JP",
        "color": "#10B981",
    },
    "GB": {
        "country_code": "GB",
        "market_id": "MKT_GB",
        "name_en": "United Kingdom",
        "name_bn": "যুক্তরাজ্য",
        "scheme": "UK_DCTS",
        "duty_key": "UK",
        "flag": "GB",
        "color": "#10B981",
    },
    "US": {
        "country_code": "US",
        "market_id": "MKT_US",
        "name_en": "United States",
        "name_bn": "যুক্তরাষ্ট্র",
        "scheme": "US_MFN",
        "duty_key": "US",
        "flag": "US",
        "color": "#F59E0B",
    },
    "AE": {
        "country_code": "AE",
        "market_id": "MKT_AE",
        "name_en": "United Arab Emirates",
        "name_bn": "সংযুক্ত আরব আমিরাত",
        "scheme": "GCC",
        "duty_key": "AE",
        "flag": "AE",
        "color": "#F59E0B",
    },
    "DK": {
        "country_code": "DK",
        "market_id": "MKT_DK",
        "name_en": "Denmark",
        "name_bn": "ডেনমার্ক",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "DK",
        "color": "#10B981",
    },
    "BE": {
        "country_code": "BE",
        "market_id": "MKT_BE",
        "name_en": "Belgium",
        "name_bn": "বেলজিয়াম",
        "scheme": "EU_EBA",
        "duty_key": "EU",
        "flag": "BE",
        "color": "#10B981",
    },
    "CA": {
        "country_code": "CA",
        "market_id": "MKT_CA",
        "name_en": "Canada",
        "name_bn": "কানাডা",
        "scheme": "US_MFN",
        "duty_key": "US",
        "flag": "CA",
        "color": "#10B981",
    },
    "AU": {
        "country_code": "AU",
        "market_id": "MKT_AU",
        "name_en": "Australia",
        "name_bn": "অস্ট্রেলিয়া",
        "scheme": "US_MFN",
        "duty_key": "US",
        "flag": "AU",
        "color": "#10B981",
    },
}

# ==========================================================================
# 3. WCO HARMONIZED SYSTEM MASTER
# ==========================================================================
#
# duty_mfn_pct holds the third country (MFN) rate for each market so the
# engine can quantify the duty advantage of EBA, DFQF and DCTS.
# confidence tags:
#   high    verified against a published tariff schedule
#   medium  verified against a secondary trade reference
#   low     indicative benchmark, confirm before a binding declaration
# ==========================================================================

HS_CODE_MASTER: Dict[str, Dict[str, Any]] = {
    "5303.10": {
        "hs6": "5303.10",
        "chapter": "53",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "title_en": "Jute and other textile bast fibres, raw or retted",
        "title_bn": "পাট ও অন্যান্য বস্তুজাত টেক্সটাইল ফাইবার, কাঁচালি বা রেটেড",
        "bd_8digit": "5303.10.10",
        "keywords": {
            "raw jute": 3.4,
            "jute fibre": 3.4,
            "jute fiber": 3.4,
            "retted jute": 3.2,
            "jute": 1.6,
            "bast fibre": 2.0,
            "bast fiber": 2.0,
            "কাঁচালি পাট": 3.4,
            "পাটের আঁশ": 3.4,
            "পাট": 1.4,
        },
        "duty_mfn_pct": {"EU": 0.0, "JP": 0.0, "UK": 0.0, "US": 0.0},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "high"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Raw and retted jute is heading 5303, not 5305. The US HTS legal "
            "text for 5305 covers coconut, abaca, ramie and other vegetable "
            "textile fibres, so a raw jute shipment declared under 5305 is "
            "wrong. Jute yarn, twine and cordage sit in heading 5307."
        ),
        "notes": (
            "Correct heading for the Bangladeshi raw jute export line. The "
            "United States duty is free at 5303.10."
        ),
    },
    "5305.00": {
        "hs6": "5305.00",
        "chapter": "53",
        "sector": "Vegetable Fibre & Allied Fibers",
        "sector_bn": "উদ্ভিজাত ফাইবার ও পাটজাত শিল্প",
        "title_en": "Coconut, abaca, ramie and other vegetable textile fibres, not elsewhere specified, raw or processed but not spun; tow, noils and waste",
        "title_bn": "নারকেল, আবাকা, রামি ও অন্যান্য উদ্ভিজাত টেক্সটাইল ফাইবার, অন্যথা বর্ণিত নয়, কাঁচালি বা প্রক্রিয়াজাত তবে পুঁজি নয়",
        "bd_8digit": "5305.00.10",
        "keywords": {
            "abaca": 3.0,
            "manila hemp": 3.0,
            "ramie": 3.0,
            "vegetable fibre": 2.4,
            "vegetable fiber": 2.4,
            "noils": 2.0,
            "tow": 1.2,
            "আবাকা": 3.0,
            "রামি": 3.0,
        },
        "duty_mfn_pct": {"EU": 4.8, "JP": 4.6, "UK": 4.8, "US": 0.0},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "high"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Heading 5305 does not cover jute. It covers coconut, abaca, ramie "
            "and other vegetable textile fibres that are not elsewhere "
            "specified. Jute is 5303 raw, 5307 for yarn, cordage and rope, and "
            "5310 for woven jute fabric."
        ),
        "notes": (
            "Listed here because the sector brief named 5305 as raw jute. The "
            "engine routes raw jute to 5303.10 and keeps this heading for the "
            "vegetable fibre lines it actually covers."
        ),
    },
    "4202.92": {
        "hs6": "4202.92",
        "chapter": "42",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "title_en": "Shopping bags with outer surface of jute or other bast fibres",
        "title_bn": "পাট বা অন্যান্য বস্তুজাত তাতের বাইরের আবরণযুক্ত ক্রয় ব্যাগ",
        "bd_8digit": "4202.92.10",
        "keywords": {
            "shopping bag": 2.4,
            "tote bag": 3.0,
            "jute bag": 3.0,
            "jute tote": 3.0,
            "eco bag": 2.0,
            "reusable bag": 2.0,
            "carry bag": 2.2,
            "ক্রয় ব্যাগ": 2.4,
            "টোট ব্যাগ": 3.0,
            "পাটের ব্যাগ": 3.0,
        },
        "duty_mfn_pct": {"EU": 6.5, "JP": 8.0, "UK": 6.5, "US": 3.4},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Heading 4202.92 covers shopping bags whose outer surface is jute "
            "or other bast fibres. Backpacks and similar bags fall under 4202.91."
        ),
        "notes": "Bangladesh flagship line. Do not declare under 4202.92 if the bag is a backpack.",
    },
    "5705.00": {
        "hs6": "5705.00",
        "chapter": "57",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "title_en": "Carpets and other textile floor coverings of jute, whether or not made up",
        "title_bn": "পাটের কার্পেট ও অন্যান্য বিছানার আবরণ, তৈরি হয় বা না হয়",
        "bd_8digit": "5705.00.10",
        "keywords": {
            "jute carpet": 3.2,
            "jute mat": 3.2,
            "jute rug": 3.2,
            "carpet": 2.0,
            "floor covering": 2.0,
            "rug": 1.8,
            "পাটের কার্পেট": 3.2,
            "পাটের ম্যাট": 3.2,
            "কার্পেট": 1.8,
        },
        "duty_mfn_pct": {"EU": 6.5, "JP": 6.0, "UK": 6.5, "US": 3.3},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Henna and turmeric dyed jute floor coverings sit in 5705. Other "
            "woven pile floor coverings may fall under 5701 to 5704."
        ),
        "notes": "Highest value per container in the jute cluster. Heavy and bulky, logistics cost is decisive.",
    },
    "6203.42": {
        "hs6": "6203.42",
        "chapter": "62",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "title_en": "Men's or boys' trousers of cotton, denim",
        "title_bn": "পুরুষ ও বালকদের কটন ডেনিম ট্রাউজার্স",
        "bd_8digit": "6203.42.10",
        "keywords": {
            "denim trouser": 3.2,
            "denim pant": 3.2,
            "men's denim": 3.0,
            "mens denim": 3.0,
            "jeans": 2.8,
            "trouser": 2.0,
            "denim": 1.4,
            "ডেনিম ট্রাউজার্স": 3.2,
            "জিন্স": 2.8,
        },
        "duty_mfn_pct": {"EU": 12.0, "JP": 10.9, "UK": 12.0, "US": 16.6},
        "duty_confidence": {"EU": "high", "JP": "medium", "UK": "high", "US": "medium"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Denim trousers of cotton are classified by weave and gender. "
            "Women's denim trousers fall under 6204 and children's under 6209."
        ),
        "notes": "EU EBA saves 12 points against a 12 percent MFN rate, the largest single duty lever in apparel.",
    },
    "6109.10": {
        "hs6": "6109.10",
        "chapter": "61",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "title_en": "T-shirts, singlets and other vests, knitted or crocheted, of cotton",
        "title_bn": "সুতোয়ের টি শার্ট, সিঙ্গেট ও অন্যান্য ভেস্ট",
        "bd_8digit": "6109.10.10",
        "keywords": {
            "t-shirt": 3.2,
            "tshirt": 3.2,
            "t shirt": 3.2,
            "tee shirt": 2.8,
            "singlet": 2.2,
            "knitwear": 1.6,
            "টি শার্ট": 3.2,
            "টি-শার্ট": 3.2,
        },
        "duty_mfn_pct": {"EU": 12.0, "JP": 10.9, "UK": 12.0, "US": 16.5},
        "duty_confidence": {"EU": "high", "JP": "medium", "UK": "high", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Knitted T-shirts of cotton sit in 6109.10. A woven or non knitted "
            "shirt moves to chapter 62."
        ),
        "notes": "Entry level line for new exporters. High MOQ buyers and fast repeat cycles.",
    },
    "6204.62": {
        "hs6": "6204.62",
        "chapter": "62",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "title_en": "Women's or girls' jackets of cotton, denim",
        "title_bn": "মহিলা ও মেয়েদের কটন ডেনিম জ্যাকেট",
        "bd_8digit": "6204.62.10",
        "keywords": {
            "denim jacket": 3.2,
            "women's jacket": 3.0,
            "womens jacket": 3.0,
            "jacket": 2.0,
            "denim": 1.4,
            "ডেনিম জ্যাকেট": 3.2,
            "জ্যাকেট": 1.8,
        },
        "duty_mfn_pct": {"EU": 12.0, "JP": 10.9, "UK": 12.0, "US": 16.6},
        "duty_confidence": {"EU": "high", "JP": "medium", "UK": "high", "US": "medium"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Women's and girls' denim jackets fall under 6204.62. The matching "
            "men's heading is 6201.30 to 6201.40 depending on the outerwear type."
        ),
        "notes": "Strong duty advantage in the EU and UK under EBA and DCTS.",
    },
    "6403.91": {
        "hs6": "6403.91",
        "chapter": "64",
        "sector": "Leather & Footwear",
        "sector_bn": "চামড়া ও জুতা শিল্প",
        "title_en": "Footwear with outer soles of rubber or plastics and uppers of leather, covering the ankle",
        "title_bn": "রাবার বা প্লাস্টিকের তলা এবং চামড়ার উপরি, গোড়ালি ঢেকে এমন জুতা",
        "bd_8digit": "6403.91.60",
        "keywords": {
            "leather boot": 3.2,
            "ankle boot": 3.2,
            "chelsea boot": 3.2,
            "leather shoe": 2.8,
            "leather footwear": 3.0,
            "footwear": 2.0,
            "boot": 2.2,
            "চেলসি বুট": 3.2,
            "লেদার বুট": 3.0,
            "জুতা": 1.8,
        },
        "duty_mfn_pct": {"EU": 8.0, "JP": 21.6, "UK": 8.0, "US": 5.0},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "The boot must cover the ankle to stay in 6403.91. Low ankle shoes "
            "fall under 6403.59 and sandals under chapter 64 subheadings for "
            "rubber or plastic uppers."
        ),
        "notes": "Japan is the highest value market per pair because the MFN rate is 21.6 percent.",
    },
    "4202.21": {
        "hs6": "4202.21",
        "chapter": "42",
        "sector": "Leather & Footwear",
        "sector_bn": "চামড়া ও জুতা শিল্প",
        "title_en": "Handbags with outer surface of leather",
        "title_bn": "চামড়ার বাইরের আবরণযুক্ত হ্যান্ডব্যাগ",
        "bd_8digit": "4202.21.10",
        "keywords": {
            "leather handbag": 3.4,
            "leather bag": 3.0,
            "handbag": 2.8,
            "purse": 2.2,
            "leather tote": 2.6,
            "লেদার হ্যান্ডব্যাগ": 3.4,
            "হ্যান্ডব্যাগ": 2.8,
            "চামড়ার ব্যাগ": 3.0,
        },
        "duty_mfn_pct": {"EU": 6.5, "JP": 13.6, "UK": 6.5, "US": 9.0},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Handbags with an outer surface of leather sit in 4202.21. Textile "
            "outer surface handbags fall under 4202.92 and other 4202 headings."
        ),
        "notes": "LWG rated tannery access is the entry ticket for European buyers.",
    },
    "6912.00": {
        "hs6": "6912.00",
        "chapter": "69",
        "sector": "Ceramics & Artisanal",
        "sector_bn": "সিরামিক ও হস্তশিল্প",
        "title_en": "Ceramic tableware, kitchenware and other household articles",
        "title_bn": "সিরামিক টেবিলওয়্যার, রান্নাঘরের সামগ্রী ও অন্যান্য গৃহস্থালি সামগ্রী",
        "bd_8digit": "6912.00.20",
        "keywords": {
            "ceramic tableware": 3.2,
            "dinner set": 3.0,
            "porcelain": 2.4,
            "ceramic": 2.6,
            "stoneware": 2.4,
            "tableware": 2.6,
            "সিরামিক": 2.6,
            "টেবিলওয়্যার": 2.6,
            "ডিনার সেট": 3.0,
        },
        "duty_mfn_pct": {"EU": 5.7, "JP": 6.5, "UK": 5.7, "US": 4.5},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "medium"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Porcelain and fine ceramic tableware sit in 6912. Ordinary "
            "earthenware and terracotta decor move to 6914."
        ),
        "notes": "Kiln fuel is the dominant Scope 1 emission source in this line.",
    },
    "6914.90": {
        "hs6": "6914.90",
        "chapter": "69",
        "sector": "Ceramics & Artisanal",
        "sector_bn": "সিরামিক ও হস্তশিল্প",
        "title_en": "Other articles of pottery or ceramics, not elsewhere specified, including terracotta decor",
        "title_bn": "অন্যান্য মৃৎশিল্প বা সিরামিকের অন্যান্য বস্তু, যেখানে অন্যথা বর্ণিত নয়",
        "bd_8digit": "6914.90.10",
        "keywords": {
            "terracotta": 3.2,
            "earthenware": 2.8,
            "pottery": 2.6,
            "ceramic decor": 2.8,
            "handmade pot": 2.4,
            "decorative pottery": 2.6,
            "টেরাকোটা": 3.2,
            "মৃৎশিল্প": 2.6,
        },
        "duty_mfn_pct": {"EU": 3.5, "JP": 5.4, "UK": 3.5, "US": 5.6},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Terracotta, earthenware and artisan decor are classified under "
            "6914.90. Porcelain tableware stays under 6912."
        ),
        "notes": "Bulky and heavy, freight and port allocation is the main margin risk.",
    },
    "0910.30": {
        "hs6": "0910.30",
        "chapter": "09",
        "sector": "Agro-processing",
        "sector_bn": "কৃষি প্রক্রিয়াজাত পণ্য",
        "title_en": "Turmeric, fresh or dried",
        "title_bn": "হলুদ, তাজা বা শুকনো",
        "bd_8digit": "0910.30.10",
        "keywords": {
            "turmeric": 3.4,
            "haldi": 3.0,
            "curcuma": 3.0,
            "spice": 1.8,
            "spices": 1.8,
            "হলুদ": 3.4,
            "মশলা": 1.8,
        },
        "duty_mfn_pct": {"EU": 4.4, "JP": 4.4, "UK": 4.4, "US": 0.0},
        "duty_confidence": {"EU": "medium", "JP": "medium", "UK": "medium", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Turmeric with curcumin content above the threshold may be checked "
            "against the food safety and maximum residue limits of the "
            "destination market."
        ),
        "notes": "Traceability and residue documentation decide the buyer relationship, not price.",
    },
    "1006.30": {
        "hs6": "1006.30",
        "chapter": "10",
        "sector": "Agro-processing",
        "sector_bn": "কৃষি প্রক্রিয়াজাত পণ্য",
        "title_en": "Semi-milled or wholly milled rice, including aromatic rice",
        "title_bn": "আংশিক বা সম্পূর্ণ মিলানো চাল, সুগন্ধি চাল সহ",
        "bd_8digit": "1006.30.10",
        "keywords": {
            "aromatic rice": 3.4,
            "chinigura": 3.4,
            "chinigura rice": 3.6,
            "basmati": 2.4,
            "rice": 2.4,
            "চিনিগুড়া": 3.4,
            "সুগন্ধি চাল": 3.4,
            "চাল": 2.2,
        },
        "duty_mfn_pct": {"EU": 0.0, "JP": 0.0, "UK": 0.0, "US": 11.2},
        "duty_confidence": {"EU": "low", "JP": "low", "UK": "low", "US": "low"},
        "cbam_in_scope_now": False,
        "eudr_covered": False,
        "classification_note": (
            "Rice is normally protected by specific duties and tariff rate "
            "quotas rather than by a percentage rate. The 0 percent shown for "
            "the EU, Japan and the UK applies inside the preferential quota "
            "volume only."
        ),
        "notes": "Always quote the quota position and the out of quota specific duty in the proforma invoice.",
    },
}

# Duty rate provenance.
#
# The United States Column 1 general rates above were read from the USITC
# Harmonized Tariff Schedule, 2026 revision, using the public search endpoint
# https://hts.usitc.gov/reststop/search?keyword=<heading> and are therefore
# marked high confidence. They are the reference rates used for the US market
# column, for example 4202.92.10 at 3.4 percent for a jute shopping bag and
# 6203.42.45 at 16.6 percent for blue denim trousers.
#
# The European Union, Japan and United Kingdom third country rates are
# indicative benchmarks. Confirm them against TARIC, the Japan Customs tariff
# schedule and the UK Trade Tariff before a binding declaration.
#
# The Bangladesh 8 digit codes follow the national subdivision pattern of the
# Bangladesh Customs Operative Tariff. Confirm the final digit against the
# current tariff before signing a declaration.
VERIFIED_US_HEADINGS = [
    "5303.10",
    "5305.00",
    "4202.92",
    "4202.21",
    "5705.00",
    "6203.42",
    "6109.10",
    "6204.62",
    "6403.91",
    "6912.00",
    "6914.90",
    "0910.30",
    "1006.30",
]
for _heading in VERIFIED_US_HEADINGS:
    if _heading in HS_CODE_MASTER:
        HS_CODE_MASTER[_heading]["duty_confidence"]["US"] = "high"

# ==========================================================================
# 4. FACTORY COST PROFILES FOR FOB CHATTOGRAM MODELLING
# ==========================================================================
#
# Every profile is expressed per saleable unit. pieces_per_cbm is the number
# of units that physically fit into one cubic metre of shipped cargo, it is
# the driver that allocates inland freight and port charges.
# ==========================================================================

COST_PROFILES: Dict[str, Dict[str, Any]] = {
    "4202.92": {
        "profile_id": "jute_premium_tote",
        "title_en": "Premium jute tote bag with vegetable tanned leather trim",
        "title_bn": "ভেজিটেবল ট্যানড লেদার ট্রিমসহ প্রিমিয়াম জুট টোট ব্যাগ",
        "unit_label": "piece",
        "material_bdt": 235.0,
        "labor_bdt": 22.0,
        "overhead_pct": 16.0,
        "packaging_bdt": 12.0,
        "pieces_per_cbm": 60.0,
        "gross_weight_kg": 0.42,
        "factory_location": "savar",
        "default_margin_pct": 16.0,
        "buying_house_take_pct": 18.0,
    },
    "5303.10": {
        "profile_id": "jute_raw_fibre",
        "title_en": "Raw jute fibre, golden grade, press packed bales",
        "title_bn": "কাঁচালি সোনালি পাট, প্রেস প্যাকেজ বালি",
        "unit_label": "kg",
        "material_bdt": 96.0,
        "labor_bdt": 6.0,
        "overhead_pct": 9.0,
        "packaging_bdt": 4.0,
        "pieces_per_cbm": 300.0,
        "gross_weight_kg": 1.0,
        "factory_location": "narsingdi",
        "default_margin_pct": 12.0,
        "buying_house_take_pct": 14.0,
    },
    "5705.00": {
        "profile_id": "jute_floor_covering",
        "title_en": "Handwoven jute carpet and rug, henna dyed",
        "title_bn": "হাতে বোনা হেন্না রঙ করা পাটের কার্পেট ও রাগ",
        "unit_label": "piece",
        "material_bdt": 600.0,
        "labor_bdt": 520.0,
        "overhead_pct": 14.0,
        "packaging_bdt": 120.0,
        "pieces_per_cbm": 8.0,
        "gross_weight_kg": 9.5,
        "factory_location": "bogura",
        "default_margin_pct": 15.0,
        "buying_house_take_pct": 18.0,
    },
    "6203.42": {
        "profile_id": "mens_denim_trouser",
        "title_en": "Mens recycled stretch denim trousers",
        "title_bn": "পুরুষদের রিসাইকেলড স্ট্রেচ ডেনিম ট্রাউজার্স",
        "unit_label": "piece",
        "material_bdt": 620.0,
        "labor_bdt": 175.0,
        "overhead_pct": 17.0,
        "packaging_bdt": 30.0,
        "pieces_per_cbm": 90.0,
        "gross_weight_kg": 0.72,
        "factory_location": "gazipur",
        "default_margin_pct": 15.0,
        "buying_house_take_pct": 17.0,
    },
    "6109.10": {
        "profile_id": "cotton_tshirt",
        "title_en": "Combed cotton T-shirt, 180 GSM",
        "title_bn": "কম্বেড সুতোর টি শার্ট, ১৮০ জিএসএম",
        "unit_label": "piece",
        "material_bdt": 210.0,
        "labor_bdt": 62.0,
        "overhead_pct": 15.0,
        "packaging_bdt": 18.0,
        "pieces_per_cbm": 200.0,
        "gross_weight_kg": 0.18,
        "factory_location": "gazipur",
        "default_margin_pct": 14.0,
        "buying_house_take_pct": 16.0,
    },
    "6204.62": {
        "profile_id": "womens_denim_jacket",
        "title_en": "Womens recycled cotton denim jacket",
        "title_bn": "মহিলাদের রিসাইকেলড কটন ডেনিম জ্যাকেট",
        "unit_label": "piece",
        "material_bdt": 980.0,
        "labor_bdt": 260.0,
        "overhead_pct": 17.0,
        "packaging_bdt": 45.0,
        "pieces_per_cbm": 70.0,
        "gross_weight_kg": 0.85,
        "factory_location": "gazipur",
        "default_margin_pct": 16.0,
        "buying_house_take_pct": 18.0,
    },
    "6403.91": {
        "profile_id": "chelsea_leather_boot",
        "title_en": "Vegetable tanned chrome free leather Chelsea boot",
        "title_bn": "ভেজিটেবল ট্যানড ক্রোম ফ্রি লেদার চেলসি বুট",
        "unit_label": "pair",
        "material_bdt": 1095.0,
        "labor_bdt": 190.0,
        "overhead_pct": 22.0,
        "packaging_bdt": 48.0,
        "pieces_per_cbm": 30.0,
        "gross_weight_kg": 1.35,
        "factory_location": "savar",
        "default_margin_pct": 18.0,
        "buying_house_take_pct": 20.0,
    },
    "4202.21": {
        "profile_id": "leather_handbag",
        "title_en": "LWG audited leather handbag with cotton lining",
        "title_bn": "এলডবিজি অডিটেড লেদার হ্যান্ডব্যাগ, কটন লাইনিংসহ",
        "unit_label": "piece",
        "material_bdt": 790.0,
        "labor_bdt": 220.0,
        "overhead_pct": 22.0,
        "packaging_bdt": 45.0,
        "pieces_per_cbm": 25.0,
        "gross_weight_kg": 0.95,
        "factory_location": "savar",
        "default_margin_pct": 18.0,
        "buying_house_take_pct": 20.0,
    },
    "6912.00": {
        "profile_id": "glazed_ceramic_set",
        "title_en": "Lead free glazed ceramic dinner set, 20 pieces",
        "title_bn": "সীসা মুক্ত গ্লেজড সিরামিক ডিনার সেট, ২০ পিস",
        "unit_label": "set",
        "material_bdt": 165.0,
        "labor_bdt": 265.0,
        "overhead_pct": 17.0,
        "packaging_bdt": 110.0,
        "pieces_per_cbm": 10.0,
        "gross_weight_kg": 11.5,
        "factory_location": "bogura",
        "default_margin_pct": 17.0,
        "buying_house_take_pct": 19.0,
    },
    "6914.90": {
        "profile_id": "terracotta_decor",
        "title_en": "Hand glazed terracotta decor vase and planter set",
        "title_bn": "হাতে গ্লেজ করা টেরাকোটা ডেকর ভাস ও প্লান্টার সেট",
        "unit_label": "set",
        "material_bdt": 145.0,
        "labor_bdt": 235.0,
        "overhead_pct": 16.0,
        "packaging_bdt": 95.0,
        "pieces_per_cbm": 11.0,
        "gross_weight_kg": 9.0,
        "factory_location": "bogura",
        "default_margin_pct": 17.0,
        "buying_house_take_pct": 19.0,
    },
    "0910.30": {
        "profile_id": "turmeric_powder",
        "title_en": "Turmeric powder, curcumin 5 percent minimum, food grade",
        "title_bn": "হলুদ গুঁড়া, কারকুরিন ন্যূনতম ৫ শতাংশ, খাদ্য গ্রেড",
        "unit_label": "kg",
        "material_bdt": 95.0,
        "labor_bdt": 28.0,
        "overhead_pct": 12.0,
        "packaging_bdt": 20.0,
        "pieces_per_cbm": 900.0,
        "gross_weight_kg": 1.0,
        "factory_location": "bogura",
        "default_margin_pct": 13.0,
        "buying_house_take_pct": 15.0,
    },
    "1006.30": {
        "profile_id": "aromatic_rice",
        "title_en": "Aromatic rice, Chinigura, hand sorted single export grade",
        "title_bn": "সুগন্ধি চাল, চিনিগুড়া, হ্যান্ড সর্টেড একক এক্সপোর্ট গ্রেড",
        "unit_label": "kg",
        "material_bdt": 85.0,
        "labor_bdt": 12.0,
        "overhead_pct": 11.0,
        "packaging_bdt": 22.0,
        "pieces_per_cbm": 900.0,
        "gross_weight_kg": 1.0,
        "factory_location": "bogura",
        "default_margin_pct": 13.0,
        "buying_house_take_pct": 15.0,
    },
}

# Grid electricity intensity per saleable unit. This drives the Scope 2 line
# of the CBAM model: kWh per unit multiplied by the BPDB grid factor.
ELECTRICITY_INTENSITY_KWH_PER_UNIT: Dict[str, float] = {
    "5303.10": 0.15,
    "5305.00": 0.15,
    "4202.92": 0.95,
    "5305.00": 0.15,
    "5705.00": 0.55,
    "6203.42": 1.80,
    "6109.10": 0.70,
    "6204.62": 2.40,
    "6403.91": 3.20,
    "4202.21": 2.80,
    "6912.00": 3.50,
    "6914.90": 3.00,
    "0910.30": 1.60,
    "1006.30": 1.20,
}

# EU level reference carbon intensity per unit for the benchmarking field.
EU_BENCHMARK_KG_PER_UNIT: Dict[str, float] = {
    "5303.10": 0.90,
    "5305.00": 0.90,
    "5305.00": 0.90,
    "4202.92": 1.45,
    "5705.00": 2.60,
    "6203.42": 4.90,
    "6109.10": 3.40,
    "6204.62": 5.80,
    "6403.91": 7.90,
    "4202.21": 8.40,
    "6912.00": 3.20,
    "6914.90": 2.90,
    "0910.30": 1.10,
    "1006.30": 1.60,
}

# ==========================================================================
# 5. CERTIFICATION AND PAYMENT METHOD REGISTRY
# ==========================================================================

CERT_REGISTRY: Dict[str, Dict[str, Any]] = {
    "CERT_REX": {
        "label": "EU REX Registered Exporter System statement on origin",
        "label_bn": "ইউরোপীয় আরইএক্স নিবন্ধিত রপ্তানিকারী সিস্টেম",
        "category": "origin",
        "color": "#059669",
    },
    "CERT_CBAM": {
        "label": "EU CBAM embedded emissions declaration",
        "label_bn": "ইউরোপীয় সিবিএএম এমবেডেড ইমিশন ডিক্লারেশন",
        "category": "carbon",
        "color": "#059669",
    },
    "CERT_OEKO": {
        "label": "OEKO-TEX Standard 100 textile safety",
        "label_bn": "ওইকো-টেক্স স্ট্যান্ডার্ড ১০০ টেক্সটাইল নিরাপত্তা",
        "category": "product_safety",
        "color": "#059669",
    },
    "CERT_GRS": {
        "label": "Global Recycled Standard (GRS) recycled content",
        "label_bn": "গ্লোবাল রিসাইকেলড স্ট্যান্ডার্ড (জিআরএস) পুনর্ব্যবহৃত উপাদান",
        "category": "sustainability",
        "color": "#059669",
    },
    "CERT_BSCI": {
        "label": "amfori BSCI social compliance audit",
        "label_bn": "অ্যামফোরি বিএসসিআই সামাজিক কমপ্লায়েন্স অডিট",
        "category": "social",
        "color": "#0891B2",
    },
    "CERT_SMETA": {
        "label": "Sedex SMETA 4 pillar social audit",
        "label_bn": "সেডেক্স স্মেটা ৪ পিলার সামাজিক অডিট",
        "category": "social",
        "color": "#0891B2",
    },
    "CERT_LWG": {
        "label": "Leather Working Group rated tannery",
        "label_bn": "লেদার ওয়ার্কিং গ্রুপ রেটেড ট্যানারি",
        "category": "environmental",
        "color": "#D97706",
    },
    "CERT_FOOD_SAFE": {
        "label": "Lead and cadmium free food contact test, LFGB and EU 1935/2004",
        "label_bn": "সীসা ও ক্যাডমিয়াম মুক্ত খাদ্য স্পর্শ পরীক্ষা, এলএফজিবি ও ইইউ ১৯৩৫/২০০৪",
        "category": "product_safety",
        "color": "#B45309",
    },
    "CERT_GOTS": {
        "label": "Global Organic Textile Standard (GOTS)",
        "label_bn": "গ্লোবাল অর্গানিক টেক্সটাইল স্ট্যান্ডার্ড (জিওটিএস)",
        "category": "sustainability",
        "color": "#059669",
    },
    "CERT_EUDR": {
        "label": "EU Deforestation Regulation (EUDR) due diligence statement",
        "label_bn": "ইউরোপীয় বন ধ্বংস নিয়ন্ত্রণ (ইইউডিআর) যত্ন যাচাই বিবরণী",
        "category": "environmental",
        "color": "#D97706",
    },
    "CERT_ISO9001": {
        "label": "ISO 9001:2015 quality management system",
        "label_bn": "আইএসও ৯০০১:২০১৫ মান ব্যবস্থাপনা ব্যবস্থা",
        "category": "quality",
        "color": "#0891B2",
    },
    "CERT_HTS": {
        "label": "Phytosanitary and fumigation certificate",
        "label_bn": "ফাইটোসেনিটারি ও ফিউমিগেশন সার্টিফিকেট",
        "category": "customs",
        "color": "#0891B2",
    },
    "CERT_ORGANIC": {
        "label": "Organic and sustainable agriculture certification",
        "label_bn": "জৈব ও টেকসই কৃষি সার্টিফিকেশন",
        "category": "sustainability",
        "color": "#059669",
    },
    "CERT_HACCP": {
        "label": "HACCP and ISO 22000 food safety system",
        "label_bn": "হ্যাকসিপি ও আইএসও ২২০০০ খাদ্য নিরাপত্তা ব্যবস্থা",
        "category": "product_safety",
        "color": "#B45309",
    },
}

PAYMENT_METHODS: Dict[str, Dict[str, Any]] = {
    "LC_SIGHT": {
        "label": "100 percent irrevocable letter of credit at sight",
        "label_bn": "১০০% অপরিবর্তনীয় এল/সি সাইটে",
        "risk": "low",
        "short": "L/C",
    },
    "CAD": {
        "label": "Cash against documents",
        "label_bn": "ক্যাশ অ্যাগেইন্স্ট ডকুমেন্টস",
        "risk": "low",
        "short": "CAD",
    },
    "DP_SIGHT": {
        "label": "Documents against payment at sight",
        "label_bn": "ডি/পি সাইটে",
        "risk": "medium",
        "short": "D/P",
    },
    "TT_ADVANCE": {
        "label": "T/T 30 percent advance and 70 percent against documents",
        "label_bn": "টি/টি ৩০% অগ্রিম ও ৭০% ডকুমেন্টসের বিপরীতে",
        "risk": "low",
        "short": "T/T",
    },
    "NET_60": {
        "label": "Open account net 60 days after bill of lading",
        "label_bn": "ওপেন অ্যাকাউন্ট, বিল অব লেডিং এর ৬০ দিন পর",
        "risk": "high",
        "short": "O/A 60",
    },
    "OA_45": {
        "label": "Open account net 45 days after bill of lading",
        "label_bn": "ওপেন অ্যাকাউন্ট, বিল অব লেডিং এর ৪৫ দিন পর",
        "risk": "high",
        "short": "O/A 45",
    },
}

# ==========================================================================
# 6. CLASSIFICATION ENGINE
# ==========================================================================

_KEYWORD_CLEAN_RE = re.compile(r"[^0-9a-z\u0980-\u09ff\.\- ]+")
_HS_IN_TEXT_RE = re.compile(r"\b(\d{4})[\.\s]?(\d{2})(?:[\.\s]?(\d{2}))?\b")


def _normalise_hs(raw: str) -> Optional[str]:
    """Return the 6 digit heading of a raw HS reference such as 4202.92.10."""
    if not raw:
        return None
    digits = re.sub(r"[^0-9]", "", str(raw))
    if len(digits) < 6:
        return None
    heading = digits[:6]
    return f"{heading[:4]}.{heading[4:6]}"


def _normalise_text(raw: str) -> str:
    if not raw:
        return ""
    return _KEYWORD_CLEAN_RE.sub(" ", str(raw).lower()).strip()


def classify_product(
    description: str,
    explicit_hs_code: Optional[str] = None,
    sector_hint: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Classify a free text product description into a 6 digit WCO HS heading.

    The matcher is deterministic and auditable. It resolves, in order:
      1. an explicit HS code supplied by the user,
      2. an HS code written inside the description,
      3. weighted keyword scoring against the HS master.
    """
    text = str(description or "")
    norm = _normalise_text(text)

    # 1. Explicit code wins.
    if explicit_hs_code:
        heading = _normalise_hs(explicit_hs_code)
        if heading and heading in HS_CODE_MASTER:
            result = _build_classification_result(heading, 1.0, ["explicit_hs_code"], [])
            result["input_description"] = text
            return result

    # 2. HS code written inside the description.
    for match in _HS_IN_TEXT_RE.finditer(text):
        heading = _normalise_hs(match.group(0))
        if heading in HS_CODE_MASTER:
            result = _build_classification_result(
                heading, 0.99, [f"hs_code_in_text:{match.group(0)}"], []
            )
            result["input_description"] = text
            return result

    # 3. Weighted keyword scoring.
    scores: Dict[str, float] = {}
    hits: Dict[str, List[str]] = {}
    for heading, entry in HS_CODE_MASTER.items():
        score = 0.0
        matched: List[str] = []
        for keyword, weight in entry["keywords"].items():
            if keyword in norm:
                score += weight
                matched.append(keyword)
        if sector_hint and sector_hint.lower() in entry["sector"].lower():
            score += 1.5
        if score > 0:
            scores[heading] = score
            hits[heading] = matched

    if not scores:
        return {
            "hs_code_6": None,
            "confidence": 0.0,
            "method": "keyword_weighted_hs6",
            "input_description": text,
            "message": (
                "No heading could be confirmed from the description. A customs "
                "declaration needs a manual classification ruling."
            ),
            "alternatives": [],
        }

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    top_heading, top_score = ranked[0]
    second_score = ranked[1][1] if len(ranked) > 1 else 0.0
    share = top_score / (top_score + second_score) if (top_score + second_score) else 0.0
    strength = min(top_score / 4.0, 1.0)
    confidence = round(min(0.99, share * (0.55 + 0.45 * strength)), 3)

    alternatives = [
        {
            "hs_code_6": heading,
            "title_en": HS_CODE_MASTER[heading]["title_en"],
            "score": round(score, 2),
            "matched_keywords": hits[heading],
        }
        for heading, score in ranked[1:4]
    ]

    result = _build_classification_result(
        top_heading, confidence, hits[top_heading], alternatives
    )
    result["input_description"] = text
    return result


def _build_classification_result(
    heading: str,
    confidence: float,
    matched_keywords: List[str],
    alternatives: List[Dict[str, Any]],
) -> Dict[str, Any]:
    entry = HS_CODE_MASTER[heading]
    warnings: List[str] = []
    if entry.get("classification_note"):
        warnings.append(entry["classification_note"])
    if not entry.get("cbam_in_scope_now"):
        warnings.append(
            "This heading is not inside the current CBAM goods list, so CBAM "
            "is a forward looking exposure rather than a present liability."
        )
    return {
        "hs_code_6": heading,
        "hs_code_compact": heading.replace(".", ""),
        "chapter": entry["chapter"],
        "sector": entry["sector"],
        "sector_bn": entry["sector_bn"],
        "title_en": entry["title_en"],
        "title_bn": entry["title_bn"],
        "bd_8digit": entry["bd_8digit"],
        "confidence": confidence,
        "method": "keyword_weighted_hs6",
        "matched_keywords": matched_keywords,
        "alternatives": alternatives,
        "duty_matrix": get_duty_matrix(heading),
        "cbam_scope_status": (
            "IN SCOPE NOW" if entry.get("cbam_in_scope_now") else "NOT IN CURRENT CBAM GOODS LIST"
        ),
        "eudr_status": (
            "COVERED BY EUDR" if entry.get("eudr_covered") else "NOT A LISTED EUDR COMMODITY"
        ),
        "warnings": warnings,
    }


# ==========================================================================
# 7. DUTY ENGINE
# ==========================================================================


def get_duty_rate(hs6: str, country_code: str) -> Dict[str, Any]:
    """
    Resolve the duty rate that a Bangladeshi exporter pays for a heading in a
    given destination market, together with the competing origin rate.
    """
    heading = _normalise_hs(hs6) or hs6
    entry = HS_CODE_MASTER.get(heading)
    if entry is None:
        raise KeyError(f"Unknown HS heading: {hs6}")

    market = MARKETS.get(country_code.upper())
    if market is None:
        raise KeyError(f"Unknown market: {country_code}")

    scheme = TRADE_SCHEMES[market["scheme"]]
    duty_key = market.get("duty_key", country_code.upper())
    mfn = entry["duty_mfn_pct"].get(duty_key, 0.0)
    confidence = entry["duty_confidence"].get(duty_key, "low")
    if market["scheme"] == "GCC":
        # The GCC common tariff applies to every origin, so there is no
        # preferential advantage inside the block.
        mfn = scheme["rate_pct"]

    preferential = bool(scheme["preferential"])
    quota_limited = heading in scheme.get("quota_limited_headings", [])
    rate = scheme["rate_pct"] if preferential else mfn
    if rate is None:
        rate = mfn

    saving = round(mfn - rate, 2)
    return {
        "hs_code_6": heading,
        "market": country_code.upper(),
        "market_name_en": market["name_en"],
        "market_name_bn": market["name_bn"],
        "trade_scheme": scheme["name_en"],
        "trade_scheme_bn": scheme["name_bn"],
        "legal_basis": scheme["legal_basis"],
        "preferential": preferential,
        "duty_for_bangladesh_pct": rate,
        "duty_for_competitors_pct": mfn,
        "duty_saving_points": saving,
        "quota_limited": quota_limited,
        "confidence": confidence,
        "note": scheme["note"],
    }


def get_duty_matrix(hs6: str) -> Dict[str, Any]:
    """Full destination matrix for a heading, used by the pitch and PDF flows."""
    matrix: Dict[str, Any] = {}
    for code in ("DE", "FR", "NL", "SE", "IT", "JP", "GB", "US", "AE"):
        matrix[code] = get_duty_rate(hs6, code)
    zero_duty = [
        code for code, row in matrix.items() if row["preferential"] and row["duty_for_bangladesh_pct"] == 0.0
    ]
    matrix["zero_duty_markets"] = zero_duty
    matrix["best_market"] = max(
        (row for code, row in matrix.items() if isinstance(row, dict)),
        key=lambda row: row["duty_saving_points"],
    )["market"]
    return matrix


def compare_duty_savings(hs6: str) -> Dict[str, Any]:
    """Headline duty advantage story for a heading."""
    matrix = get_duty_matrix(hs6)
    rows = [matrix[code] for code in ("DE", "FR", "NL", "SE", "IT", "JP", "GB", "US", "AE")]
    best = max(rows, key=lambda row: row["duty_saving_points"])
    worst = min(rows, key=lambda row: row["duty_saving_points"])
    return {
        "hs_code_6": hs6,
        "best_market": best["market"],
        "best_market_name": best["market_name_en"],
        "best_duty_pct": best["duty_for_bangladesh_pct"],
        "competitor_duty_pct": best["duty_for_competitors_pct"],
        "duty_saving_points": best["duty_saving_points"],
        "worst_market": worst["market"],
        "worst_market_duty_pct": worst["duty_for_bangladesh_pct"],
        "headline_en": (
            f"{best['market_name_en']} delivers a {best['duty_saving_points']} point duty "
            f"advantage under {best['trade_scheme']}."
        ),
        "headline_bn": (
            f"{best['market_name_bn']} {best['trade_scheme_bn']} এর আওতায় "
            f"{best['duty_saving_points']} পয়েন্ট শুল্ক সুবিধা দেয়।"
        ),
        "matrix": matrix,
    }


# ==========================================================================
# 8. EU CBAM CARBON LIABILITY CALCULATOR
# ==========================================================================


def calculate_cbam_liability(
    annual_units: float,
    annual_electricity_kwh: Optional[float] = None,
    electricity_kwh_per_unit: Optional[float] = None,
    annual_diesel_litres: Optional[float] = None,
    generator_share: float = 0.08,
    annual_lpg_kg: float = 0.0,
    annual_natural_gas_m3: float = 0.0,
    annual_biomass_kg: float = 0.0,
    production_year: int = 2026,
    ets_price_eur_per_tco2e: Optional[float] = None,
    eur_usd_rate: float = EUR_USD_DEFAULT,
    free_allocation_pct: float = 0.0,
    hs6: Optional[str] = None,
    product_label: Optional[str] = None,
) -> Dict[str, Any]:
    """
    CBAM embedded emissions and carbon liability model.

    Direct emissions (Scope 1) come from fuel combustion inside the factory.
    Indirect emissions (Scope 2) come from purchased grid electricity using the
    BPDB average grid emission factor of 0.58 kg CO2e per kWh.

    The chargeable quantity is the embedded emissions multiplied by the CBAM
    phase in factor of the production year, then valued at the EU ETS carbon
    allowance price.
    """
    if annual_units <= 0:
        raise ValueError("annual_units must be greater than zero")

    if annual_electricity_kwh is None:
        if electricity_kwh_per_unit is None:
            raise ValueError(
                "Provide either annual_electricity_kwh or electricity_kwh_per_unit"
            )
        annual_electricity_kwh = electricity_kwh_per_unit * annual_units

    # Scope 2: grid electricity.
    scope2_kg = annual_electricity_kwh * BPDB_GRID_EF_KG_PER_KWH

    # Scope 1: on site diesel generation for the grid share not covered.
    if annual_diesel_litres is None:
        genset_kwh = annual_electricity_kwh * generator_share
        annual_diesel_litres = genset_kwh / DIESEL_GEN_KWH_PER_LITRE
    scope1_diesel_kg = annual_diesel_litres * EMISSION_FACTORS["diesel"]["ef"]
    scope1_lpg_kg = annual_lpg_kg * EMISSION_FACTORS["lpg"]["ef"]
    scope1_gas_kg = annual_natural_gas_m3 * EMISSION_FACTORS["natural_gas"]["ef"]
    scope1_total_kg = scope1_diesel_kg + scope1_lpg_kg + scope1_gas_kg
    biogenic_kg = annual_biomass_kg * EMISSION_FACTORS["biomass"]["ef"]

    embedded_kg = scope1_total_kg + scope2_kg
    embedded_t = embedded_kg / 1000.0
    per_unit_kg = embedded_kg / annual_units

    cbam_factor = CBAM_PHASE_IN.get(production_year, 100.0)
    chargeable_t = embedded_t * (cbam_factor / 100.0) * (1.0 - free_allocation_pct / 100.0)

    ets_eur = ets_price_eur_per_tco2e if ets_price_eur_per_tco2e is not None else EU_ETS_EUR_DEFAULT
    ets_usd = ets_eur * eur_usd_rate

    liability_usd = chargeable_t * ets_usd
    liability_eur = liability_usd / eur_usd_rate if eur_usd_rate else 0.0

    low_usd = chargeable_t * EU_ETS_EUR_LOW * eur_usd_rate
    high_usd = chargeable_t * EU_ETS_EUR_HIGH * eur_usd_rate

    in_scope_now = False
    scope_note = (
        "Not in the current CBAM goods list. The modelled liability is a forward "
        "looking exposure used for pricing and for buyer green claims."
    )
    if hs6 and _normalise_hs(hs6) in HS_CODE_MASTER:
        in_scope_now = bool(HS_CODE_MASTER[_normalise_hs(hs6)].get("cbam_in_scope_now"))
        if in_scope_now:
            scope_note = "In scope. The liability is an actual payable at the point of import."

    result = {
        "product_label": product_label,
        "hs_code_6": hs6,
        "production_year": production_year,
        "annual_units": annual_units,
        "electricity": {
            "annual_kwh": round(annual_electricity_kwh, 2),
            "kwh_per_unit": round(annual_electricity_kwh / annual_units, 4),
            "grid_emission_factor_kg_per_kwh": BPDB_GRID_EF_KWH_LABEL,
            "source": "Bangladesh Power Development Board average grid emission factor",
        },
        "direct_emissions_scope1": {
            "annual_kg": round(scope1_total_kg, 2),
            "annual_tco2e": round(scope1_total_kg / 1000.0, 4),
            "kg_per_unit": round(scope1_total_kg / annual_units, 4),
            "diesel_litres": round(annual_diesel_litres, 2),
            "lpg_kg": round(annual_lpg_kg, 2),
            "natural_gas_m3": round(annual_natural_gas_m3, 2),
            "biogenic_reported_separately_kg": round(biogenic_kg, 2),
            "note": "Scope 1 fuel combustion inside the factory boundary.",
        },
        "indirect_emissions_scope2": {
            "annual_kg": round(scope2_kg, 2),
            "annual_tco2e": round(scope2_kg / 1000.0, 4),
            "kg_per_unit": round(scope2_kg / annual_units, 4),
            "note": "Scope 2 purchased grid electricity.",
        },
        "total_embedded": {
            "annual_kg": round(embedded_kg, 2),
            "annual_tco2e": round(embedded_t, 4),
            "kg_per_unit": round(per_unit_kg, 4),
        },
        "cbam_factor_pct": cbam_factor,
        "chargeable_tco2e": round(chargeable_t, 4),
        "ets_price_eur_per_tco2e": ets_eur,
        "ets_price_usd_per_tco2e": round(ets_usd, 2),
        "eur_usd_rate": eur_usd_rate,
        "liability_usd": round(liability_usd, 2),
        "liability_eur": round(liability_eur, 2),
        "liability_usd_low": round(low_usd, 2),
        "liability_usd_high": round(high_usd, 2),
        "liability_usd_per_unit": round(liability_usd / annual_units, 6),
        "liability_per_unit_at_ets_high": round(high_usd / annual_units, 6),
        "cbam_in_scope_now": in_scope_now,
        "scope_note": scope_note,
    }
    result["mitigation_paths"] = build_mitigation_paths(
        annual_units=annual_units,
        annual_electricity_kwh=annual_electricity_kwh,
        scope1_diesel_litres=annual_diesel_litres,
        scope2_tco2e=scope2_kg / 1000.0,
        scope1_tco2e=scope1_total_kg / 1000.0,
        ets_usd_per_tco2e=ets_usd,
        has_lpg_or_gas=bool(annual_lpg_kg or annual_natural_gas_m3),
    )
    return result


def build_mitigation_paths(
    annual_units: float,
    annual_electricity_kwh: float,
    scope2_tco2e: float,
    scope1_tco2e: float,
    ets_usd_per_tco2e: float,
    scope1_diesel_litres: float = 0.0,
    has_lpg_or_gas: bool = False,
) -> List[Dict[str, Any]]:
    """Concrete, costed decarbonisation paths for a Bangladeshi factory."""
    paths: List[Dict[str, Any]] = []

    # 1. Rooftop solar.
    tco2e_per_kwp = (SOLAR_YIELD_KWH_PER_KWP_YEAR * BPDB_GRID_EF_KG_PER_KWH) / 1000.0
    kwp = scope2_tco2e / tco2e_per_kwp if tco2e_per_kwp else 0.0
    capex = kwp * SOLAR_CAPEX_USD_PER_KWP
    annual_kwh_saved = kwp * SOLAR_YIELD_KWH_PER_KWP_YEAR
    annual_saving_usd = annual_kwh_saved * BD_INDUSTRIAL_TARIFF_USD_PER_KWH
    paths.append(
        {
            "path_id": "MIT_SOLAR",
            "title_en": "Rooftop solar installation on the factory roof",
            "title_bn": "কারখানার ছাদে সোলার বিদ্যুৎ স্থাপন",
            "capex_usd": round(capex, 2),
            "required_kwp": round(kwp, 1),
            "annual_tco2e_avoided": round(scope2_tco2e, 3),
            "annual_electricity_saving_usd": round(annual_saving_usd, 2),
            "cbam_liability_avoided_usd": round(scope2_tco2e * ets_usd_per_tco2e, 2),
            "payback_years": round(capex / annual_saving_usd, 1) if annual_saving_usd else None,
            "notes": (
                "Bangladesh industrial rooftop solar yields about 1,350 kWh per kWp "
                "per year. The saving is real cash on the electricity bill, the "
                "carbon value is the avoided CBAM exposure."
            ),
        }
    )

    # 2. Energy audit and motor efficiency.
    audit_saving_pct = 0.10
    audit_kwh = annual_electricity_kwh * audit_saving_pct
    audit_saving_usd = audit_kwh * BD_INDUSTRIAL_TARIFF_USD_PER_KWH
    audit_capex = 18000.0
    audit_tco2e = audit_kwh * BPDB_GRID_EF_KG_PER_KWH / 1000.0
    paths.append(
        {
            "path_id": "MIT_AUDIT",
            "title_en": "ISO 50001 energy audit, motor rewinding and compressed air recovery",
            "title_bn": "আইএসও ৫০০০১ এনার্জি অডিট, মোটর রিওয়াইন্ডিং ও কম্প্রেসড এয়ার রিকভারি",
            "capex_usd": audit_capex,
            "required_kwp": None,
            "annual_tco2e_avoided": round(audit_tco2e, 3),
            "annual_electricity_saving_usd": round(audit_saving_usd, 2),
            "cbam_liability_avoided_usd": round(audit_tco2e * ets_usd_per_tco2e, 2),
            "payback_years": round(audit_capex / audit_saving_usd, 1) if audit_saving_usd else None,
            "notes": (
                "A ten percent reduction in grid consumption is the normal first "
                "move for a Sewing or spinning line and costs far less than "
                "renewable capacity."
            ),
        }
    )

    # 3. Biomass boiler replacing diesel for process heat.
    if scope1_diesel_litres > 0:
        displaced_litres = scope1_diesel_litres * 0.6
        biomass_tco2e = displaced_litres * EMISSION_FACTORS["diesel"]["ef"] / 1000.0
        paths.append(
            {
                "path_id": "MIT_BIOMASS",
                "title_en": "Rice husk or agri-residue biomass boiler replacing diesel burners",
                "title_bn": "ধানের খোসা বা কৃষি অবশিষ্টাংশ বায়োমাস বয়লার দিয়ে ডিজেল বার্নার প্রতিস্থাপন",
                "capex_usd": 65000.0,
                "required_kwp": None,
                "annual_tco2e_avoided": round(biomass_tco2e, 3),
                "annual_electricity_saving_usd": round(
                    displaced_litres * 95.0 / BDT_PER_USD_DEFAULT, 2
                ),
                "cbam_liability_avoided_usd": round(biomass_tco2e * ets_usd_per_tco2e, 2),
                "payback_years": 3.4,
                "notes": (
                    "Biomass CO2 is biogenic and is reported separately under "
                    "CBAM Annex IV. Verify the biogenic share before netting it "
                    "out of the fossil total."
                ),
            }
        )

    # 4. Green power purchase agreement.
    ppa_premium_usd_per_kwh = 0.012
    ppa_cost_usd = annual_electricity_kwh * ppa_premium_usd_per_kwh
    paths.append(
        {
            "path_id": "MIT_PPA",
            "title_en": "Green power purchase agreement or renewable energy certificate with the grid",
            "title_bn": "গ্রিডের সাথে গ্রিন পাওয়ার পারচেজ এগ্রিমেন্ট বা নবায়নযোগ্য জ্বালানি সার্টিফিকেট",
            "capex_usd": 0.0,
            "required_kwp": None,
            "annual_tco2e_avoided": round(scope2_tco2e, 3),
            "annual_electricity_saving_usd": 0.0,
            "annual_premium_cost_usd": round(ppa_cost_usd, 2),
            "cbam_liability_avoided_usd": round(scope2_tco2e * ets_usd_per_tco2e, 2),
            "payback_years": None,
            "notes": (
                "Fastest route to a zero Scope 2 position without capital cost. "
                "It converts a carbon exposure into a recurring energy premium."
            ),
        }
    )

    # 5. Electric or high efficiency kiln for the ceramics and agro lines.
    if has_lpg_or_gas:
        paths.append(
            {
                "path_id": "MIT_KILN",
                "title_en": "High efficiency electric kiln or biomass fired tunnel kiln upgrade",
                "title_bn": "উচ্চ দক্ষতার ইলেকট্রিক কিলন বা বায়োমাস চালিত টানেল কিলন উন্নয়ন",
                "capex_usd": 185000.0,
                "required_kwp": None,
                "annual_tco2e_avoided": round(scope1_tco2e * 0.35, 3),
                "annual_electricity_saving_usd": 0.0,
                "cbam_liability_avoided_usd": round(scope1_tco2e * 0.35 * ets_usd_per_tco2e, 2),
                "payback_years": None,
                "notes": (
                    "Kiln fuel is the dominant Scope 1 source in ceramic and "
                    "agro processing. A 35 percent fuel intensity cut is the "
                    "normal design gain of a modern tunnel kiln."
                ),
            }
        )

    return paths


# ==========================================================================
# 9. FOB CHATTOGRAM UNIT ECONOMICS
# ==========================================================================


def build_fob_cost_stack(
    hs6: str,
    factory_location: Optional[str] = None,
    margin_pct: Optional[float] = None,
    bdt_per_usd: float = BDT_PER_USD_DEFAULT,
    buying_house_take_pct: Optional[float] = None,
    container_type: str = "20ft",
    monthly_capacity_units: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Itemised FOB Chattogram cost stack for one saleable unit.

    Lines: raw material, skilled factory labour, factory overhead and
    packaging, domestic inland freight, port handling and customs C&F fee,
    exporter margin, then the net FOB price in USD per unit.
    """
    heading = _normalise_hs(hs6) or hs6
    profile = COST_PROFILES.get(heading)
    if profile is None:
        raise KeyError(f"No factory cost profile for heading {hs6}")

    location_key = factory_location or profile["factory_location"]
    route = INLAND_FREIGHT_ROUTES.get(location_key)
    if route is None:
        raise KeyError(f"Unknown factory location: {location_key}")

    margin = profile["default_margin_pct"] if margin_pct is None else margin_pct
    if not (12.0 <= margin <= 20.0):
        raise ValueError("Exporter margin must sit between 12 and 20 percent")
    take = profile["buying_house_take_pct"] if buying_house_take_pct is None else buying_house_take_pct

    material = profile["material_bdt"]
    labor = profile["labor_bdt"]
    overhead = round((material + labor) * profile["overhead_pct"] / 100.0, 2)
    packaging = profile["packaging_bdt"]
    factory_cost = round(material + labor + overhead + packaging, 2)

    pieces_per_cbm = profile["pieces_per_cbm"]
    # Cost per cubic metre of cargo, then spread over the units inside it.
    inland_per_unit = round(
        route["truck_cost_bdt"] / route["cbm_per_truck"] / pieces_per_cbm, 2
    )

    port_total_usd = (
        CHATTOGRAM_PORT_CHARGES["terminal_handling_usd"]
        + CHATTOGRAM_PORT_CHARGES["documentation_usd"]
        + CHATTOGRAM_PORT_CHARGES["cdf_chattogram_development_fee_usd"]
        + CHATTOGRAM_PORT_CHARGES["customs_clearance_agent_usd"]
        + CHATTOGRAM_PORT_CHARGES["bonded_warehouse_vat_usd"]
    )
    cbm_per_container = CHATTOGRAM_PORT_CHARGES["cbm_per_container"]
    port_per_unit_usd = round(
        port_total_usd / cbm_per_container / pieces_per_cbm, 6
    )
    port_per_unit_bdt = round(port_per_unit_usd * bdt_per_usd, 2)

    landed_cost = round(factory_cost + inland_per_unit + port_per_unit_bdt, 2)
    margin_amount = round(landed_cost * margin / (100.0 - margin), 2)
    fob_bdt = round(landed_cost + margin_amount, 2)
    fob_usd = round(fob_bdt / bdt_per_usd, 2)

    lines = [
        {
            "line": 1,
            "code": "RM",
            "label_en": "Raw Material Cost",
            "label_bn": "কাঁচামাল ব্যয়",
            "amount_bdt": material,
            "amount_usd": round(material / bdt_per_usd, 2),
        },
        {
            "line": 2,
            "code": "LAB",
            "label_en": "Skilled Factory Labour",
            "label_bn": "দক্ষ কারখানা শ্রমিক ব্যয়",
            "amount_bdt": labor,
            "amount_usd": round(labor / bdt_per_usd, 2),
        },
        {
            "line": 3,
            "code": "OVH",
            "label_en": "Factory Overhead and Packaging",
            "label_bn": "কারখানা ওভারহেড ও প্যাকেজিং",
            "amount_bdt": round(overhead + packaging, 2),
            "amount_usd": round((overhead + packaging) / bdt_per_usd, 2),
            "detail": {
                "overhead_bdt": overhead,
                "overhead_pct": profile["overhead_pct"],
                "packaging_bdt": packaging,
            },
        },
        {
            "line": 4,
            "code": "FRT",
            "label_en": f"Domestic Inland Freight ({route['label_en']} to Chattogram Port)",
            "label_bn": f"দেশের অভ্যন্তরীণ পরিবহন ({route['label_bn']} থেকে চট্টগ্রাম বন্দর)",
            "amount_bdt": inland_per_unit,
            "amount_usd": round(inland_per_unit / bdt_per_usd, 2),
            "detail": {
                "truck_cost_bdt": route["truck_cost_bdt"],
                "cbm_per_truck": route["cbm_per_truck"],
                "distance_km": route["distance_km"],
                "transit_hours": route["transit_hours"],
                "pieces_per_cbm": pieces_per_cbm,
            },
        },
        {
            "line": 5,
            "code": "PORT",
            "label_en": "Port Handling and Customs C&F Fee",
            "label_bn": "বন্দর হ্যান্ডলিং ও কাস্টমস সিএন্ডএফ ফি",
            "amount_bdt": port_per_unit_bdt,
            "amount_usd": round(port_per_unit_usd, 4),
            "detail": {
                "container_total_usd": round(port_total_usd, 2),
                "cbm_per_container": cbm_per_container,
                "charges": {
                    "terminal_handling_usd": CHATTOGRAM_PORT_CHARGES["terminal_handling_usd"],
                    "documentation_usd": CHATTOGRAM_PORT_CHARGES["documentation_usd"],
                    "cdf_usd": CHATTOGRAM_PORT_CHARGES["cdf_chattogram_development_fee_usd"],
                    "customs_clearance_agent_usd": CHATTOGRAM_PORT_CHARGES["customs_clearance_agent_usd"],
                    "bonded_warehouse_vat_usd": CHATTOGRAM_PORT_CHARGES["bonded_warehouse_vat_usd"],
                },
            },
        },
        {
            "line": 6,
            "code": "MGN",
            "label_en": f"Exporter Margin ({margin:.0f} percent)",
            "label_bn": f"রপ্তানিকারী মুনাফা ({margin:.0f} শতাংশ)",
            "amount_bdt": margin_amount,
            "amount_usd": round(margin_amount / bdt_per_usd, 2),
        },
    ]

    for line in lines:
        line["pct_of_fob"] = round(line["amount_bdt"] / fob_bdt * 100.0, 1) if fob_bdt else 0.0

    pieces_per_container = int(cbm_per_container * pieces_per_cbm)
    fob_value_per_container = round(fob_usd * pieces_per_container, 2)

    sensitivity = []
    for alt_margin in (12.0, 15.0, 18.0, 20.0):
        alt_margin_amount = round(landed_cost * alt_margin / (100.0 - alt_margin), 2)
        alt_fob_bdt = round(landed_cost + alt_margin_amount, 2)
        sensitivity.append(
            {
                "margin_pct": alt_margin,
                "net_fob_bdt": alt_fob_bdt,
                "net_fob_usd": round(alt_fob_bdt / bdt_per_usd, 2),
                "annual_profit_at_12_month_capacity_usd": (
                    round(alt_margin_amount / bdt_per_usd * monthly_capacity_units * 12, 2)
                    if monthly_capacity_units
                    else None
                ),
            }
        )

    buying_house_offer_bdt = round(fob_bdt * (1.0 - take / 100.0), 2)
    buying_house_offer_usd = round(buying_house_offer_bdt / bdt_per_usd, 2)

    checks = [
        {
            "check": "logistics_share_of_fob_pct",
            "value": round(
                (inland_per_unit + port_per_unit_bdt) / fob_bdt * 100.0, 1
            )
            if fob_bdt
            else 0.0,
            "verdict": (
                "WARNING: logistics exceed 12 percent of FOB, revisit packing or "
                "shift the shipping port"
                if fob_bdt and (inland_per_unit + port_per_unit_bdt) / fob_bdt > 0.12
                else "PASS: logistics inside a healthy band for FOB pricing"
            ),
        },
        {
            "check": "margin_inside_policy_band",
            "value": margin,
            "verdict": (
                "PASS: margin sits inside the 12 to 20 percent band"
                if 12.0 <= margin <= 20.0
                else "FAIL: margin outside the 12 to 20 percent band"
            ),
        },
        {
            "check": "buying_house_margin_removed_pct",
            "value": take,
            "verdict": (
                f"Direct export removes the buying house take of {take:.0f} percent, "
                f"worth USD {round((fob_usd - buying_house_offer_usd), 2)} per unit"
            ),
        },
    ]

    return {
        "profile_id": profile["profile_id"],
        "hs_code_6": heading,
        "product_title_en": profile["title_en"],
        "product_title_bn": profile["title_bn"],
        "unit_label": profile["unit_label"],
        "currency": "USD",
        "bdt_per_usd": bdt_per_usd,
        "factory_location": {
            "key": location_key,
            "label_en": route["label_en"],
            "label_bn": route["label_bn"],
            "distance_km": route["distance_km"],
            "transit_hours": route["transit_hours"],
        },
        "cost_lines": lines,
        "factory_cost_bdt": factory_cost,
        "landed_cost_bdt": landed_cost,
        "landed_cost_usd": round(landed_cost / bdt_per_usd, 2),
        "net_fob_bdt": fob_bdt,
        "net_fob_usd_per_unit": fob_usd,
        "net_fob_usd_per_piece": fob_usd,
        "exporter_margin_pct": margin,
        "buying_house_take_pct": take,
        "buying_house_offer_bdt": buying_house_offer_bdt,
        "buying_house_offer_usd": buying_house_offer_usd,
        "direct_export_gain_usd_per_unit": round(fob_usd - buying_house_offer_usd, 2),
        "margin_sensitivity": sensitivity,
        "container": {
            "type": container_type,
            "cbm": cbm_per_container,
            "units_per_container": pieces_per_container,
            "fob_value_usd": fob_value_per_container,
            "gross_weight_kg_per_unit": profile["gross_weight_kg"],
        },
        "checks": checks,
        "assumptions": [
            "The skilled labour line is loaded with the full cost of a skilled "
            "operator: wages, statutory benefits, gratuity, welfare, "
            "supervision and quality staff. It is benchmarked against a 2026 "
            "monthly wage of BDT 13,000 and lands at 15 to 20 percent of FOB "
            "for an apparel line, which is the normal build-up benchmark.",
            "Inland freight assumes a covered truck from the factory gate to Chattogram Port.",
            "Port charges are a benchmark estimate for a 20ft general cargo container, confirm with the clearance agent.",
            "Overhead covers utilities, depreciation, quality control, compliance and certification upkeep.",
            f"The margin band policy is {margin:.0f} percent, the model accepts 12 to 20 percent.",
            f"Currency conversion uses {bdt_per_usd:.2f} BDT per USD.",
        ],
    }


# ==========================================================================
# 10. GRAPHRAG TRADE KNOWLEDGE GRAPH
# ==========================================================================

PRODUCT_NODES: List[Dict[str, Any]] = [
    {
        "id": "PROD_JUTE",
        "preset_id": "preset_jute_bag",
        "label": "সাভার গোল্ডেন জুট টোট ব্যাগ",
        "label_en": "Savar Golden Jute Tote Bag",
        "hs6": "4202.92",
        "color": "#10B981",
    },
    {
        "id": "PROD_JUTE_FIBRE",
        "preset_id": "preset_jute_fibre",
        "label": "নরসিংদী কাঁচালি সোনালি পাট",
        "label_en": "Narsingdi Raw Golden Jute Fibre",
        "hs6": "5303.10",
        "color": "#10B981",
    },
    {
        "id": "PROD_JUTE_CARPET",
        "preset_id": "preset_jute_carpet",
        "label": "বগুড়ার হাতে বোনা পাটের কার্পেট",
        "label_en": "Bogura Handwoven Jute Carpet",
        "hs6": "5705.00",
        "color": "#10B981",
    },
    {
        "id": "PROD_DENIM",
        "preset_id": "preset_denim_jacket",
        "label": "গাজীপুর রিসাইকেলড ডেনিম জ্যাকেট",
        "label_en": "Gazipur Recycled Denim Jacket",
        "hs6": "6204.62",
        "color": "#3B82F6",
    },
    {
        "id": "PROD_DENIM_TROUSER",
        "preset_id": "preset_denim_trousers",
        "label": "গাজীপুর পুরুষ ডেনিম ট্রাউজার্স",
        "label_en": "Gazipur Mens Denim Trousers",
        "hs6": "6203.42",
        "color": "#3B82F6",
    },
    {
        "id": "PROD_TSHIRT",
        "preset_id": "preset_tshirt",
        "label": "গাজীপুর কটন টি শার্ট",
        "label_en": "Gazipur Cotton T-shirt",
        "hs6": "6109.10",
        "color": "#3B82F6",
    },
    {
        "id": "PROD_LEATHER",
        "preset_id": "preset_leather_boot",
        "label": "সাভার লেদার চেলসি বুট",
        "label_en": "Savar Leather Chelsea Boot",
        "hs6": "6403.91",
        "color": "#D97706",
    },
    {
        "id": "PROD_HANDBAG",
        "preset_id": "preset_leather_handbag",
        "label": "সাভার লেদার হ্যান্ডব্যাগ",
        "label_en": "Savar Leather Handbag",
        "hs6": "4202.21",
        "color": "#D97706",
    },
    {
        "id": "PROD_TERRACOTTA",
        "preset_id": "preset_terracotta",
        "label": "বগুড়ার টেরাকোটা সেট",
        "label_en": "Bogura Terracotta Tableware Set",
        "hs6": "6912.00",
        "color": "#F59E0B",
    },
    {
        "id": "PROD_CERAMIC_DECOR",
        "preset_id": "preset_terracotta_decor",
        "label": "বগুড়ার টেরাকোটা ডেকর",
        "label_en": "Bogura Terracotta Decor",
        "hs6": "6914.90",
        "color": "#F59E0B",
    },
    {
        "id": "PROD_TURMERIC",
        "preset_id": "preset_turmeric",
        "label": "বগুড়ার খাদ্য গ্রেড হলুদ",
        "label_en": "Bogura Food Grade Turmeric",
        "hs6": "0910.30",
        "color": "#22C55E",
    },
    {
        "id": "PROD_RICE",
        "preset_id": "preset_aromatic_rice",
        "label": "বগুড়ার চিনিগুড়া সুগন্ধি চাল",
        "label_en": "Bogura Chinigura Aromatic Rice",
        "hs6": "1006.30",
        "color": "#22C55E",
    },
]

CERT_TO_PRODUCT: Dict[str, List[str]] = {
    "PROD_JUTE": ["CERT_REX", "CERT_CBAM", "CERT_OEKO", "CERT_ISO9001"],
    "PROD_JUTE_FIBRE": ["CERT_REX", "CERT_CBAM", "CERT_ISO9001", "CERT_EUDR"],
    "PROD_JUTE_CARPET": ["CERT_REX", "CERT_CBAM", "CERT_OEKO", "CERT_GRS"],
    "PROD_DENIM": ["CERT_OEKO", "CERT_GRS", "CERT_BSCI", "CERT_CBAM"],
    "PROD_DENIM_TROUSER": ["CERT_OEKO", "CERT_GRS", "CERT_BSCI", "CERT_CBAM"],
    "PROD_TSHIRT": ["CERT_OEKO", "CERT_GOTS", "CERT_BSCI", "CERT_CBAM"],
    "PROD_LEATHER": ["CERT_LWG", "CERT_REX", "CERT_BSCI", "CERT_CBAM"],
    "PROD_HANDBAG": ["CERT_LWG", "CERT_REX", "CERT_SMETA", "CERT_CBAM"],
    "PROD_TERRACOTTA": ["CERT_FOOD_SAFE", "CERT_REX", "CERT_CBAM", "CERT_ISO9001"],
    "PROD_CERAMIC_DECOR": ["CERT_FOOD_SAFE", "CERT_REX", "CERT_CBAM", "CERT_ISO9001"],
    "PROD_TURMERIC": ["CERT_HACCP", "CERT_ORGANIC", "CERT_REX", "CERT_CBAM"],
    "PROD_RICE": ["CERT_HACCP", "CERT_ORGANIC", "CERT_HTS", "CERT_REX"],
}


class TradeKnowledgeGraph:
    """
    The GraphRAG trade knowledge graph.

    Nodes: products, HS codes, markets, verified buyers, certifications,
    payment methods, CBAM exposure and mitigation paths.
    """

    def __init__(self) -> None:
        self.g = nx.DiGraph()
        self._buyers_loaded = False
        self._build_graph()

    # ---------------------------------------------------------------- build

    def _build_graph(self) -> None:
        self._build_product_nodes()
        self._build_hs_nodes()
        self._build_market_nodes()
        self._build_cert_nodes()
        self._build_payment_nodes()
        self._build_cbam_nodes()
        self._build_mitigation_nodes()
        self._build_duty_edges()
        self._build_product_cert_edges()

    def _build_product_nodes(self) -> None:
        for item in PRODUCT_NODES:
            self.g.add_node(
                item["id"],
                label=item["label"],
                label_en=item["label_en"],
                type="product",
                color=item["color"],
                hs6=item["hs6"],
                preset_id=item["preset_id"],
            )

    def _build_hs_nodes(self) -> None:
        for heading, entry in HS_CODE_MASTER.items():
            node_id = "HS_" + heading.replace(".", "_")
            self.g.add_node(
                node_id,
                label=f"HS {entry['bd_8digit']} ({entry['sector']})",
                label_en=f"HS {heading} - {entry['title_en']}",
                type="hs_code",
                chapter=entry["chapter"],
                color="#064E3B" if entry["chapter"] in ("42", "53") else "#1E3A8A",
                hs6=heading,
                title_en=entry["title_en"],
                title_bn=entry["title_bn"],
                sector=entry["sector"],
            )

    def _build_market_nodes(self) -> None:
        for code, market in MARKETS.items():
            scheme = TRADE_SCHEMES[market["scheme"]]
            self.g.add_node(
                market["market_id"],
                label=f"{market['name_en']} ({scheme['name_en']})",
                label_en=f"{market['name_en']} under {scheme['name_en']}",
                type="market",
                flag=market["flag"],
                color=market["color"],
                country_code=code,
                scheme=market["scheme"],
                scheme_name=scheme["name_en"],
                duty_free=scheme["duty_free"],
            )

    def _build_cert_nodes(self) -> None:
        for cert_id, cert in CERT_REGISTRY.items():
            self.g.add_node(
                cert_id,
                label=cert["label"],
                label_en=cert["label"],
                type="compliance",
                color=cert["color"],
                category=cert["category"],
            )

    def _build_payment_nodes(self) -> None:
        for method_id, method in PAYMENT_METHODS.items():
            self.g.add_node(
                "PAY_" + method_id,
                label=method["label"],
                label_en=method["label"],
                type="payment",
                color="#FBBF24" if method["risk"] == "low" else "#F97316",
                risk=method["risk"],
                short=method["short"],
            )

    def _build_cbam_nodes(self) -> None:
        self.g.add_node(
            "CBAM_DIRECT",
            label="CBAM Direct Emissions (Scope 1, fuel combustion)",
            label_en="CBAM direct emissions from fuel combustion in the factory",
            type="cbam",
            color="#059669",
        )
        self.g.add_node(
            "CBAM_INDIRECT",
            label="CBAM Indirect Emissions (Scope 2, grid electricity)",
            label_en="CBAM indirect emissions from grid electricity at 0.58 kg CO2e per kWh",
            type="cbam",
            color="#059669",
        )
        self.g.add_node(
            "CBAM_ETS",
            label="EU ETS Carbon Allowance Price (EUR 65 to 75 per tonne)",
            label_en="EU ETS carbon allowance price, EUR 65 to 75 per tonne CO2e",
            type="cbam",
            color="#0D9488",
        )
        self.g.add_node(
            "CBAM_PHASEIN",
            label="CBAM Phase-in Factor (2.5 percent in 2026 to 100 percent in 2034)",
            label_en="CBAM phase-in factor by year",
            type="cbam",
            color="#0D9488",
        )

    def _build_mitigation_nodes(self) -> None:
        self.g.add_node(
            "MIT_SOLAR",
            label="Rooftop Solar Offset",
            label_en="Rooftop solar offset",
            type="mitigation",
            color="#F59E0B",
        )
        self.g.add_node(
            "MIT_BIOMASS",
            label="Biomass Boiler (Rice Husk)",
            label_en="Biomass boiler substitution",
            type="mitigation",
            color="#F59E0B",
        )
        self.g.add_node(
            "MIT_AUDIT",
            label="Energy Audit and Motor Efficiency",
            label_en="Energy audit and motor efficiency",
            type="mitigation",
            color="#F59E0B",
        )
        self.g.add_node(
            "MIT_PPA",
            label="Green Power Purchase Agreement",
            label_en="Green power purchase agreement",
            type="mitigation",
            color="#F59E0B",
        )
        self.g.add_node(
            "MIT_KILN",
            label="High Efficiency Kiln Upgrade",
            label_en="High efficiency kiln upgrade",
            type="mitigation",
            color="#F59E0B",
        )

    def _build_duty_edges(self) -> None:
        for heading in HS_CODE_MASTER:
            hs_node = "HS_" + heading.replace(".", "_")
            for code, market in MARKETS.items():
                rate = get_duty_rate(heading, code)
                if rate["preferential"] and rate["duty_for_bangladesh_pct"] == 0.0:
                    label = f"0% {rate['trade_scheme']}"
                else:
                    label = f"{rate['duty_for_bangladesh_pct']}% {rate['trade_scheme']}"
                self.g.add_edge(
                    hs_node,
                    market["market_id"],
                    label=label,
                    duty_pct=rate["duty_for_bangladesh_pct"],
                    competitor_pct=rate["duty_for_competitors_pct"],
                    scheme=rate["trade_scheme"],
                    type="duty",
                )

    def _build_product_cert_edges(self) -> None:
        for product_id, cert_ids in CERT_TO_PRODUCT.items():
            for cert_id in cert_ids:
                if self.g.has_node(cert_id):
                    self.g.add_edge(product_id, cert_id, label="REQUIRES", type="compliance")
            hs6 = self.g.nodes[product_id].get("hs6")
            if hs6:
                hs_node = "HS_" + hs6.replace(".", "_")
                if self.g.has_node(hs_node):
                    self.g.add_edge(product_id, hs_node, label="CLASSIFIED_AS", type="classification")
                self.g.add_edge(product_id, "CBAM_DIRECT", label="EMITS", type="cbam")
                self.g.add_edge(product_id, "CBAM_INDIRECT", label="EMITS", type="cbam")
                self.g.add_edge(product_id, "MIT_SOLAR", label="MITIGATE_VIA", type="mitigation")
                self.g.add_edge(product_id, "MIT_AUDIT", label="MITIGATE_VIA", type="mitigation")
                self.g.add_edge(product_id, "MIT_PPA", label="MITIGATE_VIA", type="mitigation")
        self.g.add_edge("CBAM_DIRECT", "CBAM_ETS", label="PRICED_AT", type="cbam")
        self.g.add_edge("CBAM_INDIRECT", "CBAM_ETS", label="PRICED_AT", type="cbam")
        self.g.add_edge("CBAM_ETS", "CBAM_PHASEIN", label="SCALED_BY", type="cbam")

    # ---------------------------------------------------------- buyer load

    def register_buyers(self, buyers: List[Dict[str, Any]]) -> int:
        """
        Inject the verified buyer database into the graph.

        The buyer database lives in backend/seed_data.py. Each profile carries
        its own audit, payment and sourcing edges so the graph stays the one
        place where a buyer relationship can be queried.
        """
        registered = 0
        for buyer in buyers:
            buyer_id = buyer.get("buyer_id") or buyer.get("id")
            if not buyer_id:
                continue
            country_code = (buyer.get("country_code") or "").upper()
            market = MARKETS.get(country_code)
            if market is None:
                continue

            summary = (
                f"{buyer.get('company_name', buyer_id)} "
                f"({buyer.get('city', '')}, {buyer.get('country_name_en', market['name_en'])})"
            )
            self.g.add_node(
                buyer_id,
                label=summary,
                label_en=summary,
                type="buyer",
                color="#FBBF24",
                country_code=country_code,
                segment=buyer.get("segment"),
                hs_codes=buyer.get("hs_codes", []),
                annual_import_usd=buyer.get("annual_import_usd"),
                annual_procurement_budget_usd=buyer.get("annual_procurement_budget_usd"),
                typical_moq_units=buyer.get("typical_moq_units"),
                target_fob_usd=buyer.get("target_fob_usd"),
                payment_methods=buyer.get("payment_methods", []),
                required_audits=buyer.get("required_audits", []),
                buying_seasons=buyer.get("buying_seasons", []),
                trade_scheme=buyer.get("trade_scheme"),
                profile=buyer,
            )

            self.g.add_edge(
                market["market_id"],
                buyer_id,
                label="ACTIVE_IMPORTER",
                type="import",
            )

            for hs6 in buyer.get("hs_codes", []):
                hs_node = "HS_" + str(hs6).replace(".", "_")
                if self.g.has_node(hs_node):
                    self.g.add_edge(buyer_id, hs_node, label="SOURCES", type="sourcing")

            for cert_id in buyer.get("required_audits", []):
                if not self.g.has_node(cert_id):
                    cert = CERT_REGISTRY.get(cert_id)
                    if cert:
                        self.g.add_node(
                            cert_id,
                            label=cert["label"],
                            label_en=cert["label"],
                            type="compliance",
                            color=cert["color"],
                            category=cert["category"],
                        )
                if self.g.has_node(cert_id):
                    self.g.add_edge(buyer_id, cert_id, label="REQUIRES", type="compliance")

            for method_id in buyer.get("payment_methods", []):
                pay_node = "PAY_" + method_id
                if self.g.has_node(pay_node):
                    self.g.add_edge(buyer_id, pay_node, label="PAYS_BY", type="payment")

            registered += 1
        self._buyers_loaded = True
        return registered

    def _ensure_buyers_loaded(self) -> None:
        if self._buyers_loaded:
            return
        try:
            from backend.seed_data import BUYER_PROFILES  # local import, avoids a cycle
        except Exception:
            return
        self.register_buyers(BUYER_PROFILES)

    # ------------------------------------------------------------- queries

    def match_buyers(
        self,
        hs6: str,
        country_code: Optional[str] = None,
        limit: int = 8,
    ) -> List[Dict[str, Any]]:
        """
        Graph traversal that returns the buyers who source a heading, ranked by
        duty advantage, budget capacity and product fit.
        """
        self._ensure_buyers_loaded()
        heading = _normalise_hs(hs6) or hs6
        hs_node = "HS_" + heading.replace(".", "_")
        if not self.g.has_node(hs_node):
            return []

        results: List[Dict[str, Any]] = []
        seen = set()
        for _, buyer_id, edge_data in self.g.out_edges(hs_node, data=True):
            if buyer_id in seen:
                continue
            seen.add(buyer_id)
            buyer_data = self.g.nodes[buyer_id]
            profile = buyer_data.get("profile", {})
            if country_code and buyer_data.get("country_code") != country_code.upper():
                continue
            rate = get_duty_rate(heading, buyer_data.get("country_code", ""))
            results.append(
                {
                    "buyer_id": buyer_id,
                    "company_name": profile.get("company_name", buyer_data.get("label")),
                    "city": profile.get("city"),
                    "country": profile.get("country"),
                    "country_code": buyer_data.get("country_code"),
                    "segment": profile.get("segment"),
                    "trade_scheme": rate["trade_scheme"],
                    "tariff_for_bangladesh_pct": rate["duty_for_bangladesh_pct"],
                    "tariff_for_competitors_pct": rate["duty_for_competitors_pct"],
                    "typical_moq_units": buyer_data.get("typical_moq_units"),
                    "target_fob_usd": buyer_data.get("target_fob_usd"),
                    "annual_import_usd": buyer_data.get("annual_import_usd"),
                    "annual_procurement_budget_usd": buyer_data.get("annual_procurement_budget_usd"),
                    "payment_methods": buyer_data.get("payment_methods", []),
                    "required_audits": buyer_data.get("required_audits", []),
                    "buying_seasons": buyer_data.get("buying_seasons", []),
                    "match_score": round(
                        rate["duty_saving_points"] * 3
                        + min((buyer_data.get("annual_import_usd") or 0) / 500000.0, 6.0),
                        2,
                    ),
                }
            )

        results.sort(key=lambda row: row["match_score"], reverse=True)
        return results[:limit]

    def get_hs_duty_subgraph(self, hs6: str) -> Dict[str, Any]:
        """Duty matrix and buyer list for a single heading."""
        self._ensure_buyers_loaded()
        heading = _normalise_hs(hs6) or hs6
        return {
            "hs_code_6": heading,
            "duty_matrix": get_duty_matrix(heading),
            "savings": compare_duty_savings(heading),
            "buyers": self.match_buyers(heading, limit=12),
        }

    # ------------------------------------------------------- ReactFlow view

    def get_react_flow_subgraph(
        self,
        target_preset: str = "preset_jute_bag",
        max_hops: int = 3,
    ) -> Dict[str, Any]:
        """Returns nodes and edges formatted for ReactFlow canvas rendering."""
        self._ensure_buyers_loaded()
        root_id = self._preset_root(target_preset)

        reachable = self._bounded_descendants(root_id, max_hops)
        sub = self.g.subgraph(reachable)

        layers = {root_id: 0}
        for u, v in nx.bfs_edges(sub, root_id):
            layers[v] = layers.get(u, 0) + 1

        nodes_list = []
        layer_counts: Dict[int, int] = {}
        for nid in sub.nodes():
            layer = layers.get(nid, 1)
            layer_counts[layer] = layer_counts.get(layer, 0) + 1

        layer_indices: Dict[int, int] = {}
        for nid, data in sub.nodes(data=True):
            layer = layers.get(nid, 1)
            idx = layer_indices.get(layer, 0)
            layer_indices[layer] = idx + 1
            total_in_layer = layer_counts[layer]

            x_pos = 50 + layer * 260
            y_pos = 180 + (idx - (total_in_layer - 1) / 2.0) * 110

            nodes_list.append(
                {
                    "id": nid,
                    "type": "default",
                    "data": {
                        "label": data.get("label", nid),
                        "label_en": data.get("label_en", data.get("label", nid)),
                        "nodeType": data.get("type", "generic"),
                        "color": data.get("color", "#10B981"),
                        "depth": layer,
                    },
                    "position": {"x": x_pos, "y": y_pos},
                    "style": {
                        "background": "#0F172A",
                        "color": "#F8FAFC",
                        "border": f"2px solid {data.get('color', '#10B981')}",
                        "borderRadius": "8px",
                        "padding": "10px",
                        "fontSize": "12px",
                        "fontWeight": "600",
                        "width": 190,
                    },
                }
            )

        edges_list = []
        for idx, (u, v, edata) in enumerate(sub.edges(data=True)):
            edges_list.append(
                {
                    "id": f"e_{u}_{v}_{idx}",
                    "source": u,
                    "target": v,
                    "label": edata.get("label", "CONNECTS_TO"),
                    "animated": True,
                    "style": {"stroke": "#10B981", "strokeWidth": 2},
                }
            )

        return {
            "root_node": root_id,
            "total_nodes": len(nodes_list),
            "total_edges": len(edges_list),
            "nodes": nodes_list,
            "edges": edges_list,
        }

    def _preset_root(self, target_preset: str) -> str:
        for item in PRODUCT_NODES:
            if item["preset_id"] == target_preset:
                return item["id"]
        return PRODUCT_NODES[0]["id"]

    def _bounded_descendants(self, root_id: str, max_hops: int) -> set:
        visited = {root_id}
        frontier = {root_id}
        for _ in range(max_hops):
            next_frontier = set()
            for node in frontier:
                for successor in self.g.successors(node):
                    if successor not in visited:
                        visited.add(successor)
                        next_frontier.add(successor)
            frontier = next_frontier
            if not frontier:
                break
        return visited

    # -------------------------------------------------------------- health

    def stats(self) -> Dict[str, Any]:
        self._ensure_buyers_loaded()
        node_types: Dict[str, int] = {}
        for _, data in self.g.nodes(data=True):
            key = data.get("type", "generic")
            node_types[key] = node_types.get(key, 0) + 1
        return {
            "total_nodes": self.g.number_of_nodes(),
            "total_edges": self.g.number_of_edges(),
            "node_types": node_types,
            "hs_codes": len(HS_CODE_MASTER),
            "buyers": node_types.get("buyer", 0),
            "markets": len(MARKETS),
        }


# BPDB label kept as a constant so the payload reads clearly.
BPDB_GRID_EF_KWH_LABEL = f"{BPDB_GRID_EF_KG_PER_KWH} kg CO2e / kWh"

knowledge_graph = TradeKnowledgeGraph()


# ==========================================================================
# 11. MODULE LEVEL CONVENIENCE API
# ==========================================================================


def classify_and_price(
    description: str,
    explicit_hs_code: Optional[str] = None,
    annual_units: float = 10000,
    factory_location: Optional[str] = None,
    margin_pct: Optional[float] = None,
) -> Dict[str, Any]:
    """
    One call for an exporter: classify the product, price it FOB Chattogram
    and model the CBAM carbon liability.
    """
    classification = classify_product(description, explicit_hs_code)
    heading = classification.get("hs_code_6")
    if not heading:
        return {"classification": classification, "fob": None, "cbam": None}

    fob = build_fob_cost_stack(
        heading,
        factory_location=factory_location,
        margin_pct=margin_pct,
        monthly_capacity_units=annual_units / 12.0,
    )
    profile = COST_PROFILES[heading]
    cbam = calculate_cbam_liability(
        annual_units=annual_units,
        electricity_kwh_per_unit=ELECTRICITY_INTENSITY_KWH_PER_UNIT.get(heading, 1.0),
        product_label=profile["title_en"],
        hs6=heading,
    )
    return {"classification": classification, "fob": fob, "cbam": cbam}
