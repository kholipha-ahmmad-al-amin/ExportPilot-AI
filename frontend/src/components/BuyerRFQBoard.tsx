import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface RFQItem {
  is_owner: boolean;
  is_illustrative: boolean;
  id: string;
  product_title: string;
  hs_code: string;
  target_fob_usd: number;
  quantity_units: number;
  destination_country: string;
  target_co2_kg: number;
  delivery_deadline: string;
  status: string;
  buyer_company: string;
}

interface CapacitySummary {
  monthly_capacity_units: number;
  allocated_units: number;
  available_units: number;
  utilization_pct: number;
  production_line_count: number;
  next_available_slot: string;
}

const inputClass = 'field w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100';

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => ({}));
  return new Error(typeof body.detail === 'string' ? body.detail : fallback);
}

export const BuyerRFQBoard: React.FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
  const { t, user } = useAuth();
  const canManageFactory = user?.role === 'factory_owner' || user?.role === 'admin';
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [rfqOffset, setRfqOffset] = useState(0);
  const [rfqTotal, setRfqTotal] = useState(0);
  const [showMine, setShowMine] = useState(user?.role === 'verified_buyer');
  const rfqSequence = useRef(0);
  const pageSize = 20;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null);
  const [capacityLoaded, setCapacityLoaded] = useState(false);
  const [capacityError, setCapacityError] = useState('');
  const [monthly, setMonthly] = useState('');
  const [allocated, setAllocated] = useState('0');
  const [lines, setLines] = useState('');
  const [slot, setSlot] = useState('');
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [capacitySaved, setCapacitySaved] = useState(false);
  const [selected, setSelected] = useState<RFQItem | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [leadDays, setLeadDays] = useState('');
  const [notes, setNotes] = useState('');
  const [savingBid, setSavingBid] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSaved, setBidSaved] = useState(false);
  const [quotesRevision, setQuotesRevision] = useState(0);
  const [selectedInbox, setSelectedInbox] = useState<RFQItem | null>(null);

  const fetchRfqs = useCallback(async () => {
    const sequence = ++rfqSequence.current;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        offset: String(rfqOffset),
        limit: String(pageSize),
        mine: String(user?.role === 'verified_buyer' && showMine),
      });
      const response = await fetch('/api/v1/rfq/feed?' + params.toString(), { credentials: 'include' });
      if (!response.ok) throw await responseError(response, t('চাহিদাপত্র লোড করা যায়নি।', 'Could not load RFQs.'));
      const data = await response.json();
      if (sequence !== rfqSequence.current) return;
      setRfqs(Array.isArray(data.items) ? data.items : []);
      setRfqTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (err) {
      if (sequence === rfqSequence.current) {
        setError(err instanceof Error ? err.message : t('চাহিদাপত্র লোড করা যায়নি।', 'Could not load RFQs.'));
      }
    } finally {
      if (sequence === rfqSequence.current) setLoading(false);
    }
  }, [t, rfqOffset, showMine, user?.role]);
  const fetchCapacity = useCallback(async () => {
    if (!canManageFactory) return;
    setCapacityError('');
    try {
      const response = await fetch('/api/v1/rfq/capacity', { credentials: 'include' });
      if (response.status === 404) {
        setCapacity(null);
      } else {
        if (!response.ok) throw await responseError(response, t('সক্ষমতার তথ্য লোড করা যায়নি।', 'Could not load capacity.'));
        const data: CapacitySummary = await response.json();
        setCapacity(data);
        setMonthly(String(data.monthly_capacity_units));
        setAllocated(String(data.allocated_units));
        setLines(String(data.production_line_count));
        setSlot(data.next_available_slot);
      }
    } catch (err) {
      setCapacityError(err instanceof Error ? err.message : t('সক্ষমতার তথ্য লোড করা যায়নি।', 'Could not load capacity.'));
    } finally {
      setCapacityLoaded(true);
    }
  }, [canManageFactory, t]);

  useEffect(() => { void fetchRfqs(); return () => { rfqSequence.current += 1; }; }, [fetchRfqs, refreshKey]);
  useEffect(() => { fetchCapacity(); }, [fetchCapacity]);

  const saveCapacity = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingCapacity(true);
    setCapacityError('');
    setCapacitySaved(false);
    try {
      const response = await fetch('/api/v1/rfq/capacity', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_capacity_units: Number(monthly), allocated_units: Number(allocated),
          production_line_count: Number(lines), next_available_slot: slot,
        }),
      });
      if (!response.ok) throw await responseError(response, t('সক্ষমতা সংরক্ষণ করা যায়নি।', 'Could not save capacity.'));
      const data: CapacitySummary = await response.json();
      setCapacity(data);
      setCapacitySaved(true);
    } catch (err) {
      setCapacityError(err instanceof Error ? err.message : t('সক্ষমতা সংরক্ষণ করা যায়নি।', 'Could not save capacity.'));
    } finally {
      setSavingCapacity(false);
    }
  };

  const saveBid = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSavingBid(true);
    setBidError('');
    try {
      const response = await fetch('/api/v1/rfq/' + encodeURIComponent(selected.id) + '/bid', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposed_fob_usd: Number(price), committed_units: Number(quantity),
          lead_time_days: Number(leadDays), factory_notes_bn: notes.trim() || undefined,
        }),
      });
      if (!response.ok) throw await responseError(response, t('খসড়া সংরক্ষণ করা যায়নি।', 'Could not save draft.'));
      setBidSaved(true);
      setQuotesRevision(value => value + 1);
    } catch (err) {
      setBidError(err instanceof Error ? err.message : t('খসড়া সংরক্ষণ করা যায়নি।', 'Could not save draft.'));
    } finally {
      setSavingBid(false);
    }
  };

  return (
    <section className="card space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('ক্রেতার চাহিদাপত্র', 'Buyer requests')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('চাহিদাপত্র দেখে কোটেশনের খসড়া তৈরি করুন। প্রস্তুত হলে প্ল্যাটফর্মে বায়ারকে পাঠাতে পারবেন।', 'View requests, prepare quotations, and submit them to the buyer inside the platform.')}
          </p>
        </div>
        <button type="button" onClick={fetchRfqs} disabled={loading} className="btn-secondary text-xs">{t('রিফ্রেশ', 'Refresh')}</button>
      </div>
      {user?.role === 'verified_buyer' && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('চাহিদাপত্রের তালিকা', 'Request view')}>
          <button type="button" aria-pressed={showMine} onClick={() => { setRfqOffset(0); setShowMine(true); setSelectedInbox(null); }} className={showMine ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
            {t('আমার চাহিদাপত্র', 'My requests')}
          </button>
          <button type="button" aria-pressed={!showMine} onClick={() => { setRfqOffset(0); setShowMine(false); setSelectedInbox(null); }} className={!showMine ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
            {t('সব খোলা চাহিদাপত্র', 'All open requests')}
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
      {loading ? <p className="text-sm text-slate-600 dark:text-slate-400">{t('লোড হচ্ছে...', 'Loading...')}</p> :
        rfqs.length === 0 ? <p className="text-sm text-slate-600 dark:text-slate-400">{t('এখন কোনো সক্রিয় চাহিদাপত্র নেই।', 'There are no active requests right now.')}</p> :
        <div className="grid gap-4 md:grid-cols-2">
          {rfqs.map(rfq => (
            <article key={rfq.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{rfq.product_title}</h3>
              {rfq.is_illustrative && <span className="badge badge-blue">{t('নমুনা চাহিদাপত্র', 'Illustrative request')}</span>}
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{rfq.buyer_company} ({rfq.destination_country})</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">HS {rfq.hs_code} | {rfq.quantity_units.toLocaleString()} {t('পিস', 'units')} | USD {rfq.target_fob_usd.toFixed(2)}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('শেষ তারিখ', 'Deadline')}: {rfq.delivery_deadline}</p>
              {canManageFactory && !rfq.is_owner && <button type="button" className="btn-secondary mt-3 text-xs" onClick={() => { setSelected(rfq); setPrice(String(rfq.target_fob_usd)); setQuantity(String(rfq.quantity_units)); setLeadDays(''); setNotes(''); setBidError(''); setBidSaved(false); }}>{t('কোটেশনের খসড়া তৈরি', 'Prepare quotation draft')}</button>}
              {(rfq.is_owner || user?.role === 'admin') && <button type="button" className="btn-secondary mt-3 text-xs" onClick={() => setSelectedInbox(rfq)}>{t('প্রাপ্ত কোটেশন দেখুন', 'View received quotations')}</button>}
            </article>
          ))}
        </div>
      }
      {(rfqTotal > pageSize || rfqOffset > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800" aria-label={t('চাহিদাপত্র পৃষ্ঠা', 'Request pages')}>
          <button type="button" className="btn-secondary text-xs" disabled={loading || rfqOffset === 0} onClick={() => { setRfqOffset(Math.max(0, rfqOffset - pageSize)); setSelectedInbox(null); }}>
            {t('আগের পৃষ্ঠা', 'Previous')}
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-400" aria-live="polite">
            {t('দেখানো হচ্ছে', 'Showing')} {rfqs.length ? rfqOffset + 1 : 0}-{rfqs.length ? rfqOffset + rfqs.length : 0} / {rfqTotal}
          </span>
          <button type="button" className="btn-secondary text-xs" disabled={loading || rfqOffset + pageSize >= rfqTotal} onClick={() => { setRfqOffset(rfqOffset + pageSize); setSelectedInbox(null); }}>
            {t('পরের পৃষ্ঠা', 'Next')}
          </button>
        </div>
      )}
      {canManageFactory && <QuotationList mode="sent" refreshKey={quotesRevision} />}
      {selectedInbox && (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('প্রাপ্ত কোটেশন', 'Received quotations')}: {selectedInbox.product_title}</h3>
            <button type="button" className="btn-secondary text-xs" onClick={() => setSelectedInbox(null)}>{t('বন্ধ করুন', 'Close')}</button>
          </div>
          <QuotationList mode="received" rfqId={selectedInbox.id} refreshKey={quotesRevision} />
        </div>
      )}
      {selected && (
        <div role="dialog" aria-modal="true" aria-label={t('কোটেশনের খসড়া', 'Quotation draft')} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{selected.product_title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('এই খসড়া আপনার অ্যাকাউন্টে থাকবে। বায়ারকে পাঠানো হবে না।', 'This draft stays in your account and is not sent to the buyer.')}</p>
            {bidSaved ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{t('খসড়া সংরক্ষিত হয়েছে। বন্ধ করে আমার কোটেশন থেকে বায়ারকে পাঠাতে পারেন।', 'Draft saved. Close this window to submit it from My quotations.')}</p> :
              <form onSubmit={saveBid} className="space-y-3">
                <label className="block text-sm">{t('প্রতি পিস দর (USD)', 'Price per unit (USD)')}<input className={inputClass} type="number" min="0.01" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} /></label>
                <label className="block text-sm">{t('পরিমাণ', 'Quantity')}<input className={inputClass} type="number" min="1" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
                <label className="block text-sm">{t('সম্ভাব্য সময় (দিন)', 'Estimated lead time (days)')}<input className={inputClass} type="number" min="7" max="180" step="1" required value={leadDays} onChange={e => setLeadDays(e.target.value)} /></label>
                <label className="block text-sm">{t('নোট', 'Notes')}<textarea className={inputClass} maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} /></label>
                {bidError && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{bidError}</p>}
                <button type="submit" disabled={savingBid} className="btn-primary text-xs">{savingBid ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('খসড়া সংরক্ষণ', 'Save draft')}</button>
              </form>
            }
            <button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>{t('বন্ধ করুন', 'Close')}</button>
          </div>
        </div>
      )}
      {canManageFactory && (
        <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('কারখানার উৎপাদন সক্ষমতা', 'Factory production capacity')}</h3>
          {!capacityLoaded ? <p className="text-sm text-slate-600 dark:text-slate-400">{t('লোড হচ্ছে...', 'Loading...')}</p> :
            <form onSubmit={saveCapacity} className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">{t('মাসিক সক্ষমতা', 'Monthly capacity')}<input className={inputClass} type="number" min="1" step="1" required value={monthly} onChange={e => setMonthly(e.target.value)} /></label>
              <label className="text-sm">{t('বরাদ্দ পরিমাণ', 'Allocated units')}<input className={inputClass} type="number" min="0" max={monthly || undefined} step="1" required value={allocated} onChange={e => setAllocated(e.target.value)} /></label>
              <label className="text-sm">{t('উৎপাদন লাইন', 'Production lines')}<input className={inputClass} type="number" min="1" step="1" required value={lines} onChange={e => setLines(e.target.value)} /></label>
              <label className="text-sm">{t('পরবর্তী খালি সময়', 'Next available date')}<input className={inputClass} type="date" required value={slot} onChange={e => setSlot(e.target.value)} /></label>
              <div className="sm:col-span-2">
                {capacity && <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{t('সংরক্ষিত অবশিষ্ট সক্ষমতা', 'Saved available capacity')}: {capacity.available_units.toLocaleString()}</p>}
                {!capacity && <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{t('সক্ষমতার তথ্য এখনো যোগ করা হয়নি।', 'Capacity has not been configured yet.')}</p>}
                {capacityError && <p role="alert" className="mb-2 text-sm text-rose-700 dark:text-rose-300">{capacityError}</p>}
                {capacitySaved && <p role="status" className="mb-2 text-sm text-emerald-700 dark:text-emerald-300">{t('সক্ষমতার তথ্য সংরক্ষিত হয়েছে।', 'Capacity saved.')}</p>}
                <button type="submit" disabled={savingCapacity} className="btn-primary text-xs">{savingCapacity ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('সক্ষমতা সংরক্ষণ', 'Save capacity')}</button>
              </div>
            </form>
          }
        </div>
      )}
    </section>
  );
};

interface QuotationItem {
  id: string;
  status?: string;
  factory_name?: string | null;
  notes?: string;
  details: {
    rfq_id?: string;
    buyer_company?: string;
    proposed_fob_usd?: number;
    committed_units?: number;
    lead_time_days?: number;
  };
}

const QuotationList: React.FC<{ mode: 'sent' | 'received'; rfqId?: string; refreshKey: number }> = ({ mode, rfqId, refreshKey }) => {
  const { t } = useAuth();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [localRevision, setLocalRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const endpoint = mode === 'sent' ? '/api/v1/rfq/my-bids' : '/api/v1/rfq/' + encodeURIComponent(rfqId || '') + '/bids';
    setLoading(true);
    setError('');
    fetch(endpoint, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw await responseError(response, t('কোটেশন লোড করা যায়নি।', 'Could not load quotations.'));
        return response.json();
      })
      .then(data => { if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : t('কোটেশন লোড করা যায়নি।', 'Could not load quotations.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mode, rfqId, refreshKey, localRevision, t]);

  const submit = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      const response = await fetch('/api/v1/rfq/bids/' + encodeURIComponent(id) + '/submit', { method: 'POST', credentials: 'include' });
      if (!response.ok) throw await responseError(response, t('কোটেশন পাঠানো যায়নি।', 'Could not submit quotation.'));
      setLocalRevision(value => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('কোটেশন পাঠানো যায়নি।', 'Could not submit quotation.'));
    } finally { setBusyId(''); }
  };

  return (
    <div className={mode === 'sent' ? 'space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800' : 'space-y-3'}>
      {mode === 'sent' && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('আমার কোটেশন', 'My quotations')}</h3>}
      {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
      {loading ? <p className="text-sm text-slate-600 dark:text-slate-400">{t('লোড হচ্ছে...', 'Loading...')}</p> : items.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">{mode === 'sent' ? t('এখনো কোনো কোটেশন নেই।', 'No quotations yet.') : t('এখনো কোনো কোটেশন পাওয়া যায়নি।', 'No quotations received yet.')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{mode === 'received' ? (item.factory_name || t('কারখানা', 'Factory')) : (item.details.buyer_company || t('বায়ারের অনুরোধ', 'Buyer request'))}</span>
                {mode === 'sent' && <span className="badge badge-blue">{item.status === 'submitted' ? t('পাঠানো হয়েছে', 'Submitted') : t('খসড়া', 'Draft')}</span>}
              </div>
              <p className="mt-2 text-slate-700 dark:text-slate-300">USD {Number(item.details.proposed_fob_usd || 0).toFixed(2)} | {Number(item.details.committed_units || 0).toLocaleString()} {t('পিস', 'units')} | {Number(item.details.lead_time_days || 0)} {t('দিন', 'days')}</p>
              {item.notes && <p className="mt-1 text-slate-600 dark:text-slate-400">{item.notes}</p>}
              {mode === 'sent' && item.status === 'draft' && <button type="button" disabled={Boolean(busyId)} onClick={() => void submit(item.id)} className="btn-primary mt-3 text-xs">{busyId === item.id ? t('পাঠানো হচ্ছে...', 'Submitting...') : t('বায়ারকে পাঠান', 'Submit to buyer')}</button>}
            </li>
          ))}
        </ul>
      )}
      {mode === 'sent' && <p className="text-xs text-slate-600 dark:text-slate-400">{t('পাঠানো কোটেশন বায়ার এই প্ল্যাটফর্মে দেখতে পারবেন।', 'Submitted quotations are visible to the buyer in this platform.')}</p>}
    </div>
  );
};
