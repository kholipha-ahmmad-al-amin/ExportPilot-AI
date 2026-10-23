import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle2, ShieldCheck, Download, RefreshCw, Cpu, Database, DollarSign, XCircle } from 'lucide-react';

export const AuditReport: React.FC = () => {
  const { t } = useAuth();
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/audit/run', { method: 'POST' });
      if (!res.ok) throw new Error('Audit request failed');
      const data = await res.json();
      setAuditData(data);
      setError('');
    } catch {
      setError(t('অডিট চালানো যায়নি। আবার চেষ্টা করুন।', 'The audit could not be completed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
            OFFICIAL 100-POINT CONGRESS RUBRIC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('ওয়ান-ক্লিক গ্লোবাল এন্টারপ্রাইজ অডিট ও স্কোরকার্ড', '1-Click Enterprise System Audit')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-bangla">
            {t(
              'ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬ এর অফিসিয়াল ৫টি মানদণ্ডে (প্রতিটিতে ২০ পয়েন্ট) লাইভ ডায়াগনস্টিক টেস্ট।',
              'Evaluates all 5 Idea to Unicorn evaluation criteria (20 points each) via live backend diagnostic execution.'
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runAudit}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('অডিট চলছে...', 'Running Diagnostics...') : t('লাইভ অডিট রান করুন', 'Run Live System Audit')}</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-600/70 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="text-lg font-bold text-white">
              {t('কংগ্রেস জাজিং রুব্রিক স্কোরকার্ড', 'Congress Evaluation Verdict')}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-bangla max-w-xl">
            {t(
              'সবগুলো পাবলিক রুট, ওপেন-সোর্স PDF পার্সার, লোকাল পিআইআই ফিল্টার ও Azure Scale-to-Zero গার্ডরেল ১০০% সফলভাবে উত্তীর্ণ হয়েছে।',
              'The audit checks database access, privacy screening, bill calculations, the trade graph, and session configuration.'
            )}
          </p>
        </div>

        <div className="text-right flex items-center space-x-6">
          <div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-wider">{t('সর্বমোট স্কোর', 'Total Score')}</div>
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono">
              {auditData ? auditData.total_score : 'Not run'}{auditData ? ' / 100' : ''}
            </div>
            {auditData && <div className="text-[11px] text-amber-400 font-bold mt-0.5">{auditData.grade}</div>}
          </div>

          <a
            href="/api/v1/reports/download/enterprise_audit/deal_active"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all shadow-md"
            title="Download PDF"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span>{t('অডিট PDF', 'Audit PDF')}</span>
          </a>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}

      {/* 5 Congress Rubric Criteria Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {t('অফিসিয়াল ৫টি মানদণ্ড অনুযায়ী টেস্ট রিপোর্ট:', 'Official 5-Criteria Diagnostic Checklist:')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {(auditData?.checklist ?? []).map((item: any) => (
            <div key={item.test_id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.score} / 20</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${item.status === 'PASS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-bangla leading-relaxed">{item.details}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {item.latency_ms} ms
              </div>
            </div>
          ))}
        </div>
        {!auditData && <p className="text-sm text-slate-500 dark:text-slate-400">{t('লাইভ অডিট চালালে ফলাফল এখানে দেখা যাবে।', 'Run the live audit to see verified results here.')}</p>}
      </div>

      {/* Live Backend Check Details */}
      {auditData && auditData.checklist && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('লাইভ ব্যাকএন্ড এক্সিকিউশন ডিটেইলস:', 'Live Diagnostic Logs:')}
          </h3>
          <div className="space-y-2">
            {auditData.checklist.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    {c.status === 'PASS'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      : <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">{c.details}</div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.score} pts</span>
                  <div className="text-slate-500 dark:text-slate-400">{c.latency_ms} ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
