import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Download, FileText, MessageSquare, RefreshCw, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Drawer } from './ui/dialog';

type Translate = (bn: string, en: string) => string;

export function quotationStatus(status: string | undefined, t: Translate): string {
  switch (status) {
    case 'submitted': return t('পাঠানো হয়েছে', 'Submitted');
    case 'accepted': return t('প্রস্তাব বেছে নেওয়া হয়েছে', 'Proposal selected');
    case 'declined': return t('গ্রহণ করা হয়নি', 'Declined');
    case 'withdrawn': return t('ফিরিয়ে নেওয়া হয়েছে', 'Withdrawn');
    default: return t('খসড়া', 'Draft');
  }
}

export async function quotationError(response: Response, fallback: string, t?: Translate): Promise<Error> {
  if (t) {
    const translated: Record<number, string> = {
      401: t('সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।', 'Your session has ended. Please log in again.'),
      403: t('এই কাজ করার অনুমতি আপনার অ্যাকাউন্টে নেই।', 'Your account does not have permission for this action.'),
      404: t('কোটেশন বা আলাপটি পাওয়া যায়নি। এটি আপনার অ্যাকাউন্টের কি না দেখুন।', 'The quotation or conversation could not be found. Check that it belongs to your account.'),
      409: t('কোটেশন বা চাহিদাপত্রের অবস্থা বদলেছে। হালনাগাদ করে আবার দেখুন।', 'The quotation or request has changed. Refresh to check its latest status.'),
      422: t('দর, পরিমাণ ও সময়ের তথ্য আবার দেখে দিন।', 'Check the price, quantity, and lead time and try again.'),
      429: t('অল্প সময়ে অনেক অনুরোধ এসেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।', 'Too many requests. Wait a moment and try again.'),
    };
    if (translated[response.status]) return new Error(translated[response.status]);
    if (response.status >= 500) return new Error(fallback);
  }
  const body = await response.json().catch(() => ({}));
  return new Error(typeof body.detail === 'string' ? body.detail : fallback);
}

interface ConversationMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  is_mine: boolean;
  body: string;
  created_at: string;
}

interface Conversation {
  bid: {
    id: string;
    status: string;
    notes?: string;
    factory_name?: string;
    buyer_company?: string;
    details: { proposed_fob_usd?: number; committed_units?: number; lead_time_days?: number };
    rfq: { product_title: string; status: string; destination_country: string };
  };
  messages: ConversationMessage[];
  total: number;
  offset: number;
  limit: number;
  can_message: boolean;
  can_decide: boolean;
  can_withdraw: boolean;
}

export interface Agreement {
  id: string;
  bid_id: string;
  rfq_id: string;
  product_title: string;
  hs_code: string;
  quantity_units: number;
  unit_price_usd: number;
  total_value_usd: number;
  lead_time_days: number;
  destination_country: string;
  delivery_deadline: string;
  incoterm: string;
  payment_terms: string | null;
  delivery_terms: string | null;
  stage: string;
  stage_index: number;
  stages: string[];
  can_edit_terms: boolean;
  can_advance: boolean;
  stage_history: { stage: string; at: string; note?: string }[];
  latest_lc_check?: {
    lc_number: string;
    health_score: number;
    risk_level: string;
    total_discrepancies: number;
    verdict_en: string;
    verdict_bn: string;
    checked_at: string;
  } | null;
  factory_name?: string | null;
  buyer_company?: string | null;
  is_mine_as_factory: boolean;
  is_mine_as_buyer: boolean;
}

export const AGREEMENT_STAGE_LABELS: Record<string, [string, string]> = {
  terms_draft: ['শর্ত খসড়া', 'Draft terms'],
  documents_ready: ['কাগজপত্র প্রস্তুত', 'Documents ready'],
  lc_reviewed: ['এলসি পর্যালোচনা', 'LC reviewed'],
  production_reported: ['উৎপাদন শুরু (রিপোর্ট)', 'Production reported'],
  shipped_reported: ['চালান (রিপোর্ট)', 'Shipment reported'],
  delivered_reported: ['ডেলিভারি (রিপোর্ট)', 'Delivery reported'],
};

export const AGREEMENT_NEXT_STEP: Record<string, [string, string]> = {
  terms_draft: ['ইনকোটার্ম ও পেমেন্ট শর্ত ঠিক করুন, তারপর প্রফর্মা খসড়া ডাউনলোড করে আলাপে শেয়ার করুন।', 'Agree the incoterm and payment terms, then download the proforma draft and share it in the conversation.'],
  documents_ready: ['প্রফর্মা খসড়া যাচাই করুন এবং চালানের আগে এলসি পর্যালোচনা চালান।', 'Review the proforma draft and run an LC audit before shipment documents.'],
  lc_reviewed: ['উৎপাদন শুরু হলে দুই পক্ষ মিলে উৎপাদনের রিপোর্ট চিহ্নিত করুন।', 'When production begins, either party can mark the production milestone together.'],
  production_reported: ['কাঁচামাল ও লাইনের প্রস্তুতি দেখুন, তারপর চালান বুকিং ও ডকুমেন্ট তালিকা ঠিক করুন।', 'Check material and line readiness, then agree the shipment booking and document list.'],
  shipped_reported: ['ক্রেতার গ্রহণ ও ডেলিভারি কাগজপত্র নিশ্চিত করুন, তারপর ডেলিভারি রিপোর্ট করুন।', 'Confirm buyer acceptance and delivery documents, then mark delivery reported.'],
  delivered_reported: ['এই প্ল্যাটফর্মে চুক্তির কাজ শেষ। রেকর্ডগুলো সংরক্ষণ করুন।', 'The deal workflow on this platform is complete. Keep the records for your files.'],
};

const AgreementPanel: React.FC<{ bidId: string; t: Translate; lang: string; onChanged?: () => void }> = ({ bidId, t, lang, onChanged }) => {
  const formatStamp = (value: string) => {
    const date = new Date(value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value) ? value : value + 'Z');
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [incoterm, setIncoterm] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/rfq/bids/${encodeURIComponent(bidId)}/agreement`, { credentials: 'include' });
      if (res.status === 404) { setMissing(true); return; }
      if (!res.ok) throw new Error('load failed');
      const data: Agreement = await res.json();
      setAgreement(data);
      setIncoterm(data.incoterm || '');
      setPaymentTerms(data.payment_terms || '');
      setDeliveryTerms(data.delivery_terms || '');
      setError('');
    } catch {
      setError(t('সম্মত শর্ত লোড করা যায়নি।', 'Could not load the agreed terms.'));
    }
  }, [bidId, t]);

  useEffect(() => { void load(); }, [load]);

  if (missing) return null;
  if (!agreement) {
    return error
      ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>
      : <p className="text-xs text-slate-500 dark:text-slate-400">{t('সম্মত শর্ত লোড হচ্ছে...', 'Loading agreed terms...')}</p>;
  }

  const saveTerms = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/terms`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incoterm, payment_terms: paymentTerms || null, delivery_terms: deliveryTerms || null }),
      });
      if (!res.ok) throw new Error('save failed');
      setEditing(false);
      await load();
      onChanged?.();
    } catch {
      setError(t('শর্ত সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।', 'Could not save the terms. Try again.'));
    } finally { setSaving(false); }
  };

  const advance = async () => {
    if (!agreement.can_advance) return;
    const next = agreement.stages[agreement.stage_index + 1];
    const label = AGREEMENT_STAGE_LABELS[next]?.[lang === 'bn' ? 0 : 1] || next;
    if (!window.confirm(t(`“${label}” হিসেবে চিহ্নিত করবেন? এটি দুই পক্ষের নিজস্ব রিপোর্ট করা অগ্রগতি, যাচাইকৃত সম্পন্নির প্রমাণ নয়।`, `Mark this as "${label}"? This is a self-reported milestone, not verified completion.`))) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/stage`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: next }),
      });
      if (!res.ok) throw new Error('advance failed');
      await load();
      onChanged?.();
    } catch {
      setError(t('অগ্রগতি সংরক্ষণ করা যায়নি।', 'Could not save progress.'));
    } finally { setSaving(false); }
  };

  const runLcCheck = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/lc-check`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('lc check failed');
      await load();
      onChanged?.();
    } catch {
      setError(t('এলসি যাচাই চালানো যায়নি। আবার চেষ্টা করুন।', 'Could not run the LC check. Try again.'));
    } finally { setSaving(false); }
  };

  const isParticipant = agreement.is_mine_as_factory || agreement.is_mine_as_buyer;

  return (
    <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <FileText className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          {t('সম্মত শর্ত ও অগ্রগতি', 'Agreed terms & progress')}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <a href={`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/proforma.pdf`} target="_blank" rel="noopener noreferrer"
             className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />{t('প্রফর্মা খসড়া PDF', 'Proforma draft PDF')}
          </a>
          <a href={`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/commercial-invoice.pdf`} target="_blank" rel="noopener noreferrer"
             className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />{t('কমার্শিয়াল ইনভয়েস খসড়া', 'Commercial invoice draft')}
          </a>
          <a href={`/api/v1/rfq/agreements/${encodeURIComponent(agreement.id)}/packing-list.pdf`} target="_blank" rel="noopener noreferrer"
             className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />{t('প্যাকিং লিস্ট খসড়া', 'Packing list draft')}
          </a>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <div><dt className="text-slate-500 dark:text-slate-400">{t('দর', 'Price')}</dt><dd className="font-mono text-slate-900 dark:text-slate-100">USD {agreement.unit_price_usd.toFixed(2)} x {agreement.quantity_units.toLocaleString()}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('ইনকোটার্ম', 'Incoterm')}</dt><dd className="text-slate-900 dark:text-slate-100">{agreement.incoterm || '-'}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('পেমেন্ট', 'Payment')}</dt><dd className="text-slate-900 dark:text-slate-100">{agreement.payment_terms || t('আলোচনা বাকি', 'To discuss')}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('ডেলিভারি', 'Delivery')}</dt><dd className="text-slate-900 dark:text-slate-100">{agreement.delivery_terms || agreement.delivery_deadline}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t(' HS কোড', 'HS code')}</dt><dd className="font-mono text-slate-900 dark:text-slate-100">{agreement.hs_code}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('মোট (USD)', 'Total (USD)')}</dt><dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">{agreement.total_value_usd.toLocaleString()}</dd></div>
      </dl>
      {(agreement.payment_terms || agreement.delivery_terms) && !editing && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('এই শর্তগুলো খসড়া। চূড়ান্ত চুক্তি বা ব্যাংক নির্দেশনা নয়।', 'These are draft terms, not a final contract or bank instruction.')}</p>
      )}
      {agreement.can_edit_terms && !editing && (
        <button type="button" className="btn-secondary text-xs" onClick={() => setEditing(true)}>{t('শর্ত খসড়া সম্পাদনা', 'Edit draft terms')}</button>
      )}
      {editing && agreement.can_edit_terms && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="agr-incoterm">{t('ইনকোটার্ম', 'Incoterm')}</label>
          <input id="agr-incoterm" className="field w-full text-xs" value={incoterm} onChange={e => setIncoterm(e.target.value)} maxLength={50} />
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="agr-payment">{t('পেমেন্ট শর্ত', 'Payment terms')}</label>
          <input id="agr-payment" className="field w-full text-xs" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} maxLength={255} placeholder="e.g. 30% TT advance, 70% against B/L copy" />
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="agr-delivery">{t('ডেলিভারি শর্ত', 'Delivery terms')}</label>
          <input id="agr-delivery" className="field w-full text-xs" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} maxLength={500} />
          <div className="flex gap-2">
            <button type="button" disabled={saving} className="btn-primary text-xs" onClick={() => void saveTerms()}>{saving ? t('সংরক্ষণ...', 'Saving...') : t('সংরক্ষণ', 'Save')}</button>
            <button type="button" disabled={saving} className="btn-secondary text-xs" onClick={() => setEditing(false)}>{t('বাতিল', 'Cancel')}</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}
      <div>
        <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{t('অগ্রগতির ধাপ', 'Progress stages')}</p>
        <ol className="flex flex-wrap gap-1.5">
          {agreement.stages.map((s, i) => {
            const done = i <= agreement.stage_index;
            const current = i === agreement.stage_index;
            const label = AGREEMENT_STAGE_LABELS[s]?.[lang === 'bn' ? 0 : 1] || s;
            return (
              <li key={s} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${current ? 'border-emerald-500 bg-emerald-600 text-white' : done ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'}`}>
                {label}
              </li>
            );
          })}
        </ol>
        <div className="mt-2 flex flex-wrap gap-2">
          {agreement.can_advance && (
            <button type="button" disabled={saving} className="btn-secondary text-xs" onClick={() => void advance()}>
              {t('পরের ধাপ চিহ্নিত করুন', 'Mark next step')}
            </button>
          )}
          {isParticipant && (
            <button type="button" disabled={saving} className="btn-secondary text-xs" onClick={() => void runLcCheck()}>
              {t('UCP 600 এলসি যাচাই চালান', 'Run UCP 600 LC check')}
            </button>
          )}
        </div>
        {agreement.latest_lc_check && (
          <div className="mt-2 rounded-lg border border-emerald-200 bg-white/90 px-3 py-2 text-[11px] text-slate-700 dark:border-emerald-800 dark:bg-slate-900/80 dark:text-slate-200">
            <p className="font-semibold">
              {t('সর্বশেষ UCP 600 স্ক্রিনিং ফলাফল', 'Latest UCP 600 screening result')}: {agreement.latest_lc_check.health_score}/100 ({agreement.latest_lc_check.risk_level}) - {agreement.latest_lc_check.total_discrepancies} {t('টি অসঙ্গতি', 'findings')}
            </p>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? agreement.latest_lc_check.verdict_bn : agreement.latest_lc_check.verdict_en}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              {t('এটি সম্মত খসড়া শর্তের ওপর প্রাথমিক নিয়ম যাচাই, ব্যাংকের চূড়ান্ত এলসি অনুমোদন নয়।', 'Rule-based screening against agreed draft terms, not an issuing or negotiating bank approval.')}
            </p>
          </div>
        )}
        {AGREEMENT_NEXT_STEP[agreement.stage] && (
          <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
            {t('পরবর্তী ধাপ: ', 'Next: ')}{AGREEMENT_NEXT_STEP[agreement.stage][lang === 'bn' ? 0 : 1]}
          </p>
        )}
        {agreement.stage_history.length > 1 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] font-medium text-slate-600 dark:text-slate-400">{t('অগ্রগতির ইতিহাস', 'Progress history')}</summary>
            <ol className="mt-1 space-y-1 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
              {[...agreement.stage_history].reverse().slice(0, 8).map((entry, idx) => (
                <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{AGREEMENT_STAGE_LABELS[entry.stage]?.[lang === 'bn' ? 0 : 1] || entry.stage}</span>
                  {entry.note ? ` - ${entry.note}` : ''}
                  <span className="block text-slate-500 dark:text-slate-500">{formatStamp(entry.at)}</span>
                </li>
              ))}
            </ol>
          </details>
        )}
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t('ধাপগুলো দুই পক্ষের নিজস্ব রিপোর্ট করা অগ্রগতি। সম্পন্নির যাচাইকৃত প্রমাণ নয়।', 'Stages are self-reported milestones by the two account holders, not verified completion.')}</p>
      </div>
    </section>
  );
};

interface Props {
  bidId: string;
  onClose: () => void;
  onChanged: () => void;
}

async function requestQuotation(url: string, options: RequestInit = {}, controller = new AbortController()) {
  const timeout = window.setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(url, { credentials: 'include', ...options, signal: controller.signal });
  } finally { window.clearTimeout(timeout); }
}

export const QuotationConversation: React.FC<Props> = ({ bidId, onClose, onChanged }) => {
  const { t, lang } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [confirm, setConfirm] = useState<'accepted' | 'declined' | 'withdrawn' | null>(null);
  const sequence = useRef(0);
  const loadController = useRef<AbortController | null>(null);
  const firstLoad = useRef(true);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const messageAttempt = useRef<{ id: string; body: string } | null>(null);
  const pageSize = 30;

  const load = useCallback(async (showLoading = false) => {
    const request = ++sequence.current;
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    if (showLoading) setLoading(true);
    try {
      const response = await requestQuotation(`/api/v1/rfq/bids/${encodeURIComponent(bidId)}/conversation?offset=${offset}&limit=${pageSize}`, {}, controller);
      if (!response.ok) throw await quotationError(response, t('আলাপ লোড করা যায়নি। আবার চেষ্টা করুন।', 'Could not load the conversation. Try again.'), t);
      const data: Conversation = await response.json();
      if (request !== sequence.current) return;
      const latestOffset = Math.max(0, Math.floor((data.total - 1) / pageSize) * pageSize);
      if (firstLoad.current && offset !== latestOffset) {
        firstLoad.current = false;
        setOffset(latestOffset);
        return;
      }
      firstLoad.current = false;
      setConversation(data);
      setError('');
    } catch (err) {
      if (request === sequence.current) setError(err instanceof DOMException && err.name === 'AbortError' ? t('লোড হতে বেশি সময় লাগছে। আবার চেষ্টা করুন।', 'Loading took too long. Try again.') : err instanceof Error ? err.message : t('আলাপ লোড করা যায়নি।', 'Could not load the conversation.'));
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, [bidId, offset, t]);

  useEffect(() => {
    void load(true);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 15000);
    return () => { sequence.current += 1; loadController.current?.abort(); window.clearInterval(timer); };
  }, [load, revision]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !body.trim() || !conversation?.can_message) return;
    setBusy(true);
    setError('');
    setNotice('');
    const text = body.trim();
    if (!messageAttempt.current || messageAttempt.current.body !== text) {
      messageAttempt.current = { id: crypto.randomUUID(), body: text };
    }
    try {
      const response = await requestQuotation(`/api/v1/rfq/bids/${encodeURIComponent(bidId)}/messages`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text, client_message_id: messageAttempt.current.id }),
      });
      if (!response.ok) throw await quotationError(response, t('বার্তা পাঠানো যায়নি। লেখাটি রেখে দেওয়া হয়েছে।', 'Could not send your message. Your text has been kept.'), t);
      setBody('');
      messageAttempt.current = null;
      setNotice(t('বার্তা পাঠানো হয়েছে।', 'Message sent.'));
      firstLoad.current = true;
      setRevision(value => value + 1);
      messageInput.current?.focus();
    } catch (err) {
      setError(err instanceof DOMException && err.name === 'AbortError' ? t('বার্তা পৌঁছেছে কি না নিশ্চিত হওয়া যায়নি। আবার পাঠানোর আগে আলাপ হালনাগাদ করে দেখুন।', 'Delivery could not be confirmed. Refresh the conversation before sending again.') : err instanceof Error ? err.message : t('বার্তা পাঠানো যায়নি।', 'Could not send the message.'));
    } finally { setBusy(false); }
  };

  const changeStatus = async () => {
    if (!confirm || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const endpoint = confirm === 'withdrawn' ? 'withdraw' : 'decision';
      const response = await requestQuotation(`/api/v1/rfq/bids/${encodeURIComponent(bidId)}/${endpoint}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        ...(endpoint === 'decision' ? { body: JSON.stringify({ decision: confirm }) } : {}),
      });
      if (!response.ok) throw await quotationError(response, t('পরিবর্তন সংরক্ষণ করা যায়নি। তালিকাটি হালনাগাদ করে আবার দেখুন।', 'Could not save the change. Refresh to check the latest status.'), t);
      setNotice(quotationStatus(confirm, t));
      setConfirm(null);
      setRevision(value => value + 1);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('পরিবর্তন সংরক্ষণ করা যায়নি।', 'Could not save the change.'));
      void load();
    } finally { setBusy(false); }
  };

  const formatDate = (value: string) => {
    const date = new Date(value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value) ? value : value + 'Z');
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  return (
    <Drawer open onClose={onClose} title={t('কোটেশন নিয়ে আলাপ', 'Quotation conversation')} className="sm:max-w-2xl">
      <div className="space-y-6">
        {loading && !conversation && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">{t('আলাপ লোড হচ্ছে...', 'Loading conversation...')}</p>}
        {error && <div role="alert" className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"><p>{error}</p><button type="button" onClick={() => void load(true)} disabled={busy || loading} className="btn-secondary text-xs">{t('আবার চেষ্টা করুন', 'Try again')}</button></div>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{notice}</p>}
        {conversation && <>
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><h4 className="break-words font-semibold text-slate-900 dark:text-slate-100">{conversation.bid.rfq.product_title}</h4><p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{conversation.bid.factory_name} / {conversation.bid.buyer_company}</p></div>
              <span className="badge badge-blue">{quotationStatus(conversation.bid.status, t)}</span>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div><dt className="text-xs text-slate-600 dark:text-slate-400">{t('প্রতি পিস দর', 'Unit price')}</dt><dd className="mt-1 font-mono text-slate-900 dark:text-slate-100">USD {Number(conversation.bid.details.proposed_fob_usd || 0).toFixed(2)}</dd></div>
              <div><dt className="text-xs text-slate-600 dark:text-slate-400">{t('পরিমাণ', 'Quantity')}</dt><dd className="mt-1 font-mono text-slate-900 dark:text-slate-100">{Number(conversation.bid.details.committed_units || 0).toLocaleString()}</dd></div>
              <div><dt className="text-xs text-slate-600 dark:text-slate-400">{t('প্রস্তুতির সময়', 'Lead time')}</dt><dd className="mt-1 text-slate-900 dark:text-slate-100">{conversation.bid.details.lead_time_days} {t('দিন', 'days')}</dd></div>
            </dl>
            {conversation.bid.notes && <p className="whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">{conversation.bid.notes}</p>}
          </section>
          <div className="flex items-center justify-between gap-3"><h4 className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"><MessageSquare className="h-4 w-4" aria-hidden="true" />{t('বার্তা', 'Messages')}</h4><button type="button" onClick={() => void load(true)} disabled={loading || busy} className="btn-ghost inline-flex items-center gap-2 text-xs"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />{t('হালনাগাদ', 'Refresh')}</button></div>
          {conversation.messages.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">{t('এখনো কোনো বার্তা নেই। দর, নমুনা বা সরবরাহের শর্ত নিয়ে এখানে আলাপ করতে পারেন।', 'No messages yet. Discuss price, samples, or delivery terms here.')}</p> : <ol aria-label={t('আলাপের ইতিহাস', 'Conversation history')} className="space-y-4">
            {conversation.messages.map(message => <li key={message.id} className={`max-w-[94%] rounded-2xl border p-4 ${message.is_mine ? 'ml-auto border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40' : 'mr-auto border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="break-words text-xs font-semibold text-slate-800 dark:text-slate-200">{message.is_mine ? t('আপনি', 'You') : message.sender_name}</span><time dateTime={message.created_at} className="text-xs text-slate-600 dark:text-slate-400">{formatDate(message.created_at)}</time></div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900 dark:text-slate-100">{message.body}</p>
            </li>)}
          </ol>}
          {conversation.total > pageSize && <div className="flex flex-wrap items-center justify-between gap-3 text-xs"><button type="button" className="btn-secondary text-xs" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - pageSize))}>{t('আগের বার্তা', 'Earlier messages')}</button><span className="text-slate-600 dark:text-slate-400">{offset + 1}-{offset + conversation.messages.length} / {conversation.total}</span><button type="button" className="btn-secondary text-xs" disabled={offset + pageSize >= conversation.total || loading} onClick={() => setOffset(offset + pageSize)}>{t('পরের বার্তা', 'Later messages')}</button></div>}
          {conversation.bid.status === 'accepted' && <AgreementPanel bidId={bidId} t={t} lang={lang} onChanged={onChanged} />}
          {conversation.can_message ? <form onSubmit={sendMessage} className="space-y-3">
            <label htmlFor="quotation-message" className="block text-sm font-medium text-slate-800 dark:text-slate-200">{t('আপনার বার্তা', 'Your message')}</label>
            <textarea ref={messageInput} id="quotation-message" rows={3} maxLength={5000} required value={body} onChange={event => setBody(event.target.value)} className="field w-full resize-y" placeholder={t('দর, নমুনা বা ডেলিভারি নিয়ে লিখুন...', 'Write about price, samples, or delivery...')} />
            <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-600 dark:text-slate-400">{body.length.toLocaleString()} / 5,000</span><button type="submit" disabled={busy || !body.trim()} className="btn-primary inline-flex items-center gap-2"><Send className="h-4 w-4" aria-hidden="true" />{busy ? t('অপেক্ষা করুন...', 'Please wait...') : t('বার্তা পাঠান', 'Send message')}</button></div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('বার্তা শুধু এই প্ল্যাটফর্মে পৌঁছাবে। পাসওয়ার্ড, পরিচয়পত্র বা ব্যাংকের গোপন তথ্য লিখবেন না।', 'Messages are delivered inside this platform. Keep passwords, identity documents, and confidential bank details out of the conversation.')}</p>
          </form> : <p className="text-sm text-slate-600 dark:text-slate-400">{t('এই কোটেশনে নতুন বার্তা পাঠানো বন্ধ আছে। আগের আলাপ দেখতে পারবেন।', 'New messages are closed for this quotation. Its conversation history remains available.')}</p>}
          {(conversation.can_decide || conversation.can_withdraw) && <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('প্রস্তাব বেছে নেওয়া মানে পরবর্তী আলোচনা এগিয়ে নেওয়া। এতে চুক্তি সই, পেমেন্ট বা চালান সম্পন্ন হয় না।', 'Selecting a proposal moves the discussion forward. It does not sign a contract, process payment, or complete a shipment.')}</p>
            {confirm ? <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
              <p className="text-sm text-amber-900 dark:text-amber-200">{confirm === 'accepted' ? t('এই প্রস্তাবটি বেছে নেবেন? চাহিদাপত্রে নতুন কোটেশন নেওয়া বন্ধ হবে। এই সিদ্ধান্ত পরে বদলানো যাবে না।', 'Select this proposal? The request will stop receiving new quotations. This decision cannot be changed here.') : confirm === 'declined' ? t('এই প্রস্তাবটি গ্রহণ করবেন না? এই কোটেশনের আলাপ বন্ধ হবে। এই সিদ্ধান্ত পরে বদলানো যাবে না।', 'Decline this proposal? Its conversation will close. This decision cannot be changed here.') : t('কোটেশন ফিরিয়ে নেবেন? এরপর এই কোটেশনে নতুন আলাপ করা যাবে না।', 'Withdraw this quotation? New messages on it will be closed.')}</p>
              <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} className="btn-primary text-xs" onClick={() => void changeStatus()}>{busy ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('নিশ্চিত করুন', 'Confirm')}</button><button type="button" disabled={busy} className="btn-secondary text-xs" onClick={() => setConfirm(null)}>{t('ফিরে যান', 'Go back')}</button></div>
            </div> : <div className="flex flex-wrap gap-3">
              {conversation.can_decide && <><button type="button" disabled={busy} className="btn-primary inline-flex items-center gap-2 text-xs" onClick={() => setConfirm('accepted')}><Check className="h-4 w-4" aria-hidden="true" />{t('এই প্রস্তাব বেছে নিন', 'Select proposal')}</button><button type="button" disabled={busy} className="btn-secondary inline-flex items-center gap-2 text-xs" onClick={() => setConfirm('declined')}><X className="h-4 w-4" aria-hidden="true" />{t('গ্রহণ করব না', 'Decline')}</button></>}
              {conversation.can_withdraw && <button type="button" disabled={busy} className="btn-secondary text-xs" onClick={() => setConfirm('withdrawn')}>{t('কোটেশন ফিরিয়ে নিন', 'Withdraw quotation')}</button>}
            </div>}
          </section>}
        </>}
      </div>
    </Drawer>
  );
};
