import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radar, Send, History, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { redactBangladeshPii } from '../utils/piiRedactor';

interface PaymentFlag {
  severity: 'critical' | 'high' | 'medium';
  issue_bn: string;
  issue_en: string;
  advice_bn: string;
  advice_en: string;
}

interface PriceAssessment {
  offered_usd: number;
  benchmark_floor_usd: number;
  recommended_usd: number;
  gap_vs_floor_pct: number;
  verdict: 'below_sustainable' | 'thin' | 'healthy';
  verdict_bn: string;
  basis_bn: string;
  basis_en: string;
}

interface DealReview {
  status: string;
  redacted_count: number;
  payment_flags: PaymentFlag[];
  quantity_units: number | null;
  price_assessment: PriceAssessment | null;
  note_bn: string | null;
  note_en: string | null;
}

interface InteractionItem {
  id: string;
  interaction_type: string;
  status: string;
  notes: string;
  created_at: string;
}

const SAFE_PAYMENT = 'Confirmed Irrevocable LC at Sight';

const sevCls = (sev: string): string =>
  sev === 'critical'
    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
    : sev === 'high'
    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
    : 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800';

const verdictCls = (v: string): string =>
  v === 'below_sustainable'
    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
    : v === 'thin'
    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';

/**
 * Contextual deal co-pilot rendered beside the negotiation room. Analyzes a
 * pasted buyer message against the deterministic server-side reviewer, drafts
 * and saves the outbound reply (driving the deal into communication_draft),
 * and shows the saved interaction timeline.
 */
export const DealCopilotPane: React.FC<{
  presetId?: string;
  tradeDealId?: string;
  currentFob?: number;
  onApplyCounter?: (price: number, payment?: string) => void;
}> = ({ presetId, tradeDealId, currentFob, onApplyCounter }) => {
  const { t } = useAuth();

  const [buyerMessage, setBuyerMessage] = useState('');
  const [review, setReview] = useState<DealReview | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const [replyDraft, setReplyDraft] = useState('');
  const [savingReply, setSavingReply] = useState(false);
  const [replySaved, setReplySaved] = useState(false);
  const [replyError, setReplyError] = useState('');

  const [interactions, setInteractions] = useState<InteractionItem[]>([]);

  const loadTimeline = useCallback(() => {
    if (!tradeDealId) return;
    fetch(`/api/v1/mcp/deals/${encodeURIComponent(tradeDealId)}/interactions`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) setInteractions(data.items);
      })
      .catch(() => {});
  }, [tradeDealId]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const analyze = async () => {
    const raw = buyerMessage.trim();
    if (raw.length < 3 || analyzing) return;
    setAnalyzing(true);
    setAnalyzeError('');
    setReview(null);
    try {
      const outbound = redactBangladeshPii(raw).redacted_text;
      const res = await fetch('/api/v1/trade/deal-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          buyer_message: outbound,
          preset_id: presetId || undefined,
          offered_fob_usd: currentFob || undefined,
        }),
      });
      if (!res.ok) throw new Error('review failed');
      setReview(await res.json());
    } catch {
      setAnalyzeError(t('বার্তা যাচাই করা যায়নি। আবার চেষ্টা করুন।', 'Could not review the message. Try again.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const saveReply = async () => {
    const draft = replyDraft.trim();
    if (draft.length < 3 || savingReply || !tradeDealId) return;
    setSavingReply(true);
    setReplyError('');
    setReplySaved(false);
    try {
      const res = await fetch(`/api/v1/mcp/deals/${encodeURIComponent(tradeDealId)}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          interaction_type: 'outbound_message_draft',
          notes: redactBangladeshPii(draft).redacted_text,
          details: { source: 'deal_copilot' },
        }),
      });
      if (!res.ok) throw new Error('save failed');
      setReplySaved(true);
      setReplyDraft('');
      loadTimeline();
    } catch {
      setReplyError(t('খসড়া সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।', 'Could not save the draft. Try again.'));
    } finally {
      setSavingReply(false);
    }
  };

  const sectionTitle = 'text-[11px] font-bold uppercase tracking-wider font-bangla flex items-center gap-1.5';

  return (
    <aside className="card space-y-5" aria-label={t('ডিল সহকারী', 'Deal co-pilot')}>
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
          <Radar className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('ডিল সহকারী', 'Deal Co-Pilot')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
            {t('বায়ারের বার্তা যাচাই ও জবাবের খসড়া', 'Review buyer messages and draft replies')}
          </p>
        </div>
      </div>

      {/* Buyer message analysis */}
      <section className="space-y-2.5">
        <h4 className={`${sectionTitle} text-slate-600 dark:text-slate-400`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <span>{t('বায়ারের বার্তা বিশ্লেষণ', 'Buyer message analysis')}</span>
        </h4>
        <label htmlFor="copilot-buyer-msg" className="sr-only">
          {t('বায়ারের বার্তা এখানে লিখুন বা পেস্ট করুন', 'Paste or type the buyer message here')}
        </label>
        <textarea
          id="copilot-buyer-msg"
          rows={4}
          maxLength={8000}
          value={buyerMessage}
          onChange={(e) => setBuyerMessage(e.target.value)}
          placeholder={t(
            'বায়ারের ইমেইল বা বার্তা এখানে পেস্ট করুন। পেমেন্ট শর্ত ও দর স্বয়ংক্রিয়ভাবে যাচাই হবে।',
            'Paste the buyer email or message here. Payment terms and price are checked automatically.'
          )}
          className="field text-xs font-bangla"
        />
        <button
          type="button"
          onClick={analyze}
          disabled={analyzing || buyerMessage.trim().length < 3}
          className="btn-primary w-full justify-center text-xs"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>{t('যাচাই হচ্ছে...', 'Reviewing...')}</span>
            </>
          ) : (
            <span>{t('বার্তা যাচাই করুন', 'Review message')}</span>
          )}
        </button>

        {analyzeError && (
          <p role="alert" className="text-[11px] text-rose-700 dark:text-rose-300 font-bangla">{analyzeError}</p>
        )}

        {review && (
          <div className="space-y-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            {review.payment_flags.length > 0 ? (
              review.payment_flags.map((f, i) => (
                <div key={i} className={`rounded-lg border px-2.5 py-2 text-[11px] font-bangla ${sevCls(f.severity)}`}>
                  <span className="block font-bold">{t(f.issue_bn, f.issue_en)}</span>
                  <span className="block mt-0.5 opacity-90">{t(f.advice_bn, f.advice_en)}</span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-bangla flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('পেমেন্ট শর্তে বিপজ্জনক কিছু পাওয়া যায়নি।', 'No dangerous payment terms detected.')}</span>
              </div>
            )}

            {review.price_assessment && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400">{t('দর যাচাই', 'Price check')}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold font-bangla ${verdictCls(review.price_assessment.verdict)}`}>
                    {t(review.price_assessment.verdict_bn, review.price_assessment.verdict.replace('_', ' '))}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 font-mono uppercase">{t('দেওয়া', 'Offered')}</div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${review.price_assessment.offered_usd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-mono uppercase">{t('ন্যূনতম', 'Floor')}</div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${review.price_assessment.benchmark_floor_usd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-mono uppercase">{t('প্রস্তাবিত', 'Counter')}</div>
                    <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">${review.price_assessment.recommended_usd.toFixed(2)}</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bangla leading-snug">
                  {t(review.price_assessment.basis_bn, review.price_assessment.basis_en)}
                </p>
                {onApplyCounter && (
                  <button
                    type="button"
                    onClick={() => onApplyCounter(review.price_assessment!.recommended_usd, review.payment_flags.some((f) => f.severity === 'critical') ? SAFE_PAYMENT : undefined)}
                    className="btn-primary w-full justify-center text-[11px]"
                  >
                    {t('প্রস্তাবিত দর ও নিরাপদ শর্ত প্রয়োগ করুন', 'Apply recommended price and safe terms')}
                  </button>
                )}
              </div>
            )}

            {review.redacted_count > 0 && (
              <p className="text-[10px] text-slate-400 font-bangla">
                {t(
                  `সতর্কতা: বার্তায় সংবেদনশীল নম্বর ছিল; বিশ্লেষণের আগে ${review.redacted_count} টি মান আড়াল করা হয়েছে।`,
                  `Note: sensitive numbers were present; ${review.redacted_count} value(s) masked before review.`
                )}
              </p>
            )}
            {!review.price_assessment && review.note_en && (
              <p className="text-[10px] text-slate-400 font-bangla">{t(review.note_bn || '', review.note_en)}</p>
            )}
          </div>
        )}
      </section>

      {/* Reply draft: drives the deal into communication_draft */}
      <section className="space-y-2.5">
        <h4 className={`${sectionTitle} text-slate-600 dark:text-slate-400`}>
          <Send className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
          <span>{t('জবাবের খসড়া', 'Reply draft')}</span>
        </h4>
        <label htmlFor="copilot-reply" className="sr-only">
          {t('বায়ারকে পাঠানোর জবাবের খসড়া', 'Draft reply to send to the buyer')}
        </label>
        <textarea
          id="copilot-reply"
          rows={4}
          maxLength={10000}
          value={replyDraft}
          onChange={(e) => { setReplyDraft(e.target.value); setReplySaved(false); }}
          disabled={!tradeDealId}
          placeholder={
            tradeDealId
              ? t('জবাবের খসড়া লিখুন। সংরক্ষণ করলে ডিল যোগাযোগ পর্যায়ে চলে যাবে; কোনো বায়ারকে পাঠানো হবে না।', 'Draft your reply. Saving moves the deal to the communication stage; nothing is sent to any buyer.')
              : t('প্রথমে পণ্য বিশ্লেষণ সম্পন্ন করুন।', 'Run the product analysis first.')
          }
          className="field text-xs font-bangla disabled:opacity-50"
        />
        <button
          type="button"
          onClick={saveReply}
          disabled={!tradeDealId || savingReply || replyDraft.trim().length < 3}
          className="btn-secondary w-full justify-center text-xs"
        >
          {savingReply ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('খসড়া সংরক্ষণ করুন', 'Save draft')}
        </button>
        {replySaved && (
          <p role="status" className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bangla">
            {t('খসড়া সংরক্ষিত হয়েছে; কোনো বায়ারকে পাঠানো হয়নি।', 'Draft saved; it was not sent to any buyer.')}
          </p>
        )}
        {replyError && <p role="alert" className="text-[11px] text-rose-700 dark:text-rose-300 font-bangla">{replyError}</p>}
      </section>

      {/* Timeline */}
      <section className="space-y-2">
        <h4 className={`${sectionTitle} text-slate-600 dark:text-slate-400`}>
          <History className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>{t('সংরক্ষিত ঘটনা', 'Saved activity')}</span>
        </h4>
        {interactions.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-bangla">
            {t('এখনো কোনো খসড়া সংরক্ষিত হয়নি।', 'No drafts saved yet.')}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {interactions.slice().reverse().map((it) => (
              <li key={it.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                    {it.interaction_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">{it.created_at.slice(0, 10)}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-bangla">{it.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};
