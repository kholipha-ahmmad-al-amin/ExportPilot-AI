import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, DollarSign, TrendingUp, ShieldCheck, Cpu, Globe, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const { user, t } = useAuth();
  const navigate = useNavigate();

  // Loss-Aversion Interactive Calculator State
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
      markets: 'Germany, Japan, Netherlands (0% Duty)',
      co2: '0.31 kg CO2e',
      margin: '+36.5%'
    },
    {
      id: 'preset_denim_jacket',
      title: t('গাজীপুর রিসাইকেলড ডেনিম জ্যাকেট', 'Gazipur Recycled Denim Jacket'),
      hs: '6201.40.10',
      img: '/assets/samples/denim-jacket-rmg.png',
      fob: '$13.80',
      markets: 'UK (DCTS), Sweden (EBA 0% Duty)',
      co2: '2.15 kg CO2e',
      margin: '+34.8%'
    },
    {
      id: 'preset_leather_boot',
      title: t('সাভার লেদার চেলসি বুট', 'Savar Leather Chelsea Boot'),
      hs: '6403.91.60',
      img: '/assets/samples/leather-chelsea-boot.png',
      fob: '$24.50',
      markets: 'Italy, Japan (Saves 21.6% Quota Duty)',
      co2: '3.40 kg CO2e',
      margin: '+37.1%'
    },
    {
      id: 'preset_terracotta',
      title: t('বগুড়া হস্তশিল্প টেরাকোটা সেট', 'Bogura Terracotta Tableware'),
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
    <div className="space-y-20 py-8">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('আন্তর্জাতিক বাণিজ্য বুদ্ধিমত্তা প্ল্যাটফর্ম ২০২৬', 'International Sovereign Trade Intelligence 2026')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          {t('মাত্র ১টি পণ্যের ছবি ও বাংলা ভয়েস থেকে', 'From 1 Product Photo & Bangla Voice to')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
            {t('৬০ সেকেন্ডে বায়ার, কমপ্লায়েন্স ও এক্সপোর্ট ডিল!', 'Verified Global Buyers & Export Deals in 60s!')}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-bangla">
          {t(
            'সাভার, গাজীপুর, বগুড়ার কারখানা মালিকদের জন্য জিরো-প্যারা সমাধান। বায়িং হাউসের দালাল ছাড়া সরাসরি ইউরোপ, জাপান ও মধ্যপ্রাচ্যে ডলারে পণ্য পাঠান।',
            'Zero-hassle trade engine for Bangladeshi SME factories. Cut out buying house middlemen and export directly to Germany, Japan, and the UK with 0% tariff optimization.'
          )}
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to={user ? "/app" : "/login"}
            className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>{user ? t('ট্রেড ওয়ার্কস্পেস খুলুন', 'Launch Trade Workspace') : t('নিরাপদ সাইন ইন', 'Sign In to Workspace')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/buyers"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-slate-200 font-bold text-sm transition-all hover:bg-slate-800"
          >
            <span>{t('ভেরিফায়েড বায়ার ডিরেক্টরি', 'Browse Verified Buyers')}</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </section>

      {/* Middleman Loss-Aversion Interactive Calculator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-amber-400" />
                <span>{t('দালাল বনাম সরাসরি এক্সপোর্ট লাভ ক্যালকুলেটর', 'Middleman Loss vs Direct Export Calculator')}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('Kahneman & Tversky Loss Aversion Model: দেখুন বায়িং হাউসের কারণে প্রতি চালানে আপনার কত টাকা লস হচ্ছে।', 'See how much money factory owners lose to buying house middlemen on every single shipment.')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">{t('প্রতি চালানে অতিরিক্ত লাভ', 'Additional Profit Gained')}</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                +${Number(middlemanLossUsd).toLocaleString()} USD
              </div>
              <div className="text-xs text-slate-400">
                (+{(middlemanLossBdt / 100000).toFixed(2)} {t('লাখ টাকা', 'Lakh BDT')})
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{t('মাসিক উৎপাদন সক্ষমতা (পিস)', 'Monthly Capacity (Units)')}</span>
                <span className="font-mono text-emerald-400 font-bold">{units.toLocaleString()} pcs</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{t('প্রতি পিস তৈরি করতে আপনার খরচ (টাকা)', 'Factory Production Cost per Unit (BDT)')}</span>
                <span className="font-mono text-amber-400 font-bold">{unitCost} BDT</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* High-Contrast Dual Progress Bar */}
          <div className="space-y-3 pt-2">
            
            {/* Red Bar: Middleman Buying House Loss */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-400">{t('বায়িং হাউস বা দালালের মাধ্যমে বিক্রি করলে মুনাফা লস:', 'Selling through Buying House / Middleman:')}</span>
                <span className="text-rose-400 font-mono">-৩২% থেকে -৪০% মুনাফা লোপাট</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-rose-900/40">
                <div className="bg-rose-600 h-full rounded-full transition-all duration-300" style={{ width: '38%' }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {t('দালাল আপনাকে দেয় মাত্র ২৫ টাকা লাভ per piece। বাকি ১৮০+ টাকা লাভ তারা নিজের পকেটে নিয়ে নেয়।', 'Middlemen offer factory owners only 25 BDT profit per unit while pocketing 180+ BDT per unit abroad.')}
              </div>
            </div>

            {/* Emerald Bar: Direct Export with ExportPilot AI */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{t('ExportPilot AI দিয়ে সরাসরি এক্সপোর্ট করলে আপনার মুনাফা:', 'Direct Export via ExportPilot AI:')}</span>
                <span className="text-emerald-400 font-mono">+৩৬.৫% অতিরিক্ত মার্জিন (+${Number(middlemanLossUsd).toLocaleString()} USD)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-emerald-900/40">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: '85%' }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {t('সরাসরি ডলারে ৩.৪০ USD (৪০৮ টাকা) FOB মূল্যে আন্তর্জাতিক বায়ারকে পণ্য সরবরাহ করুন।', 'Export directly at $3.40 USD (408 BDT) FOB price directly to verified importers in Hamburg or Tokyo.')}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4 Flagship Presets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-bangla">
            {t('৪টি জাতীয় ফ্ল্যাগশিপ রপ্তানি প্রেসেট', '4 National Flagship Export Presets')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-bangla">
            {t(
              'বাংলাদেশের শীর্ষ রপ্তানি খাতের জন্য রিয়েল-টাইম কমপ্লায়েন্স ও আন্তর্জাতিক বাজার বিশ্লেষণ। যেকোনো পণ্যে ক্লিক করে সম্পূর্ণ ৫-এজেন্ট পাইপলাইনের ফলাফল পর্যালোচনা করুন।',
              'Real-time compliance and global market analysis across Bangladesh top export sectors. Review verified tariffs, carbon scores, and buyer matching.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {presets.map((p) => (
            <div
              key={p.id}
              onClick={() => handleLaunchPreset(p.id)}
              className="group cursor-pointer rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/40 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-800">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/90 text-amber-400 border border-amber-500/60">
                    {p.fob} FOB
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60">
                    {p.margin} MARGIN
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </h3>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    HS CODE: {p.hs}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {p.markets}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">EU CBAM: {p.co2}</span>
                <span className="inline-flex items-center text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>{t('রান করুন', 'Test')}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 FastMCP Autonomous Agents Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t('ব্যাকএন্ডে ৫টি স্বয়ংক্রিয় FastMCP এজেন্ট', '5 Autonomous FastMCP Agents on Backend')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {t(
              'ইউজারের কোনো ঝামেলা নেই। ১টি ছবি ড্রপ করার পর ৫টি স্পেশালাইজড এজেন্ট সমান্তরালে এক্সপোর্ট ডিল প্রস্তুত করে।',
              'Zero user hassle. Drop 1 photo or voice note and 5 specialized MCP agents orchestrate the entire export pipeline.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: 'Agent 1',
              title: t('ভিশন ও এইচএস কোড', 'Vision & 8-Digit HS Code'),
              desc: t('OpenCV দিয়ে ব্যাকগ্রাউন্ড ক্লিন করে স্টুডিও ক্যাটালগ ও ৮-ডিজিট এইচএস কোড নির্ধারণ করে।', 'Cleans background and classifies exact 8-digit tariff code with 98.4% confidence.')
            },
            {
              step: 'Agent 2',
              title: t('GraphRAG বায়ার ট্র্যাভার্সাল', 'GraphRAG Buyer Matcher'),
              desc: t('NetworkX নলেজ গ্রাফ দিয়ে ০% শুল্কমুক্ত দেশ ও ভেরিফায়েড বিদেশি ইম্পোর্টার খুঁজে বের করে।', 'Traverses trade graph to match 0% duty schemes (EU EBA, Japan DFQF) and verified buyers.')
            },
            {
              step: 'Agent 3',
              title: t('জিরো-হার্ডওয়্যার CBAM অডিট', 'Zero-Hardware CBAM'),
              desc: t('PyMuPDF দিয়ে বিদ্যুৎ বিল পার্স করে প্রতি ইউনিটে Scope 2 কার্বন নিঃসরণ অডিট করে।', 'Extracts kWh from REB utility bills to audit Scope 2 kg CO2e per unit without IoT sensors.')
            },
            {
              step: 'Agent 4',
              title: t('FOB প্রাইসিং ও মার্জিন', 'Loss-Aversion FOB Pricer'),
              desc: t('দালালের মার্জিন বাদ দিয়ে ফ্যাক্টরিকে সর্বোচ্চ লাভজনক FOB এক্সপোর্ট প্রাইস প্রস্তাব করে।', 'Calculates exact dollar margin saved by bypassing buying house middlemen.')
            },
            {
              step: 'Agent 5',
              title: t('মাল্টিলিঙ্গুয়াল ডিল ও PDF', 'Multilingual Pitch & PDFs'),
              desc: t('জার্মান, জাপানি ও ইংরেজিতে পিচ এবং ReportLab দিয়ে ৩টি ভেক্টর PDF তৈরি করে।', 'Generates German/Japanese pitches and downloadable Proforma Invoice PDFs on the fly.')
            }
          ].map((a, i) => (
            <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {a.step}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-white pt-1">{a.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-bangla">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
