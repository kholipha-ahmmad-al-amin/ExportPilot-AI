import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Send, RefreshCw, Building2, ShieldCheck, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RFQItem {
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

export const BuyerRFQBoard: React.FC = () => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState<'rfqs' | 'capacity'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Bid state
  const [selectedRfq, setSelectedRfq] = useState<RFQItem | null>(null);
  const [bidFobUsd, setBidFobUsd] = useState('');
  const [bidDeliveryDate, setBidDeliveryDate] = useState('2026-11-25');
  const [bidNotes, setBidNotes] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidSuccessMessage, setBidSuccessMessage] = useState('');

  const fetchRfqs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/rfq/feed');
      if (!res.ok) throw new Error('Failed to load RFQ feed');
      const data = await res.json();
      setRfqs(data.items || []);
    } catch {
      setError(t('বায়ার আরএফকিউ তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'Could not load live RFQs. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const fetchCapacities = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/rfq/capacity');
      if (!res.ok) throw new Error('Failed to load capacity');
      const data = await res.json();
      setCapacity(data);
    } catch {
      setError(t('উৎপাদন সক্ষমতার তথ্য লোড করতে সমস্যা হয়েছে।', 'Could not load production capacity data.'));
    }
  }, [t]);

  useEffect(() => {
    fetchRfqs();
    fetchCapacities();
  }, [fetchRfqs, fetchCapacities]);

  const handleOpenBid = (rfq: RFQItem) => {
    setSelectedRfq(rfq);
    setBidFobUsd(rfq.target_fob_usd.toString());
    setBidSuccessMessage('');
    setError('');
  };

  const leadTimeFromDeliveryDate = (deliveryDate: string): number => {
    const target = new Date(deliveryDate).getTime();
    if (Number.isNaN(target)) return 30;
    const days = Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.min(180, Math.max(7, days));
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setIsBidding(true);
    setBidSuccessMessage('');
    setError('');
    try {
      const payload = {
        proposed_fob_usd: parseFloat(bidFobUsd),
        committed_units: selectedRfq.quantity_units,
        lead_time_days: leadTimeFromDeliveryDate(bidDeliveryDate),
        factory_notes_bn: bidNotes || undefined,
      };
      const res = await fetch(`/api/v1/rfq/${encodeURIComponent(selectedRfq.id)}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bid submission failed');
      setBidSuccessMessage(
        t(
          'আপনার কোটেশন জমা হয়েছে এবং আপনার অ্যাকাউন্টে সংরক্ষিত আছে। এটি এখনো কোনো বায়ারের সাথে চূড়ান্ত চুক্তি নয়।',
          'Your quotation was submitted and saved to your account. It is not a confirmed contract with any buyer yet.'
        )
      );
      setTimeout(() => {
        setSelectedRfq(null);
        fetchRfqs();
      }, 2000);
    } catch {
      setError(t('কাউন্টার-অফার পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'Failed to submit the counter bid. Please try again.'));
    } finally {
      setIsBidding(false);
    }
  };

  return (
    <div className="card space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
              {t('আন্তর্জাতিক বায়ার আরএফকিউ বোর্ড ও ক্যাপাসিটি ট্র্যাকার', 'Global Buyer RFQ Board & Capacity Tracker')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bangla">
            {t(
              'আন্তর্জাতিক ক্রেতাদের চাহিদাপত্র এবং আপনার কারখানার মাসিক উৎপাদন সক্ষমতা একসাথে দেখুন।',
              'Review international purchase inquiries next to your factory monthly production capacity.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label={t('আরএফকিউ এবং ক্যাপাসিটি ভিউ', 'RFQ and capacity views')}
            className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'rfqs'}
              onClick={() => setActiveTab('rfqs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-bangla ${
                activeTab === 'rfqs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('আরএফকিউ বোর্ড', 'RFQ Feed')} ({rfqs.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'capacity'}
              onClick={() => setActiveTab('capacity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-bangla ${
                activeTab === 'capacity'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('উৎপাদন সক্ষমতা', 'Capacity')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { fetchRfqs(); fetchCapacities(); }}
            disabled={isLoading}
            aria-label={t('তথ্য রিফ্রেশ করুন', 'Refresh data')}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Tab 1: RFQ Board */}
      {activeTab === 'rfqs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-500/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {rfq.product_title}
                        </span>
                        <span className="badge badge-em text-[10px] font-mono">
                          HS {rfq.hs_code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {rfq.buyer_company} ({rfq.destination_country})
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-lg">
                      ${rfq.target_fob_usd.toFixed(2)} FOB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">
                        {t('অর্ডার পরিমাণ', 'Quantity')}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {rfq.quantity_units.toLocaleString()} {t('পিস', 'units')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">
                        {t('ডেলিভারির শেষ তারিখ', 'Delivery deadline')}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {rfq.delivery_deadline}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">
                        {t('কার্বন লক্ষ্য', 'Carbon target')}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {rfq.target_co2_kg.toFixed(2)} kg CO2e/{t('পিস', 'unit')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">
                        {t('অবস্থা', 'Status')}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {rfq.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-3">
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {rfq.id}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBid(rfq)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-bangla transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('কাউন্টার-অফার জমা দিন', 'Submit Bid')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && rfqs.length === 0 && !error && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla text-center py-6">
              {t('এই মুহূর্তে কোনো সক্রিয় আরএফকিউ নেই।', 'There are no active RFQs right now.')}
            </p>
          )}

          {/* Bid Modal */}
          {selectedRfq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label={t('কাউন্টার-অফার ফর্ম', 'Counter-offer form')}>
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
                      {t('সরাসরি কাউন্টার-অফার দাখিল', 'Submit Direct Counter-Bid')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {selectedRfq.product_title} - {selectedRfq.buyer_company}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    aria-label={t('ফর্ম বন্ধ করুন', 'Close form')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {bidSuccessMessage ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" aria-hidden="true" />
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-bangla">
                      {bidSuccessMessage}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBid} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="rfq-bid-fob" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                          {t('কাউন্টার FOB দর (USD)', 'Counter FOB Price (USD)')}
                        </label>
                        <input
                          id="rfq-bid-fob"
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={bidFobUsd}
                          onChange={(e) => setBidFobUsd(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="rfq-bid-delivery" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                          {t('জাহাজীকরণের তারিখ', 'Shipment Date')}
                        </label>
                        <input
                          id="rfq-bid-delivery"
                          type="date"
                          required
                          value={bidDeliveryDate}
                          onChange={(e) => setBidDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="rfq-bid-notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                        {t('কারখানার বিশেষ নোট / স্পেসিফিকেশন', 'Factory Production Notes')}
                      </label>
                      <textarea
                        id="rfq-bid-notes"
                        rows={3}
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        placeholder={t('উদা: OEKO-TEX স্ট্যান্ডার্ড ১০০ সার্টিফাইড সুতা এবং পরিবেশবান্ধব ওয়াশিং প্রক্রিয়া।', 'e.g. Complies with OEKO-TEX 100, local value addition over 40%.')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bangla text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-bangla">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('সার্বভৌম যাচাইকরণ ও ভ্যালু-এডিশন সুরক্ষা', 'Sovereign Verification & Protection')}</span>
                      </div>
                      <p>
                        {t(
                          'আপনার কারখানার মূল্য কাঠামো গোপন থাকে; শুধু চূড়ান্ত FOB দর ও উৎপাদন নোট সংরক্ষিত হয়। জমা দেওয়া কোটেশন এখনো কোনো নিশ্চিত অর্ডার নয়।',
                          'Your factory margin structure stays private; only the final FOB counter-offer and production notes are stored. A submitted quotation is not a confirmed order.'
                        )}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRfq(null)}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 font-bangla"
                      >
                        {t('বাতিল', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isBidding}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-bangla flex items-center gap-2 shadow-sm"
                      >
                        {isBidding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Send className="w-3.5 h-3.5" aria-hidden="true" />}
                        <span>{isBidding ? t('জমা হচ্ছে...', 'Submitting...') : t('কাউন্টার-অফার পাঠান', 'Submit Counter-Offer')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Factory Production Capacity */}
      {activeTab === 'capacity' && (
        <div className="space-y-4">
          {capacity ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase">
                    {t('এই মাসের বুকিং', 'This month')}
                  </span>
                  <span
                    className={`badge text-[10px] font-mono ${
                      capacity.utilization_pct >= 85
                        ? 'badge-rose'
                        : capacity.utilization_pct >= 60
                        ? 'badge-gold'
                        : 'badge-em'
                    }`}
                  >
                    {capacity.utilization_pct.toFixed(0)}% {t('বুকড', 'booked')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, capacity.utilization_pct)} aria-valuemin={0} aria-valuemax={100} aria-label={t('উৎপাদন সক্ষমতার ব্যবহার', 'Capacity utilization')}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        capacity.utilization_pct >= 85
                          ? 'bg-rose-500'
                          : capacity.utilization_pct >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, capacity.utilization_pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{capacity.allocated_units.toLocaleString()} {t('বুকড', 'booked')}</span>
                    <span>{capacity.monthly_capacity_units.toLocaleString()} {t('সর্বোচ্চ', 'max')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bangla">
                    {t('অবশিষ্ট উৎপাদন স্লট:', 'Free capacity:')}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {capacity.available_units.toLocaleString()} {t('পিস', 'units')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>{t('উৎপাদন লাইন', 'Production lines')}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {capacity.production_line_count}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-bangla">
                  {t('পরবর্তী খালি স্লট:', 'Next free slot:')}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 ml-1">{capacity.next_available_slot}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
                  {t(
                    'কাউন্টার-অফার জমা দিলে এই সক্ষমতার হিসাব আপডেট হয় না; চূড়ান্ত অর্ডার নিশ্চিত হলে ম্যানুয়ালি আপডেট করুন।',
                    'Submitting a counter-offer does not change this capacity figure; update it manually when an order is confirmed.'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla text-center py-6">
              {t('উৎপাদন সক্ষমতার তথ্য লোড হচ্ছে...', 'Loading production capacity data...')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
