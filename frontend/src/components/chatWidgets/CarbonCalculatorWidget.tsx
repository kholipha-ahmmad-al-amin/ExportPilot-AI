import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Leaf } from 'lucide-react';
import {
  BDT_PER_USD,
  CBAM_PHASE_IN,
  CBAM_PHASE_IN_YEARS,
  ETS_EUR,
  EUR_USD,
  GRID_EF_KG_PER_KWH,
  SOLAR_YIELD_KWH_PER_KWP_YEAR,
  fmtBdt,
} from '../../data/tradeConstants';

/**
 * Interactive Scope 2 carbon and CBAM liability calculator rendered inside the
 * chat stream. Pure client-side math on the shared sourced constants.
 */
export const CarbonCalculatorWidget: React.FC = () => {
  const { t } = useAuth();
  const [monthlyKwh, setMonthlyKwh] = useState(20000);
  const [solarKwp, setSolarKwp] = useState(0);
  const [year, setYear] = useState<number>(CBAM_PHASE_IN_YEARS[0]);

  const annualKwh = monthlyKwh * 12;
  const scope2Tons = (annualKwh * GRID_EF_KG_PER_KWH) / 1000;
  const solarOffsetTons = (solarKwp * SOLAR_YIELD_KWH_PER_KWP_YEAR * GRID_EF_KG_PER_KWH) / 1000;
  const netTons = Math.max(0, scope2Tons - solarOffsetTons);
  const phaseInPct = CBAM_PHASE_IN[year] ?? 100;
  const chargeableTons = (netTons * phaseInPct) / 100;
  const liabilityEur = chargeableTons * ETS_EUR.baseline;
  const liabilityBdt = liabilityEur * EUR_USD * BDT_PER_USD;

  const row = 'flex items-center justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-800 last:border-0';
  const strong = 'font-mono font-bold text-slate-800 dark:text-slate-200';

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
        <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t('স্কোপ ২ কার্বন ও সিবিএম ক্যালকুলেটর', 'Scope 2 Carbon & CBAM Calculator')}</span>
      </div>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="cc-kwh" className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            <span>{t('মাসিক বিদ্যুৎ ব্যবহার (kWh)', 'Monthly electricity (kWh)')}</span>
            <span className={strong}>{monthlyKwh.toLocaleString()}</span>
          </label>
          <input
            id="cc-kwh"
            type="range"
            min={1000}
            max={500000}
            step={1000}
            value={monthlyKwh}
            onChange={(e) => setMonthlyKwh(Number(e.target.value))}
            aria-label={t('মাসিক বিদ্যুৎ ব্যবহার কিলোওয়াট ঘণ্টা', 'Monthly electricity usage in kilowatt hours')}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <label htmlFor="cc-solar" className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            <span>{t('রুফটপ সোলার (kWp)', 'Rooftop solar (kWp)')}</span>
            <span className={strong}>{solarKwp.toLocaleString()}</span>
          </label>
          <input
            id="cc-solar"
            type="range"
            min={0}
            max={500}
            step={5}
            value={solarKwp}
            onChange={(e) => setSolarKwp(Number(e.target.value))}
            aria-label={t('রুফটপ সোলার কিলোওয়াট পিক', 'Rooftop solar kilowatt peak')}
            className="w-full accent-emerald-600"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <label htmlFor="cc-year" className="text-[11px] text-slate-600 dark:text-slate-400">
            {t('সিবিএম চার্জেবল বছর', 'CBAM chargeable year')}
          </label>
          <select
            id="cc-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label={t('সিবিএম চার্জেবল বছর নির্বাচন করুন', 'Select CBAM chargeable year')}
            className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-mono text-slate-800 dark:text-slate-200"
          >
            {CBAM_PHASE_IN_YEARS.map((y) => (
              <option key={y} value={y}>{y} ({CBAM_PHASE_IN[y]}%)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5">
        <div className={row}>
          <span className="text-slate-500 dark:text-slate-400">{t('বার্ষিক স্কোপ ২ নির্গমন', 'Annual Scope 2 emissions')}</span>
          <span className={strong}>{scope2Tons.toFixed(1)} t CO2e</span>
        </div>
        <div className={row}>
          <span className="text-slate-500 dark:text-slate-400">{t('সোলার অফসেট', 'Solar offset')}</span>
          <span className={strong}>-{solarOffsetTons.toFixed(1)} t CO2e</span>
        </div>
        <div className={row}>
          <span className="text-slate-500 dark:text-slate-400">{t(`চার্জেবল (${phaseInPct}%)`, `Chargeable (${phaseInPct}%)`)}</span>
          <span className={strong}>{chargeableTons.toFixed(1)} t CO2e</span>
        </div>
        <div className={row}>
          <span className="text-slate-500 dark:text-slate-400">{t(`সিবিএম দায় (EUR ${ETS_EUR.baseline}/t)`, `CBAM liability (EUR ${ETS_EUR.baseline}/t)`)}</span>
          <span className={strong}>EUR {liabilityEur.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className={row}>
          <span className="text-slate-500 dark:text-slate-400">{t('প্রায় সমতুল্য টাকায়', 'Approximate equivalent in BDT')}</span>
          <span className={strong}>{fmtBdt(liabilityBdt)}</span>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bangla">
        {t(
          'বিদ্যুৎ বিলের তথ্য থেকে প্রাথমিক হিসাব। গ্রিড ফ্যাক্টর ০.৫৮ কেজি CO2e/kWh (বিপিডিবি)। এটি কোনো যাচাইকৃত সার্টিফিকেট নয়।',
          'Preliminary estimate from utility data. Grid factor 0.58 kg CO2e/kWh (BPDB). Not a verified certificate.'
        )}
      </p>
    </div>
  );
};
