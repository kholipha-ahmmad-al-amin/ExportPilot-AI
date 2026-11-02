import React, { useState } from 'react';
import {CheckCircle2, X, Copy, Check, Landmark} from 'lucide-react';
import {useAuth} from '../context/AuthContext';

interface TradeRegulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFobUsd?: number;
}

export const TradeRegulatoryModal: React.FC<TradeRegulatoryModalProps> = ({
  isOpen,
  onClose,
  defaultFobUsd = 33800,
}) => {
  const { lang, t } = useAuth();
  const [activeTab, setActiveTab] = useState<'lc' | 'subsidy'>('lc');

  // L/C Audit Form State
  const [lcNumber, setLcNumber] = useState('LC-2026-BD-9042');
  const [issuingBank, setIssuingBank] = useState('Deutsche Bank AG, Frankfurt');
  const [lcAmount] = useState(defaultFobUsd.toString());
  const [shipDate, setShipDate] = useState('2026-11-30');
  const [expDate, setExpDate] = useState('2026-12-21');
  const [portLoading, setPortLoading] = useState('Chattogram Sea Port, Bangladesh');
  const [portDischarge, setPortDischarge] = useState('Hamburg Port, Germany');
  const [isAuditing, setIsAuditing] = useState(false);
  const [lcResult, setLcResult] = useState<any>(null);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Cash Incentive Form State
  const [sectorId, setSectorId] = useState('diversified_jute');
  const [fobVal, setFobVal] = useState(defaultFobUsd.toString());
  const [importCost, setImportCost] = useState('5000');
  const [isCalculating, setIsCalculating] = useState(false);
  const [subsidyResult, setSubsidyResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunLCAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    setLcResult(null);

    try {
      const res = await fetch('/api/v1/trade/lc-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('exportpilot_access_token') || ''}`,
        },
        body: JSON.stringify({
          lc_number: lcNumber,
          issuing_bank: issuingBank,
          issuing_country: 'Germany',
          lc_amount_usd: parseFloat(lcAmount) || defaultFobUsd,
          tolerance_pct: 5.0,
          latest_shipment_date: shipDate,
          lc_expiry_date: expDate,
          port_of_loading: portLoading,
          port_of_discharge: portDischarge,
          product_description: 'Sovereign Export Batch Goods HS 4202.92.10',
          required_documents: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Certificate of Origin'],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLcResult(data);
      }
    } catch {
      // Handled silently
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCalculateSubsidy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setSubsidyResult(null);

    try {
      const res = await fetch('/api/v1/trade/cash-incentive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('exportpilot_access_token') || ''}`,
        },
        body: JSON.stringify({
          sector_id: sectorId,
          fob_export_value_usd: parseFloat(fobVal) || defaultFobUsd,
          raw_material_import_cost_usd: parseFloat(importCost) || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubsidyResult(data);
      }
    } catch {
      // Handled silently
    } finally {
      setIsCalculating(false);
    }
  };

  const copyAmendmentLetter = () => {
    if (lcResult?.amendment_letter_template_en) {
      navigator.clipboard.writeText(lcResult.amendment_letter_template_en);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('আন্তর্জাতিক এলসি ও নগদ সহায়তা অডিটর', 'L/C Discrepancy & Export Subsidy Engine')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ICC UCP 600 Standard • Bangladesh Bank FE Guidelines
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Trade Tools Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 shrink-0 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('lc')}
            className={`pb-3 px-4 text-xs font-semibold font-bangla transition-colors border-b-2 ${
              activeTab === 'lc'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {t('লেটার অব ক্রেডিট (L/C) অডিট', 'L/C Discrepancy Auditor')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subsidy')}
            className={`pb-3 px-4 text-xs font-semibold font-bangla transition-colors border-b-2 ${
              activeTab === 'subsidy'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {t('বাংলাদেশ ব্যাংক নগদ সহায়তা হিসাব', 'Bangladesh Bank Cash Incentive')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-bangla">
          {activeTab === 'lc' ? (
            <div className="space-y-6">
              <form onSubmit={handleRunLCAudit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-lc-num" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('এলসি নম্বর (L/C No)', 'L/C Number')}
                  </label>
                  <input
                    id="modal-lc-num"
                    type="text"
                    value={lcNumber}
                    onChange={(e) => setLcNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-lc-bank" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ইস্যুয়িং ব্যাংক (Issuing Bank)', 'Issuing Bank')}
                  </label>
                  <input
                    id="modal-lc-bank"
                    type="text"
                    value={issuingBank}
                    onChange={(e) => setIssuingBank(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-lc-ship-date" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('সর্বশেষ জাহাজিকরণের তারিখ', 'Latest Shipment Date')}
                  </label>
                  <input
                    id="modal-lc-ship-date"
                    type="date"
                    value={shipDate}
                    onChange={(e) => setShipDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-lc-exp-date" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('এলসি মেয়াদের শেষ তারিখ (Expiry Date)', 'L/C Expiry Date')}
                  </label>
                  <input
                    id="modal-lc-exp-date"
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-lc-pol" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('লোডিং বন্দর (Port of Loading)', 'Port of Loading')}
                  </label>
                  <input
                    id="modal-lc-pol"
                    type="text"
                    value={portLoading}
                    onChange={(e) => setPortLoading(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-lc-pod" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('গন্তব্য বন্দর (Port of Discharge)', 'Port of Discharge')}
                  </label>
                  <input
                    id="modal-lc-pod"
                    type="text"
                    value={portDischarge}
                    onChange={(e) => setPortDischarge(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAuditing}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isAuditing ? t('UCP 600 যাচাই চলছে...', 'Auditing UCP 600 rules...') : t('এলসি শর্তাবলি ও অসংগতি অডিট করুন', 'Audit L/C Terms & Discrepancies')}
                  </button>
                </div>
              </form>

              {/* L/C Audit Results View */}
              {lcResult && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {lcResult.overall_health_score}/100
                      </span>
                      <span className="badge badge-em font-mono">
                        RISK: {lcResult.risk_level}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      {t(`চিহ্নিত অসংগতি: ${lcResult.total_discrepancies}টি`, `Discrepancies found: ${lcResult.total_discrepancies}`)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {lang === 'bn' ? lcResult.verdict_bn : lcResult.verdict_en}
                  </p>

                  {/* Discrepancies List */}
                  {lcResult.findings?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold uppercase text-slate-500 font-mono tracking-wider">
                        {t('সংশোধনীয় অসংগতিসমূহ', 'Identified Discrepancies')}
                      </div>
                      {lcResult.findings.map((f: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {lang === 'bn' ? f.title_bn : f.title_en}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{f.ucp600_article}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            {lang === 'bn' ? f.description_bn : f.description_en}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                            {t('সুপারিশ:', 'Action:')} {lang === 'bn' ? f.suggested_amendment_bn : f.suggested_amendment_en}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Amendment Request Letter Copy Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={copyAmendmentLetter}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium transition-colors flex items-center gap-2"
                    >
                      {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLetter ? t('লেটার কপি হয়েছে!', 'Letter Copied!') : t('বায়ারের জন্য এলসি সংশোধন চিঠি কপি করুন', 'Copy L/C Amendment Request Letter')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Subsidy Tab */
            <div className="space-y-6">
              <form onSubmit={handleCalculateSubsidy} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="modal-sub-sector" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('রপ্তানি খাত নির্বাচন করুন', 'Select Export Sector')}
                  </label>
                  <select
                    id="modal-sub-sector"
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="diversified_jute">বহুমুখী পাটজাত পণ্য (২০% নগদ সহায়তা)</option>
                    <option value="jute_yarn_hessian">পাটের সুতা ও বস্তা (৭% নগদ সহায়তা)</option>
                    <option value="leather_footwear">চামড়াজাত পণ্য ও জুতা (১৫% নগদ সহায়তা)</option>
                    <option value="rmg_new_markets">তৈরি পোশাক - নতুন বাজার ও এসএমই (৪% নগদ সহায়তা)</option>
                    <option value="agro_processing">কৃষি ও প্রক্রিয়াজাত খাদ্যপণ্য (২০% নগদ সহায়তা)</option>
                    <option value="ceramics_engineering">সিরামিক সামগ্রী ও হালকা প্রকৌশল (১০% নগদ সহায়তা)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-sub-fob" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('মোট এফওবি রপ্তানি মূল্য (USD)', 'Total FOB Value (USD)')}
                  </label>
                  <input
                    id="modal-sub-fob"
                    type="number"
                    value={fobVal}
                    onChange={(e) => setFobVal(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-sub-raw" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('আমদানিকৃত কাঁচামাল খরচ (USD)', 'Imported Raw Material Cost (USD)')}
                  </label>
                  <input
                    id="modal-sub-raw"
                    type="number"
                    value={importCost}
                    onChange={(e) => setImportCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isCalculating ? t('হিসাব হচ্ছে...', 'Calculating...') : t('নগদ সহায়তা ও ব্যাংক ডকুমেন্টস দেখুন', 'Calculate Cash Incentive & Bank Checklist')}
                  </button>
                </div>
              </form>

              {/* Subsidy Results View */}
              {subsidyResult && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">INCENTIVE RATE</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {subsidyResult.applicable_subsidy_rate_pct}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">VALUE ADDITION</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {subsidyResult.value_addition_pct}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">SUBSIDY USD</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        ${subsidyResult.estimated_cash_incentive_usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">SUBSIDY BDT</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ৳{subsidyResult.estimated_cash_incentive_bdt.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="font-bold">{subsidyResult.statutory_circular}</div>
                    <div>{t('ন্যূনতম ৩০% স্থানীয় মূল্য সংযোজন শর্ত পূরণ হওয়ায় এই চালানটি শতভাগ নগদ সহায়তার যোগ্য।', 'Exceeds minimum 30% local value addition requirement. 100% eligible for statutory subsidy.')}</div>
                  </div>

                  {/* Bank Submission Checklist */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold uppercase text-slate-500 font-mono tracking-wider">
                      {t('বাংলাদেশ ব্যাংক ও এডি ব্যাংকে জমাদানের আবশ্যকীয় তালিকা', 'Bank Submission Checklist (EXP Settlement)')}
                    </div>
                    <ul className="space-y-1.5">
                      {(lang === 'bn' ? subsidyResult.required_bank_documents_bn : subsidyResult.required_bank_documents_en).map((doc: string, dIdx: number) => (
                        <li key={dIdx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
