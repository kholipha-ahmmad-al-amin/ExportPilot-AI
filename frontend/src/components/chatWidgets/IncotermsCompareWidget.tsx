import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ship } from 'lucide-react';
import {
  DESTINATION_BROKER_USD_PER_20FT,
  INSURANCE_PCT,
  TRADE_ROUTES,
  fmtUsd,
} from '../../data/tradeConstants';

interface Column {
  id: string;
  labelBn: string;
  labelEn: string;
  lines: { labelBn: string; labelEn: string; usd: number }[];
  total: number;
  noteBn?: string;
  noteEn?: string;
}

/**
 * Side-by-side FOB vs CIF vs DDP landed-cost comparison rendered inside the
 * chat stream. Freight and insurance are illustrative planning bands.
 */
export const IncotermsCompareWidget: React.FC = () => {
  const { t } = useAuth();
  const [fobUsd, setFobUsd] = useState('3.40');
  const [units, setUnits] = useState('5000');
  const [routeId, setRouteId] = useState<string>(TRADE_ROUTES[0].id);

  const fob = Math.max(0.01, parseFloat(fobUsd) || 0);
  const pcs = Math.max(1, parseInt(units, 10) || 1);
  const route = TRADE_ROUTES.find((r) => r.id === routeId) ?? TRADE_ROUTES[0];

  const freightPerUnit = route.freight20ftUsd / pcs;
  const insurancePerUnit = ((fob + freightPerUnit) * INSURANCE_PCT.baseline) / 100;
  const cif = fob + freightPerUnit + insurancePerUnit;
  const brokerPerUnit = DESTINATION_BROKER_USD_PER_20FT / pcs;

  const columns: Column[] = [
    {
      id: 'fob',
      labelBn: 'FOB চট্টগ্রাম',
      labelEn: 'FOB Chattogram',
      lines: [{ labelBn: 'পণ্য মূল্য', labelEn: 'Goods value', usd: fob }],
      total: fob,
      noteBn: 'বন্দরে জাহাজে তোলার আগ পর্যন্ত দায়িত্ব আপনার।',
      noteEn: 'Your responsibility ends once goods are on board.',
    },
    {
      id: 'cif',
      labelBn: `CIF ${route.labelEn.split(',')[0]}`,
      labelEn: `CIF ${route.labelEn.split(',')[0]}`,
      lines: [
        { labelBn: 'পণ্য মূল্য', labelEn: 'Goods value', usd: fob },
        { labelBn: 'সমুদ্র ভাড়া (ভাগ)', labelEn: 'Ocean freight (share)', usd: freightPerUnit },
        { labelBn: 'বীমা', labelEn: 'Insurance', usd: insurancePerUnit },
      ],
      total: cif,
      noteBn: 'ভাড়া ও বীমা আপনার বহন করলেও ঝুঁকি জাহাজে ওঠার সাথে ক্রেতার।',
      noteEn: 'You carry freight and insurance cost; risk transfers on board.',
    },
    {
      id: 'ddp',
      labelBn: `DDP ${route.labelEn.split(',')[0]}`,
      labelEn: `DDP ${route.labelEn.split(',')[0]}`,
      lines: [
        { labelBn: 'CIF মূল্য', labelEn: 'CIF value', usd: cif },
        { labelBn: 'গন্তব্য ক্লিয়ারেন্স (ভাগ)', labelEn: 'Destination clearance (share)', usd: brokerPerUnit },
        { labelBn: 'শুল্ক', labelEn: 'Duty', usd: 0 },
      ],
      total: cif + brokerPerUnit,
      noteBn: 'কাস্টমস ব্রোকার ছাড়া ঝুঁকিপূর্ণ; দায় পুরোপুরি আপনার।',
      noteEn: 'Risky without a customs broker; full responsibility is yours.',
    },
  ];

  const maxTotal = Math.max(...columns.map((c) => c.total));

  return (
    <div className="mt-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/20 p-3.5 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
        <Ship className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t('ইনকোটার্মস দাম তুলনা', 'Incoterms Price Comparison')}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="ic-fob" className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            {t('FOB দর (USD)', 'FOB price (USD)')}
          </label>
          <input
            id="ic-fob"
            type="number"
            min="0.01"
            step="0.05"
            value={fobUsd}
            onChange={(e) => setFobUsd(e.target.value)}
            aria-label={t('প্রতি পিস এফওবি দর', 'FOB price per unit')}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="ic-units" className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            {t('পিস সংখ্যা', 'Units')}
          </label>
          <input
            id="ic-units"
            type="number"
            min="1"
            step="100"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            aria-label={t('চালানে পিস সংখ্যা', 'Units per shipment')}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="ic-route" className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            {t('গন্তব্য', 'Destination')}
          </label>
          <select
            id="ic-route"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            aria-label={t('গন্তব্য বন্দর নির্বাচন করুন', 'Select destination port')}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200"
          >
            {TRADE_ROUTES.map((r) => (
              <option key={r.id} value={r.id}>{r.labelEn.split(',')[0]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.id} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono uppercase truncate">
              {t(col.labelBn, col.labelEn)}
            </div>
            {col.lines.map((ln, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="truncate mr-1 font-bangla">{t(ln.labelBn, ln.labelEn)}</span>
                <span className="font-mono shrink-0">{fmtUsd(ln.usd)}</span>
              </div>
            ))}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t('ল্যান্ডেড', 'Landed')}</span>
              <span className="text-[12px] font-mono font-bold text-slate-900 dark:text-white">{fmtUsd(col.total)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={col.id === 'fob' ? 'h-full bg-emerald-500' : col.id === 'cif' ? 'h-full bg-sky-500' : 'h-full bg-amber-500'}
                style={{ width: `${Math.max(6, (col.total / maxTotal) * 100)}%` }}
              />
            </div>
            <p className="text-[9px] leading-snug text-slate-400 dark:text-slate-500 font-bangla">{t(col.noteBn || '', col.noteEn || '')}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bangla">
        {t(
          `সমুদ্র ভাড়া ও বীমা পরিকল্পনা ব্যান্ড (${route.transitDays} দিন, ২০ ফুট কন্টেইনার ধরে)। চূড়ান্ত হার নিযুক্ত ফরওয়ার্ডারের কোটেশনে নিশ্চিত করুন। ${route.dutyBn}`,
          `Freight and insurance are planning bands (${route.transitDays} days, per 20ft container). Confirm final rates in your forwarder quotation. ${route.dutyEn}`
        )}
      </p>
    </div>
  );
};
