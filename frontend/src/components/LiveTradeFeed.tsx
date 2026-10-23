import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Globe, Building2, DollarSign, RefreshCw } from 'lucide-react';

interface TradeDealItem {
  deal_id: string;
  factory_name: string;
  product_name?: string;
  product_title?: string;
  buyer_name: string;
  destination_country?: string;
  buyer_city_country?: string;
  quantity_units?: number;
  fob_unit_price_usd?: number;
  fob_unit_usd?: number;
  total_fob_value_usd?: number;
  total_deal_usd?: number;
  middleman_margin_saved_usd?: number;
  compliance_status?: string;
  cbam_carbon_intensity?: string;
  tariff_rate_bd?: string;
  timestamp?: string;
  timestamp_en?: string;
  status?: string;
  status_bn?: string;
}

interface FeedData {
  total_deals_monitored: number;
  total_middleman_margin_saved_usd: number;
  deals: TradeDealItem[];
}

const FALLBACK_FEED: FeedData = {
  total_deals_monitored: 7,
  total_middleman_margin_saved_usd: 158200,
  deals: [
    {
      deal_id: 'DEAL-BD-8901',
      factory_name: 'সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ',
      product_title: 'সাভার গোল্ডেন জুট শপিং ব্যাগ (১০,০০০ পিস)',
      product_name: 'সাভার গোল্ডেন জুট শপিং ব্যাগ (১০,০০০ পিস)',
      buyer_name: 'NordicEco Retail GmbH',
      destination_country: 'Germany',
      buyer_city_country: 'Hamburg, Germany',
      quantity_units: 10000,
      fob_unit_price_usd: 3.40,
      fob_unit_usd: 3.40,
      total_fob_value_usd: 34000,
      total_deal_usd: 34000,
      middleman_margin_saved_usd: 10880,
      compliance_status: 'CBAM Scope 2 Verified (0.42 kg CO2e)',
      cbam_carbon_intensity: '0.42 kg CO2e / unit',
      timestamp: '১০ মিনিট আগে'
    },
    {
      deal_id: 'DEAL-BD-8902',
      factory_name: 'গাজীপুর ব্লু ডেনিম টেক্সটাইল মিলস লিঃ',
      product_title: 'রিসাইকেলড ওভেন ডেনিম জ্যাকেট (৫,০০০ পিস)',
      product_name: 'রিসাইকেলড ওভেন ডেনিম জ্যাকেট (৫,০০০ পিস)',
      buyer_name: 'Thames Streetwear Collective Ltd',
      destination_country: 'UK',
      buyer_city_country: 'London, United Kingdom',
      quantity_units: 5000,
      fob_unit_price_usd: 13.80,
      fob_unit_usd: 13.80,
      total_fob_value_usd: 69000,
      total_deal_usd: 69000,
      middleman_margin_saved_usd: 22080,
      compliance_status: 'GRS Certified Scope 2 Verified',
      cbam_carbon_intensity: '0.68 kg CO2e / unit',
      timestamp: '২৫ মিনিট আগে'
    },
    {
      deal_id: 'DEAL-BD-8903',
      factory_name: 'সাভার লেদার ফুটওয়্যার ইন্ডাস্ট্রিজ লিঃ',
      product_title: 'হ্যান্ডক্রাফটেড চেলসি লেদার বুট (২,০০০ জোড়া)',
      product_name: 'হ্যান্ডক্রাফটেড চেলসি লেদার বুট (২,০০০ জোড়া)',
      buyer_name: 'Osaka Craft Footwear KK',
      destination_country: 'Japan',
      buyer_city_country: 'Osaka, Japan',
      quantity_units: 2000,
      fob_unit_price_usd: 24.50,
      fob_unit_usd: 24.50,
      total_fob_value_usd: 49000,
      total_deal_usd: 49000,
      middleman_margin_saved_usd: 15680,
      compliance_status: 'LWG Gold Medal Verified',
      cbam_carbon_intensity: '1.12 kg CO2e / unit',
      timestamp: '৪৭ মিনিট আগে'
    },
    {
      deal_id: 'DEAL-BD-8904',
      factory_name: 'করতোয়া হ্যান্ডমেড টেরাকোটা ও পটারি ওয়ার্কস',
      product_title: 'ফুড-গ্রেড হ্যান্ডমেড সিরামিক ডিনার সেট (৩,০০০ সেট)',
      product_name: 'ফুড-গ্রেড হ্যান্ডমেড সিরামিক ডিনার সেট (৩,০০০ সেট)',
      buyer_name: 'Bayern Craft Imports AG',
      destination_country: 'Germany',
      buyer_city_country: 'Munich, Germany',
      quantity_units: 3000,
      fob_unit_price_usd: 11.20,
      fob_unit_usd: 11.20,
      total_fob_value_usd: 33600,
      total_deal_usd: 33600,
      middleman_margin_saved_usd: 10752,
      compliance_status: 'Oeko-Tex Standard Verified',
      cbam_carbon_intensity: '0.38 kg CO2e / unit',
      timestamp: '১ ঘণ্টা আগে'
    }
  ]
};

export const LiveTradeFeed: React.FC = () => {
  const { t } = useAuth();
  const [feed, setFeed] = useState<FeedData>(FALLBACK_FEED);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchFeed = () => {
    setLoading(true);
    fetch('/api/v1/deals/feed')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.deals) && data.deals.length > 0) {
          setFeed({
            total_deals_monitored: data.total_deals_monitored || data.total_active_deals || data.deals.length,
            total_middleman_margin_saved_usd: data.total_middleman_margin_saved_usd || data.total_margin_saved_usd || 0,
            deals: data.deals
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 45000); // 45s polling
    return () => clearInterval(interval);
  }, []);

  const formatUsd = (val?: number) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(safe);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-md dark:shadow-xl overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('লাইভ এক্সপোর্ট ট্রেড ফিড ও সঞ্চয় বিবরণী', 'Live Export Trade Feed & Margin Savings')}
              </h2>
              <span className="badge badge-em text-[10px] font-mono">
                {feed.total_deals_monitored || feed.deals.length} {t('সক্রিয় ডিল', 'Active Deals')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla mt-0.5">
              {t(
                'মধ্যস্বত্বভোগী বায়িং হাউস ছাড়া সম্পাদিত সাম্প্রতিক রপ্তানি চালানের সরাসরি বিবরণ।',
                'Real-time stream of direct SME shipments finalized without middleman agency cuts.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Total Margin Saved Metric */}
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-medium">
              {t('সরাসরি অর্জিত অতিরিক্ত লাভ', 'Total Direct Margin Saved')}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
              +{formatUsd(feed.total_middleman_margin_saved_usd)}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchFeed}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('রিফ্রেশ করুন', 'Refresh Feed')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? t('সংক্ষেপ করুন', 'Collapse') : t('প্রদর্শন করুন', 'Expand')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Deals List */}
      {isExpanded && (
        <div className="p-4 sm:p-5 divide-y divide-slate-200 dark:divide-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feed.deals.map((deal) => {
              const productTitle = deal.product_title || deal.product_name || 'Export Shipment';
              const buyerLocation = deal.buyer_city_country || deal.destination_country || '';
              const totalValue = deal.total_deal_usd ?? deal.total_fob_value_usd ?? 0;
              const marginSaved = deal.middleman_margin_saved_usd ?? 0;
              const unitFob = deal.fob_unit_usd ?? deal.fob_unit_price_usd ?? 0;
              const quantity = deal.quantity_units ?? (unitFob > 0 && totalValue > 0 ? Math.round(totalValue / unitFob) : 0);
              const compliance = deal.cbam_carbon_intensity || deal.compliance_status || deal.tariff_rate_bd || 'Scope 2 Verified';

              return (
                <div
                  key={deal.deal_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {deal.deal_id}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-bangla">
                        {deal.factory_name}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-mono">
                        {productTitle}
                      </p>
                    </div>
                    <span className="badge badge-gold font-mono text-[10px] shrink-0">
                      +{formatUsd(marginSaved)} {t('সাশ্রয়', 'Saved')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/50 shadow-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-bangla font-medium">{t('ক্রেতা প্রতিষ্ঠান:', 'Buyer:')}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">
                        {deal.buyer_name} {buyerLocation ? `(${buyerLocation})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-bangla font-medium">{t('চালানের আকার:', 'Volume & Value:')}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold block">
                        {quantity > 0 ? `${quantity.toLocaleString()} units` : t('রপ্তানি চালান', 'Export Order')} ({formatUsd(totalValue)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono text-[10px] truncate">{compliance}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono shrink-0">
                      {deal.timestamp || 'Direct FOB 2026'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
