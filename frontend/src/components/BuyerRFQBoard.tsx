import React, { useState, useEffect } from 'react';
import {
  Globe, Clock, DollarSign, Package, CheckCircle2,
  TrendingUp, Send, RefreshCw, AlertCircle, Building2,
  ShieldCheck, FileText, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RFQItem {
  rfq_id: string;
  buyer_company: string;
  country: string;
  target_market: string;
  product_name: string;
  hs_code: string;
  target_fob_usd: number;
  quantity_units: number;
  delivery_window: string;
  certifications_required: string[];
  local_value_addition_min_pct: number;
  status: string;
  created_at: string;
}

interface CapacityMonth {
  month_year: string;
  total_capacity_units: number;
  allocated_units: number;
  available_units: number;
  utilization_pct: number;
  active_product_preset?: string;
}

export const BuyerRFQBoard: React.FC = () => {
  const { lang, t } = useAuth();
  const [activeTab, setActiveTab] = useState<'rfqs' | 'capacity'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [capacities, setCapacities] = useState<CapacityMonth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Bid state
  const [selectedRfq, setSelectedRfq] = useState<RFQItem | null>(null);
  const [bidFobUsd, setBidFobUsd] = useState('');
  const [bidDeliveryDate, setBidDeliveryDate] = useState('2026-11-25');
  const [bidNotes, setBidNotes] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidSuccessMessage, setBidSuccessMessage] = useState('');

  // Fetch RFQs
  const fetchRfqs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/rfq/feed');
      if (!res.ok) throw new Error('Failed to load RFQ feed');
      const data = await res.json();
      setRfqs(data.rfqs || []);
    } catch (err) {
      console.error(err);
      setError(t('বায়ার আরএফকিউ তথ্য লোড করতে সমস্যা হয়েছে।', 'Failed to load live RFQs.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Capacities
  const fetchCapacities = async () => {
    try {
      const res = await fetch('/api/v1/rfq/capacity?factory_id=factory_default_01');
      if (res.ok) {
        const data = await res.json();
        setCapacities(data.allocations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRfqs();
    fetchCapacities();
  }, []);

  const handleOpenBid = (rfq: RFQItem) => {
    setSelectedRfq(rfq);
    setBidFobUsd(rfq.target_fob_usd.toString());
    setBidSuccessMessage('');
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setIsBidding(true);
    setBidSuccessMessage('');
    try {
      const payload = {
        rfq_id: selectedRfq.rfq_id,
        factory_id: 'factory_default_01',
        counter_fob_usd: parseFloat(bidFobUsd),
        promised_delivery_date: bidDeliveryDate,
        notes: bidNotes || `Standard export production offer for ${selectedRfq.product_name}.`,
        local_value_addition_pct: 42.5,
      };
      const res = await fetch('/api/v1/rfq/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bid submission failed');
      const data = await res.json();
      setBidSuccessMessage(data.message || 'Counter-bid submitted successfully.');
      setTimeout(() => {
        setSelectedRfq(null);
        fetchRfqs();
      }, 1800);
    } catch (err) {
      console.error(err);
      setError(t('কাউন্টার-অফার পাঠাতে সমস্যা হয়েছে।', 'Failed to submit counter bid.'));
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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
              {t('আন্তর্জাতিক বায়ার আরএফকিউ বোর্ড ও ক্যাপাসিটি ট্রেকার', 'Live Global Buyer RFQ Board & Capacity Tracker')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bangla">
            {t(
              'ইউরোপ, যুক্তরাজ্য ও মার্কিন আমদানিকারকদের সরাসরি চাহিদাপত্র ও স্থানীয় কারখানার মাসিক উৎপাদন সক্ষমতা।',
              'Direct verified purchase inquiries from EU, UK, and US buyers with real-time factory slot matching.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('rfqs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-bangla ${
                activeTab === 'rfqs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('লাইভ আরএফকিউ বোর্ড', 'Live RFQ Feed')} ({rfqs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capacity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-bangla ${
                activeTab === 'capacity'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('উৎপাদন সক্ষমতা ট্র্যাকার', 'Capacity Tracker')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { fetchRfqs(); fetchCapacities(); }}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
            title={t('রিফ্রেশ করুন', 'Refresh Data')}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Tab 1: Live RFQ Board */}
      {activeTab === 'rfqs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map((rfq) => (
              <div
                key={rfq.rfq_id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-500/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {rfq.product_name}
                        </span>
                        <span className="badge badge-em text-[10px] font-mono">
                          HS {rfq.hs_code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {rfq.buyer_company} ({rfq.country} - {rfq.target_market})
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
                        {rfq.quantity_units.toLocaleString()} units
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">
                        {t('ডেলিভারি সময়', 'Delivery Window')}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {rfq.delivery_window}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      {t('প্রয়োজনীয় সার্টিফিকেশন:', 'Required Certifications:')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rfq.certifications_required.map((c) => (
                        <span key={c} className="badge badge-blue text-[10px]">
                          {c}
                        </span>
                      ))}
                      <span className="badge badge-gold text-[10px]">
                        {rfq.local_value_addition_min_pct}% Value-Add
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-3">
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {rfq.rfq_id}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBid(rfq)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-bangla transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('কাউন্টার-অফার জমা দিন', 'Submit Bid')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bid Modal */}
          {selectedRfq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
                      {t('সরাসরি কাউন্টার-অফার দাখিল', 'Submit Direct Counter-Bid')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {selectedRfq.product_name} - {selectedRfq.buyer_company}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ×
                  </button>
                </div>

                {bidSuccessMessage ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-bangla">
                      {bidSuccessMessage}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBid} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                          {t('কাউন্টার FOB দর (USD)', 'Counter FOB Price (USD)')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={bidFobUsd}
                          onChange={(e) => setBidFobUsd(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                          {t('জাহাজীকরণের তারিখ', 'Shipment Date')}
                        </label>
                        <input
                          type="date"
                          required
                          value={bidDeliveryDate}
                          onChange={(e) => setBidDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block mb-1">
                        {t('কারখানার বিশেষ নোট / স্পেসিফিকেশন', 'Factory Production Notes')}
                      </label>
                      <textarea
                        rows={3}
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        placeholder={t('উদা: OEKO-TEX স্ট্যান্ডার্ড ১০০ সার্টিফাইড সুতা এবং ১০০% পরিবেশবান্ধব ওয়াশিং প্রক্রিয়া।', 'e.g. Complies with OEKO-TEX 100, local value addition over 40%.')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bangla text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-bangla">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t('সার্বভৌম যাচাইকরণ ও ভ্যালু-এডিশন সুরক্ষা', 'Sovereign Verification & Protection')}</span>
                      </div>
                      <p>
                        {t(
                          'আপনার কারখানার মূল্য কাঠামো এনক্রিপ্ট রাখা হবে এবং বায়ার শুধুমাত্র চূড়ান্ত FOB দর ও উৎপাদন মান দেখতে পাবেন।',
                          'Your factory margin structure is strictly protected; only the final FOB counter-offer and quality specs are shared.'
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
                        {isBidding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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

      {/* Tab 2: Factory Production Capacity Tracker */}
      {activeTab === 'capacity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {capacities.map((c) => (
              <div
                key={c.month_year}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase">
                    {c.month_year}
                  </span>
                  <span
                    className={`badge text-[10px] font-mono ${
                      c.utilization_pct >= 85
                        ? 'badge-rose'
                        : c.utilization_pct >= 60
                        ? 'badge-gold'
                        : 'badge-em'
                    }`}
                  >
                    {c.utilization_pct.toFixed(0)}% Booked
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.utilization_pct >= 85
                          ? 'bg-rose-500'
                          : c.utilization_pct >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, c.utilization_pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{c.allocated_units.toLocaleString()} booked</span>
                    <span>{c.total_capacity_units.toLocaleString()} max</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bangla">
                    {t('অবশিষ্ট উৎপাদন স্লট:', 'Free Capacity:')}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {c.available_units.toLocaleString()} pcs
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-bangla block">
                {t('অতিরিক্ত বায়ার অর্ডার ও ক্যাপাসিটি রিজার্ভেশন', 'Capacity Slot Reservation')}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                {t(
                  'আন্তর্জাতিক বায়ারদের সরাসরি আরএফকিউ গ্রহণ করার পর কারখানার স্লট স্বয়ংক্রিয়ভাবে আপডেট হয়।',
                  'Slots are automatically updated when international buyers confirm orders through the Deal Room.'
                )}
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
              Factory ID: factory_default_01
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
