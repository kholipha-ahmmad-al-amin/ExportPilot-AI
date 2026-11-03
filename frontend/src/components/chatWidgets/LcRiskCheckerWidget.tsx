import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileCheck } from 'lucide-react';

interface LcCheck {
  id: string;
  labelBn: string;
  labelEn: string;
  whyBn: string;
  whyEn: string;
}

const LC_CHECKS: LcCheck[] = [
  {
    id: 'irrevocable',
    labelBn: 'ইরিভোকেবল (অপরিবর্তনীয়) এলসি',
    labelEn: 'Irrevocable LC',
    whyBn: 'সম্মত হওয়ার পর ক্রেতা একতরফাভাবে বাতিল করতে পারে না।',
    whyEn: 'The buyer cannot unilaterally cancel after agreement.',
  },
  {
    id: 'sight',
    labelBn: 'অ্যাট সাইট পেমেন্ট',
    labelEn: 'Payment at sight',
    whyBn: 'নথি জমা দিলেই সাথে সাথে পরিশোধ; ইউস্যান্সে অপেক্ষা নয়।',
    whyEn: 'Paid immediately on document presentation, no usance wait.',
  },
  {
    id: 'confirmed',
    labelBn: 'কনফার্মড ব্যাংক',
    labelEn: 'Bank confirmed',
    whyBn: 'খোলার ব্যাংকের দেশে পরিচিত ব্যাংক পরিশোধের নিশ্চয়তা দেয়।',
    whyEn: 'A recognized bank in the issuing country guarantees payment.',
  },
  {
    id: 'no-soft',
    labelBn: 'সফট ক্লজ নেই',
    labelEn: 'No soft clauses',
    whyBn: 'ক্রেতার সনদপত্র বা সম্মতি ছাড়া নথি জমা দেওয়া যায়।',
    whyEn: 'Documents are presentable without buyer certificates or consent.',
  },
  {
    id: 'exact-goods',
    labelBn: 'পণ্যের বর্ণনা হুবহু মিলে',
    labelEn: 'Exact goods description',
    whyBn: 'ইনভয়েস, প্যাকিং ও এলসির বর্ণনা অক্ষরে অক্ষরে মিলতে হয়।',
    whyEn: 'Invoice, packing list, and LC wording must match letter for letter.',
  },
  {
    id: 'ports',
    labelBn: 'লোডিং ও ডিসচার্জ বন্দর সঠিক',
    labelEn: 'Correct port pair',
    whyBn: 'চট্টগ্রাম/মোংলা থেকে চুক্তির বন্দর; ভুল বন্দরে ডিসক্রিপেন্সি হয়।',
    whyEn: 'Chattogram/Mongla to the contracted port; wrong ports cause discrepancies.',
  },
  {
    id: 'window',
    labelBn: 'শিপমেন্ট ও মেয়াদ সময় যথেষ্ট',
    labelEn: 'Sane shipment and expiry window',
    whyBn: 'উৎপাদন ও পরিবহনের বাস্তব সময়ের মধ্যে সর্বশেষ তারিখ আছে।',
    whyEn: 'Latest shipment and expiry dates fit real production and transit time.',
  },
];

/**
 * Interactive letter-of-credit safety checklist rendered inside the chat
 * stream. Deterministic scoring with a clear verdict band.
 */
export const LcRiskCheckerWidget: React.FC = () => {
  const { t } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const score = checked.size;
  const verdict =
    score >= 7
      ? { key: 'safe', labelBn: 'নিরাপদে এগোনো যায়', labelEn: 'Safe to proceed', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' }
      : score >= 5
      ? { key: 'caution', labelBn: 'সতর্কতার সাথে এগোন', labelEn: 'Proceed with caution', cls: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' }
      : { key: 'reject', labelBn: 'শর্ত বদলানো বা বাতিল', labelEn: 'Renegotiate or decline', cls: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' };

  return (
    <div className="mt-3 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-wider">
          <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('এলসি ঝুঁকি যাচাই', 'LC Risk Checker')}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold font-bangla ${verdict.cls}`}>
          {t(verdict.labelBn, verdict.labelEn)}
        </span>
      </div>

      <div className="space-y-1.5">
        {LC_CHECKS.map((c) => {
          const on = checked.has(c.id);
          return (
            <label
              key={c.id}
              className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                on
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
                  : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(c.id)}
                aria-label={t(c.labelBn, c.labelEn)}
                className="mt-0.5 accent-emerald-600"
              />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 font-bangla">
                  {t(c.labelBn, c.labelEn)}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bangla leading-snug">
                  {t(c.whyBn, c.whyEn)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
          {score}/7 {t('শর্ত পূরণ', 'checks met')}
        </span>
        <button
          type="button"
          onClick={() => setChecked(new Set())}
          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bangla"
        >
          {t('পুনরায় শুরু', 'Reset')}
        </button>
      </div>
    </div>
  );
};
