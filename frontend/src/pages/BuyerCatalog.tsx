import React, { useState, useMemo, useEffect } from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {RfqCreateModal} from '../components/RfqCreateModal';
import {Megaphone} from 'lucide-react';
import {LiveTradeFeed} from '../components/LiveTradeFeed';
import {BuyerRFQBoard} from '../components/BuyerRFQBoard';

import {Search, Filter, Award, ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, X} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Country = 'Germany' | 'France' | 'Japan' | 'USA' | 'UK' | 'Netherlands' | 'Sweden' | 'Italy' | 'Belgium' | 'Denmark' | 'Canada' | 'Australia';
type Cert    = 'CBAM' | 'BSCI' | 'Oeko-Tex' | 'GRS' | 'LWG' | 'REX' | 'GOTS';
type Payment = 'L/C' | 'CAD' | 'T/T' | 'D/P';
type SortKey = 'company_name' | 'country' | 'moq' | 'fob' | 'annual_import' | 'tariff';
type SortDir = 'asc' | 'desc';

interface BuyerRecord {
  id: string;
  company_name: string;
  city: string;
  country: Country;
  segment: string;
  hs_chapters: string[];
  tariff_bd_pct: number;
  trade_scheme: string;
  moq: number;
  fob_target_usd: number;
  annual_import_usd: number;
  payment_terms: Payment[];
  certs: Cert[];
  contact_ready: boolean;
  preset_id?: string;
}

const getPresetForBuyer = (b: BuyerRecord): string => {
  if (b.preset_id) return b.preset_id;
  const ch = b.hs_chapters && b.hs_chapters[0];
  if (ch === '64') return 'preset_leather_boot';
  if (ch === '69') return 'preset_terracotta';
  if (ch === '62') return 'preset_denim_jacket';
  if (ch === '42' || ch === '53') return 'preset_jute_bag';
  return 'preset_jute_bag';
};

/* ------------------------------------------------------------------ */
/* Illustrative reference profiles only. They are not verified prospects. */
/* ------------------------------------------------------------------ */
const BUYERS: BuyerRecord[] = [
  {
    id: 'b001', company_name: 'NordicEco Retail GmbH', city: 'Hamburg', country: 'Germany',
    segment: 'Sustainable Home Goods', hs_chapters: ['42', '53'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 5000, fob_target_usd: 3.40,
    annual_import_usd: 1_450_000, payment_terms: ['L/C', 'T/T'], certs: ['CBAM', 'BSCI', 'REX'],
    contact_ready: true,
  },
  {
    id: 'b002', company_name: 'Bayern Craft Imports AG', city: 'Munich', country: 'Germany',
    segment: 'Artisan Ceramics & Decor', hs_chapters: ['69'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 2000, fob_target_usd: 11.20,
    annual_import_usd: 870_000, payment_terms: ['CAD', 'L/C'], certs: ['CBAM', 'Oeko-Tex', 'REX'],
    contact_ready: true,
  },
  {
    id: 'b003', company_name: 'Paris Textile Collective SAS', city: 'Lyon', country: 'France',
    segment: 'Fashion Accessories', hs_chapters: ['42', '62'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 3000, fob_target_usd: 8.50,
    annual_import_usd: 2_100_000, payment_terms: ['L/C'], certs: ['BSCI', 'Oeko-Tex', 'CBAM'],
    contact_ready: true,
  },
  {
    id: 'b004', company_name: 'Tokyo Midori Lifestyle Ltd.', city: 'Tokyo', country: 'Japan',
    segment: 'Eco Lifestyle Products', hs_chapters: ['42', '53'],
    tariff_bd_pct: 0, trade_scheme: 'Japan DFQF', moq: 8000, fob_target_usd: 3.80,
    annual_import_usd: 980_000, payment_terms: ['T/T', 'D/P'], certs: ['BSCI', 'GRS', 'REX'],
    contact_ready: true,
  },
  {
    id: 'b005', company_name: 'Osaka Craft Footwear KK', city: 'Osaka', country: 'Japan',
    segment: 'Premium Leather Footwear', hs_chapters: ['64'],
    tariff_bd_pct: 0, trade_scheme: 'Japan DFQF', moq: 1200, fob_target_usd: 24.50,
    annual_import_usd: 1_650_000, payment_terms: ['L/C', 'CAD'], certs: ['LWG', 'BSCI', 'REX'],
    contact_ready: true,
  },
  {
    id: 'b006', company_name: 'Green Harbor Imports LLC', city: 'New York', country: 'USA',
    segment: 'Sustainable Home Textiles', hs_chapters: ['53', '62'],
    tariff_bd_pct: 15.0, trade_scheme: 'MFN (GSP Pending)', moq: 10000, fob_target_usd: 4.20,
    annual_import_usd: 3_200_000, payment_terms: ['L/C', 'T/T'], certs: ['GOTS', 'BSCI'],
    contact_ready: false,
  },
  {
    id: 'b007', company_name: 'Thames Streetwear Collective Ltd.', city: 'London', country: 'UK',
    segment: 'Recycled Denim Fashion', hs_chapters: ['62'],
    tariff_bd_pct: 0, trade_scheme: 'UK DCTS', moq: 4000, fob_target_usd: 13.80,
    annual_import_usd: 3_400_000, payment_terms: ['L/C', 'CAD'], certs: ['GRS', 'Oeko-Tex', 'BSCI'],
    contact_ready: true,
  },
  {
    id: 'b008', company_name: 'Edinburgh Natural Living PLC', city: 'Edinburgh', country: 'UK',
    segment: 'Eco Homewares', hs_chapters: ['42', '69'],
    tariff_bd_pct: 0, trade_scheme: 'UK DCTS', moq: 2500, fob_target_usd: 9.80,
    annual_import_usd: 760_000, payment_terms: ['T/T', 'L/C'], certs: ['CBAM', 'Oeko-Tex', 'REX'],
    contact_ready: true,
  },
  {
    id: 'b009', company_name: 'Amsterdam Green Wholesale BV', city: 'Amsterdam', country: 'Netherlands',
    segment: 'Organic Textiles & Accessories', hs_chapters: ['42', '53', '62'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 6000, fob_target_usd: 5.60,
    annual_import_usd: 1_820_000, payment_terms: ['CAD', 'T/T'], certs: ['CBAM', 'GOTS', 'BSCI'],
    contact_ready: true,
  },
  {
    id: 'b010', company_name: 'Nordic Circular Apparel AB', city: 'Stockholm', country: 'Sweden',
    segment: 'Circular Fashion RMG', hs_chapters: ['62'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 5000, fob_target_usd: 14.20,
    annual_import_usd: 2_800_000, payment_terms: ['L/C'], certs: ['GRS', 'Oeko-Tex', 'CBAM'],
    contact_ready: true,
  },
  {
    id: 'b011', company_name: 'Milano Calzature SpA', city: 'Milan', country: 'Italy',
    segment: 'Leather Footwear Wholesale', hs_chapters: ['64'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 800, fob_target_usd: 26.00,
    annual_import_usd: 1_900_000, payment_terms: ['L/C', 'CAD'], certs: ['LWG', 'REX', 'CBAM'],
    contact_ready: true,
  },
  {
    id: 'b012', company_name: 'Brussels Bio Home BVBA', city: 'Brussels', country: 'Belgium',
    segment: 'Sustainable Ceramics & Decor', hs_chapters: ['69'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 1500, fob_target_usd: 12.40,
    annual_import_usd: 540_000, payment_terms: ['T/T', 'D/P'], certs: ['CBAM', 'Oeko-Tex'],
    contact_ready: false,
  },
  {
    id: 'b013', company_name: 'Copenhagen Living ApS', city: 'Copenhagen', country: 'Denmark',
    segment: 'Scandi Lifestyle Goods', hs_chapters: ['42', '69'],
    tariff_bd_pct: 0, trade_scheme: 'EU EBA', moq: 3000, fob_target_usd: 7.20,
    annual_import_usd: 690_000, payment_terms: ['CAD', 'L/C'], certs: ['CBAM', 'BSCI', 'Oeko-Tex'],
    contact_ready: true,
  },
  {
    id: 'b014', company_name: 'Pacific Rim Sourcing Corp.', city: 'Los Angeles', country: 'USA',
    segment: 'Ethnic Craft & Home Decor', hs_chapters: ['42', '69'],
    tariff_bd_pct: 12.5, trade_scheme: 'MFN', moq: 5000, fob_target_usd: 6.80,
    annual_import_usd: 4_100_000, payment_terms: ['L/C', 'T/T'], certs: ['BSCI'],
    contact_ready: false,
  },
];

// Force all illustrative profiles to non-contact-ready state for safety
BUYERS.forEach((buyer) => { buyer.contact_ready = false; });

/* ------------------------------------------------------------------ */
/* Filter options                                                      */
/* ------------------------------------------------------------------ */
const COUNTRIES: Country[]    = ['Germany', 'France', 'Japan', 'USA', 'UK', 'Netherlands', 'Sweden', 'Italy', 'Belgium', 'Denmark', 'Canada', 'Australia'];
const CERTS: Cert[]           = ['CBAM', 'BSCI', 'Oeko-Tex', 'GRS', 'LWG', 'REX', 'GOTS'];
const PAYMENT_OPTS: Payment[] = ['L/C', 'CAD', 'T/T', 'D/P'];

const CERT_COLOR: Record<Cert, string> = {
  CBAM:    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  BSCI:    'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'Oeko-Tex': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  GRS:     'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  LWG:     'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  REX:     'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
  GOTS:    'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
};

const COUNTRY_FLAG: Record<Country, string> = {
  Germany: 'DE', France: 'FR', Japan: 'JP', USA: 'US', UK: 'GB',
  Netherlands: 'NL', Sweden: 'SE', Italy: 'IT', Belgium: 'BE', Denmark: 'DK',
  Canada: 'CA', Australia: 'AU',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export const BuyerCatalog: React.FC = () => {
  const { user, t } = useAuth();
  const canExport = user?.role === 'factory_owner' || user?.role === 'admin';

  /* Filter state */
  const [buyersList, setBuyersList]       = useState<BuyerRecord[]>(BUYERS);
  const [directoryNotice, setDirectoryNotice] = useState('');
  const [query, setQuery]                 = useState('');
  const [selCountries, setSelCountries]   = useState<Set<Country>>(new Set());
  const [selCerts, setSelCerts]           = useState<Set<Cert>>(new Set());
  const [selPayments, setSelPayments]     = useState<Set<Payment>>(new Set());
  const [maxMoq, setMaxMoq]              = useState<number>(50000);
  const [showFilters, setShowFilters]     = useState(false);
  const [denseRows, setDenseRows]       = useState(false);
  const [showRfqModal, setShowRfqModal]   = useState(false);
  const [rfqRefreshKey, setRfqRefreshKey] = useState(0);

  useEffect(() => {
    fetch('/api/v1/buyers')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.buyers && Array.isArray(data.buyers) && data.buyers.length > 0) {
          setBuyersList(data.buyers);
          setDirectoryNotice('');
        }
      })
      .catch(() => {
        // Keep the bundled reference list, but say so instead of failing
        // silently.
        setDirectoryNotice(t(
          'লাইভ ডিরেক্টরি এখন পাওয়া যায়নি। সাথে থাকা নমুনা তালিকা দেখানো হচ্ছে।',
          'The live directory is unavailable right now. The bundled sample list is shown.'
        ));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sort state */
  const [sortKey, setSortKey]   = useState<SortKey>('annual_import');
  const [sortDir, setSortDir]   = useState<SortDir>('desc');

  /* Active filter count */
  const filterCount = selCountries.size + selCerts.size + selPayments.size + (maxMoq < 50000 ? 1 : 0);

  /* Toggle helpers */
  const toggle = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const clearAll = () => {
    setSelCountries(new Set());
    setSelCerts(new Set());
    setSelPayments(new Set());
    setMaxMoq(50000);
    setQuery('');
  };

  /* CSV / JSON export of the filtered directory */
  const exportData = (format: 'csv' | 'json') => {
    const headers = ['Company', 'Country', 'MOQ', 'FOB Target (USD)', 'Annual Import (USD)', 'BD Tariff (%)', 'Certs'];
    const rows = filtered.map((b) => [
      b.company_name, b.country, String(b.moq), String(b.fob_target_usd),
      String(b.annual_import_usd), String(b.tariff_bd_pct), b.certs.join('; '),
    ]);
    let blob: Blob;
    let ext: string;
    if (format === 'csv') {
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join(String.fromCharCode(10));
      blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8' });
      ext = 'csv';
    } else {
      blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      ext = 'json';
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exportpilot-buyers-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* Sort handler */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  /* Derived: filter + sort */
  const filtered = useMemo(() => {
    return buyersList
      .filter(b => {
        const q = query.toLowerCase();
        if (q && !b.company_name.toLowerCase().includes(q) && !b.city.toLowerCase().includes(q) && !b.segment.toLowerCase().includes(q)) return false;
        if (selCountries.size > 0 && !selCountries.has(b.country)) return false;
        if (selCerts.size > 0 && ![...selCerts].every(c => b.certs.includes(c))) return false;
        if (selPayments.size > 0 && !b.payment_terms.some(p => selPayments.has(p))) return false;
        if (b.moq > maxMoq) return false;
        return true;
      })
      .sort((a, b) => {
        let av: string | number = 0;
        let bv: string | number = 0;
        if (sortKey === 'company_name') { av = a.company_name; bv = b.company_name; }
        else if (sortKey === 'country')   { av = a.country;       bv = b.country; }
        else if (sortKey === 'moq')       { av = a.moq;            bv = b.moq; }
        else if (sortKey === 'fob')       { av = a.fob_target_usd; bv = b.fob_target_usd; }
        else if (sortKey === 'annual_import') { av = a.annual_import_usd; bv = b.annual_import_usd; }
        else if (sortKey === 'tariff')    { av = a.tariff_bd_pct;  bv = b.tariff_bd_pct; }
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [buyersList, query, selCountries, selCerts, selPayments, maxMoq, sortKey, sortDir]);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 animate-fade-in">

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-gold">{t('নমুনা বাজার প্রোফাইল', 'Illustrative market profiles')}</span>
          <span className="badge badge-gold">{t('শুল্কের তথ্য যাচাই প্রয়োজন', 'Tariff data requires review')}</span>
        </div>
        {user?.role === 'verified_buyer' && (
          <button
            type="button"
            onClick={() => setShowRfqModal(true)}
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-bangla"
          >
            <Megaphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('নতুন চাহিদপত্র প্রকাশ করুন', 'Post a new RFQ')}</span>
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-bangla text-balance">
          {t('সম্ভাব্য আন্তর্জাতিক বাজার', 'Potential International Markets')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla text-pretty max-w-3xl">
          {t(
            'বাংলাদেশের পণ্যের জন্য সম্ভাব্য আমদানিকারকদের তালিকা। দেশ, সনদ, ন্যূনতম অর্ডার ও পেমেন্ট শর্ত অনুযায়ী ফিল্টার করুন।',
            'Review potential importers for Bangladeshi products. Filter by destination, certifications, minimum order, and payment terms.'
          )}
        </p>
        <p className="max-w-3xl rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-bangla">
          {t('তালিকার কোম্পানি ও বাণিজ্যিক পরিসংখ্যান নমুনা তথ্য। এগুলো যাচাইকৃত প্রতিষ্ঠান, সক্রিয় বায়ার, প্রকৃত আমদানি রেকর্ড বা যোগাযোগের নিশ্চয়তা নয়। HS কোড, উৎপত্তি বিধি ও বর্তমান শুল্ক কাস্টমস বা লাইসেন্সধারী ট্রেড বিশেষজ্ঞের কাছে যাচাই করুন।', 'Company names and commercial figures are illustrative. They do not represent verified companies, active buyers, actual import records, or available contacts. Confirm the HS code, origin rules, and current tariff with customs or a qualified trade adviser.')}
        </p>
        {directoryNotice && (
          <p role="status" className="max-w-3xl rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
            {directoryNotice}
          </p>
        )}
      </div>

      {/* Search + Filter bar */}


      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('কোম্পানি, শহর বা সেগমেন্ট খুঁজুন...', 'Search company, city, or segment...')}
              className="field pl-9"
              aria-label={t('বায়ার সার্চ করুন', 'Search buyers')}
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className={`btn-ghost gap-2 ${filterCount > 0 ? 'border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span>{t('ফিল্টার', 'Filters')}</span>
            {filterCount > 0 && (
              <span className="badge badge-em ml-1">{filterCount}</span>
            )}
          </button>
          {filterCount > 0 && (
            <button onClick={clearAll} className="btn-ghost bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:border-rose-400 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-950 dark:hover:border-rose-700">
              <X className="w-4 h-4" />
              <span>{t('ক্লিয়ার', 'Clear')}</span>
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div id="filter-panel" className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">

            {/* Country */}
            <FilterGroup label={t('গন্তব্য দেশ:', 'Destination Country:')}>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={selCountries.has(c)}
                    onClick={() => toggle(selCountries, c, setSelCountries)}
                    prefix={COUNTRY_FLAG[c]}
                  />
                ))}
              </div>
            </FilterGroup>

            {/* Certs */}
            <FilterGroup label={t('কমপ্লায়েন্স সার্টিফিকেট:', 'Compliance Certs:')}>
              <div className="flex flex-wrap gap-1.5">
                {CERTS.map(c => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={selCerts.has(c)}
                    onClick={() => toggle(selCerts, c, setSelCerts)}
                    certColor={selCerts.has(c) ? CERT_COLOR[c] : undefined}
                  />
                ))}
              </div>
            </FilterGroup>

            {/* Payment */}
            <FilterGroup label={t('পেমেন্ট টার্ম:', 'Payment Terms:')}>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_OPTS.map(p => (
                  <FilterChip
                    key={p}
                    label={p}
                    active={selPayments.has(p)}
                    onClick={() => toggle(selPayments, p, setSelPayments)}
                  />
                ))}
              </div>
            </FilterGroup>

            {/* Minimum order slider */}
            <FilterGroup label={`${t('সর্বোচ্চ অর্ডার:', 'Maximum order:')} ${(maxMoq || 0).toLocaleString()} ${t('পিস', 'units')}`}>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={maxMoq}
                onChange={e => setMaxMoq(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                aria-label={t('সর্বোচ্চ অর্ডার', 'Maximum order')}
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>500</span>
                <span>50,000</span>
              </div>
            </FilterGroup>

          </div>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {filtered.length} {t('বায়ার পাওয়া গেছে', 'buyers found')}
          {query && <span> {t('এর জন্য:', 'for:')} <span className="text-slate-900 dark:text-white font-semibold">"{query}"</span></span>}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('নমুনা তথ্য, যোগাযোগ নেই', 'Illustrative data, no buyer contacts')}</span>
        </div>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block card overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={() => setDenseRows(!denseRows)}
            aria-pressed={denseRows}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bangla"
          >
            {denseRows ? t('স্ট্যান্ডার্ড ঘাঁড়তে', 'Standard rows') : t('ক্ষুবঘচ্ছ সারি', 'Compact rows')}
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => exportData('csv')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bangla"
            >
              {t('CSV ডাউনলোড', 'CSV')}
            </button>
            <button
              type="button"
              onClick={() => exportData('json')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bangla"
            >
              {t('JSON ডাউনলোড', 'JSON')}
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[72vh] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className={denseRows ? "data-table data-table-dense" : "data-table"} aria-label={t('বায়ার তালিকা', 'Buyer directory')}>
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                {[
                  { key: 'company_name', labelBn: 'কোম্পানি', labelEn: 'Company' },
                  { key: 'country',      labelBn: 'দেশ',       labelEn: 'Country' },
                  { key: 'moq',          labelBn: 'ন্যূনতম অর্ডার', labelEn: 'Minimum order' },
                  { key: 'fob',          labelBn: 'FOB টার্গেট', labelEn: 'FOB Target' },
                  { key: 'annual_import',labelBn: 'বার্ষিক আমদানি', labelEn: 'Annual Import' },
                  { key: 'tariff',       labelBn: 'বাংলাদেশ শুল্ক', labelEn: 'BD Tariff' },
                ].map(({ key, labelBn, labelEn }) => (
                  <th
                    key={key}
                    aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(key as SortKey)}
                      aria-label={t(`${labelBn} অনুযায়ী সাজান`, `Sort by ${labelEn}`)}
                      className="flex items-center gap-1 font-semibold uppercase text-[10px] tracking-wider"
                    >
                      <span>{t(labelBn, labelEn)}</span>
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </button>
                  </th>
                ))}
                <th>{t('সার্টিফিকেট', 'Certs')}</th>
                <th>{t('পেমেন্ট', 'Payment')}</th>
                <th>{t('স্ট্যাটাস', 'Status')}</th>
                <th>{t('অ্যাকশন', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 font-bangla">
                    {t('কোনো বায়ার পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।', 'No buyers match your filters. Try adjusting them.')}
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <div className="font-semibold text-slate-900 dark:text-white">{b.company_name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{b.city} - {b.segment}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{COUNTRY_FLAG[b.country]}</span>
                      <span>{b.country}</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium mt-0.5">{b.trade_scheme}</div>
                  </td>
                  <td className="font-mono">{(b.moq || 0).toLocaleString()}</td>
                  <td className="font-mono text-amber-600 dark:text-amber-400 font-bold">${b.fob_target_usd.toFixed(2)}</td>
                  <td className="font-mono text-slate-700 dark:text-slate-300 font-semibold">${(b.annual_import_usd / 1_000_000).toFixed(2)}M</td>
                  <td>
                    <span className={`badge ${b.tariff_bd_pct === 0 ? 'badge-em' : 'badge-rose'}`}>
                      {b.tariff_bd_pct === 0 ? '0%*' : `${b.tariff_bd_pct}%*`}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {b.certs.map(c => (
                        <span key={c} className={`badge ${CERT_COLOR[c]}`}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {b.payment_terms.map(p => (
                        <span key={p} className="badge badge-blue">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">{t('নমুনা', 'SAMPLE')}</span>
                  </td>
                  <td>
                    {canExport ? (
                      <Link
                        to={`/dealroom?preset=${getPresetForBuyer(b)}&buyer_name=${encodeURIComponent(b.company_name)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800/80 text-xs font-semibold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('খসড়া প্রস্তুত করুন', 'Prepare Draft')}</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">{t('যোগাযোগ নেই', 'NO CONTACT')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 font-bangla text-sm">
            {t('কোনো বায়ার পাওয়া যায়নি।', 'No buyers found.')}
          </div>
        ) : filtered.map(b => (
          <div key={b.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{b.company_name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-bangla">{b.city}, {b.country}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.segment}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`badge ${b.tariff_bd_pct === 0 ? 'badge-em' : 'badge-rose'}`}>
                  {b.tariff_bd_pct === 0 ? '0%* TARIFF' : `${b.tariff_bd_pct}%* TARIFF`}
                </span>
                <span className="badge badge-blue">{b.trade_scheme}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-slate-200 dark:border-slate-800 pt-3">
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">{t('ন্যূনতম অর্ডার', 'Minimum order')}</div>
                <div className="text-slate-900 dark:text-white font-bold">{(b.moq || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">FOB</div>
                <div className="text-amber-600 dark:text-amber-400 font-bold">${b.fob_target_usd.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">{t('আমদানি', 'Import')}</div>
                <div className="text-slate-800 dark:text-slate-200 font-semibold">${(b.annual_import_usd / 1_000_000).toFixed(1)}M</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {b.certs.map(c => (
                <span key={c} className={`badge ${CERT_COLOR[c]}`}>{c}</span>
              ))}
              {b.payment_terms.map(p => (
                <span key={p} className="badge badge-blue">{p}</span>
              ))}
            </div>

            {canExport && (
              <Link
                to={`/dealroom?preset=${getPresetForBuyer(b)}&buyer_name=${encodeURIComponent(b.company_name)}`}
                className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('খসড়া প্রস্তুত করুন', 'Prepare Draft')}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Live Global Buyer RFQ Board & Factory Production Capacity Tracker */}
      <BuyerRFQBoard refreshKey={rfqRefreshKey} />

      {showRfqModal && (
        <RfqCreateModal
          onClose={() => setShowRfqModal(false)}
          onCreated={() => setRfqRefreshKey((k) => k + 1)}
        />
      )}

      {/* Illustrative trade scenarios */}
      <LiveTradeFeed />

      {/* Footer note */}
      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 font-mono pb-4">
        {filtered.length}/{buyersList.length} {t('জন বায়ার দেখানো হচ্ছে', 'buyers shown')}
      </p>

    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function FilterChip({
  label, active, onClick, prefix, certColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  prefix?: string;
  certColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 select-none ${
        active && certColor
          ? certColor
          : active
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-700'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200'
      }`}
    >
      {prefix && <span className="text-[9px] font-mono text-slate-400">{prefix}</span>}
      {label}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3 h-3 text-slate-600" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-emerald-400" />
    : <ChevronDown className="w-3 h-3 text-emerald-400" />;
}
