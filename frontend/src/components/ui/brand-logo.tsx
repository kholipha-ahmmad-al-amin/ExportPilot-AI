import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

type BrandVariant = 'full' | 'mark-only' | 'compact';
type BrandSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  variant?: BrandVariant;
  size?: BrandSize;
  className?: string;
  badge?: string;
  /** Static language override; defaults to the active UI language. */
  lang?: 'en' | 'bn';
  /** Link target; omit to render a non-interactive mark. */
  href?: string;
}

const SIZES: Record<BrandSize, { box: string; title: string; sub: string; badge: string; gap: string }> = {
  sm: { box: 'h-7 w-7', title: 'text-[13px]', sub: 'text-[9px]', badge: 'text-[8px] px-1 py-px', gap: 'gap-2' },
  md: { box: 'h-9 w-9', title: 'text-[16px]', sub: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5', gap: 'gap-2.5' },
  lg: { box: 'h-14 w-14', title: 'text-[24px]', sub: 'text-[13px]', badge: 'text-[10px] px-2 py-0.5', gap: 'gap-3.5' },
};

/**
 * Single-source brand identity. Geometry is inlined from public/brand/master-mark.svg
 * with theme-adaptive fills: one mark, tuned per Day and Night mode. The wordmark is
 * rendered in code (never raster) and switches between the English and Bengali
 * brand name with the active UI language.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', size = 'md', className, badge, lang, href }) => {
  const { lang: uiLang, theme } = useAuth();
  const activeLang: 'en' | 'bn' = lang ?? (uiLang === 'en' ? 'en' : 'bn');
  const s = SIZES[size];

  const tileFill = theme === 'dark' ? '#10B981' : '#047857';
  const cutFill = theme === 'dark' ? '#0B1120' : '#FFFFFF';

  const mark = (
    <svg
      viewBox="0 0 512 512"
      className={cn(s.box, 'shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.06] group-active:scale-95')}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="32" y="32" width="448" height="448" rx="96" fill={tileFill} />
      <path d="M256 128 L332 236 L284 236 L284 332 L228 332 L228 236 L180 236 Z" fill={cutFill} />
      <rect x="164" y="360" width="184" height="26" rx="6" fill={cutFill} />
      <rect x="164" y="402" width="184" height="26" rx="6" fill={cutFill} />
      <rect x="164" y="444" width="184" height="26" rx="6" fill={cutFill} />
    </svg>
  );

  const nameEn = 'ExportPilot AI';
  const nameBn = '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f\u09aa\u09be\u0987\u09b2\u099f \u098f\u0986\u0987';
  const subEn = 'Direct export intelligence';
  const subBn = '\u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09b0\u09aa\u09cd\u09a4\u09be\u09a8\u09bf \u09ac\u09c1\u09a6\u09cd\u09a7\u09bf\u09ae\u09c7\u09df\u09b2';

  const wordmark =
    variant === 'mark-only' ? null : (
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            'font-extrabold tracking-tight text-slate-900 dark:text-white',
            s.title,
            activeLang === 'bn' ? 'font-bangla' : 'font-display',
          )}
        >
          {activeLang === 'bn' ? nameBn : nameEn}
        </span>
        {variant === 'full' && (
          <span className={cn('mt-1 font-medium text-slate-500 dark:text-slate-400', s.sub, activeLang === 'bn' ? 'font-bangla' : 'font-display')}>
            {activeLang === 'bn' ? subBn : subEn}
          </span>
        )}
      </span>
    );

  const content = (
    <span className={cn('group inline-flex items-center', s.gap, className)}>
      {mark}
      {wordmark}
      {badge && variant !== 'mark-only' && (
        <span
          className={cn(
            'rounded-md border border-emerald-300 bg-emerald-50 font-mono font-bold uppercase tracking-wide text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
            s.badge,
          )}
        >
          {badge}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <a href={href} className="group inline-flex" aria-label={activeLang === 'bn' ? nameBn : nameEn}>
      {content}
    </a>
  );
};
