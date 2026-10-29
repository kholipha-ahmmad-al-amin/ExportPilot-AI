import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import { getClientRedactionCount } from '../utils/piiRedactor';

/**
 * Visible proof that the client-side PII shield is operating. Shows the count
 * of values masked in this browser session before any request left it.
 */
export const SovereignShieldBadge: React.FC<{ compact?: boolean; className?: string }> = ({ compact = false, className = '' }) => {
  const { t } = useAuth();
  const count = getClientRedactionCount();

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold font-bangla ${className}`}
        title={t(
          'পরিচিত পরিচয় ও কর নম্বর ব্রাউজার থেকেই আড়াল হয়। এই সেশনে আড়াল: ' + count,
          'Recognized identity and tax numbers are masked in your browser. Masked this session: ' + count
        )}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden md:inline">{t('ডেটা শিল্ড', 'Data Shield')}</span>
        {count > 0 && <span className="font-mono">{count}</span>}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 flex items-start gap-2.5 ${className}`}>
      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 font-bangla">
          {t('সার্বভৌম ডেটা শিল্ড সক্রিয় · শূন্য পিআইআই লিক', 'Sovereign Data Shield Active · Zero PII Leakage')}
        </span>
        <span className="block text-[11px] text-emerald-700 dark:text-emerald-400/80 font-bangla leading-relaxed">
          {t(
            'এনআইডি, টিআইএন, বিআইএন, মোবাইল ও ব্যাংক অ্যাকাউন্ট নম্বর ব্রাউজারেই আড়াল হয়ে সার্ভারে যায়; বাণিজ্য পরামর্শের আগে সার্ভারে দ্বিতীয়বার আড়াল হয়। এই সেশনে ব্রাউজারে আড়াল হয়েছে ' + count + ' টি মান।',
            'NID, TIN, BIN, mobile, and bank account numbers are masked in the browser before dispatch and masked a second time on the server before trade advice. Values masked in this browser session: ' + count + '.'
          )}
        </span>
      </div>
    </div>
  );
};
