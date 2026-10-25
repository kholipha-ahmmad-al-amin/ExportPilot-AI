import React, { useState, useEffect } from 'react';
import {useAuth} from '../context/AuthContext';
import {Database, FileText, Cpu, Search, ShieldCheck} from 'lucide-react';

export const DataExplorer: React.FC = () => {
  const { t } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<'sample_reb_bill' | 'sample_trade_license'>('sample_reb_bill');
  const [parseResult, setParseResult] = useState<any>(null);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading] = useState(false);
  const [graphSearchQuery, setGraphSearchQuery] = useState('HS 4202');
  const [graphSearchResult, setGraphSearchResult] = useState<any>(null);
  const [graphResultIsExample, setGraphResultIsExample] = useState(false);

  const runParse = async (docType: 'sample_reb_bill' | 'sample_trade_license') => {
    setSelectedDoc(docType);
    setLoading(true);
    setParseError('');
    try {
      const formData = new FormData();
      formData.append('preset_doc', docType);
      const res = await fetch('/api/v1/parsers/parse-pdf', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Parse request failed');
      const data = await res.json();
      setParseResult(data);
    } catch {
      setParseError(t(
        'নথি প্রস্তুত করা যায়নি। আবার চেষ্টা করুন।',
        'The document could not be prepared. Please try again.'
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runParse('sample_reb_bill');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setGraphSearchResult({
      hs_code: '4202.22.10',
      chapter: 'Chapter 42: Bast/Jute Textile Bags',
      zero_duty_markets: ['Germany (EU EBA)', 'Japan (DFQF)', 'Netherlands (EU EBA)'],
      active_importers: ['NordicEco Retail GmbH ($1.45M)', 'Tokyo Midori Lifestyle ($980K)'],
      compliance: 'REX Self-Certification + Scope 2 EU CBAM Pass'
    });
    setGraphResultIsExample(false);
  }, []);

  const handleGraphSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (graphSearchQuery.includes('4202') || graphSearchQuery.toLowerCase().includes('jute')) {
      setGraphSearchResult({
        hs_code: '4202.22.10',
        chapter: 'Chapter 42: Bast/Jute Textile Bags',
        zero_duty_markets: ['Germany (EU EBA)', 'Japan (DFQF)', 'Netherlands (EU EBA)'],
        active_importers: ['NordicEco Retail GmbH ($1.45M)', 'Tokyo Midori Lifestyle ($980K)'],
        compliance: 'REX Self-Certification + Scope 2 EU CBAM Pass'
      });
      setGraphResultIsExample(false);
    } else if (graphSearchQuery.includes('6201') || graphSearchQuery.toLowerCase().includes('denim')) {
      setGraphSearchResult({
        hs_code: '6201.40.10',
        chapter: 'Chapter 62: Denim Outerwear / RMG',
        zero_duty_markets: ['United Kingdom (DCTS)', 'Sweden (EU EBA)'],
        active_importers: ['Thames Streetwear Collective ($3.4M)', 'Nordic Circular Apparel ($2.8M)'],
        compliance: 'OEKO-TEX 100, Global Recycled Standard (GRS)'
      });
      setGraphResultIsExample(false);
    } else {
      // No canned match for this query: show the closest reference example and
      // say so, instead of presenting it as a real result for the search.
      setGraphSearchResult({
        hs_code: '6403.91.60',
        chapter: 'Chapter 64: Footwear / Leather Boots',
        zero_duty_markets: ['Italy (EU EBA)', 'Japan (Saves 21.6% leather quota)'],
        active_importers: ['Milano Calzature ($1.9M)', 'Osaka Craft Footwear ($1.65M)'],
        compliance: 'LWG Chrome-Free, REACH Chemical Declaration'
      });
      setGraphResultIsExample(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
          {t('নথি ও বাণিজ্য তথ্য', 'Documents and trade information')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t('নথি পর্যালোচনা ও বাজারের তথ্য', 'Document review and market information')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-bangla">
          {t(
            'নমুনা বিদ্যুৎ বিল ও ট্রেড লাইসেন্স থেকে দরকারি তথ্য দেখুন এবং সম্ভাব্য বাজারের সঙ্গে পণ্য মিলিয়ে নিন।',
            'Review key details from sample utility bills and trade licenses, then explore possible markets for your product.'
          )}
        </p>
      </div>

      {/* Interactive document review */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('নমুনা নথি পর্যালোচনা', 'Review sample documents')}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {t('নমুনা বিদ্যুৎ বিল বা ট্রেড লাইসেন্স থেকে তথ্য দেখুন:', 'View details from a sample utility bill or trade license.')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => runParse('sample_reb_bill')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedDoc === 'sample_reb_bill'
                  ? 'bg-emerald-600 text-white dark:text-slate-950 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t('REB বিদ্যুৎ বিল পার্স করুন', 'Parse REB Electricity Bill')}
            </button>
            <button
              onClick={() => runParse('sample_trade_license')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedDoc === 'sample_trade_license'
                  ? 'bg-emerald-600 text-white dark:text-slate-950 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t('ট্রেড লাইসেন্স পার্স করুন', 'Parse Trade License & ERC')}
            </button>
          </div>
        </div>

        {parseError && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
            <span>{parseError}</span>
            <button
              type="button"
              onClick={() => runParse(selectedDoc)}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold font-bangla"
            >
              {t('আবার চেষ্টা করুন', 'Try again')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {t('নথির তথ্য প্রস্তুত করা হচ্ছে...', 'Preparing document details...')}
            </div>
          </div>
        ) : parseResult ? (
          <div className="space-y-4">
            
            {/* Parser Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('প্রস্তুতির সময়:', 'Ready in:')}</span>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">{parseResult.execution_time_ms} ms</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('নথির ধরন:', 'Document type:')}</span>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-sm">{selectedDoc === 'sample_reb_bill' ? t('বিদ্যুৎ বিল', 'Utility bill') : t('ট্রেড লাইসেন্স', 'Trade license')}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('গোপন রাখা তথ্য:', 'Details hidden:')}</span>
                <div className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">{parseResult.pii_redacted_count} {t('টি তথ্য', 'values')}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('তথ্যের সারি:', 'Rows found:')}</span>
                <div className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">{parseResult.tables_count}</div>
              </div>
            </div>

            {/* Redacted Text Snippet */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('গোপন তথ্য সরিয়ে নথির অংশ', 'Document excerpt with private details hidden')}</span>
              </span>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900/80 p-3 rounded border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                {parseResult.redacted_text_snippet}
              </p>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('যেকোনো একটি বোতাম বেছে নিয়ে নমুনা নথি দেখুন।', 'Select a button above to review a sample document.')}
          </div>
        )}
      </div>

      {/* Market and buyer search */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('পণ্য অনুযায়ী বাজার ও বায়ার খুঁজুন', 'Find markets and buyers by product')}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {t('পণ্যের নাম বা এইচএস কোড লিখুন:', 'Enter a product name or HS code:')}
          </p>
        </div>

        <form onSubmit={handleGraphSearch} className="flex gap-2">
          <label htmlFor="data-explorer-search" className="sr-only">
            {t('পণ্যের নাম বা এইচএস কোড', 'Product name or HS code')}
          </label>
          <input
            id="data-explorer-search"
            type="text"
            value={graphSearchQuery}
            onChange={(e) => setGraphSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 text-xs text-slate-900 dark:text-white outline-none"
            placeholder={t("যেমন: 'HS 4202', 'Jute', 'Denim'", "e.g. 'HS 4202', 'Jute', 'Denim'")}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:text-slate-950 font-bold text-xs flex items-center space-x-1 transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('বাজার খুঁজুন', 'Find markets')}</span>
          </button>
        </form>

        {graphSearchResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            {graphResultIsExample && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bangla">
                {t(
                  'এই অনুসন্ধানের জন্য নির্দিষ্ট মিল পাওয়া যায়নি। নিচের তথ্য সবচেয়ে কাছের নমুনা রেফারেন্স, প্রকৃত ফলাফল নয়।',
                  'No specific match exists for this search. The reference below is the closest example, not an actual result.'
                )}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{graphSearchResult.hs_code}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{graphSearchResult.chapter}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-900">
              <div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{t('সম্ভাব্য শুল্ক সুবিধা:', 'Indicative tariff references:')}</span>
                <ul className="text-emerald-700 dark:text-emerald-400 font-mono mt-1 space-y-0.5">
                  {graphSearchResult.zero_duty_markets.map((m: string, i: number) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{t('নমুনা বাজার প্রোফাইল:', 'Illustrative market profiles:')}</span>
                <ul className="text-slate-800 dark:text-slate-200 mt-1 space-y-0.5">
                  {graphSearchResult.active_importers.map((m: string, i: number) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{t('প্রয়োজনীয় কমপ্লায়েন্স:', 'Required Compliance:')}</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 text-[11px] leading-relaxed">
                  {graphSearchResult.compliance}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Sources & Legal Provenance Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('বাণিজ্য তথ্যের সূত্র', 'Trade information sources')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">{t('তথ্য ভান্ডার', 'Data Repository')}</th>
                <th className="p-3">{t('দাপ্তরিক সূত্র', 'Official Source')}</th>
                <th className="p-3">{t('পরিসর ও যাচাই', 'Scope & Verification')}</th>
                <th className="p-3">{t('হালনাগাদ চক্র', 'Update Cycle')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">NBR Bangladesh Customs Tariff 2026</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">nbr.gov.bd/customs-tariff</td>
                <td className="p-3">Chapters 42, 53, 62, 64, 69 (8-Digit HS Codes)</td>
                <td className="p-3">Annual National Budget</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">EU CBAM Regulation (EU) 2023/956</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0956</td>
                <td className="p-3">Scope 2 Electricity Grid Emission Benchmarks</td>
                <td className="p-3">Live EU RAG Sync</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Bangladesh Export Policy 2024-2027</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">mincom.gov.bd/export-policy</td>
                <td className="p-3">ERC, IRC, Cash Incentives & REX Eligibility</td>
                <td className="p-3">Triennial Policy Cycle</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">BREB Industrial Tariff Schedule E-1</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">reb.gov.bd/tariff-rates</td>
                <td className="p-3">Peak / Off-Peak Time-of-Use & Power Factor Rules</td>
                <td className="p-3">Quarterly BERC Orders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
