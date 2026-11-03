import React, { useState, useEffect } from 'react';
import {useAuth} from '../context/AuthContext';
import {Award, CheckCircle2, Download, RefreshCw, XCircle} from 'lucide-react';

export const AuditReport: React.FC = () => {
  const { t, lang } = useAuth();
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const CATEGORY_MAP: Record<string, { bn: string; en: string; prefix: string; rubricCategoryBn: string; rubricCategoryEn: string; rubricMax: number }> = {
    innovation: {
      bn: 'ইনোভেশন ও এআই-নেটিভ ডিজাইন',
      en: 'Innovation & AI-Native Design',
      prefix: 'CHK_04',
      rubricCategoryBn: 'ক্যাটাগরি ১: ইনোভেশন ও এআই-নেটিভ ডিজাইন (গ্রাফআরএজি)',
      rubricCategoryEn: 'Category 1: Innovation & AI-Native Design (GraphRAG)',
      rubricMax: 20,
    },
    technical: {
      bn: 'টেকনিক্যাল এক্সিলেন্স ও আর্কিটেকচার',
      en: 'Technical Excellence & Architecture',
      prefix: 'CHK_01',
      rubricCategoryBn: 'ক্যাটাগরি ২: টেকনিক্যাল এক্সিলেন্স ও আর্কিটেকচার',
      rubricCategoryEn: 'Category 2: Technical Excellence & Architecture',
      rubricMax: 20,
    },
    business: {
      bn: 'বিজনেস ভ্যালু ও বাণিজ্যিক উপযোগিতা',
      en: 'Business Value & Commercial Viability',
      prefix: 'CHK_05',
      rubricCategoryBn: 'ক্যাটাগরি ৩: বিজনেস ভ্যালু ও ফাস্টএমসিপি এজেন্টস',
      rubricCategoryEn: 'Category 3: Business Value & FastMCP Agents',
      rubricMax: 20,
    },
    scalability: {
      bn: 'গ্লোবাল স্কেলেবিলিটি ও বাস্তবিক প্রভাব',
      en: 'Global Scalability & Real-World Impact',
      prefix: 'CHK_03',
      rubricCategoryBn: 'ক্যাটাগরি ৪: গ্লোবাল স্কেলেবিলিটি ও সিবিএএম কার্বন',
      rubricCategoryEn: 'Category 4: Global Scalability & CBAM Carbon',
      rubricMax: 20,
    },
    sovereignty: {
      bn: 'দায়িত্বশীল এআই ও ডাটা সার্বভৌমত্ব',
      en: 'Responsible AI & Data Sovereignty',
      prefix: 'CHK_02',
      rubricCategoryBn: 'ক্যাটাগরি ৫: দায়িত্বশীল এআই ও সার্বভৌম শিল্ড',
      rubricCategoryEn: 'Category 5: Responsible AI & Sovereign Shield',
      rubricMax: 20,
    },
  };

  const categoryOf = (testId: string): string => {
    const entry = Object.entries(CATEGORY_MAP).find(([, cat]) => testId.startsWith(cat.prefix));
    return entry ? entry[0] : 'other';
  };

  const visibleChecks = (auditData?.checklist ?? []).filter(
    (item: any) => categoryFilter === 'all' || categoryOf(item.test_id) === categoryFilter
  );

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
            {t('প্ল্যাটফর্ম ডায়াগনস্টিকস', 'PLATFORM DIAGNOSTICS')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('প্ল্যাটফর্ম সিস্টেম পরীক্ষা', 'Platform System Diagnostics')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-bangla">
            {t(
              'সার্ভার, গোপনীয়তা যাচাই, বিদ্যুৎ বিলের হিসাব, বাজার তথ্য ও সেশনের অবস্থা পরীক্ষা করে।',
              'Checks the server, privacy screening, utility bill calculations, market data, and session configuration.'
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runAudit}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-sm"
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
            <Award className="w-6 h-6 text-amber-200" />
            <span className="text-lg font-bold text-white">
              {t('AIBC ২০২৬ অফিসিয়াল জাজিং রুব্রিক স্কোরকার্ড', 'AIBC 2026 Official Judging Rubric Scorecard')}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-bangla max-w-xl">
            {t(
              'আন্তর্জাতিক মানদণ্ড অনুযায়ী ৫টি মূল ক্যাটাগরিতে (প্রতিটিতে ২০ নম্বর) স্বয়ংক্রিয় লাইভ সিস্টেম ভেরিফিকেশন ও কোডবেস অডিট।',
              'Automated live diagnostic evaluation across all five official AIBC 2026 judging categories (20 points each).'
            )}
          </p>
        </div>

        <div className="text-right flex items-center space-x-6">
          <div>
            <div className="text-xs font-mono text-slate-200 uppercase tracking-wider">{t('সর্বমোট স্কোর', 'Total Score')}</div>
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-200 font-mono">
              {loading && !auditData ? (
                <span className="text-2xl sm:text-3xl animate-pulse text-emerald-200">{t('যাচাই চলছে...', 'Testing...')}</span>
              ) : (
                <>{auditData ? auditData.total_score : t('চালানো হয়নি', 'Not run')}{auditData ? ' / 100' : ''}</>
              )}
            </div>
            {auditData && <div className="text-[11px] text-amber-200 font-bold mt-0.5">{auditData.grade}</div>}
          </div>

          <a
            href="/api/v1/reports/download/enterprise_audit/deal_active"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-300 text-slate-200 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all shadow-md"
            title={t('পিডিএফ ডাউনলোড করুন', 'Download PDF')}
          >
            <Download className="w-5 h-5 text-emerald-200" />
            <span>{t('অডিট PDF', 'Audit PDF')}</span>
          </a>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}

      {/* Diagnostic checklist */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {t('সিস্টেম পরীক্ষার ফল:', 'System diagnostic results:')}
        </h2>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('কুষবিভাগ ফিলটার', 'Category filter')}>
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            aria-pressed={categoryFilter === 'all'}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold font-bangla transition-colors ${
              categoryFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {t('সব পরীক্ষা', 'All checks')}
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              aria-pressed={categoryFilter === key}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold font-bangla transition-colors ${
                categoryFilter === key
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {t(cat.bn, cat.en)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {visibleChecks.map((item: any) => {
            const catMeta = CATEGORY_MAP[categoryOf(item.test_id)];
            return (
              <div key={item.test_id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.score} / 20</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${item.status === 'PASS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'}`}>
                      {item.status}
                    </span>
                  </div>
                  {catMeta && (
                    <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate mb-1">
                      {lang === 'bn' ? catMeta.rubricCategoryBn : catMeta.rubricCategoryEn}
                    </div>
                  )}
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-bangla">{item.name}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-bangla leading-relaxed">{item.details}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {item.latency_ms} ms
                </div>
              </div>
            );
          })}
        </div>
        {!auditData && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {['db', 'pii', 'carbon', 'graph', 'auth'].map((key) => (
              <div key={key} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        )}
        {!auditData && !loading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('লাইভ অডিট চালালে ফলাফল এখানে দেখা যাবে।', 'Run the live audit to see verified results here.')}</p>}
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
