import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const SecurityLab: React.FC = () => {
  const { t } = useAuth();

  const [inputSample, setInputSample] = useState(
    'সাভার কারখানার মালিক রহিম উদ্দিনের NID নম্বর: 19882694812004512 এবং ট্যাক্স শনাক্তকরণ নম্বর TIN: 558492011234। ফ্যাক্টরির ভ্যাট BIN: 004192837-0101 এবং মোবাইল নম্বর +8801712984920। অগ্রণী ব্যাংক হিসাব নম্বর: 20491829401928। এই ডকুমেন্ট ইউরোপে পাঠানোর আগে গোপন তথ্য রক্ষা করতে হবে।'
  );
  const [redactedResult, setRedactedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestFilter = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/security/mask-pii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputSample })
      });
      const data = await res.json();
      setRedactedResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          BANGLADESH DATA SOVEREIGNTY & PII LAB
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('বাংলাদেশ ডাটা সার্বভৌমত্ব ও লাইভ পিআইআই মাস্কিং ল্যাব', 'Data Sovereignty & Live Bangla PII Redaction')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-bangla">
          {t(
            'জাতীয় পরিচয়পত্র (NID), টিআইএন (TIN), বিন (BIN) ও মোবাইল নম্বর কোনো পাবলিক ক্লাউড বা এলএলএম-এ পাঠানোর আগেই লোকাল মেশিনে এনক্রিপ্ট ও মাস্ক করা হয়।',
            'Zero data leakage. Bangladeshi National IDs (10/13/17 digits), TINs, BINs, and phone numbers are redacted locally before any model inference.'
          )}
        </p>
      </div>

      {/* Interactive PII Sandbox */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              <span>{t('লাইভ বাংলা পিআইআই ফিল্টার স্যান্ডবক্স', 'Live Bangla PII Redaction Sandbox')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('নিচের টেক্সট বক্সে আপনার ইচ্ছামতো তথ্য দিয়ে সার্বভৌমত্ব ফিল্টার টেস্ট করুন:', 'Test local sovereignty regex & NER against real-world factory text:')}
            </p>
          </div>

          <button
            onClick={handleTestFilter}
            disabled={loading}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? t('ফিল্টারিং হচ্ছে...', 'Filtering...') : t('টেস্ট সার্বভৌমত্ব ফিল্টার', 'Test Sovereignty Filter')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Raw Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('মূল টেক্সট (অপ্রস্তুত ও সংবেদনশীল তথ্যসহ):', 'Raw Text (With Sensitive PII):')}
            </label>
            <textarea
              rows={8}
              value={inputSample}
              onChange={(e) => setInputSample(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:border-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Redacted Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {t('সার্বভৌম ফিল্টারের পর সুরক্ষিত পেলোড:', 'Sovereign Redacted Payload:')}
              </label>
              {redactedResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {redactedResult.total_redactions} ENTITIES MASKED
                </span>
              )}
            </div>

            <div className="h-[188px] p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-y-auto leading-relaxed">
              {redactedResult ? (
                redactedResult.redacted_text
              ) : (
                <span className="text-slate-400 italic">
                  {t('উপরে "টেস্ট সার্বভৌমত্ব ফিল্টার" বোতামে ক্লিক করুন...', 'Click "Test Sovereignty Filter" above to execute...')}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Entities Detected Breakdown */}
        {redactedResult && redactedResult.detected_entities.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t('শনাক্ত ও মাস্ককৃত সংবেদনশীল তথ্যের তালিকা:', 'Detected & Redacted Entities Breakdown:')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {redactedResult.detected_entities.map((ent: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">{ent.type}</div>
                  <div className="font-mono text-slate-400 line-through text-[11px] truncate">{ent.raw}</div>
                  <div className="font-mono text-emerald-400 font-bold text-[11px]">{ent.replacement}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RBAC Permission Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>{t('রোল-বেসড অ্যাক্সেস কন্ট্রোল (RBAC) সিকিউরিটি ম্যাট্রিক্স', 'Role-Based Access Control (RBAC) Matrix')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">User Role</th>
                <th className="p-3">FOB Pricing & Deals</th>
                <th className="p-3">Raw Utility Bill Access</th>
                <th className="p-3">Buyer Proposal Outreach</th>
                <th className="p-3">Azure $100 Protection & System Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-emerald-400">👨🏭 SME Exporter (কারখানা মালিক)</td>
                <td className="p-3 text-emerald-400">Full Access</td>
                <td className="p-3 text-emerald-400">Own Bills Only</td>
                <td className="p-3 text-emerald-400">Enabled</td>
                <td className="p-3 text-slate-400">Restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-blue-400">🛒 Global Buyer (বিদেশি বায়ার)</td>
                <td className="p-3 text-emerald-400">Read Quoted FOB</td>
                <td className="p-3 text-rose-400">Zero Access (PII Redacted)</td>
                <td className="p-3 text-emerald-400">Receive Proposals</td>
                <td className="p-3 text-slate-400">Restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-amber-400">🌍 NRB Trade Mentor (প্রবাসী বিশেষজ্ঞ)</td>
                <td className="p-3 text-emerald-400">Advisory Review</td>
                <td className="p-3 text-rose-400">Redacted Metrics Only</td>
                <td className="p-3 text-emerald-400">Mentorship Notes</td>
                <td className="p-3 text-slate-400">Restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-purple-400">🛡️ System Administrator</td>
                <td className="p-3 text-emerald-400">Full Access</td>
                <td className="p-3 text-emerald-400">Audit Logs Only</td>
                <td className="p-3 text-emerald-400">Manage Routing</td>
                <td className="p-3 text-emerald-400 font-bold">Full Control (Scale-to-Zero)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
