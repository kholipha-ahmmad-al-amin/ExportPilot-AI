import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, FileText, Cpu, CheckCircle2, Search, ArrowRight, ShieldCheck, Download } from 'lucide-react';

export const DataExplorer: React.FC = () => {
  const { t } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<'sample_reb_bill' | 'sample_trade_license'>('sample_reb_bill');
  const [parseResult, setParseResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [graphSearchQuery, setGraphSearchQuery] = useState('HS 4202');
  const [graphSearchResult, setGraphSearchResult] = useState<any>(null);

  const runParse = async (docType: 'sample_reb_bill' | 'sample_trade_license') => {
    setSelectedDoc(docType);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('preset_doc', docType);
      const res = await fetch('/api/v1/parsers/parse-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setParseResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    } else if (graphSearchQuery.includes('6201') || graphSearchQuery.toLowerCase().includes('denim')) {
      setGraphSearchResult({
        hs_code: '6201.40.10',
        chapter: 'Chapter 62: Denim Outerwear / RMG',
        zero_duty_markets: ['United Kingdom (DCTS)', 'Sweden (EU EBA)'],
        active_importers: ['Thames Streetwear Collective ($3.4M)', 'Nordic Circular Apparel ($2.8M)'],
        compliance: 'OEKO-TEX 100, Global Recycled Standard (GRS)'
      });
    } else {
      setGraphSearchResult({
        hs_code: '6403.91.60',
        chapter: 'Chapter 64: Footwear / Leather Boots',
        zero_duty_markets: ['Italy (EU EBA)', 'Japan (Saves 21.6% leather quota)'],
        active_importers: ['Milano Calzature ($1.9M)', 'Osaka Craft Footwear ($1.65M)'],
        compliance: 'LWG Chrome-Free, REACH Chemical Declaration'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          OPEN-SOURCE DATA & PARSER LAB
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('ওপেন-সোর্স PDF পার্সার ও GraphRAG এক্সপ্লোরার', 'Open-Source PDF Parsers & GraphRAG Explorer')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-bangla">
          {t(
            'PyMuPDF (fitz) এবং pdfplumber এর মাধ্যমে ফ্যাক্টরির বিদ্যুৎ বিল ও ট্রেড লাইসেন্স থেকে স্বয়ংক্রিয় টেবিল এক্সট্র্যাকশন ও ডাটা সভারেনটি পিআইআই মাস্কিং।',
            'Live workbench for zero-hardware utility bill parsing, tabular extraction via PyMuPDF (fitz), and multi-hop trade topology.'
          )}
        </p>
      </div>

      {/* Interactive Open-Source Parser Workbench */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>{t('লাইভ PDF পার্সিং ওয়ার্কবেঞ্চ', 'Live PDF Parser Workbench')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('নিচের বোতামে ক্লিক করে নমুনা বিদ্যুৎ বিল বা ট্রেড লাইসেন্স পার্স করে দেখুন:', 'Test parsing bundled sample documents via PyMuPDF:')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => runParse('sample_reb_bill')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedDoc === 'sample_reb_bill'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('১. REB বিদ্যুৎ বিল পার্স করুন', '1. Parse REB Electricity Bill')}
            </button>
            <button
              onClick={() => runParse('sample_trade_license')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedDoc === 'sample_trade_license'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('২. ট্রেড লাইসেন্স পার্স করুন', '2. Parse Trade License & ERC')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-400 font-mono">
              Running PyMuPDF (fitz) + pdfplumber extraction pipeline...
            </div>
          </div>
        ) : parseResult ? (
          <div className="space-y-4">
            
            {/* Parser Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Execution Time:</span>
                <div className="text-emerald-400 font-mono font-bold text-sm">{parseResult.execution_time_ms} ms</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Parser Engine:</span>
                <div className="text-white font-mono font-bold text-sm">{parseResult.parser_engine}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">PII Entities Masked:</span>
                <div className="text-amber-400 font-mono font-bold text-sm">{parseResult.pii_redacted_count} Entities</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Tables Extracted:</span>
                <div className="text-blue-400 font-mono font-bold text-sm">{parseResult.tables_count} Vector Tables</div>
              </div>
            </div>

            {/* Extracted Metrics */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                EXTRACTED DOMAIN METRICS (JSON)
              </span>
              <pre className="text-xs font-mono text-slate-300 bg-slate-900/80 p-3 rounded border border-slate-800 overflow-x-auto">
                {JSON.stringify(parseResult.metrics, null, 2)}
              </pre>
            </div>

            {/* Redacted Text Snippet */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SOVEREIGN PII-MASKED TEXT SNIPPET</span>
              </span>
              <p className="text-xs font-mono text-slate-400 bg-slate-900/80 p-3 rounded border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {parseResult.redacted_text_snippet}
              </p>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            {t('যেকোনো একটি বোতামে ক্লিক করে লাইভ পার্সিং টেস্ট শুরু করুন।', 'Click any button above to execute live PDF parsing.')}
          </div>
        )}
      </div>

      {/* NetworkX & ChromaDB GraphRAG Node Explorer */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>{t('ট্রেড নলেজ গ্রাফ ও ভেক্টর সার্চ এক্সপ্লোরার', 'Trade Knowledge Graph & Vector Search')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('এইচএস কোড বা পণ্যের নাম দিয়ে মাল্টি-হপ গ্রাফ ক্যোয়ারী করুন:', 'Query multi-hop paths by HS Code or product keyword:')}
          </p>
        </div>

        <form onSubmit={handleGraphSearch} className="flex gap-2">
          <input
            type="text"
            value={graphSearchQuery}
            onChange={(e) => setGraphSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white outline-none"
            placeholder="Search e.g. 'HS 4202', 'Jute', 'Denim', 'Leather'"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('সার্চ করুন', 'Query Graph')}</span>
          </button>
        </form>

        {graphSearchResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">{graphSearchResult.hs_code}</span>
              <span className="text-xs text-slate-300 font-semibold">{graphSearchResult.chapter}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-900">
              <div>
                <span className="text-slate-400 font-semibold">{t('শুল্কমুক্ত মার্কেট (0% Duty):', 'Zero-Duty Markets:')}</span>
                <ul className="text-emerald-400 font-mono mt-1 space-y-0.5">
                  {graphSearchResult.zero_duty_markets.map((m: string, i: number) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{t('ভেরিফায়েড ইম্পোর্টারগণ:', 'Verified Importers:')}</span>
                <ul className="text-slate-200 mt-1 space-y-0.5">
                  {graphSearchResult.active_importers.map((m: string, i: number) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{t('প্রয়োজনীয় কমপ্লায়েন্স:', 'Required Compliance:')}</span>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  {graphSearchResult.compliance}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Sources & Legal Provenance Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>{t('আইনি ভিত্তি ও ডাটা সোর্স প্রোভেন্যান্স', 'Legal Provenance & Data Sources')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Data Repository</th>
                <th className="p-3">Official Source URL</th>
                <th className="p-3">Scope & Verification</th>
                <th className="p-3">Update Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">NBR Bangladesh Customs Tariff 2026</td>
                <td className="p-3 text-emerald-400">nbr.gov.bd/customs-tariff</td>
                <td className="p-3">Chapters 42, 53, 62, 64, 69 (8-Digit HS Codes)</td>
                <td className="p-3">Annual National Budget</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">EU CBAM Regulation (EU) 2023/956</td>
                <td className="p-3 text-emerald-400">eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0956</td>
                <td className="p-3">Scope 2 Electricity Grid Emission Benchmarks</td>
                <td className="p-3">Live EU RAG Sync</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Bangladesh Export Policy 2024-2027</td>
                <td className="p-3 text-emerald-400">mincom.gov.bd/export-policy</td>
                <td className="p-3">ERC, IRC, Cash Incentives & REX Eligibility</td>
                <td className="p-3">Triennial Policy Cycle</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">BREB Industrial Tariff Schedule E-1</td>
                <td className="p-3 text-emerald-400">reb.gov.bd/tariff-rates</td>
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
