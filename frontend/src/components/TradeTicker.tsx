import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

interface TickerItem {
  labelBn: string;
  labelEn: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
}

/**
 * Institutional reference telemetry strip. Streams sovereign trade indicators
 * from the seeded reference data set: port turnaround, bunker index, EU ETS
 * carbon price, cash incentive rates. Bilingual, both modes.
 */
const ITEMS: TickerItem[] = [
  { labelBn: '\u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae \u09ac\u09a8\u09cd\u09a6\u09b0 \u099f\u09be\u09b0\u09cd\u09a8\u09be\u09b0\u09be\u0989\u09a8\u09cd\u09a1', labelEn: 'Chattogram turnaround', value: '2.1 \u09a6\u09bf\u09a8 / days', trend: 'down' },
  { labelBn: '\u09ac\u09cd\u09b0\u09c7\u09a8\u09cd\u099f \u09ac\u0999\u09cd\u0995\u09be\u09b0 \u0987\u09a8\u09cd\u09a1\u09c7\u0995\u09cd\u09b8', labelEn: 'Brent bunker index', value: '$412/t', trend: 'flat' },
  { labelBn: 'EU ETS \u0995\u09be\u09b0\u09cd\u09ac\u09a8 \u099b\u09be\u09dc', labelEn: 'EU ETS carbon price', value: '\u20ac70.2/t', trend: 'up' },
  { labelBn: '\u09a8\u0997\u09a6 \u09aa\u09cd\u09b0\u09a3\u09cb\u09a6\u09a8 \u09b9\u09be\u09b0', labelEn: 'Cash incentive rate', value: '20% (\u09aa\u09be\u099f\u099c\u09be\u09a4)', trend: 'flat' },
  { labelBn: '\u09ac\u09bf\u09ae\u09be \u09ac\u09bf\u09a8\u09bf\u09af\u09bc\u09cb\u0997 \u09ae\u09be\u09a8\u09be\u09a7\u09a8', labelEn: 'BDT/USD reference', value: '123.53', trend: 'flat' },
  { labelBn: '\u099c\u09be\u09b9\u09be\u099c\u09c0 \u09ac\u09a8\u09cd\u09a6\u09b0 \u09a8\u09cc\u099b\u09a4\u09cd\u09b0\u09bf\u0995 \u0995\u09cd\u09b7\u09ae\u09a4\u09be', labelEn: 'Jetty berth capacity', value: '78%', trend: 'up' },
];

export const TradeTicker: React.FC = () => {
  const { t } = useAuth();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setOffset((o) => (o + 1) % ITEMS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const visible = [0, 1, 2, 3].map((i) => ITEMS[(offset + i) % ITEMS.length]);

  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 overflow-hidden"
      role="marquee"
      aria-label={t('\u09b2\u09be\u0987\u09ad \u09ac\u09be\u09a3\u09bf\u099c\u09cd\u09af \u099f\u09c7\u09b2\u09bf\u09ae\u09c7\u099f\u09b0\u09bf', 'Live trade telemetry')}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" aria-hidden="true" />
          {t('\u09b2\u09be\u0987\u09ad', 'Live')}
        </span>
        <div className="flex items-center gap-4 sm:gap-6 overflow-hidden flex-1 min-w-0">
          {visible.map((item, i) => {
            const visibilityClass =
              i === 0
                ? 'inline-flex'
                : i === 1
                ? 'hidden sm:inline-flex'
                : i === 2
                ? 'hidden md:inline-flex'
                : 'hidden xl:inline-flex';
            const separatorClass =
              i === 0
                ? 'hidden sm:inline text-slate-300 dark:text-slate-700 shrink-0'
                : i === 1
                ? 'hidden md:inline text-slate-300 dark:text-slate-700 shrink-0'
                : 'hidden xl:inline text-slate-300 dark:text-slate-700 shrink-0';

            return (
              <React.Fragment key={offset + i}>
                <span className={`items-baseline gap-1.5 shrink-0 text-[11px] truncate ${visibilityClass}`}>
                  <span className="text-slate-500 dark:text-slate-400 font-bangla">{t(item.labelBn, item.labelEn)}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                  <span
                    className={`text-[8px] font-mono ${
                      item.trend === 'up' ? 'text-emerald-500' : item.trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '▬'}
                  </span>
                </span>
                {i < visible.length - 1 && <span className={separatorClass}>|</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
