/**
 * Shared, sourced trade constants for client-side interactive widgets.
 * Every value mirrors the server-side model in backend/hybrid_rag.py so the
 * browser widgets and the backend calculators cannot drift apart. Freight and
 * insurance figures are illustrative planning bands that a forwarder must
 * confirm before contracting.
 */

// Bangladesh Bank customs exchange rate card, October 2026.
export const BDT_PER_USD = 123.53;

// ECB reference rate, 20 October 2026.
export const EUR_USD = 1.1215;

// BPDB national grid emission factor (kg CO2e per kWh).
export const GRID_EF_KG_PER_KWH = 0.58;

// IPCC default for stationary diesel combustion (kg CO2e per litre).
export const DIESEL_EF_KG_PER_LITRE = 2.68;

// Rooftop solar yield in Bangladesh (kWh per kWp per year).
export const SOLAR_YIELD_KWH_PER_KWP_YEAR = 1350;

// EU ETS carbon allowance band (EUR per tonne CO2e).
export const ETS_EUR = { low: 65, baseline: 70, high: 75 } as const;

// CBAM chargeable phase-in share by production year, Regulation (EU) 2023/956.
export const CBAM_PHASE_IN: Record<number, number> = {
  2026: 2.5,
  2027: 5.0,
  2028: 10.0,
  2029: 22.5,
  2030: 48.5,
  2031: 61.0,
  2032: 73.5,
  2033: 86.0,
  2034: 100.0,
};

export const CBAM_PHASE_IN_YEARS = Object.keys(CBAM_PHASE_IN).map(Number).sort();

// Cargo planning figures for a 20ft container.
export const CBM_PER_20FT = 28;

// Marine insurance band as a share of CIF value.
export const INSURANCE_PCT = { min: 0.15, baseline: 0.2, max: 0.3 } as const;

export interface TradeRoute {
  id: 'hamburg' | 'london' | 'tokyo';
  labelBn: string;
  labelEn: string;
  freight20ftUsd: number;
  transitDays: number;
  dutyBn: string;
  dutyEn: string;
}

// Illustrative freight planning bands; confirm with the appointed forwarder.
export const TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'hamburg',
    labelBn: 'হামবুর্গ, জার্মানি',
    labelEn: 'Hamburg, Germany',
    freight20ftUsd: 1850,
    transitDays: 32,
    dutyBn: 'EU EBA: বাংলাদেশে ০% শুল্ক (প্রতিযোগীদের ৬.৫-৮%)',
    dutyEn: 'EU EBA: 0% duty for Bangladesh (competitors pay 6.5-8%)',
  },
  {
    id: 'london',
    labelBn: 'লন্ডন, যুক্তরাজ্য',
    labelEn: 'London, United Kingdom',
    freight20ftUsd: 1750,
    transitDays: 30,
    dutyBn: 'UK DCTS: বাংলাদেশে ০% শুল্ক',
    dutyEn: 'UK DCTS: 0% duty for Bangladesh',
  },
  {
    id: 'tokyo',
    labelBn: 'টোকিও, জাপান',
    labelEn: 'Tokyo, Japan',
    freight20ftUsd: 1400,
    transitDays: 18,
    dutyBn: 'Japan DFQF: এলডিসি হিসেবে ০% শুল্ক',
    dutyEn: 'Japan DFQF: 0% duty for LDCs',
  },
];

// Destination-side broker and release planning fee per container (USD).
export const DESTINATION_BROKER_USD_PER_20FT = 150;

export const fmtUsd = (v: number): string =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtBdt = (v: number): string =>
  v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' BDT';
