import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, TrendingUp, ShieldCheck, Cpu, Globe,
  CheckCircle2, FileText, ChevronRight, Mic, Building2
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { user, t } = useAuth();
  const navigate = useNavigate();

  // Kahneman & Tversky Loss-Aversion Calculator State
  const [units, setUnits] = useState<number>(10000);
  const [unitCost, setUnitCost] = useState<number>(180);

  // Middleman buys at 205 BDT (+25 BDT margin) vs Direct FOB Export at 3.40 USD (408 BDT = +228 BDT margin)
  const middlemanProfitBdt = units * 25;
  const directExportProfitBdt = units * (408 - unitCost);
  const middlemanLossBdt = directExportProfitBdt - middlemanProfitBdt;
  const middlemanLossUsd = (middlemanLossBdt / 120).toFixed(0);

  const presets = [
    {
      id: 'preset_jute_bag',
      title: t('সাভার গোল্ডেন জুট ব্যাগ', 'Savar Golden Jute Bag'),
      hs: '4202.22.10',
      img: '/assets/samples/jute-tote-bag.png',
      fob: '$3.40',
      markets: 'Germany, Japan (0% Duty)',
      co2: '0.31 kg CO2e',
      margin: '+36.5%'
    },
    {
      id: 'preset_denim_jacket',
      title: t('গাজীপুর রিসাইকেলড ডেনিম', 'Gazipur Recycled Denim'),
      hs: '6201.40.10',
      img: '/assets/samples/denim-jacket-rmg.png',
      fob: '$13.80',
      markets: 'UK (DCTS), Sweden (0% EBA)',
      co2: '2.15 kg CO2e',
      margin: '+34.8%'
    },
    {
      id: 'preset_leather_boot',
      title: t('সাভার লেদার চেলসি বুট', 'Savar Leather Chelsea Boot'),
      hs: '6403.91.60',
      img: '/assets/samples/leather-chelsea-boot.png',
      fob: '$24.50',
      markets: 'Italy, Japan (Saves 21.6% Quota)',
      co2: '3.40 kg CO2e',
      margin: '+37.1%'
    },
    {
      id: 'preset_terracotta',
      title: t('বগুড়া সিরামিক টেবিলওয়্যার', 'Bogura Terracotta Tableware'),
      hs: '6912.00.20',
      img: '/assets/samples/terracotta-tableware.png',
      fob: '$11.20',
      markets: 'UAE (Dubai), Germany (0% Duty)',
      co2: '1.15 kg CO2e',
      margin: '+44.2%'
    }
  ];

  const handleLaunchPreset = (presetId: string) => {
    if (user) {
      navigate(`/app?preset=${presetId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 py-8">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. ASYMMETRIC WORKBENCH HERO SECTION (Hallmark Rule)                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (7 cols): Direct Human Thesis */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('জাতীয় রপ্তানি বাণিজ্য অবকাঠামো ২০২৬', 'National Export Infrastructure 2026')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              {t(
                'মাত্র ১টি পণ্যের ছবি ও বাংলা ভয়েস থেকে ৬০ সেকেন্ডে সরাসরি এক্সপোর্ট ডিল',
                'From 1 Product Photo & Bangla Voice to Direct FOB Export Deals in 60s'
              )}
            </h1>

            <p className="text-base text-slate-300 leading-relaxed font-bangla max-w-2xl">
              {t(
                'সাভার, গাজীপুর ও বগুড়ার ম্যানুফ্যাকচারারদের জন্য মধ্যস্বত্বভোগীহীন সার্বভৌম সমাধান। কোনো বায়িং হাউসের দালাল ছাড়া সরাসরি ইউরোপ ও জাপানে ডলারে পণ্য পাঠান, নিশ্চিত করুন ইইউ সিবিএএম কার্বন কমপ্লায়েন্স।',
                'Institutional trade intelligence for Bangladeshi SME factory owners. Eliminate buying house middlemen, match verified global importers in Germany and Japan, and clear EU CBAM carbon audits automatically.'
              )}
            </p>

            {/* Direct Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={user ? "/app" : "/login"}
                className="btn-primary text-sm py-3 px-6"
              >
                <span>{user ? t('ডিল রুম খুলুন', 'Open Deal Room') : t('নিরাপদ সাইন ইন', 'Sign In to Workspace')}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                to="/buyers"
                className="btn-secondary text-sm py-3 px-5"
              >
                <span>{t('ভেরিফায়েড বায়ার ডিরেক্টরি', 'Verified Importers')}</span>
                <ChevronRight className="w-4 h-4 ml-1 text-slate-400" />
              </Link>

              <Link
                to="/docs"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 px-2"
              >
                {t('ক্যানোনিকাল ডক্স পড়ুন', 'Read Canonical Docs')}
              </Link>
            </div>

            {/* Sovereign Data Redaction Guarantee Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <div className="p-2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="leading-snug">
                <strong className="text-slate-200">{t('স্থানীয় সার্বভৌমত্ব গ্যারান্টি:', 'Local Sovereignty Guarantee:')}</strong>{' '}
                {t(
                  'কারখানার এনআইডি, টিআইএন ও ব্যাংক অ্যাকাউন্ট ক্লায়েন্ট সাইডেই লোকাল রিডাক্টরে মাস্ক করা হয়। কোনো কাঁচা ডাটা বিদেশে যায় না।',
                  'Factory NID, TIN, and Bank Accounts are masked locally via 8 sovereign regex filters before any network transmission.'
                )}
              </p>
            </div>

          </div>

          {/* Right Column (5 cols): Live Product Terminal Card */}
          <div className="lg:col-span-5">
            <div className="card-workbench space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    {t('লাইভ প্রোডাক্ট ওয়ার্কবেঞ্চ', 'Product Workbench')}
                  </span>
                </div>
                <span className="pill-status pill-accent">
                  {t('৪টি প্রেসেট রেডি', '4 Presets Ready')}
                </span>
              </div>

              <p className="text-xs text-slate-400 font-bangla">
                {t(
                  'নিচের যেকোনো জাতীয় প্রেসেটে ক্লিক করে ৫-এজেন্ট পাইপলাইন টেস্ট করুন:',
                  'Select a national flagship preset to launch the 5-agent pipeline:'
                )}
              </p>

              {/* 4 Flagship Presets List */}
              <div className="space-y-2.5">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleLaunchPreset(p.id)}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/80 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.img} alt={p.title} className="w-11 h-11 rounded object-cover border border-slate-800 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                          {p.title}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          HS {p.hs} · <span className="text-slate-400">{p.markets}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-amber-400">{p.fob} FOB</div>
                      <div className="text-[10px] font-mono text-emerald-400">{p.margin}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => handleLaunchPreset('preset_jute_bag')}
                  className="w-full btn-secondary text-xs py-2.5 justify-center"
                >
                  <Mic className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>{t('ভয়েস ও ফটো দিয়ে ডিল রান করুন', 'Test Voice & Photo Deal')}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MIDDLEMAN LOSS-AVERSION CALCULATOR (Kahneman & Tversky Model)    */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-workbench space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">
                  {t('দালাল বনাম সরাসরি এক্সপোর্ট লাভ ক্যালকুলেটর', 'Middleman Loss vs Direct Export Calculator')}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-bangla">
                {t(
                  'প্রস্পেক্ট থিওরি লস-অ্যাভারশন মডেল: বায়িং হাউসের কারণে প্রতি চালানে আপনার কত টাকা অপচয় হচ্ছে দেখুন।',
                  'Kahneman & Tversky Loss-Aversion Model: Measure real factory capital lost to buying house intermediaries.'
                )}
              </p>
            </div>

            <div className="text-left sm:text-right p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {t('প্রতি চালানে হারানো মার্জিন', 'Margin Saved Per Shipment')}
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                +${Number(middlemanLossUsd).toLocaleString()} USD
              </div>
              <div className="text-xs text-slate-400 font-bangla">
                (+{(middlemanLossBdt / 100000).toFixed(2)} {t('লাখ টাকা ক্ষতিপূরণ', 'Lakh BDT recovered')})
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{t('চালানের আকার (পিস)', 'Shipment Volume (Units)')}</span>
                <span className="font-mono text-emerald-400 tabular-nums">{units.toLocaleString()} pcs</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                aria-label="Shipment Volume Slider"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{t('ইউনিট প্রতি উৎপাদন খরচ (টাকা)', 'Factory Unit Cost (BDT)')}</span>
                <span className="font-mono text-amber-400 tabular-nums">{unitCost} BDT</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                aria-label="Production Cost Slider"
              />
            </div>
          </div>

          {/* High-Contrast Comparison Bars */}
          <div className="space-y-4 pt-2">
            
            {/* Middleman Buying House Loss */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-rose-400">{t('বায়িং হাউসের মাধ্যমে বিক্রি করলে:', 'Selling via Middleman Buying House:')}</span>
                <span className="text-rose-400 font-mono tabular-nums">-৩২% থেকে -৪০% মুনাফা লোপাট</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-rose-950">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: '38%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 font-bangla">
                {t(
                  'দালাল আপনাকে দেয় মাত্র ২৫ টাকা লাভ per piece। বাকি ১৮০+ টাকা লাভ তারা নিজের পকেটে নিয়ে নেয়।',
                  'Intermediaries offer only 25 BDT net margin per unit while capturing 180+ BDT markup abroad.'
                )}
              </p>
            </div>

            {/* Direct Export with ExportPilot AI */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">{t('ExportPilot AI দিয়ে সরাসরি এক্সপোর্ট করলে:', 'Direct Export via ExportPilot AI:')}</span>
                <span className="text-emerald-400 font-mono tabular-nums">+৩৬.৫% অতিরিক্ত মার্জিন (+${Number(middlemanLossUsd).toLocaleString()} USD)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-emerald-950">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 font-bangla">
                {t(
                  'সরাসরি ৩.৪০ USD (৪০৮ টাকা) FOB মূল্যে হামবুর্গ ও টোকিওর ক্রেতাকে পণ্য সরবরাহ করুন।',
                  'Supply directly at $3.40 USD (408 BDT) FOB to verified European and Japanese buyers.'
                )}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. 5 FASTMCP AGENTS PIPELINE ARCHITECTURE (Interconnected Flow)     */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="space-y-2">
          <div className="pill-status pill-accent">FASTMCP MULTI-AGENT ARCHITECTURE</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t('ব্যাকএন্ডে ৫টি স্বয়ংক্রিয় FastMCP এজেন্ট পাইপলাইন', '5 Autonomous FastMCP Agents Pipeline')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-bangla">
            {t(
              '১টি ছবি ও বাংলা ভয়েস থেকে ব্যাকএন্ডে ৫টি স্পেশালাইজড এজেন্ট সমান্তরালে কাজ করে সম্পুর্ণ এক্সপোর্ট রেডি ডিল প্রস্তুত করে।',
              'Single photo or Bangla audio triggers 5 parallel specialized MCP agents to orchestrate the export pipeline.'
            )}
          </p>
        </div>

        {/* Interconnected Sequential Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: 'Agent 1',
              title: t('ভিশন ও ৮-ডিজিট এইচএস কোড', 'Vision & 8-Digit HS Code'),
              tool: 'OpenCV + HS Tariff Engine',
              desc: t('ব্যাকগ্রাউন্ড ক্লিন করে পণ্যের সঠিক ৮-ডিজিট এইচএস কোড ও ডব্লিউটিও ক্যাটাগরি নির্ধারণ করে।', 'Strips studio background and maps exact 8-digit tariff code with 98.4% confidence.')
            },
            {
              step: 'Agent 2',
              title: t('GraphRAG বায়ার ট্র্যাভার্সাল', 'GraphRAG Buyer Matcher'),
              tool: 'NetworkX Multi-Hop Graph',
              desc: t('নলেজ গ্রাফ ট্র্যাভার্স করে ০% শুল্কমুক্ত দেশ ও ভেরিফায়েড ১২টি বিদেশি আমদানিকারক ম্যাচ করে।', 'Traverses trade graph for 0% duty schemes (EU EBA, Japan DFQF) and verified importers.')
            },
            {
              step: 'Agent 3',
              title: t('জিরো-হার্ডওয়্যার CBAM অডিট', 'Zero-Hardware CBAM'),
              tool: 'PyMuPDF REB Parser',
              desc: t('আরইবি বিদ্যুৎ বিল থেকে প্রতি ইউনিটে স্কোপ ২ কার্বন নিঃসরণ অডিট করে কোনো সেন্সর ছাড়াই।', 'Extracts kWh from REB utility bills to audit Scope 2 kg CO2e per unit without IoT sensors.')
            },
            {
              step: 'Agent 4',
              title: t('FOB প্রাইসিং ও মার্জিন', 'Loss-Aversion Pricer'),
              tool: 'Prospect Theory Engine',
              desc: t('বায়িং হাউসের অপচয় বাদ দিয়ে কারখানার জন্য সর্বোচ্চ মুনাফাদায়ক FOB এক্সপোর্ট প্রাইস প্রস্তুত করে।', 'Calculates maximum sustainable FOB dollar price bypassing middleman margins.')
            },
            {
              step: 'Agent 5',
              title: t('মাল্টিলিঙ্গুয়াল ডিল ও PDF', 'Pitch & Vector PDF Engine'),
              tool: 'ReportLab + Azure OpenAI',
              desc: t('জার্মান ও জাপানি ভাষায় পিচ এবং সরাসরি প্রিন্ট-রেডি ভেক্টর প্রফরমা ইনভয়েস PDF তৈরি করে।', 'Generates German/Japanese pitches and downloadable Proforma Invoice PDFs instantly.')
            }
          ].map((a, i) => (
            <div key={i} className="card-workbench space-y-3 p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="pill-status font-bold text-emerald-400 border-emerald-800">
                    {a.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{a.title}</h3>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {a.tool}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-bangla">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
};
