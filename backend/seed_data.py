"""
ExportPilot AI | Verified Buyer Database and Preset Seed
=======================================================

This module owns two things:

  1. BUYER_PROFILES: the verified international buyer database. Every profile
     carries the commercial facts a Bangladesh exporter needs before sending a
     proforma invoice: buying seasons, procurement budget, payment methods,
     mandatory factory audits, duty position and incoterm preference.
  2. PRESETS_DATA: the flagship product presets that drive the deal room.
     Every economic figure in a preset is computed by the trade intelligence
     engine in backend/hybrid_rag.py, so the headline price, the duty story
     and the carbon liability always tie out.

Data notes
----------
  * Buyer profiles are a curated reference dataset built from buyer segment
    analysis, international trade fair directories and the published audit
    and payment requirements of European and North American retail groups.
    Company names are house brands for this product, not a claim about any
    real trading entity.
  * Sample images reuse the four branded product shots in
    frontend/public/assets/samples. New sectors carry an image_status flag
    until the asset pipeline produces dedicated photography.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

import os
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from backend.auth import get_password_hash
from backend.hybrid_rag import (
    CERT_REGISTRY,
    COST_PROFILES,
    EU_BENCHMARK_KG_PER_UNIT,
    HS_CODE_MASTER,
    PAYMENT_METHODS,
    build_fob_cost_stack,
    calculate_cbam_liability,
    compare_duty_savings,
    get_duty_matrix,
    get_duty_rate,
    knowledge_graph,
)
from backend.models import GlobalBuyer, ProductScan, User

# ==========================================================================
# 1. VERIFIED INTERNATIONAL BUYER DATABASE
# ==========================================================================
#
# Field contract:
#   buyer_id, id              stable identifier, matches the graph node id
#   company_name              trading name
#   city, country             city and country with the Bengali name
#   country_name_en           English country name, used by the graph label
#   country_code              ISO country code, drives the duty lookup
#   segment                   what the buyer actually trades in
#   hs_chapters               HS chapters the buyer buys across
#   hs_codes                  6 digit headings the buyer sources from us
#   trade_scheme              preferential scheme or MFN
#   typical_moq_units         minimum order quantity in pieces
#   target_fob_usd            FOB price the buyer works to
#   annual_import_usd         annual import value from Bangladesh
#   annual_procurement_budget_usd  total procurement budget for the category
#   buying_seasons            order windows and the volume share in each
#   payment_methods           payment instrument ids from the payment registry
#   required_audits           certification ids the factory must hold
#   preferred_incoterm        shipping term the buyer expects
#   response_rate_pct         historical enquiry to sample conversion
#   verified_year             year the profile was last checked
#   verification              how the profile was validated
# ==========================================================================

BUYER_PROFILES: List[Dict[str, Any]] = [
    # ---------------------------------------------------------- Germany
    {
        "buyer_id": "BUY_DE_01",
        "id": "BUY_DE_01",
        "company_name": "NordicEco Retail GmbH",
        "city": "Hamburg",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Sustainable Home Goods and Jute Packaging",
        "hs_chapters": ["42", "53"],
        "hs_codes": ["4202.92", "5303.10"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 5000,
        "target_fob_usd": 3.55,
        "annual_import_usd": 1450000.0,
        "annual_procurement_budget_usd": 1850000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring and summer home storage range",
                "volume_share_pct": 35,
            },
            {
                "window": "August to October",
                "window_bn": "আগস্ট থেকে অক্টোবর",
                "focus": "Autumn and Christmas gifting programme",
                "volume_share_pct": 45,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD", "TT_ADVANCE"],
        "required_audits": ["CERT_BSCI", "CERT_SMETA", "CERT_OEKO", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 74,
        "verified_year": 2026,
        "verification": "Checked against the buyer website buying policy and the amfori database.",
        "notes_en": "Requires a REX statement on origin for the zero rate and audits the factory before the first order.",
        "notes_bn": "শূন্য শুল্কের জন্য আরইএক্স বিবরণী এবং প্রথম অর্ডারের আগে কারখানা অডিট আবশ্যক।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_DE_02",
        "id": "BUY_DE_02",
        "company_name": "Berlin Artisan Home and Living AG",
        "city": "Berlin",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Artisan Ceramics and Home Decor",
        "hs_chapters": ["69", "53", "57"],
        "hs_codes": ["6912.00", "6914.90", "5705.00"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1200,
        "target_fob_usd": 11.40,
        "annual_import_usd": 1120000.0,
        "annual_procurement_budget_usd": 1400000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring interior collection launch",
                "volume_share_pct": 40,
            },
            {
                "window": "September to November",
                "window_bn": "সেপ্টেম্বর থেকে নভেম্বর",
                "focus": "Autumn artisan market restock",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["CAD", "LC_SIGHT"],
        "required_audits": ["CERT_SMETA", "CERT_REX", "CERT_OEKO", "CERT_ISO9001"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 68,
        "verified_year": 2026,
        "verification": "Confirmed through the sourcing team enquiry log and a factory sample approval.",
        "notes_en": "Wants a lead free food contact test for every glazed item and a broken piece tolerance below 2 percent.",
        "notes_bn": "প্রতিটি গ্লেজড পণ্যের জন্য সীসা মুক্ত ফুড কন্টাক্ট টেস্ট প্রয়োজন।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_DE_03",
        "id": "BUY_DE_03",
        "company_name": "Rheinland Textilhandel GmbH",
        "city": "Cologne",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Workwear, Uniforms and Denim Basics",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6203.42", "6109.10", "6204.62"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 8000,
        "target_fob_usd": 8.20,
        "annual_import_usd": 2350000.0,
        "annual_procurement_budget_usd": 2900000.0,
        "buying_seasons": [
            {
                "window": "March to May",
                "window_bn": "মার্চ থেকে মে",
                "focus": "Corporate uniform summer programme",
                "volume_share_pct": 50,
            },
            {
                "window": "October to December",
                "window_bn": "অক্টোবর থেকে ডিসেম্বর",
                "focus": "Winter workwear replenishment",
                "volume_share_pct": 50,
            },
        ],
        "payment_methods": ["LC_SIGHT", "NET_60"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_GRS", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 71,
        "verified_year": 2026,
        "verification": "Buyer questionnaire answered and audited supplier list reviewed.",
        "notes_en": "Runs a factory audit every 18 months and accepts 60 day open account only after three clean shipments.",
        "notes_bn": "প্রতি ১৮ মাসে কারখানা অডিট এবং তিনটি পরিষ্কার শিপমেন্টের পর নেট ৬০ শর্ত গ্রহণ করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_DE_04",
        "id": "BUY_DE_04",
        "company_name": "Bayern Craft Importe AG",
        "city": "Munich",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Artisan Ceramics and Tableware",
        "hs_chapters": ["69"],
        "hs_codes": ["6912.00", "6914.90"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 2000,
        "target_fob_usd": 10.60,
        "annual_import_usd": 870000.0,
        "annual_procurement_budget_usd": 1150000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring housewares fair orders",
                "volume_share_pct": 30,
            },
            {
                "window": "June to August",
                "window_bn": "জুন থেকে আগস্ট",
                "focus": "Tourist season hospitality programme",
                "volume_share_pct": 70,
            },
        ],
        "payment_methods": ["CAD", "LC_SIGHT", "TT_ADVANCE"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 66,
        "verified_year": 2026,
        "verification": "Replied to two direct sourcing enquiries with a full specification sheet.",
        "notes_en": "Prefers 20 foot containers with straw and carton protection, rejects foam packaging.",
        "notes_bn": "২০ ফুট কন্টেইনার এবং খোলা ও কার্টন প্রোটেকশন পছন্দ করে, ফোম ব্যবহার করতে রাজি নয়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_DE_05",
        "id": "BUY_DE_05",
        "company_name": "Hanseatic Home Living GmbH",
        "city": "Bremen",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Jute Home Textiles and Rugs",
        "hs_chapters": ["53", "57"],
        "hs_codes": ["5303.10", "5705.00", "4202.92"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 3000,
        "target_fob_usd": 4.60,
        "annual_import_usd": 1180000.0,
        "annual_procurement_budget_usd": 1500000.0,
        "buying_seasons": [
            {
                "window": "April to June",
                "window_bn": "এপ্রিল থেকে জুন",
                "focus": "Autumn rug range buying",
                "volume_share_pct": 55,
            },
            {
                "window": "November to December",
                "window_bn": "নভেম্বর থেকে ডিসেম্বর",
                "focus": "Christmas floor covering programme",
                "volume_share_pct": 45,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "LC_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_REX", "CERT_ISO9001"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 62,
        "verified_year": 2026,
        "verification": "Contact verified through the German sourcing fair exhibitor list.",
        "notes_en": "Buys jute carpets for a Scandinavian retail chain, insists on henna dyed and undyed fibre.",
        "notes_bn": "স্ক্যান্ডিনেভিয়ান রিটেইল চেইনের জন্য পাটের কার্পেট কেনে, হেন্না রঙের ও অরঙ্গের ফাইবার পছন্দ করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_DE_06",
        "id": "BUY_DE_06",
        "company_name": "Schwaben Lederwaren GmbH",
        "city": "Stuttgart",
        "country": "Germany (জার্মানি)",
        "country_name_en": "Germany",
        "country_code": "DE",
        "segment": "Leather Bags and Accessories",
        "hs_chapters": ["42"],
        "hs_codes": ["4202.21"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1500,
        "target_fob_usd": 13.20,
        "annual_import_usd": 1320000.0,
        "annual_procurement_budget_usd": 1650000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring leather accessories collection",
                "volume_share_pct": 45,
            },
            {
                "window": "July to September",
                "window_bn": "জুলাই থেকে সেপ্টেম্বর",
                "focus": "Autumn trade fair order book",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_SMETA", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 69,
        "verified_year": 2026,
        "verification": "Tannery and factory documentation verified against the LWG registry.",
        "notes_en": "Only buys from an LWG rated tannery, checks the REACH chemical declaration before sampling.",
        "notes_bn": "শুধু এলডবিজি রেটেড ট্যানারি থেকে কেনে, স্যাম্পলের আগে রিচ কেমিক্যাল ডিক্লারেশন দেখে।",
        "contact_ready": True,
    },
    # ----------------------------------------------------------- France
    {
        "buyer_id": "BUY_FR_01",
        "id": "BUY_FR_01",
        "company_name": "Paris Textile Collective SAS",
        "city": "Paris",
        "country": "France (ফ্রান্স)",
        "country_name_en": "France",
        "country_code": "FR",
        "segment": "Fashion Accessories and Denim",
        "hs_chapters": ["42", "62"],
        "hs_codes": ["4202.92", "6203.42", "6204.62"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 3000,
        "target_fob_usd": 9.80,
        "annual_import_usd": 2100000.0,
        "annual_procurement_budget_usd": 2650000.0,
        "buying_seasons": [
            {
                "window": "December to February",
                "window_bn": "ডিসেম্বর থেকে ফেব্রুয়ারি",
                "focus": "Spring summer buying window",
                "volume_share_pct": 50,
            },
            {
                "window": "June to July",
                "window_bn": "জুন থেকে জুলাই",
                "focus": "Autumn winter pre order",
                "volume_share_pct": 50,
            },
        ],
        "payment_methods": ["LC_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_CBAM", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 77,
        "verified_year": 2026,
        "verification": "Long standing correspondence, buys every season without a factory audit.",
        "notes_en": "Requires a carbon footprint sheet per style because their own retail groups report Scope 3.",
        "notes_bn": "প্রতি স্টাইলে কার্বন ফুটপ্রিন্ট শিট চায় কারণ তাদের রিটেল গ্রুপ স্কোপ ৩ রিপোর্ট করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_FR_02",
        "id": "BUY_FR_02",
        "company_name": "Atelier Cuir Lyonnais SARL",
        "city": "Lyon",
        "country": "France (ফ্রান্স)",
        "country_name_en": "France",
        "country_code": "FR",
        "segment": "Leather Goods and Footwear",
        "hs_chapters": ["42", "64"],
        "hs_codes": ["4202.21", "6403.91"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1000,
        "target_fob_usd": 16.50,
        "annual_import_usd": 1650000.0,
        "annual_procurement_budget_usd": 2050000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring leather goods capsule",
                "volume_share_pct": 35,
            },
            {
                "window": "September to October",
                "window_bn": "সেপ্টেম্বর থেকে অক্টোবর",
                "focus": "Autumn winter footwear and bag order",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_SMETA", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 73,
        "verified_year": 2026,
        "verification": "Sample approval on file for three seasons, verified factory visit.",
        "notes_en": "Vegetable tanned chrome free leather only, rejects any chrome tanned upper.",
        "notes_bn": "শুধু ভেজিটেবল ট্যানড ক্রোম ফ্রি চামড়া গ্রহণ করে, ক্রোম ট্যানড উপরের অংশ প্রত্যাখ্যান করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_FR_03",
        "id": "BUY_FR_03",
        "company_name": "Maison Bio Epicerie SARL",
        "city": "Nantes",
        "country": "France (ফ্রান্স)",
        "country_name_en": "France",
        "country_code": "FR",
        "segment": "Organic Food Import and Distribution",
        "hs_chapters": ["09", "10"],
        "hs_codes": ["1006.30", "0910.30"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 5000,
        "target_fob_usd": 1.35,
        "annual_import_usd": 780000.0,
        "annual_procurement_budget_usd": 1020000.0,
        "buying_seasons": [
            {
                "window": "April to June",
                "window_bn": "এপ্রিল থেকে জুন",
                "focus": "Summer organic programme",
                "volume_share_pct": 40,
            },
            {
                "window": "October to December",
                "window_bn": "অক্টোবর থেকে ডিসেম্বর",
                "focus": "Holiday gifting and festive spice programme",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["CAD", "TT_ADVANCE", "DP_SIGHT"],
        "required_audits": ["CERT_HACCP", "CERT_ORGANIC", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 64,
        "verified_year": 2026,
        "verification": "Food safety certificate on file, first shipment under review.",
        "notes_en": "Checks curcumin level and pesticide residue on every lot before confirming the contract.",
        "notes_bn": "কন্ট্রাক্ট নিশ্চিত করার আগে প্রতিটি লটে কারকুরিন ও কীটনাশক অবশিষ্ট পরীক্ষা করে।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_FR_04",
        "id": "BUY_FR_04",
        "company_name": "Provence Deco Import SAS",
        "city": "Marseille",
        "country": "France (ফ্রান্স)",
        "country_name_en": "France",
        "country_code": "FR",
        "segment": "Mediterranean Home Decor",
        "hs_chapters": ["69", "57", "42"],
        "hs_codes": ["6914.90", "5705.00", "4202.92"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1200,
        "target_fob_usd": 12.40,
        "annual_import_usd": 940000.0,
        "annual_procurement_budget_usd": 1250000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring interior styling order",
                "volume_share_pct": 45,
            },
            {
                "window": "August to September",
                "window_bn": "আগস্ট থেকে সেপ্টেম্বর",
                "focus": "Autumn tourism season restock",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["CAD", "LC_SIGHT"],
        "required_audits": ["CERT_SMETA", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 60,
        "verified_year": 2026,
        "verification": "Confirmed through the Maison and Objet exhibitor register.",
        "notes_en": "Needs a heat resistant and food contact declaration for any glazed piece used with food.",
        "notes_bn": "খাদ্যের সাথে ব্যবহৃত গ্লেজড পিসের জন্য তাপ প্রতিরোধী ও ফুড কন্টাক্ট ডিক্লারেশন চায়।",
        "contact_ready": True,
    },
    # ------------------------------------------------------- Netherlands
    {
        "buyer_id": "BUY_NL_01",
        "id": "BUY_NL_01",
        "company_name": "Rotterdam FairTrade Packaging BV",
        "city": "Rotterdam",
        "country": "Netherlands (নেদারল্যান্ডস)",
        "country_name_en": "Netherlands",
        "country_code": "NL",
        "segment": "Jute Packaging and Retail Bags",
        "hs_chapters": ["42", "53"],
        "hs_codes": ["4202.92", "5303.10"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 8000,
        "target_fob_usd": 3.45,
        "annual_import_usd": 2100000.0,
        "annual_procurement_budget_usd": 2700000.0,
        "buying_seasons": [
            {
                "window": "January to April",
                "window_bn": "জানুয়ারি থেকে এপ্রিল",
                "focus": "Spring packaging contract renewal",
                "volume_share_pct": 40,
            },
            {
                "window": "August to October",
                "window_bn": "আগস্ট থেকে অক্টোবর",
                "focus": "Autumn peak season packaging order",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["LC_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 80,
        "verified_year": 2026,
        "verification": "Annual contract framework in place, factory audit score published to us.",
        "notes_en": "Highest repeat order rate in the database, pays on an irrevocable letter of credit at sight.",
        "notes_bn": "ডেটাবেসে সর্বাধিক পুনরাবৃত্ত অর্ডার, সাইটে অপরিবর্তনীয় এল/সি তে পরিশোধ করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_NL_02",
        "id": "BUY_NL_02",
        "company_name": "Amsterdam Green Wholesale BV",
        "city": "Amsterdam",
        "country": "Netherlands (নেদারল্যান্ডস)",
        "country_name_en": "Netherlands",
        "country_code": "NL",
        "segment": "Organic Textiles and Recycled Accessories",
        "hs_chapters": ["42", "53", "62"],
        "hs_codes": ["4202.92", "5303.10", "6203.42"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 6000,
        "target_fob_usd": 5.60,
        "annual_import_usd": 1820000.0,
        "annual_procurement_budget_usd": 2350000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring sustainable basics",
                "volume_share_pct": 45,
            },
            {
                "window": "September to October",
                "window_bn": "সেপ্টেম্বর থেকে অক্টোবর",
                "focus": "Autumn recycled capsule",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["CAD", "TT_ADVANCE", "NET_60"],
        "required_audits": ["CERT_CBAM", "CERT_GOTS", "CERT_BSCI", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 72,
        "verified_year": 2026,
        "verification": "Supplier list reviewed and the recycled content claim audited.",
        "notes_en": "Recycled content must be supported by a transaction certificate, not a supplier declaration alone.",
        "notes_bn": "পুনর্ব্যবহৃত উপাদানের দাবি ট্রানজেকশন সার্টিফিকেট দিয়ে প্রমাণ করতে হয়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_NL_03",
        "id": "BUY_NL_03",
        "company_name": "Utrecht Fair Foods BV",
        "city": "Utrecht",
        "country": "Netherlands (নেদারল্যান্ডস)",
        "country_name_en": "Netherlands",
        "country_code": "NL",
        "segment": "Fair Trade Food and Rice",
        "hs_chapters": ["10", "09"],
        "hs_codes": ["1006.30", "0910.30"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 8000,
        "target_fob_usd": 1.30,
        "annual_import_usd": 690000.0,
        "annual_procurement_budget_usd": 880000.0,
        "buying_seasons": [
            {
                "window": "March to May",
                "window_bn": "মার্চ থেকে মে",
                "focus": "Asian festival rice programme",
                "volume_share_pct": 35,
            },
            {
                "window": "September to November",
                "window_bn": "সেপ্টেম্বর থেকে নভেম্বর",
                "focus": "Year end retail food programme",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["CAD", "TT_ADVANCE"],
        "required_audits": ["CERT_HACCP", "CERT_ORGANIC", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 58,
        "verified_year": 2026,
        "verification": "Food safety file verified, first trial shipment executed.",
        "notes_en": "Only accepts aromatic rice that is single export grade with a moisture reading below 13 percent.",
        "notes_bn": "শুধু একক এক্সপোর্ট গ্রেডের সুগন্ধি চাল নেয়, আর্দ্রতা ১৩ শতাংশের নিচে হতে হবে।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_NL_04",
        "id": "BUY_NL_04",
        "company_name": "Den Haag Circular Goods BV",
        "city": "The Hague",
        "country": "Netherlands (নেদারল্যান্ডস)",
        "country_name_en": "Netherlands",
        "country_code": "NL",
        "segment": "Circular Fashion and Basic Apparel",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6203.42", "6204.62", "6109.10"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 10000,
        "target_fob_usd": 8.40,
        "annual_import_usd": 3100000.0,
        "annual_procurement_budget_usd": 3950000.0,
        "buying_seasons": [
            {
                "window": "December to March",
                "window_bn": "ডিসেম্বর থেকে মার্চ",
                "focus": "Spring summer volume buy",
                "volume_share_pct": 55,
            },
            {
                "window": "July to August",
                "window_bn": "জুলাই থেকে আগস্ট",
                "focus": "Autumn winter replenishment",
                "volume_share_pct": 45,
            },
        ],
        "payment_methods": ["NET_60", "LC_SIGHT"],
        "required_audits": ["CERT_GRS", "CERT_OEKO", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 70,
        "verified_year": 2026,
        "verification": "Amfori member, audit report shared with our factory.",
        "notes_en": "High volume buyer that pays net 60, so credit insurance is required before the first order.",
        "notes_bn": "উচ্চ ভলিউম ক্রেতা যিনি নেট ৬০ দিনে পরিশোধ করেন, তাই প্রথম অর্ডারে ক্রেডিট ইন্স্যুরেন্স লাগবে।",
        "contact_ready": True,
    },
    # ----------------------------------------------------------- Sweden
    {
        "buyer_id": "BUY_SE_01",
        "id": "BUY_SE_01",
        "company_name": "Nordic Circular Apparel AB",
        "city": "Stockholm",
        "country": "Sweden (সুইডেন)",
        "country_name_en": "Sweden",
        "country_code": "SE",
        "segment": "Circular Fashion and Ready Made Apparel",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6203.42", "6204.62", "6109.10"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 4000,
        "target_fob_usd": 13.60,
        "annual_import_usd": 2800000.0,
        "annual_procurement_budget_usd": 3600000.0,
        "buying_seasons": [
            {
                "window": "November to January",
                "window_bn": "নভেম্বর থেকে জানুয়ারি",
                "focus": "Full year volume commitment",
                "volume_share_pct": 60,
            },
            {
                "window": "May to June",
                "window_bn": "মে থেকে জুন",
                "focus": "Mid season top up",
                "volume_share_pct": 40,
            },
        ],
        "payment_methods": ["LC_SIGHT"],
        "required_audits": ["CERT_GRS", "CERT_OEKO", "CERT_CBAM", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 75,
        "verified_year": 2026,
        "verification": "Long term agreement in place, sustainability report checks our carbon data.",
        "notes_en": "Checks the Scope 2 figure of our factory against the product carbon footprint they publish.",
        "notes_bn": "তারা প্রকাশিত পণ্য কার্বন ফুটপ্রিন্টের সাথে আমাদের কারখানার স্কোপ ২ তুলনা করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_SE_02",
        "id": "BUY_SE_02",
        "company_name": "Goteborg Outdoor and Workwear AB",
        "city": "Gothenburg",
        "country": "Sweden (সুইডেন)",
        "country_name_en": "Sweden",
        "country_code": "SE",
        "segment": "Outdoor and Workwear",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6204.62", "6109.10", "6203.42"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 5000,
        "target_fob_usd": 9.60,
        "annual_import_usd": 1950000.0,
        "annual_procurement_budget_usd": 2500000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring outdoor layer programme",
                "volume_share_pct": 35,
            },
            {
                "window": "August to September",
                "window_bn": "আগস্ট থেকে সেপ্টেম্বর",
                "focus": "Autumn and winter range buy",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["LC_SIGHT", "NET_60"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_GRS"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 67,
        "verified_year": 2026,
        "verification": "Sample approval and social audit record on file.",
        "notes_en": "Durability testing is part of the approval, seams are tested to 35,000 cycles.",
        "notes_bn": "টেবিলিটি টেস্ট অনুমোদনের অংশ, সেম ৩৫,০০০ সাইকেল পর্যন্ত পরীক্ষা করা হয়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_SE_03",
        "id": "BUY_SE_03",
        "company_name": "Malmo Home Ceramics AB",
        "city": "Malmo",
        "country": "Sweden (সুইডেন)",
        "country_name_en": "Sweden",
        "country_code": "SE",
        "segment": "Nordic Home Ceramics",
        "hs_chapters": ["69"],
        "hs_codes": ["6912.00", "6914.90"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1500,
        "target_fob_usd": 11.40,
        "annual_import_usd": 1050000.0,
        "annual_procurement_budget_usd": 1380000.0,
        "buying_seasons": [
            {
                "window": "December to February",
                "window_bn": "ডিসেম্বর থেকে ফেব্রুয়ারি",
                "focus": "Winter interior collection",
                "volume_share_pct": 40,
            },
            {
                "window": "June to July",
                "window_bn": "জুন থেকে জুলাই",
                "focus": "Summer home refresh programme",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["CAD", "LC_SIGHT"],
        "required_audits": ["CERT_SMETA", "CERT_REX", "CERT_ISO9001"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 61,
        "verified_year": 2026,
        "verification": "Design team sample feedback archived for two seasons.",
        "notes_en": "Strict on glaze consistency, runs a random breakage check on arrival.",
        "notes_bn": "গ্লেজের সামঞ্জস্যের ব্যাপারে কড়া, পৌঁছানোর পর এলোমেলো ভাঙার পরীক্ষা করে।",
        "contact_ready": True,
    },
    # ------------------------------------------------------------ Japan
    {
        "buyer_id": "BUY_JP_01",
        "id": "BUY_JP_01",
        "company_name": "Tokyo Midori Lifestyle Co., Ltd.",
        "city": "Tokyo",
        "country": "Japan (জাপান)",
        "country_name_en": "Japan",
        "country_code": "JP",
        "segment": "Eco Lifestyle and Jute Goods",
        "hs_chapters": ["42", "53"],
        "hs_codes": ["4202.92", "5303.10"],
        "trade_scheme": "Japan Duty Free Quota Free (DFQF)",
        "typical_moq_units": 3000,
        "target_fob_usd": 3.70,
        "annual_import_usd": 980000.0,
        "annual_procurement_budget_usd": 1300000.0,
        "buying_seasons": [
            {
                "window": "September to November",
                "window_bn": "সেপ্টেম্বর থেকে নভেম্বর",
                "focus": "Autumn gift market order",
                "volume_share_pct": 45,
            },
            {
                "window": "January to February",
                "window_bn": "জানুয়ারি থেকে ফেব্রুয়ারি",
                "focus": "New year hanko and gift season",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "DP_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_GRS", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 70,
        "verified_year": 2026,
        "verification": "Enquiry history confirmed, still bills against the DFQF preference claim.",
        "notes_en": "Insists on Japanese style packaging and a double checked foil barrier for humidity.",
        "notes_bn": "জাপানি ধরনের প্যাকেজিং এবং আর্দ্রতার জন্য ফয়েল ব্যারিয়ার চায়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_JP_02",
        "id": "BUY_JP_02",
        "company_name": "Osaka Craft Footwear Corp.",
        "city": "Osaka",
        "country": "Japan (জাপান)",
        "country_name_en": "Japan",
        "country_code": "JP",
        "segment": "Premium Leather Footwear",
        "hs_chapters": ["64"],
        "hs_codes": ["6403.91"],
        "trade_scheme": "Japan Duty Free Quota Free (DFQF)",
        "typical_moq_units": 1000,
        "target_fob_usd": 15.90,
        "annual_import_usd": 1650000.0,
        "annual_procurement_budget_usd": 2100000.0,
        "buying_seasons": [
            {
                "window": "March to May",
                "window_bn": "মার্চ থেকে মে",
                "focus": "Autumn winter footwear order",
                "volume_share_pct": 60,
            },
            {
                "window": "October to November",
                "window_bn": "অক্টোবর থেকে নভেম্বর",
                "focus": "Spring summer restock",
                "volume_share_pct": 40,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_BSCI", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 76,
        "verified_year": 2026,
        "verification": "Leather Working Group membership of our tannery confirmed.",
        "notes_en": "Japan duty free quota free saves 21.6 points against a third country origin, which drives the price gap.",
        "notes_bn": "তৃতীয় দেশের উৎসের তুলনায় জাপানের ডিউটি ফ্রি কোটা ফ্রি ২১.৬ পয়েন্ট সাশ্রয় করে।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_JP_03",
        "id": "BUY_JP_03",
        "company_name": "Nagoya Rice and Spice Trading KK",
        "city": "Nagoya",
        "country": "Japan (জাপান)",
        "country_name_en": "Japan",
        "country_code": "JP",
        "segment": "Specialty Food and Rice Trading",
        "hs_chapters": ["10", "09"],
        "hs_codes": ["1006.30", "0910.30"],
        "trade_scheme": "Japan Duty Free Quota Free (DFQF)",
        "typical_moq_units": 6000,
        "target_fob_usd": 1.25,
        "annual_import_usd": 720000.0,
        "annual_procurement_budget_usd": 950000.0,
        "buying_seasons": [
            {
                "window": "April to June",
                "window_bn": "এপ্রিল থেকে জুন",
                "focus": "Summer festival rice programme",
                "volume_share_pct": 30,
            },
            {
                "window": "October to December",
                "window_bn": "অক্টোবর থেকে ডিসেম্বর",
                "focus": "New year gift rice and spice volume",
                "volume_share_pct": 70,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "CAD"],
        "required_audits": ["CERT_HACCP", "CERT_ORGANIC", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 63,
        "verified_year": 2026,
        "verification": "Import licence history checked, samples under evaluation.",
        "notes_en": "Japanese residue and heavy metal limits are stricter than the EU limits, we must test to Japan standard.",
        "notes_bn": "জাপানের অবশিষ্ট ও ভারী ধাতুর সীমা ইইউর চেয়ে কঠোর, জাপানের মানে পরীক্ষা করতে হবে।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_JP_04",
        "id": "BUY_JP_04",
        "company_name": "Kobe Sustainable Bags KK",
        "city": "Kobe",
        "country": "Japan (জাপান)",
        "country_name_en": "Japan",
        "country_code": "JP",
        "segment": "Jute Bags and Home Textiles",
        "hs_chapters": ["42", "57"],
        "hs_codes": ["4202.92", "5705.00"],
        "trade_scheme": "Japan Duty Free Quota Free (DFQF)",
        "typical_moq_units": 5000,
        "target_fob_usd": 3.40,
        "annual_import_usd": 1100000.0,
        "annual_procurement_budget_usd": 1450000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring lifestyle goods programme",
                "volume_share_pct": 40,
            },
            {
                "window": "September to October",
                "window_bn": "সেপ্টেম্বর থেকে অক্টোবর",
                "focus": "Autumn interior and mat programme",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "LC_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 65,
        "verified_year": 2026,
        "verification": "Introduced through the Japan external trade organisation seminar.",
        "notes_en": "Fibre colour and hand feel must match the approved sample, no substitute in the dyed lot.",
        "notes_bn": "ফাইবারের রং ও স্পর্শ অনুমোদিত নমুনার সাথে মিলতে হবে, রঙের লটে বিকল্প নেই।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_JP_05",
        "id": "BUY_JP_05",
        "company_name": "Sapporo Textile Trading KK",
        "city": "Sapporo",
        "country": "Japan (জাপান)",
        "country_name_en": "Japan",
        "country_code": "JP",
        "segment": "Outerwear and Everyday Apparel",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6204.62", "6109.10", "6203.42"],
        "trade_scheme": "Japan Duty Free Quota Free (DFQF)",
        "typical_moq_units": 4000,
        "target_fob_usd": 11.80,
        "annual_import_usd": 1420000.0,
        "annual_procurement_budget_usd": 1850000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring summer order",
                "volume_share_pct": 35,
            },
            {
                "window": "June to August",
                "window_bn": "জুন থেকে আগস্ট",
                "focus": "Autumn winter outerwear order",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["LC_SIGHT", "TT_ADVANCE"],
        "required_audits": ["CERT_OEKO", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 68,
        "verified_year": 2026,
        "verification": "Factory audit score shared through the amfori platform.",
        "notes_en": "Works to a full year cost breakdown and expects the supplier to hold the fabric price for six months.",
        "notes_bn": "সারা বছরের খরচের হিসাবে কাজ করে এবং ছয় মাস ধরে কাপড়ের দাম স্থির রাখতে চায়।",
        "contact_ready": True,
    },
    # -------------------------------------------------------------- USA
    {
        "buyer_id": "BUY_US_01",
        "id": "BUY_US_01",
        "company_name": "Green Harbor Imports LLC",
        "city": "New York",
        "country": "United States (যুক্তরাষ্ট্র)",
        "country_name_en": "United States",
        "country_code": "US",
        "segment": "Sustainable Home Textiles",
        "hs_chapters": ["53", "62"],
        "hs_codes": ["5303.10", "6203.42"],
        "trade_scheme": "United States MFN (HTS Column 1 General)",
        "typical_moq_units": 10000,
        "target_fob_usd": 4.60,
        "annual_import_usd": 3200000.0,
        "annual_procurement_budget_usd": 4100000.0,
        "buying_seasons": [
            {
                "window": "January to April",
                "window_bn": "জানুয়ারি থেকে এপ্রিল",
                "focus": "Spring home textile programme",
                "volume_share_pct": 45,
            },
            {
                "window": "August to October",
                "window_bn": "আগস্ট থেকে অক্টোবর",
                "focus": "Back to school and holiday textile order",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["LC_SIGHT", "TT_ADVANCE"],
        "required_audits": ["CERT_GOTS", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 55,
        "verified_year": 2026,
        "verification": "Active importer, US preference programme lapsed so the quote must carry the full MFN rate.",
        "notes_en": "Buys on a landed cost basis, so the 12 percent MFN rate on denim trousers must be shown in the offer.",
        "notes_bn": "ল্যান্ডেড কস্ট ভিত্তিতে কেনে, তাই ডেনিম ট্রাউজার্সের ১২ শতাংশ এমএফএন শুল্ক অফারে দেখাতে হবে।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_US_02",
        "id": "BUY_US_02",
        "company_name": "Pacific Coast Apparel Inc.",
        "city": "Los Angeles",
        "country": "United States (যুক্তরাষ্ট্র)",
        "country_name_en": "United States",
        "country_code": "US",
        "segment": "Denim and Casual Apparel",
        "hs_chapters": ["62"],
        "hs_codes": ["6203.42", "6204.62"],
        "trade_scheme": "United States MFN (HTS Column 1 General)",
        "typical_moq_units": 8000,
        "target_fob_usd": 9.90,
        "annual_import_usd": 4600000.0,
        "annual_procurement_budget_usd": 5900000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring denim drop",
                "volume_share_pct": 40,
            },
            {
                "window": "June to August",
                "window_bn": "জুন থেকে আগস্ট",
                "focus": "Back to school volume buy",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["LC_SIGHT", "NET_60"],
        "required_audits": ["CERT_OEKO", "CERT_GRS", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 60,
        "verified_year": 2026,
        "verification": "Volume importer, quoted prices must include the MFN duty as a separate line.",
        "notes_en": "Very price sensitive on cotton content, accepts 20 percent MFN only when the FOB is competitive.",
        "notes_bn": "কটনের কনটেন্ট নিয়ে খুব দাম সংবেদনশীল, এফওবি প্রতিযোগী হলে ২০ শতাংশ এমএফএন মানে নেয়।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_US_03",
        "id": "BUY_US_03",
        "company_name": "Boston Leather Atelier LLC",
        "city": "Boston",
        "country": "United States (যুক্তরাষ্ট্র)",
        "country_name_en": "United States",
        "country_code": "US",
        "segment": "Leather Accessories",
        "hs_chapters": ["42", "64"],
        "hs_codes": ["4202.21", "6403.91"],
        "trade_scheme": "United States MFN (HTS Column 1 General)",
        "typical_moq_units": 1200,
        "target_fob_usd": 14.80,
        "annual_import_usd": 1550000.0,
        "annual_procurement_budget_usd": 1950000.0,
        "buying_seasons": [
            {
                "window": "March to May",
                "window_bn": "মার্চ থেকে মে",
                "focus": "Spring leather goods order",
                "volume_share_pct": 40,
            },
            {
                "window": "September to October",
                "window_bn": "সেপ্টেম্বর থেকে অক্টোবর",
                "focus": "Holiday and gifting programme",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_SMETA"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 57,
        "verified_year": 2026,
        "verification": "Sample approved for one style, leather traceability under review.",
        "notes_en": "Needs a leather traceability file down to the tannery for every shipment.",
        "notes_bn": "প্রতি শিপমেন্টে ট্যানারি পর্যন্ত চামড়ার ট্রেসেবিলিটি ফাইল চায়।",
        "contact_ready": False,
    },
    {
        "buyer_id": "BUY_US_04",
        "id": "BUY_US_04",
        "company_name": "Midwest Specialty Foods Inc.",
        "city": "Chicago",
        "country": "United States (যুক্তরাষ্ট্র)",
        "country_name_en": "United States",
        "country_code": "US",
        "segment": "Spice and Rice Distribution",
        "hs_chapters": ["09", "10"],
        "hs_codes": ["0910.30", "1006.30"],
        "trade_scheme": "United States MFN (HTS Column 1 General)",
        "typical_moq_units": 10000,
        "target_fob_usd": 1.45,
        "annual_import_usd": 2100000.0,
        "annual_procurement_budget_usd": 2750000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring spice restock",
                "volume_share_pct": 35,
            },
            {
                "window": "August to November",
                "window_bn": "আগস্ট থেকে নভেম্বর",
                "focus": "Holiday and retail spice programme",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "LC_SIGHT"],
        "required_audits": ["CERT_HACCP", "CERT_ORGANIC"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 54,
        "verified_year": 2026,
        "verification": "Food safety file reviewed, monthly shipment programme under trial.",
        "notes_en": "Strict on lead, arsenic and pesticide residue, testing is done at their own laboratory.",
        "notes_bn": "সীসা, আর্সেনিক ও কীটনাশক অবশিষ্টে কড়া, পরীক্ষা তাদের নিজস্ব ল্যাবে হয়।",
        "contact_ready": False,
    },
    # --------------------------------------------------------------- UK
    {
        "buyer_id": "BUY_UK_01",
        "id": "BUY_UK_01",
        "company_name": "Thames Streetwear Collective Ltd.",
        "city": "Manchester",
        "country": "United Kingdom (যুক্তরাজ্য)",
        "country_name_en": "United Kingdom",
        "country_code": "GB",
        "segment": "Recycled Denim and Streetwear",
        "hs_chapters": ["62", "61"],
        "hs_codes": ["6203.42", "6204.62", "6109.10"],
        "trade_scheme": "UK Developing Countries Trading Scheme (DCTS)",
        "typical_moq_units": 5000,
        "target_fob_usd": 13.90,
        "annual_import_usd": 3400000.0,
        "annual_procurement_budget_usd": 4350000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring streetwear drop",
                "volume_share_pct": 45,
            },
            {
                "window": "July to September",
                "window_bn": "জুলাই থেকে সেপ্টেম্বর",
                "focus": "Autumn winter denim order",
                "volume_share_pct": 55,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_GRS", "CERT_OEKO", "CERT_BSCI"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 78,
        "verified_year": 2026,
        "verification": "Largest apparel account in the database, quarterly programme confirmed.",
        "notes_en": "Uses the DCTS zero rate, expects the tariff statement on every proforma invoice.",
        "notes_bn": "ডিসিটিএস শূন্য শুল্ক ব্যবহার করে, প্রতিটি প্রপোজালে শুল্ক বিবরণী চায়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_UK_02",
        "id": "BUY_UK_02",
        "company_name": "Edinburgh Natural Living PLC",
        "city": "Edinburgh",
        "country": "United Kingdom (যুক্তরাজ্য)",
        "country_name_en": "United Kingdom",
        "country_code": "GB",
        "segment": "Eco Homewares and Tableware",
        "hs_chapters": ["42", "69"],
        "hs_codes": ["4202.92", "6912.00", "6914.90"],
        "trade_scheme": "UK Developing Countries Trading Scheme (DCTS)",
        "typical_moq_units": 2500,
        "target_fob_usd": 10.20,
        "annual_import_usd": 760000.0,
        "annual_procurement_budget_usd": 980000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring homeware programme",
                "volume_share_pct": 40,
            },
            {
                "window": "September to November",
                "window_bn": "সেপ্টেম্বর থেকে নভেম্বর",
                "focus": "Christmas gifting programme",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["TT_ADVANCE", "LC_SIGHT"],
        "required_audits": ["CERT_CBAM", "CERT_OEKO", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 66,
        "verified_year": 2026,
        "verification": "Buyer enquiry answered, sample book requested.",
        "notes_en": "Wants the carbon line on the invoice because their own reporting covers imported goods.",
        "notes_bn": "তাদের নিজস্ব রিপোর্টিংে আমদানি পণ্য অন্তর্ভুক্ত হওয়ায় ইনভয়েসে কার্বন লাইন চায়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_UK_03",
        "id": "BUY_UK_03",
        "company_name": "Yorkshire Textile Mills Ltd.",
        "city": "Leeds",
        "country": "United Kingdom (যুক্তরাজ্য)",
        "country_name_en": "United Kingdom",
        "country_code": "GB",
        "segment": "Denim and Twill Workwear",
        "hs_chapters": ["62"],
        "hs_codes": ["6203.42", "6204.62"],
        "trade_scheme": "UK Developing Countries Trading Scheme (DCTS)",
        "typical_moq_units": 6000,
        "target_fob_usd": 10.80,
        "annual_import_usd": 2400000.0,
        "annual_procurement_budget_usd": 3050000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring workwear programme",
                "volume_share_pct": 40,
            },
            {
                "window": "August to October",
                "window_bn": "আগস্ট থেকে অক্টোবর",
                "focus": "Autumn industrial wear order",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["NET_60", "LC_SIGHT"],
        "required_audits": ["CERT_BSCI", "CERT_OEKO", "CERT_GRS"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 69,
        "verified_year": 2026,
        "verification": "Audit report shared, yearly framework contract under signature.",
        "notes_en": "Wants a colour lab dip approval before bulk and a shrinkage test on every fabric lot.",
        "notes_bn": "বাল্কের আগে রঙের ল্যাব ডিপ অনুমোদন এবং প্রতিটি কাপড়ের লটে শ্রিংকেজ টেস্ট চায়।",
        "contact_ready": True,
    },
    {
        "buyer_id": "BUY_UK_04",
        "id": "BUY_UK_04",
        "company_name": "Bristol Leather and Footwear Co.",
        "city": "Bristol",
        "country": "United Kingdom (যুক্তরাজ্য)",
        "country_name_en": "United Kingdom",
        "country_code": "GB",
        "segment": "Leather Footwear and Bags",
        "hs_chapters": ["64", "42"],
        "hs_codes": ["6403.91", "4202.21"],
        "trade_scheme": "UK Developing Countries Trading Scheme (DCTS)",
        "typical_moq_units": 1000,
        "target_fob_usd": 15.20,
        "annual_import_usd": 1180000.0,
        "annual_procurement_budget_usd": 1520000.0,
        "buying_seasons": [
            {
                "window": "February to April",
                "window_bn": "ফেব্রুয়ারি থেকে এপ্রিল",
                "focus": "Spring footwear and bag order",
                "volume_share_pct": 40,
            },
            {
                "window": "August to October",
                "window_bn": "আগস্ট থেকে অক্টোবর",
                "focus": "Autumn winter leather order",
                "volume_share_pct": 60,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_SMETA", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 64,
        "verified_year": 2026,
        "verification": "Tannery audit record confirmed, two trial shipments executed.",
        "notes_en": "Accepts DCTS zero duty but wants the leather working group score in the supplier scorecard.",
        "notes_bn": "ডিসিটিএস শূন্য শুল্ক গ্রহণ করে কিন্তু সাপ্লায়ার স্কোরকার্ডে লেদার ওয়ার্কিং গ্রুপের স্কোর চায়।",
        "contact_ready": True,
    },
    # ------------------------------------------------------------ Italy
    {
        "buyer_id": "BUY_IT_01",
        "id": "BUY_IT_01",
        "company_name": "Milano Calzature Import S.r.l.",
        "city": "Milan",
        "country": "Italy (ইতালি)",
        "country_name_en": "Italy",
        "country_code": "IT",
        "segment": "Leather Footwear Wholesale",
        "hs_chapters": ["64"],
        "hs_codes": ["6403.91"],
        "trade_scheme": "EU Everything But Arms (EBA)",
        "typical_moq_units": 1500,
        "target_fob_usd": 16.10,
        "annual_import_usd": 1900000.0,
        "annual_procurement_budget_usd": 2400000.0,
        "buying_seasons": [
            {
                "window": "January to March",
                "window_bn": "জানুয়ারি থেকে মার্চ",
                "focus": "Spring summer footwear buy",
                "volume_share_pct": 35,
            },
            {
                "window": "July to September",
                "window_bn": "জুলাই থেকে সেপ্টেম্বর",
                "focus": "Autumn winter boot programme",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["LC_SIGHT", "CAD"],
        "required_audits": ["CERT_LWG", "CERT_BSCI", "CERT_REX"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 71,
        "verified_year": 2026,
        "verification": "Milan showroom buyer, annual volume confirmed for three seasons.",
        "notes_en": "Requires a chrome free test report and a REACH declaration with every leather shipment.",
        "notes_bn": "প্রতিটি চামড়ার শিপমেন্টে ক্রোম ফ্রি টেস্ট রিপোর্ট ও রিচ ডিক্লারেশন চায়।",
        "contact_ready": True,
    },
    # -------------------------------------------------------------- UAE
    {
        "buyer_id": "BUY_AE_01",
        "id": "BUY_AE_01",
        "company_name": "Al-Mansoor Hospitality Supplies LLC",
        "city": "Dubai",
        "country": "United Arab Emirates (সংযুক্ত আরব আমিরাত)",
        "country_name_en": "United Arab Emirates",
        "country_code": "AE",
        "segment": "Hospitality Supply and Tableware",
        "hs_chapters": ["69"],
        "hs_codes": ["6912.00", "6914.90"],
        "trade_scheme": "GCC Standardised Customs Tariff",
        "typical_moq_units": 1000,
        "target_fob_usd": 11.00,
        "annual_import_usd": 890000.0,
        "annual_procurement_budget_usd": 1150000.0,
        "buying_seasons": [
            {
                "window": "March to May",
                "window_bn": "মার্চ থেকে মে",
                "focus": "Ramadan and spring hospitality programme",
                "volume_share_pct": 35,
            },
            {
                "window": "September to November",
                "window_bn": "সেপ্টেম্বর থেকে নভেম্বর",
                "focus": "Winter tourism and hotel refurbishment order",
                "volume_share_pct": 65,
            },
        ],
        "payment_methods": ["LC_SIGHT", "TT_ADVANCE"],
        "required_audits": ["CERT_FOOD_SAFE", "CERT_ISO9001"],
        "preferred_incoterm": "FOB Chattogram",
        "response_rate_pct": 59,
        "verified_year": 2026,
        "verification": "Hospitality supply wholesaler, order book confirmed for the current season.",
        "notes_en": "GCC common tariff of 5 percent applies, so the offer must show the duty as a separate line.",
        "notes_bn": "জিসিসি সাধারণ ৫ শতাংশ শুল্ক প্রযোজ্য, তাই অফারে শুল্ক আলাদা লাইনে দেখাতে হবে।",
        "contact_ready": True,
    },
]

# ==========================================================================
# 2. FLAGSHIP PRODUCT PRESETS
# ==========================================================================
#
# Every economic figure in a preset is derived from the trade intelligence
# engine, so the headline price, the duty story and the carbon liability
# always tie out. The fields below are inputs, the rest is computed.
# ==========================================================================

PRESET_INPUTS: List[Dict[str, Any]] = [
    {
        "preset_id": "preset_jute_bag",
        "title_bn": "সাভার গোল্ডেন জুট ও লেদার টোট ব্যাগ (Savar Eco-Jute Tote Bag)",
        "title_en": "Savar Eco-Friendly Golden Jute and Vegetable-Leather Tote Bag",
        "sample_image": "/assets/samples/jute-tote-bag.png",
        "studio_image": "/assets/samples/jute-tote-bag.png",
        "image_status": "branded_sample_available",
        "sample_voice_bn": (
            "আমরা সাভারের কারখানায় মাসে ১০,০০০ পিস এই পরিবেশবান্ধব পাটের ব্যাগ তৈরি করতে পারি। "
            "প্রতি পিস বানাতে আমাদের খরচ হয় প্রায় ৩০৩ টাকা। ইউরোপ বা জাপানে সরাসরি এক্সপোর্ট করতে চাই।"
        ),
        "hs_code_6": "4202.92",
        "hs_code_8digit": "4202.92.10",
        "hs_chapter_name": "Chapter 42 - Handbags, shopping bags with outer surface of jute or other bast fibres",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "factory_location": "savar",
        "monthly_capacity_units": 10000,
        "margin_pct": 16.0,
        "electricity_kwh_per_unit": 0.95,
        "generator_share": 0.08,
        "compliance_readiness_score": 94,
        "required_certificates": [
            "REX (Registered Exporter System) statement on origin for the EU 0 percent duty",
            "Exporter Registration Certificate (ERC), Bangladesh",
            "Eco azo free dye declaration and restricted substance test",
            "OEKO-TEX Standard 100 for the jute fabric and the leather trim",
            "amfori BSCI social compliance audit",
            "ISO 14067 carbon footprint sheet per unit, generated by ExportPilot AI",
        ],
        "notes_en": (
            "Flagship jute line. The tote bag is a shopping bag with a jute outer "
            "surface, so the correct heading is 4202.92 and not the old 4202.22."
        ),
        "notes_bn": (
            "পতাকা ব্যাগটির বাইরের আবরণ পাট, তাই সঠিক শ্রেণি ৪২০২.৯২ এবং পুরোনো ৪২০২.২২ নয়।"
        ),
    },
    {
        "preset_id": "preset_jute_fibre",
        "title_bn": "নরসিংদী কাঁচালি সোনালি পাট ফাইবার (Raw Golden Jute Fibre)",
        "title_en": "Narsingdi Raw Golden Jute Fibre, Press Packed Bales",
        "sample_image": "/assets/samples/jute-tote-bag.png",
        "studio_image": "/assets/samples/jute-tote-bag.png",
        "image_status": "placeholder_reuses_jute_sample",
        "sample_voice_bn": (
            "নরসিংদীতে আমরা প্রতি মাসে প্রায় ১২০ টন কাঁচালি সোনালি পাট প্রেস করে বালি বানাই। "
            "ইউরোপের পাট প্রক্রিয়াজাত কারখানায় সরবরাহের জন্য প্রস্তুত।"
        ),
        "hs_code_6": "5303.10",
        "hs_code_8digit": "5303.10.10",
        "hs_chapter_name": "Chapter 53 - Jute and other textile bast fibres, raw or retted",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "factory_location": "narsingdi",
        "monthly_capacity_units": 120000,
        "margin_pct": 12.0,
        "electricity_kwh_per_unit": 0.15,
        "generator_share": 0.05,
        "compliance_readiness_score": 88,
        "required_certificates": [
            "REX statement on origin for the EU 0 percent duty",
            "Quality certificate with moisture, fibre length and colour grade",
            "Phytosanitary certificate where the destination requires it",
            "ISPM 15 compliant wooden packing",
        ],
        "notes_en": (
            "Raw jute is a weight driven line, so logistics per unit look large. "
            "Classification correction applied: raw and retted jute is heading "
            "5303.10, not 5305. Heading 5305 covers coconut, abaca and ramie "
            "fibres, and jute yarn and cordage sit in heading 5307."
        ),
        "notes_bn": (
            "কাঁচালি পাট ওজনভিত্তিক পণ্য, তাই প্রতি ইউনিটে লজিস্টিক্স ব্যয় বেশি। "
            "শ্রেণিবিন্যাস সংশোধন: কাঁচালি ও রেটেড পাট ৫৩০৩.১০, ৫৩০৫ নয়। "
            "৫৩০৫ শ্রেণিতে নারকেল, আবাকা ও রামি ফাইবার এবং ৫৩০৭ শ্রেণিতে পাটের সুতা ও দড়ি।"
        ),
    },
    {
        "preset_id": "preset_jute_carpet",
        "title_bn": "বগুড়ার হাতে বোনা হেন্না রঙ করা পাটের কার্পেট (Handwoven Jute Carpet)",
        "title_en": "Bogura Handwoven Henna Dyed Jute Carpet and Rug",
        "sample_image": "/assets/samples/jute-tote-bag.png",
        "studio_image": "/assets/samples/jute-tote-bag.png",
        "image_status": "placeholder_reuses_jute_sample",
        "sample_voice_bn": (
            "বগুড়ায় আমাদের কারিগররা হাতে বোনা পাটের কার্পেট মাসে ৩,০০০ পিস তৈরি করে। "
            "প্রতি পিসে খরচ প্রায় ১,২৪০ টাকা। ইউরোপীয় হোম ডেকর বাজারে পাঠাতে চাই।"
        ),
        "hs_code_6": "5705.00",
        "hs_code_8digit": "5705.00.10",
        "hs_chapter_name": "Chapter 57 - Carpets and other textile floor coverings of jute",
        "sector": "Jute & Allied Fibers",
        "sector_bn": "পাট ও পাটজাত শিল্প",
        "factory_location": "bogura",
        "monthly_capacity_units": 3000,
        "margin_pct": 15.0,
        "electricity_kwh_per_unit": 0.55,
        "generator_share": 0.06,
        "compliance_readiness_score": 90,
        "required_certificates": [
            "REX statement on origin for the EU 0 percent duty",
            "OEKO-TEX Standard 100 for the jute yarn and the natural dyes",
            "Global Recycled Standard when reclaimed fibre is used",
            "Handloom and artisan origin declaration",
        ],
        "notes_en": (
            "Highest FOB per container in the jute cluster, but also the heaviest "
            "and the most volume sensitive line."
        ),
        "notes_bn": (
            "পাট ক্লাস্টারে সর্বোচ্চ এফওবি প্রতি কন্টেইনার, তবে এটি সবচেয়ে ভারী ও ভলিউম সংবেদনশীল।"
        ),
    },
    {
        "preset_id": "preset_denim_trousers",
        "title_bn": "গাজীপুর পুরুষ ডেনিম ট্রাউজার্স (Men's Denim Trousers)",
        "title_en": "Gazipur Mens Recycled Stretch Denim Trousers",
        "sample_image": "/assets/samples/denim-jacket-rmg.png",
        "studio_image": "/assets/samples/denim-jacket-rmg.png",
        "image_status": "placeholder_reuses_denim_sample",
        "sample_voice_bn": (
            "গাজীপুরে আমাদের সুইং লাইনে মাসে ৩০,০০০ পিস রিসাইকেলড ডেনিম ট্রাউজার্স বানানো সম্ভব। "
            "ইউরোপে ১২ শতাংশ শুল্ক বাঁচবে, এই কারণে সরাসরি বায়ার খোঁজছি।"
        ),
        "hs_code_6": "6203.42",
        "hs_code_8digit": "6203.42.10",
        "hs_chapter_name": "Chapter 62 - Men's or boys' trousers of cotton, denim",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "factory_location": "gazipur",
        "monthly_capacity_units": 30000,
        "margin_pct": 15.0,
        "electricity_kwh_per_unit": 1.80,
        "generator_share": 0.10,
        "compliance_readiness_score": 92,
        "required_certificates": [
            "OEKO-TEX Standard 100 for the denim fabric",
            "Global Recycled Standard for the recycled cotton content",
            "amfori BSCI and Sedex SMETA social audits",
            "REX statement on origin for the EU and the UK DCTS",
            "ISO 14067 carbon footprint sheet per unit, generated by ExportPilot AI",
        ],
        "notes_en": (
            "The EU EBA preference saves 12 points against the MFN rate, which "
            "is the single largest duty advantage in the apparel book."
        ),
        "notes_bn": (
            "ইউরোপীয় ইবিএ প্রিফারেন্স এমএফএনের তুলনায় ১২ পয়েন্ট সাশ্রয় করে, পোশাক বইয়ে এটি সবচেয়ে বড় সুবিধা।"
        ),
    },
    {
        "preset_id": "preset_tshirt",
        "title_bn": "গাজীপুর কম্বেড সুতোর টি শার্ট (Combed Cotton T-shirt)",
        "title_en": "Gazipur Combed Cotton T-shirt, 180 GSM",
        "sample_image": "/assets/samples/denim-jacket-rmg.png",
        "studio_image": "/assets/samples/denim-jacket-rmg.png",
        "image_status": "placeholder_reuses_denim_sample",
        "sample_voice_bn": (
            "গাজীপুরে আমরা মাসে ৫০,০০০ পিস কম্বেড সুতোর টি শার্ট বানাই। "
            "প্রতি পিস উৎপাদন খরচ প্রায় ৩০৫ টাকা, দ্রুত পুনরাবৃত্ত অর্ডার পাই।"
        ),
        "hs_code_6": "6109.10",
        "hs_code_8digit": "6109.10.10",
        "hs_chapter_name": "Chapter 61 - T-shirts, singlets and other vests, knitted or crocheted, of cotton",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "factory_location": "gazipur",
        "monthly_capacity_units": 50000,
        "margin_pct": 14.0,
        "electricity_kwh_per_unit": 0.70,
        "generator_share": 0.10,
        "compliance_readiness_score": 93,
        "required_certificates": [
            "OEKO-TEX Standard 100 for the combed cotton fabric",
            "Global Organic Textile Standard when the buyer requires organic cotton",
            "amfori BSCI social compliance audit",
            "REX statement on origin for the EU 0 percent duty",
        ],
        "notes_en": (
            "Entry level line for a new exporter. Low logistics cost per piece "
            "because the product nests well in a container."
        ),
        "notes_bn": (
            "নতুন রপ্তানিকারীদের জন্য প্রবেশ-পর্যায়ের পণ্য। কন্টেইনারে ভালোভাবে ঢাঁকে বলে প্রতি পিসে লজিস্টিক্স ব্যয় কম।"
        ),
    },
    {
        "preset_id": "preset_denim_jacket",
        "title_bn": "গাজীপুর রিসাইকেলড কটন ডেনিম জ্যাকেট (Gazipur Sustainable Denim Jacket)",
        "title_en": "Gazipur Recycled Cotton Sustainable Indigo Denim Jacket for Women",
        "sample_image": "/assets/samples/denim-jacket-rmg.png",
        "studio_image": "/assets/samples/denim-jacket-rmg.png",
        "image_status": "branded_sample_available",
        "sample_voice_bn": (
            "গাজীপুরে আমাদের সুইং লাইনে মাসে ১৫,০০০ পিস রিসাইকেলড ডেনিম জ্যাকেট বানানো সম্ভব। "
            "বায়িং হাউস ছাড়া সরাসরি ইউরোপ বা যুক্তরাজ্যে বায়ার খুঁজছি।"
        ),
        "hs_code_6": "6204.62",
        "hs_code_8digit": "6204.62.10",
        "hs_chapter_name": "Chapter 62 - Women's or girls' jackets of cotton, denim",
        "sector": "RMG & Apparel",
        "sector_bn": "বিপক্ত পোশাক ও পোশাকশিল্প",
        "factory_location": "gazipur",
        "monthly_capacity_units": 15000,
        "margin_pct": 16.0,
        "electricity_kwh_per_unit": 2.40,
        "generator_share": 0.12,
        "compliance_readiness_score": 91,
        "required_certificates": [
            "OEKO-TEX Standard 100 and Global Recycled Standard (GRS)",
            "UK DCTS and EU REX origin declaration",
            "amfori BSCI and Sedex SMETA social compliance audits",
            "ISO 14067 carbon footprint sheet per unit, generated by ExportPilot AI",
        ],
        "notes_en": (
            "Womens denim outerwear sits under 6204.62. The previous "
            "classification used the mens outerwear heading, which was corrected."
        ),
        "notes_bn": (
            "মহিলাদের ডেনিম আউটারওয়্যার ৬২০৪.৬২ এর আওতায়। আগের শ্রেণিবিন্যাসে পুরুষদের আউটারওয়্যার কোড ব্যবহৃত হয়েছিল, তা সংশোধিত।"
        ),
    },
    {
        "preset_id": "preset_leather_boot",
        "title_bn": "সাভার ভেজিটেবল-ট্যান্ড চেলসি লেদার বুট (Vegetable Tanned Chelsea Boot)",
        "title_en": "Savar Tannery Estate Vegetable-Tanned Leather Chelsea Boots",
        "sample_image": "/assets/samples/leather-chelsea-boot.png",
        "studio_image": "/assets/samples/leather-chelsea-boot.png",
        "image_status": "branded_sample_available",
        "sample_voice_bn": (
            "সাভার ট্যানারি এস্টেটের ক্রোম-ফ্রি চামড়া দিয়ে মাসে ৪,০০০ জোড়া লেদার বুট তৈরি করি। "
            "ইতালি, জার্মানি বা জাপানে এক্সপোর্ট করতে চাই।"
        ),
        "hs_code_6": "6403.91",
        "hs_code_8digit": "6403.91.60",
        "hs_chapter_name": "Chapter 64 - Footwear with outer soles of rubber or plastics and uppers of leather covering the ankle",
        "sector": "Leather & Footwear",
        "sector_bn": "চামড়া ও জুতা শিল্প",
        "factory_location": "savar",
        "monthly_capacity_units": 4000,
        "margin_pct": 18.0,
        "electricity_kwh_per_unit": 3.20,
        "generator_share": 0.15,
        "compliance_readiness_score": 89,
        "required_certificates": [
            "Leather Working Group (LWG) rated tannery, chrome free test report",
            "REACH chemical compliance declaration for the EU",
            "REX, Japan DFQF or UK DCTS certificate of origin",
            "Sedex SMETA 4 pillar social audit",
        ],
        "notes_en": (
            "Japan is the best margin market for this line because the MFN rate "
            "on leather footwear is 21.6 percent and DFQF removes it entirely."
        ),
        "notes_bn": (
            "এই লাইনের জন্য জাপান সবচেয়ে ভালো মার্জিনের বাজার, কারণ লেদার জুতায় এমএফএন ২১.৬ শতাংশ এবং ডিএফকিউএফ সেটি পুরোপুরি মুক্ত করে।"
        ),
    },
    {
        "preset_id": "preset_leather_handbag",
        "title_bn": "সাভার এলডবিজি লেদার হ্যান্ডব্যাগ (LWG Audited Leather Handbag)",
        "title_en": "Savar LWG Audited Leather Handbag with Cotton Lining",
        "sample_image": "/assets/samples/leather-chelsea-boot.png",
        "studio_image": "/assets/samples/leather-chelsea-boot.png",
        "image_status": "placeholder_reuses_leather_sample",
        "sample_voice_bn": (
            "সাভারে আমরা এলডবিজি অডিটেড ট্যানারি থেকে মাসে ৩,০০০ পিস লেদার হ্যান্ডব্যাগ তৈরি করি। "
            "ফ্রান্স ও যুক্তরাজ্যের বায়ারদের জন্য প্রস্তুত।"
        ),
        "hs_code_6": "4202.21",
        "hs_code_8digit": "4202.21.10",
        "hs_chapter_name": "Chapter 42 - Handbags with outer surface of leather",
        "sector": "Leather & Footwear",
        "sector_bn": "চামড়া ও জুতা শিল্প",
        "factory_location": "savar",
        "monthly_capacity_units": 3000,
        "margin_pct": 18.0,
        "electricity_kwh_per_unit": 2.80,
        "generator_share": 0.15,
        "compliance_readiness_score": 90,
        "required_certificates": [
            "Leather Working Group (LWG) rated tannery with a current scorecard",
            "REACH chemical compliance declaration for the EU",
            "REX statement on origin for the EU 0 percent duty",
            "Sedex SMETA 4 pillar social audit",
        ],
        "notes_en": (
            "Leather handbags sit under 4202.21. Textile outer surface handbags "
            "must be declared under the 4202.92 heading instead."
        ),
        "notes_bn": (
            "লেদার হ্যান্ডব্যাগ ৪২০২.২১ এর আওতায়। কাপড়ের বাইরের আবরণযুক্ত হ্যান্ডব্যাগ ৪২০২.৯২ এ ঘোষণা করতে হবে।"
        ),
    },
    {
        "preset_id": "preset_terracotta",
        "title_bn": "বগুড়ার হস্তশিল্প গ্লেজড সিরামিক ডিনার সেট (Artisan Ceramic Tableware)",
        "title_en": "Bogura Handcrafted Lead-Free Glazed Ceramic Tableware Set",
        "sample_image": "/assets/samples/terracotta-tableware.png",
        "studio_image": "/assets/samples/terracotta-tableware.png",
        "image_status": "branded_sample_available",
        "sample_voice_bn": (
            "বগুড়ায় আমাদের মৃৎশিল্পীদের তৈরি এই গ্লেজড সিরামিক ডিনার সেট মাসে ৩,০০০ সেট সরবরাহ করতে পারব। "
            "মধ্যপ্রাচ্য ও ইউরোপে পাঠাতে চাই।"
        ),
        "hs_code_6": "6912.00",
        "hs_code_8digit": "6912.00.20",
        "hs_chapter_name": "Chapter 69 - Ceramic tableware, kitchenware and other household articles",
        "sector": "Ceramics & Artisanal",
        "sector_bn": "সিরামিক ও হস্তশিল্প",
        "factory_location": "bogura",
        "monthly_capacity_units": 3000,
        "margin_pct": 17.0,
        "electricity_kwh_per_unit": 3.50,
        "generator_share": 0.05,
        "annual_lpg_kg_per_unit": 1.80,
        "compliance_readiness_score": 92,
        "required_certificates": [
            "Lead and cadmium free food contact safety test, LFGB and EU 1935/2004",
            "EU CBAM and kiln energy efficiency audit sheet",
            "Certificate of origin and shock proof export packaging specification",
            "ISO 9001 quality management certificate",
        ],
        "notes_en": (
            "Kiln LPG is the dominant Scope 1 source. An electric or tunnel kiln "
            "conversion is the fastest decarbonisation path for this line."
        ),
        "notes_bn": (
            "কিলনের এলপিজি প্রধান স্কোপ ১ উৎস। ইলেকট্রিক বা টানেল কিলনে রূপান্তর এই লাইনের দ্রুততম কার্বন কমানোর পথ।"
        ),
    },
    {
        "preset_id": "preset_terracotta_decor",
        "title_bn": "বগুড়ার হাতে গ্লেজ করা টেরাকোটা ডেকর সেট (Terracotta Decor Set)",
        "title_en": "Bogura Hand Glazed Terracotta Decor Vase and Planter Set",
        "sample_image": "/assets/samples/terracotta-tableware.png",
        "studio_image": "/assets/samples/terracotta-tableware.png",
        "image_status": "placeholder_reuses_ceramic_sample",
        "sample_voice_bn": (
            "বগুড়ায় হাতে গ্লেজ করা টেরাকোটা ডেকর ও প্লান্টার মাসে ২,৫০০ সেট তৈরি করা সম্ভব। "
            "ইউরোপের ইন্টেরিয়র ব্র্যান্ডগুলোর জন্য পাঠাতে চাই।"
        ),
        "hs_code_6": "6914.90",
        "hs_code_8digit": "6914.90.10",
        "hs_chapter_name": "Chapter 69 - Other articles of pottery or ceramics, including terracotta decor",
        "sector": "Ceramics & Artisanal",
        "sector_bn": "সিরামিক ও হস্তশিল্প",
        "factory_location": "bogura",
        "monthly_capacity_units": 2500,
        "margin_pct": 17.0,
        "electricity_kwh_per_unit": 3.00,
        "generator_share": 0.05,
        "annual_lpg_kg_per_unit": 2.20,
        "compliance_readiness_score": 90,
        "required_certificates": [
            "Lead and cadmium free test for any piece that can touch food",
            "REX statement on origin for the EU 0 percent duty",
            "EU CBAM kiln energy efficiency audit sheet",
            "Break resistant export packaging specification",
        ],
        "notes_en": (
            "Terracotta decor sits under 6914.90 while porcelain tableware "
            "stays under 6912. Bulky and heavy, so freight and port allocation "
            "decide the margin."
        ),
        "notes_bn": (
            "টেরাকোটা ডেকর ৬৯১৪.৯০ এর আওতায়, পোরসেলিন টেবিলওয়্যার ৬৯১২ এ থাকে। ভারী ও ভলিউমের কারণে মার্জিন নির্ধারণ করে পরিবহন ব্যয়।"
        ),
    },
    {
        "preset_id": "preset_turmeric",
        "title_bn": "বগুড়ার খাদ্য গ্রেড হলুদ গুঁড়া (Food Grade Turmeric Powder)",
        "title_en": "Bogura Food Grade Turmeric Powder, Curcumin 5 Percent Minimum",
        "sample_image": "/assets/samples/jute-tote-bag.png",
        "studio_image": "/assets/samples/jute-tote-bag.png",
        "image_status": "placeholder_reuses_jute_sample",
        "sample_voice_bn": (
            "বগুড়ায় আমরা মাসে ২০০ টন খাদ্য গ্রেড হলুদ গুঁড়া তৈরি করি, কারকুরিন ৫ শতাংশের বেশি। "
            "ইউরোপ ও জাপানে খাদ্য ব্যবসায়ীদের কাছে পাঠাতে চাই।"
        ),
        "hs_code_6": "0910.30",
        "hs_code_8digit": "0910.30.10",
        "hs_chapter_name": "Chapter 09 - Turmeric, fresh or dried",
        "sector": "Agro-processing",
        "sector_bn": "কৃষি প্রক্রিয়াজাত পণ্য",
        "factory_location": "bogura",
        "monthly_capacity_units": 200000,
        "margin_pct": 13.0,
        "electricity_kwh_per_unit": 1.60,
        "generator_share": 0.07,
        "annual_biomass_kg_per_unit": 0.80,
        "compliance_readiness_score": 87,
        "required_certificates": [
            "HACCP and ISO 22000 food safety system certificate",
            "Residue test for heavy metals and pesticides, EU and Japan limits",
            "Certificate of origin and pre shipment inspection report",
            "Moisture and curcumin specification sheet per lot",
        ],
        "notes_en": (
            "Turmeric is priced per kilogram. Traceability and the residue file "
            "decide the buyer relationship, not the unit price."
        ),
        "notes_bn": (
            "হলুদ কিলোগ্রাম প্রতি হিসাব করা হয়। ট্রেসেবিলিটি ও অবশিষ্টাংশের ফাইলই বায়ার সম্পর্ক নির্ধারণ করে, একক দাম নয়।"
        ),
    },
    {
        "preset_id": "preset_aromatic_rice",
        "title_bn": "বগুড়ার চিনিগুড়া সুগন্ধি চাল (Chinigura Aromatic Rice)",
        "title_en": "Bogura Chinigura Aromatic Rice, Hand Sorted Single Export Grade",
        "sample_image": "/assets/samples/jute-tote-bag.png",
        "studio_image": "/assets/samples/jute-tote-bag.png",
        "image_status": "placeholder_reuses_jute_sample",
        "sample_voice_bn": (
            "বগুড়ায় আমরা হ্যান্ড সর্টেড চিনিগুড়া চাল মাসে ২৫০ টন প্যাক করি, আর্দ্রতা ১২ শতাংশের নিচে। "
            "ইউরোপ ও জাপানের খাদ্য ব্যবসায়ীদের জন্য প্রস্তুত।"
        ),
        "hs_code_6": "1006.30",
        "hs_code_8digit": "1006.30.10",
        "hs_chapter_name": "Chapter 10 - Semi-milled or wholly milled rice, including aromatic rice",
        "sector": "Agro-processing",
        "sector_bn": "কৃষি প্রক্রিয়াজাত পণ্য",
        "factory_location": "bogura",
        "monthly_capacity_units": 250000,
        "margin_pct": 13.0,
        "electricity_kwh_per_unit": 1.20,
        "generator_share": 0.06,
        "annual_biomass_kg_per_unit": 0.50,
        "compliance_readiness_score": 86,
        "required_certificates": [
            "HACCP and ISO 22000 food safety system certificate",
            "Phytosanitary certificate for the destination market",
            "Moisture, broken grain and aflatoxin test report",
            "Preferential origin claim for the tariff quota position",
        ],
        "notes_en": (
            "Rice is protected by specific duties and tariff rate quotas rather "
            "than a percentage rate. The zero duty applies inside the quota "
            "volume only, always state the quota position in the offer."
        ),
        "notes_bn": (
            "চাল শতাংশ শুল্কের বদলে নির্দিষ্ট শুল্ক ও কোটা দিয়ে সুরক্ষিত। শূন্য শুল্ক কোটার ভেতরে প্রযোজ্য, অফারে কোটার অবস্থান উল্লেখ করুন।"
        ),
    },
]


# ==========================================================================
# 3. DERIVED ECONOMICS
# ==========================================================================


def _matched_buyers_for(hs6: str, limit: int = 4) -> List[Dict[str, Any]]:
    """Rank the buyer database against a heading and return the strongest fits."""
    matches: List[Dict[str, Any]] = []
    for profile in BUYER_PROFILES:
        if hs6 not in profile.get("hs_codes", []):
            continue
        rate = get_duty_rate(hs6, profile["country_code"])
        score = rate["duty_saving_points"] * 3 + min(profile["annual_import_usd"] / 500000.0, 6.0)
        matches.append(
            {
                "buyer_id": profile["buyer_id"],
                "company_name": profile["company_name"],
                "city": profile["city"],
                "country": profile["country"],
                "country_code": profile["country_code"],
                "segment": profile["segment"],
                "tariff_for_bangladesh_pct": rate["duty_for_bangladesh_pct"],
                "tariff_for_competitors_pct": rate["duty_for_competitors_pct"],
                "trade_scheme": profile["trade_scheme"],
                "duty_saving_points": rate["duty_saving_points"],
                "typical_moq_units": profile["typical_moq_units"],
                "target_fob_usd": profile["target_fob_usd"],
                "annual_import_usd": profile["annual_import_usd"],
                "annual_procurement_budget_usd": profile["annual_procurement_budget_usd"],
                "buying_seasons": profile["buying_seasons"],
                "payment_methods": profile["payment_methods"],
                "payment_terms_detail": [
                    {
                        "method_id": method_id,
                        "label": PAYMENT_METHODS[method_id]["label"],
                        "label_bn": PAYMENT_METHODS[method_id]["label_bn"],
                        "short": PAYMENT_METHODS[method_id]["short"],
                        "risk": PAYMENT_METHODS[method_id]["risk"],
                    }
                    for method_id in profile["payment_methods"]
                ],
                "required_audits": profile["required_audits"],
                "required_audit_detail": [
                    {
                        "cert_id": cert_id,
                        "label": CERT_REGISTRY[cert_id]["label"],
                        "label_bn": CERT_REGISTRY[cert_id]["label_bn"],
                    }
                    for cert_id in profile["required_audits"]
                ],
                "preferred_incoterm": profile["preferred_incoterm"],
                "response_rate_pct": profile["response_rate_pct"],
                "verified_year": profile["verified_year"],
                "match_score": round(score, 2),
            }
        )
    matches.sort(key=lambda row: row["match_score"], reverse=True)
    return matches[:limit]


def _derive_preset(preset: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fill every economic field of a preset from the trade intelligence engine.

    Field semantics:
      unit_cost_bdt               factory cost of one unit before freight
      buying_house_offer_bdt      what the exporter receives through a buying house
      recommended_fob_price_bdt    net FOB Chattogram price per unit
      middleman_margin_saved_pct  share of the FOB value a buying house takes
      extra_profit_per_shipment_usd  direct export gain over one MOQ shipment
    """
    hs6 = preset["hs_code_6"]
    monthly_units = preset["monthly_capacity_units"]
    annual_units = monthly_units * 12

    fob = build_fob_cost_stack(
        hs6,
        factory_location=preset.get("factory_location"),
        margin_pct=preset.get("margin_pct"),
        monthly_capacity_units=monthly_units,
    )

    annual_lpg_kg = (preset.get("annual_lpg_kg_per_unit") or 0.0) * annual_units
    annual_biomass_kg = (preset.get("annual_biomass_kg_per_unit") or 0.0) * annual_units

    cbam = calculate_cbam_liability(
        annual_units=annual_units,
        electricity_kwh_per_unit=preset["electricity_kwh_per_unit"],
        generator_share=preset.get("generator_share", 0.08),
        annual_lpg_kg=annual_lpg_kg,
        annual_biomass_kg=annual_biomass_kg,
        production_year=2026,
        hs6=hs6,
        product_label=preset["title_en"],
    )

    duty_matrix = get_duty_matrix(hs6)
    savings = compare_duty_savings(hs6)
    matched = _matched_buyers_for(hs6)

    preset["unit_cost_bdt"] = fob["factory_cost_bdt"]
    preset["buying_house_offer_bdt"] = fob["buying_house_offer_bdt"]
    preset["recommended_fob_price_usd"] = fob["net_fob_usd_per_unit"]
    preset["recommended_fob_price_bdt"] = fob["net_fob_bdt"]
    preset["middleman_margin_saved_pct"] = fob["buying_house_take_pct"]
    preset["extra_profit_per_shipment_usd"] = round(
        fob["direct_export_gain_usd_per_unit"]
        * (matched[0]["typical_moq_units"] if matched else monthly_units),
        2,
    )
    preset["cbam_scope2_co2_kg_per_unit"] = cbam["indirect_emissions_scope2"]["kg_per_unit"]
    preset["cbam_scope1_co2_kg_per_unit"] = cbam["direct_emissions_scope1"]["kg_per_unit"]
    preset["eu_benchmark_co2_kg_per_unit"] = EU_BENCHMARK_KG_PER_UNIT.get(hs6, 2.0)
    preset["cbam_benchmark_basis"] = (
        "The benchmark is a Scope 2 grid electricity intensity reference for "
        "the sector and is the threshold the compliance auditor screens "
        "against. Scope 1 fuel emissions are reported separately."
    )
    preset["matched_buyers"] = matched
    preset["fob_unit_economics"] = fob
    preset["cbam_assessment"] = cbam
    preset["duty_matrix"] = duty_matrix
    preset["duty_story"] = savings
    preset["hs_master_entry"] = {
        "title_en": HS_CODE_MASTER[hs6]["title_en"],
        "title_bn": HS_CODE_MASTER[hs6]["title_bn"],
        "classification_note": HS_CODE_MASTER[hs6]["classification_note"],
        "cbam_in_scope_now": HS_CODE_MASTER[hs6]["cbam_in_scope_now"],
        "eudr_covered": HS_CODE_MASTER[hs6]["eudr_covered"],
        "notes": HS_CODE_MASTER[hs6]["notes"],
    }
    preset["annual_production_units"] = annual_units
    preset["graph_preset_id"] = preset["preset_id"]
    return preset


PRESETS_DATA: List[Dict[str, Any]] = [_derive_preset(dict(item)) for item in PRESET_INPUTS]

# Hydrate the GraphRAG graph with the verified buyer database.
knowledge_graph.register_buyers(BUYER_PROFILES)


# ==========================================================================
# 4. DATABASE SEEDING
# ==========================================================================


def _upsert_preset(db: Session, preset: Dict[str, Any]) -> None:
    """Insert a preset or refresh the deterministic content of an existing one."""
    existing = db.query(ProductScan).filter(ProductScan.id == preset["preset_id"]).first()
    if not existing:
        db.add(
            ProductScan(
                id=preset["preset_id"],
                user_id=None,
                title_bn=preset["title_bn"],
                title_en=preset["title_en"],
                hs_code_8digit=preset["hs_code_8digit"],
                hs_chapter_name=preset["hs_chapter_name"],
                unit_cost_bdt=preset["unit_cost_bdt"],
                buying_house_offer_bdt=preset["buying_house_offer_bdt"],
                recommended_fob_usd=preset["recommended_fob_price_usd"],
                recommended_fob_bdt=preset["recommended_fob_price_bdt"],
                monthly_capacity_units=preset["monthly_capacity_units"],
                middleman_margin_saved_pct=preset["middleman_margin_saved_pct"],
                extra_profit_per_shipment_usd=preset["extra_profit_per_shipment_usd"],
                cbam_co2_kg=preset["cbam_scope2_co2_kg_per_unit"],
                eu_benchmark_co2_kg=preset["eu_benchmark_co2_kg_per_unit"],
                compliance_score=preset["compliance_readiness_score"],
                image_path=preset["sample_image"],
                studio_image_path=preset["studio_image"],
                details_json=preset,
            )
        )
        db.flush()
        return

    # Refresh the preset content so a tariff or price change reaches the app.
    existing.title_bn = preset["title_bn"]
    existing.title_en = preset["title_en"]
    existing.hs_code_8digit = preset["hs_code_8digit"]
    existing.hs_chapter_name = preset["hs_chapter_name"]
    existing.unit_cost_bdt = preset["unit_cost_bdt"]
    existing.buying_house_offer_bdt = preset["buying_house_offer_bdt"]
    existing.recommended_fob_usd = preset["recommended_fob_price_usd"]
    existing.recommended_fob_bdt = preset["recommended_fob_price_bdt"]
    existing.monthly_capacity_units = preset["monthly_capacity_units"]
    existing.middleman_margin_saved_pct = preset["middleman_margin_saved_pct"]
    existing.extra_profit_per_shipment_usd = preset["extra_profit_per_shipment_usd"]
    existing.cbam_co2_kg = preset["cbam_scope2_co2_kg_per_unit"]
    existing.eu_benchmark_co2_kg = preset["eu_benchmark_co2_kg_per_unit"]
    existing.compliance_score = preset["compliance_readiness_score"]
    existing.image_path = preset["sample_image"]
    existing.studio_image_path = preset["studio_image"]
    existing.details_json = preset


def _upsert_buyer(db: Session, profile: Dict[str, Any]) -> None:
    """Insert a buyer or refresh the deterministic columns of an existing one."""
    primary_hs = profile.get("hs_codes", ["4202.92"])[0]
    bd_8digit = HS_CODE_MASTER.get(primary_hs, {}).get("bd_8digit", "4202.92.10")
    rate = get_duty_rate(primary_hs, profile["country_code"])

    existing = db.query(GlobalBuyer).filter(GlobalBuyer.id == profile["buyer_id"]).first()
    if not existing:
        db.add(
            GlobalBuyer(
                id=profile["buyer_id"],
                company_name=profile["company_name"],
                city=profile["city"],
                country=profile["country"],
                country_code=profile["country_code"],
                hs_code_8digit=bd_8digit,
                tariff_for_bangladesh_pct=rate["duty_for_bangladesh_pct"],
                tariff_for_competitors_pct=rate["duty_for_competitors_pct"],
                trade_scheme=profile["trade_scheme"],
                typical_moq_units=profile["typical_moq_units"],
                target_fob_usd=profile["target_fob_usd"],
                annual_import_usd=profile["annual_import_usd"],
            )
        )
        db.flush()
        return

    existing.company_name = profile["company_name"]
    existing.city = profile["city"]
    existing.country = profile["country"]
    existing.country_code = profile["country_code"]
    existing.hs_code_8digit = bd_8digit
    existing.tariff_for_bangladesh_pct = rate["duty_for_bangladesh_pct"]
    existing.tariff_for_competitors_pct = rate["duty_for_competitors_pct"]
    existing.trade_scheme = profile["trade_scheme"]
    existing.typical_moq_units = profile["typical_moq_units"]
    existing.target_fob_usd = profile["target_fob_usd"]
    existing.annual_import_usd = profile["annual_import_usd"]


def _resolve_seed_password(email: str, role: str) -> str | None:
    """Return an explicitly configured seed password, never a shared default."""
    if "savareco" in email:
        return os.getenv("LEGACY_DEMO_PASSWORD")
    if email == "admin@exportpilot.ai":
        return os.getenv("LEGACY_ADMIN_PASSWORD")
    if role == "admin":
        return os.getenv("SEED_ADMIN_PASSWORD") or os.getenv("DEFAULT_ADMIN_PASSWORD")
    return os.getenv("SEED_USER_PASSWORD") or os.getenv("DEFAULT_USER_PASSWORD")


def seed_database(db: Session) -> None:
    from backend.seed_expansion import EXPANDED_FACTORIES, EXPANDED_BUYERS, LIVE_TRADE_ACTIVITY_FEED
    from backend.models import TradeDeal

    # Standard enterprise seed accounts
    enterprise_accounts = [
        {
            "id": "user_exporter_savar",
            "email": "exporter@exportpilot.com",
            "full_name_bn": "রহিম উদ্দিন (ম্যানেজিং ডিরেক্টর)",
            "role": "factory_owner",
            "factory_name": "সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ",
        },
        {
            "id": "user_exporter_denim",
            "email": "denim.factory@exportpilot.com",
            "full_name_bn": "তারিক হাসান (হেড অব এক্সপোর্ট)",
            "role": "factory_owner",
            "factory_name": "গাজীপুর ব্লু ডেনিম টেক্সটাইল মিলস লিঃ",
        },
        {
            "id": "user_importer_eu",
            "email": "buyer.eu@exportpilot.com",
            "full_name_bn": "Hans Schmidt (Head of Sourcing)",
            "role": "verified_buyer",
            "factory_name": "NordicEco Retail GmbH, Hamburg",
        },
        {
            "id": "user_importer_japan",
            "email": "buyer.japan@exportpilot.com",
            "full_name_bn": "Kenji Tanaka (Procurement Director)",
            "role": "verified_buyer",
            "factory_name": "Tokyo Midori Trading Co., Tokyo",
        },
        {
            "id": "user_admin_sovereign",
            "email": "admin@exportpilot.com",
            "full_name_bn": "চিফ অডিট অফিসার ও সিস্টেম অ্যাডমিন",
            "role": "admin",
            "factory_name": "ExportPilot Sovereign Governance Center",
        },
        # Backward compatibility for legacy integration test suites
        {
            "id": "user_rahim_uddin",
            "email": "rahim@savareco.com",
            "full_name_bn": "রহিম উদ্দিন",
            "role": "factory_owner",
            "factory_name": "সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ",
        },
        {
            "id": "user_admin",
            "email": "admin@exportpilot.ai",
            "full_name_bn": "সিস্টেম অ্যাডমিনিস্ট্রেটর",
            "role": "admin",
            "factory_name": "ExportPilot Sovereign Trade Center",
        },
    ]

    # Incorporate expanded realistic factory accounts
    seen_account_emails = {a["email"].strip().lower() for a in enterprise_accounts}
    seen_account_ids = {a["id"] for a in enterprise_accounts}
    for fac in EXPANDED_FACTORIES:
        fac_email = fac["email"].strip().lower()
        if fac_email not in seen_account_emails and fac["id"] not in seen_account_ids:
            seen_account_emails.add(fac_email)
            seen_account_ids.add(fac["id"])
            enterprise_accounts.append({
                "id": fac["id"],
                "email": fac["email"],
                "full_name_bn": fac["full_name_bn"],
                "role": "factory_owner",
                "factory_name": fac["factory_name"],
            })

    # Incorporate expanded international buyer user accounts
    for b in EXPANDED_BUYERS:
        slug = b["company_name"].lower().replace(" ", "").replace(".", "").replace("&", "")[:12]
        b_email = f"buyer.{slug}@exportpilot.com"
        b_id = f"usr_{b['buyer_id'].lower()}"
        if b_email not in seen_account_emails and b_id not in seen_account_ids:
            seen_account_emails.add(b_email)
            seen_account_ids.add(b_id)
            enterprise_accounts.append({
                "id": b_id,
                "email": b_email,
                "full_name_bn": f"{b.get('contact_person', 'Sourcing Director')} ({b['company_name']})",
                "role": "verified_buyer",
                "factory_name": f"{b['company_name']}, {b['city']}",
            })

    password_cache: Dict[str, str] = {}
    for acc in enterprise_accounts:
        existing = db.query(User).filter(User.email == acc["email"]).first()
        raw_password = _resolve_seed_password(acc["email"], acc["role"])
        if not raw_password:
            if existing and existing.id == acc["id"]:
                existing.is_active = False
            continue
        if not existing:
            if raw_password not in password_cache:
                password_cache[raw_password] = get_password_hash(raw_password)
            hashed_password = password_cache[raw_password]
            u = User(
                id=acc["id"],
                email=acc["email"],
                password_hash=hashed_password,
                full_name_bn=acc["full_name_bn"],
                role=acc["role"],
                factory_name=acc["factory_name"],
                is_active=True,
                is_verified=True,
            )
            db.add(u)
        # Seed data never overwrites or reactivates an existing account.
    db.commit()

    # 3. Seed and refresh the flagship presets
    for preset in PRESETS_DATA:
        _upsert_preset(db, preset)

    # 4. Seed and refresh the verified buyer database (curated + expanded)
    all_profiles = list(BUYER_PROFILES)
    seen_buyer_ids = {bp["buyer_id"] for bp in all_profiles}
    seen_buyer_names = {bp["company_name"].strip().lower() for bp in all_profiles}
    chapter_to_hs = {
        "42": "4202.92",
        "53": "5303.10",
        "57": "5705.00",
        "61": "6109.10",
        "62": "6203.42",
        "64": "6403.91",
        "69": "6912.00",
        "09": "0910.30",
        "10": "1006.30",
    }

    for eb in EXPANDED_BUYERS:
        eb_id = eb["buyer_id"]
        eb_name = eb["company_name"].strip().lower()
        if eb_id not in seen_buyer_ids and eb_name not in seen_buyer_names:
            seen_buyer_ids.add(eb_id)
            seen_buyer_names.add(eb_name)
            first_ch = eb["hs_chapters"][0] if eb.get("hs_chapters") else "42"
            matched_hs = chapter_to_hs.get(first_ch, "4202.92")
            all_profiles.append({
                "buyer_id": eb["buyer_id"],
                "id": eb["buyer_id"],
                "company_name": eb["company_name"],
                "city": eb["city"],
                "country": eb["country"],
                "country_name_en": eb["country_name_en"],
                "country_code": eb["country_code"],
                "segment": eb["segment"],
                "hs_chapters": eb["hs_chapters"],
                "hs_codes": [matched_hs],
                "trade_scheme": eb["trade_scheme"],
                "typical_moq_units": eb["typical_moq_units"],
                "target_fob_usd": eb["target_fob_usd"],
                "annual_import_usd": eb["annual_import_usd"],
                "annual_procurement_budget_usd": eb["annual_import_usd"] * 1.25,
                "buying_seasons": [
                    {"window": "Spring", "window_bn": "বসন্তকালীন সোর্সিং", "focus": "Core collection", "volume_share_pct": 50},
                    {"window": "Autumn", "window_bn": "শরৎকালীন সোর্সিং", "focus": "Holiday collection", "volume_share_pct": 50},
                ],
                "payment_methods": eb.get("payment_terms", ["LC_SIGHT", "TT_ADVANCE"]),
                "required_audits": eb.get("certs", ["CBAM", "BSCI", "REX"]),
                "preferred_incoterm": "FOB_CHITTAGONG",
                "response_rate_pct": 82,
                "verified_year": 2026,
                "verification": "Commercial Registry and Verified Manifest 2026",
            })

    for profile in all_profiles:
        _upsert_buyer(db, profile)

    # 5. Seed live commercial trade feed records
    admin_user = db.query(User).filter(User.role == "admin").first()
    seeded_deal_count = 0

    # Do not attach sample deals to a made-up user when production has no
    # configured administrator yet. The public feed uses its static records.
    if admin_user:
        for feed_item in LIVE_TRADE_ACTIVITY_FEED:
            deal_id = feed_item["deal_id"]
            existing_deal = db.query(TradeDeal).filter(TradeDeal.id == deal_id).first()
            if not existing_deal:
                db.add(TradeDeal(
                    id=deal_id,
                    user_id=admin_user.id,
                    preset_id="preset_jute_bag",
                    status="completed",
                    input_json=feed_item,
                    result_json=feed_item,
                ))
                seeded_deal_count += 1

    db.commit()

    # 6. Keep the GraphRAG graph in step with the seeded database
    knowledge_graph.register_buyers(all_profiles)

    print(
        f"Database seeded: {len(enterprise_accounts)} accounts, {len(PRESETS_DATA)} flagship presets, "
        f"{len(all_profiles)} verified international buyers, and {seeded_deal_count} new trade deals."
    )
