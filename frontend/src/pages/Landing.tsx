import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import seoConfig from '../../seo.config.json';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Globe,
  FileText,
  ChevronRight,
  UploadCloud,
  Play,
  ChevronDown,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';
import { ArchitecturalBackground } from '../components/ArchitecturalBackground';
import { CanvasErrorBoundary } from '../components/CanvasErrorBoundary';
import { TradeTicker } from '../components/TradeTicker';
import { VoiceGuideButton } from '../components/VoiceGuidePlayer';
import { TradeLogisticsRadar } from '../components/TradeLogisticsRadar';

const LandingBackgroundCanvas = React.lazy(() =>
  import('../components/LandingBackgroundCanvas').then((m) => ({ default: m.LandingBackgroundCanvas }))
);

export const Landing: React.FC = () => {
  const { user, t, theme } = useAuth();
  const navigate = useNavigate();

  // Selected preset preview in hero cockpit
  const [selectedHeroPreset, setSelectedHeroPreset] = useState<string>('preset_jute_bag');

  // Video Player state (instant poster loaded, iframe on play)
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Direct Export Margin Calculator State
  const [units, setUnits] = useState<number>(10000);
  const [unitCost, setUnitCost] = useState<number>(180);

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic Trade Economics
  const totalProductionCostBdt = units * unitCost;
  const directGainPct = 0.22;
  const directGainBdt = totalProductionCostBdt * directGainPct;
  const directGainUsd = Math.round(directGainBdt / 120);
  const directGainLakhBdt = (directGainBdt / 100000).toFixed(2);

  const presets = [
    {
      id: 'preset_jute_bag',
      title: t('সাভার গোল্ডেন জুট ব্যাগ', 'Savar Golden Jute Bag'),
      sector: t('পাট ও পরিবেশবান্ধব পণ্য', 'Jute & Natural Fiber'),
      hs: '4202.22.10',
      img: '/assets/samples/jute-tote-bag.png',
      fob: '$3.40',
      markets: 'Germany, Japan (0% Duty)',
      co2: '0.31 kg CO2e',
      margin: '+36.5%',
      corridorName: t('রটারডাম / হামবুর্গ বন্দর', 'Rotterdam / Hamburg Port'),
      buyerName: 'NordicEco Retail GmbH (Hamburg)',
      benefit: t('ইউরোপে ইবিএ সুবিধার আওতায় ০% শুল্ক', 'Zero tariff entry to EU under EBA')
    },
    {
      id: 'preset_denim_jacket',
      title: t('গাজীপুর রিসাইকেলড ডেনিম', 'Gazipur Recycled Denim'),
      sector: t('তৈরি পোশাক ও টেক্সটাইল', 'RMG & Circular Denim'),
      hs: '6201.40.10',
      img: '/assets/samples/denim-jacket-rmg.png',
      fob: '$13.80',
      markets: 'UK (DCTS), Sweden (0% EBA)',
      co2: '2.15 kg CO2e',
      margin: '+34.8%',
      corridorName: t('ফেলিক্সস্টো বন্দর (লন্ডন)', 'Port of Felixstowe (London)'),
      buyerName: 'Thames Streetwear Collective (London)',
      benefit: t('যুক্তরাজ্যে ০% শুল্কমুক্ত রপ্তানি', 'Duty-free export to United Kingdom')
    },
    {
      id: 'preset_leather_boot',
      title: t('সাভার লেদার চেলসি বুট', 'Savar Leather Chelsea Boot'),
      sector: t('চামড়া ও ফুটওয়্যার', 'Leather & Footwear'),
      hs: '6403.91.60',
      img: '/assets/samples/leather-chelsea-boot.png',
      fob: '$24.50',
      markets: 'Italy, Japan (Saves 21.6% Quota)',
      co2: '3.40 kg CO2e',
      margin: '+37.1%',
      corridorName: t('টোকিও / ইয়োকোহামা বন্দর', 'Tokyo / Yokohama Port'),
      buyerName: 'Milano Calzature SpA (Milan)',
      benefit: t('জাপানে ২১.৬% লেদার কোটা সাশ্রয় সুবিধা', 'Saves 21.6% leather quota in Japan')
    },
    {
      id: 'preset_terracotta',
      title: t('বগুড়া সিরামিক টেবিলওয়্যার', 'Bogura Terracotta Tableware'),
      sector: t('সিরামিক ও হস্তশিল্প', 'Ceramic & Tableware'),
      hs: '6912.00.20',
      img: '/assets/samples/terracotta-tableware.png',
      fob: '$11.20',
      markets: 'UAE (Dubai), Germany (0% Duty)',
      co2: '1.15 kg CO2e',
      margin: '+44.2%',
      corridorName: t('পোর্ট অব নিউ ইয়র্ক ও নিউ জার্সি', 'Port of New York & New Jersey'),
      buyerName: 'Bayern Craft Imports AG (Munich)',
      benefit: t('মধ্যপ্রাচ্য ও ইউরোপে প্রিমিয়াম এফওবি রেট', 'Premium FOB pricing in Middle East & EU')
    }
  ];

  const currentHeroItem = presets.find((p) => p.id === selectedHeroPreset) || presets[0];

  const handleLaunchPreset = (presetId: string) => {
    if (user) {
      navigate(`/dealroom?preset=${presetId}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/dealroom?preset=${presetId}`)}`);
    }
  };

  const handleLaunchCalculator = () => {
    const targetUrl = `/dealroom?preset=${selectedHeroPreset}&units=${units}&cost=${unitCost}`;
    if (user) {
      navigate(targetUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const handleWatchVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVideoPlaying(true);
    const videoElem = document.getElementById('platform-video');
    if (videoElem) {
      videoElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative space-y-16 sm:space-y-24 py-6 sm:py-12 transition-colors duration-200">
      {/* Ambient 3D background on desktop */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <CanvasErrorBoundary>
          <React.Suspense fallback={null}>
            <LandingBackgroundCanvas theme={theme === 'dark' ? 'dark' : 'light'} />
          </React.Suspense>
        </CanvasErrorBoundary>
      </div>

      <div className="relative z-10 space-y-16 sm:space-y-24">

        {/* ------------------------------------------------------------------ */}
        {/* 1. HERO SECTION (VALUE PROPOSITION + LIVE EXPORT COCKPIT)          */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-6">
          <ArchitecturalBackground />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column (7 cols): Direct Value Proposition */}
            <div className="lg:col-span-7 space-y-6">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('জাতীয় রপ্তানি বাণিজ্য প্ল্যাটফর্ম | AIBC 2026 সাবমিশন', 'National Export Intelligence Platform | AIBC 2026 Submission')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2] font-bangla">
                {t(
                  'কারখানা থেকে সরাসরি বিশ্ববাজারে রপ্তানি',
                  'Export Directly from Factory to Global Markets'
                )}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bangla max-w-2xl">
                {t(
                  'সাভার, গাজীপুর ও চট্টগ্রামের কারখানাগুলোর জন্য মধ্যস্বত্বভোগী ছাড়া সরাসরি আন্তর্জাতিক বায়ারদের সাথে ডিল করার সার্বভৌম প্ল্যাটফর্ম। HS কোড যাচাই, ইউরো সিবিএএম কার্বন হিসাব এবং ব্যাংক-রেডি রপ্তানি চুক্তি প্রস্তুত করুন সহজে।',
                  'ExportPilot AI helps manufacturers in Savar, Gazipur, Bogura, and Chattogram conduct sovereign cross-border trade without intermediary buying houses. Execute HS code classification, European CBAM carbon audits, and generate bank-ready proforma invoices in seconds.'
                )}
              </p>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={user ? "/dealroom" : "/login?redirect=/dealroom"}
                  className="btn-primary text-xs sm:text-sm py-3 px-6 shadow-md flex items-center gap-2 font-bangla"
                >
                  <span>{user ? t('ডিল রুমে প্রবেশ করুন', 'Open Deal Room') : t('ডিল রুম চালু করুন', 'Launch Deal Room')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Direct Video CTA that smooth-scrolls and autoplays */}
                <button
                  type="button"
                  onClick={handleWatchVideoClick}
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-sm cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span className="font-bangla">{t('ভিডিওতে দেখুন (৩ মিনিট)', 'Watch Video Demo (3 min)')}</span>
                </button>

                <VoiceGuideButton trackKey="landing_hero" />
              </div>

              {/* Verified Trust Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-bangla text-[11px] font-medium">
                    {t('১০০% ক্লায়েন্ট-সাইড প্রাইভেসি', '100% Client-Side Privacy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-bangla text-[11px] font-medium">
                    {t('বাংলাদেশ ব্যাংক রেডি ফরম্যাট', 'Bangladesh Bank Format')}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-bangla text-[11px] font-medium">
                    {t('শূন্য মিডলম্যান কমিশন', 'Zero Broker Commissions')}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Live Export Deal Cockpit (Balanced Height) */}
            <div className="lg:col-span-5 w-full">
              <div className="card-institutional space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-bangla">
                      {t('লাইভ এক্সপোর্ট ডিল ডেমো', 'Live Export Deal Cockpit')}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {t('প্রস্তুত ডিল', 'Ready Deal')}
                  </span>
                </div>

                {/* 4 Sector Selection Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {presets.map((p) => {
                    const isActive = p.id === selectedHeroPreset;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedHeroPreset(p.id)}
                        className={`py-1.5 px-1 rounded text-[11px] font-semibold transition-all truncate text-center cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.id === 'preset_jute_bag' && t('পাট', 'Jute')}
                        {p.id === 'preset_denim_jacket' && t('ডেনিম', 'Denim')}
                        {p.id === 'preset_leather_boot' && t('লেদার', 'Leather')}
                        {p.id === 'preset_terracotta' && t('সিরামিক', 'Craft')}
                      </button>
                    );
                  })}
                </div>

                {/* Active Deal Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentHeroItem.img}
                      alt={currentHeroItem.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">
                        {currentHeroItem.sector}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate font-bangla">
                        {currentHeroItem.title}
                      </h3>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        HS {currentHeroItem.hs}
                      </div>
                    </div>
                  </div>

                  {/* Pricing, Margin and Corridor Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[11px] font-bangla">{t('নমুনা FOB দর:', 'FOB price:')}</span>
                      <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {currentHeroItem.fob} USD / pc
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[11px] font-bangla">{t('কারখানার মার্জিন লাভ:', 'Factory margin:')}</span>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {currentHeroItem.margin}
                      </div>
                    </div>
                  </div>

                  {/* Destination & Carbon */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-bangla">
                      <span>{t('গন্তব্য বন্দর:', 'Destination:')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{currentHeroItem.corridorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-bangla">
                      <span>{t('সিবিএএম কার্বন স্কোর:', 'CBAM Carbon Score:')}</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{currentHeroItem.co2}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchPreset(currentHeroItem.id)}
                  className="w-full btn-primary text-xs py-3 justify-center flex items-center shadow-sm font-bangla cursor-pointer"
                >
                  <span>{t('এই পণ্যটি দিয়ে ডিল টেস্ট করুন', 'Test This Deal in Deal Room')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Live Trade Ticker */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TradeTicker />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. ACTIONABLE TRADE LOGISTICS & TARIFF RADAR (#corridor)           */}
        {/* Replaces the ineffective 3D globe with real maritime schedules     */}
        {/* ------------------------------------------------------------------ */}
        <section id="corridor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <TradeLogisticsRadar />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 3. DEDICATED OFFICIAL VIDEO SHOWCASE (#platform-video)             */}
        {/* ------------------------------------------------------------------ */}
        <section id="platform-video" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Play className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
              <span>{t('ভিডিও উপস্থাপনা (৩ মিনিট)', 'Video Presentation (3 min)')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
              {t('ExportPilot AI কীভাবে কাজ করে', 'How ExportPilot AI Works')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bangla leading-relaxed">
              {t(
                'সাভার ও গাজীপুরের কারখানা থেকে সরাসরি এফওবি রপ্তানি, শুল্ক সুবিধা ও প্ল্যাটফর্মের মূল কার্যপ্রণালী ৩ মিনিটে দেখুন।',
                'Watch a 3-minute overview of direct FOB exports, tariff advantages, and core platform operations.'
              )}
            </p>
          </div>

          {/* Clean 16:9 Video Player Chassis */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl overflow-hidden aspect-video w-full relative">
            {isVideoPlaying ? (
              <iframe
                src="https://www.youtube-nocookie.com/embed/fHR5ZNmKrxU?autoplay=1&rel=0"
                title="ExportPilot AI Platform Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsVideoPlaying(true)}
                className="group relative w-full h-full cursor-pointer flex items-center justify-center overflow-hidden focus:outline-none"
                aria-label="Play ExportPilot AI Demo Video"
              >
                {/* Clean YouTube Video Poster */}
                <img
                  src="https://img.youtube.com/vi/fHR5ZNmKrxU/maxresdefault.jpg"
                  alt="ExportPilot AI Platform Demo Video"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle dark backdrop for high contrast */}
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />

                {/* Centered Red YouTube-style Play Button */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:bg-red-700 group-hover:scale-110 transition-all duration-200">
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1 text-white" />
                </div>
              </button>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 4. THREE-STEP WORKFLOW (#how-it-works)                             */}
        {/* ------------------------------------------------------------------ */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span>{t('সরল প্রক্রিয়া', 'Simple Workflow')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
              {t('৩টি সহজ ধাপে কারখানা থেকে সরাসরি আন্তর্জাতিক রপ্তানি', 'Direct International Export in 3 Simple Steps')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bangla">
              {t(
                'কোনো মধ্যস্থতাকারী বায়িং হাউস ছাড়াই কারখানা থেকেই সম্পন্ন করুন সম্পূর্ণ আন্তর্জাতিক এক্সপোর্ট প্রসেস।',
                'Prepare key export details and work directly with potential global buyers without intermediary friction.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <UploadCloud className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('ইনপুট পর্যায়', 'Input Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('ছবি তুলুন বা মুখে বলুন', 'Upload Photo or Speak in Bangla')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'মোবাইলে পণ্যের ছবি তুলুন অথবা বাংলায় পণ্যের বিবরণ বলুন। এআই স্বয়ংক্রিয়ভাবে স্পেসিফিকেশন গুছিয়ে নেয়।',
                  'Upload a product photo or describe it in spoken Bangla. The AI structures technical specifications automatically.'
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <Globe className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('বিশ্লেষণ পর্যায়', 'Analysis Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('সম্ভাব্য বাজার ও শুল্কের তথ্য পর্যালোচনা', 'Review Potential Markets & Tariffs')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'প্রাথমিক HS কোড, ইউরোপিয়ান সিবিএএম কার্বন রেফারেন্স ও শুল্কমুক্ত সুবিধা দেখুন এবং বায়ার চাহিদার সাথে মেলান।',
                  'Review suggested HS codes, European CBAM carbon thresholds, and duty-free benefits across target destinations.'
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('চুক্তি পর্যায়', 'Contract Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('প্রফরমা ইনভয়েস ও চুক্তি প্রস্তুত', 'Download Proforma Invoice & L/C Draft')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'বাংলাদেশ ব্যাংকের নগদ সহায়তা যাচাইকৃত ব্যাংক-রেডি প্রফর্মা ইনভয়েস ও এল/সি শর্তাবলী প্রস্তুত করুন।',
                  'Generate compliant proforma invoices with Bangladesh Bank export incentive verification and irrevocable L/C terms.'
                )}
              </p>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 5. DIRECT EXPORT MARGIN ESTIMATOR (#calculator)                    */}
        {/* ------------------------------------------------------------------ */}
        <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="card-institutional space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla">
                    {t('সরাসরি রপ্তানি লাভ ক্যালকুলেটর', 'Direct Export Profit Estimator')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla">
                  {t(
                    'চালানের পরিমাণ ও উৎপাদন খরচ দিয়ে সম্ভাব্য বাড়তি আয় হিসাব করুন।',
                    'Estimate additional earnings recovered by bypassing middleman buying houses.'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <VoiceGuideButton trackKey="calculator" />
                <div className="text-left sm:text-right p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-800 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                    {t('চালানপ্রতি সম্ভাব্য বাড়তি আয়', 'Estimated Gain Per Shipment')}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                    +${directGainUsd.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-emerald-800 dark:text-slate-300 font-bangla font-semibold">
                    (+{directGainLakhBdt} {t('লাখ টাকা বাড়তি মার্জিন', 'Lakh BDT recovered')})
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Volume Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500 font-bangla mr-1">{t('দ্রুত পরিমাণ নির্বাচন:', 'Quick volume select:')}</span>
              {[5000, 10000, 25000, 50000].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setUnits(vol)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    units === vol
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {vol.toLocaleString()} {t('পিস', 'pcs')}
                </button>
              ))}
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="font-bangla">{t('চালানের পরিমাণ (পিস)', 'Shipment Volume (Units)')}</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">{(units || 0).toLocaleString()} pcs</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-950 rounded-lg"
                  aria-label="Shipment Volume Slider"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="font-bangla">{t('ইউনিট প্রতি উৎপাদন খরচ (টাকা)', 'Factory Unit Cost (BDT)')}</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400 tabular-nums">{unitCost} BDT</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="25"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-950 rounded-lg"
                  aria-label="Production Cost Slider"
                />
              </div>
            </div>

            {/* Comparative Economics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-bangla">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span>{t('লোকাল বায়িং হাউস মার্জিন: ৮%', 'Buying House Margin: ~8%')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>{t('সরাসরি আন্তর্জাতিক FOB: ৩০%', 'Direct International FOB: ~30%')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{t('কারখানার বাড়তি মার্জিন: +২২% সরাসরি সাশ্রয়', 'Factory Gain: +22% recovered margin')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 font-bangla">
                {t('এই ক্যালকুলেটরটি নমুনা হিসাব দেখায়। প্রকৃত লাভ পণ্যের খরচ, দর, চালান ও চুক্তির শর্ত অনুযায়ী নির্ধারিত হবে।', 'Illustrative estimate only. Actual returns depend on factory production cost, final FOB price, and contract terms.')}
              </p>
              <button
                type="button"
                onClick={handleLaunchCalculator}
                className="btn-primary text-xs py-2.5 px-5 shrink-0 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center font-bangla cursor-pointer"
              >
                <span>{t('এই মার্জিন দিয়ে ডিল রুম চালু করুন', 'Launch Deal Room with This Margin')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 6. FLAGSHIP NATIONAL SECTORS (#sectors)                            */}
        {/* ------------------------------------------------------------------ */}
        <section id="sectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span>{t('শীর্ষ পণ্যসমূহ', 'Top Export Products')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
                {t('বাংলাদেশের ৪টি শীর্ষ জাতীয় রপ্তানি পণ্য', 'Bangladesh 4 National Flagship Export Sectors')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla max-w-2xl">
                {t(
                  'পাট, তৈরি পোশাক, চামড়া ও সিরামিকসহ বাংলাদেশের মূল রপ্তানি খাতের পণ্যের বিবরণ এক জায়গায় গুছিয়ে নিন। গন্তব্য অনুযায়ী শুল্ক ও কমপ্লায়েন্সের শর্ত যাচাই করুন।',
                  'Organize product details for key Bangladesh export sectors, including jute, garments, leather, and ceramics. Review tariff eligibility and compliance requirements for each destination.'
                )}
              </p>
            </div>

            <Link
              to="/buyers"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 font-bangla"
            >
              <span>{t('সম্পূর্ণ বায়ার ডিরেক্টরি দেখুন', 'Browse Full Buyer Directory')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Sector Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {presets.map((p) => (
              <div
                key={p.id}
                className="card-institutional card-institutional-hover flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={p.img}
                      alt={p.title}
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold shadow-sm">
                      {p.fob} FOB
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-500">{p.sector}</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bangla leading-snug">
                      {p.title}
                    </h3>
                    <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      HS {p.hs}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center gap-2">
                      <span className="shrink-0">{t('প্রধান বাজার:', 'Target Markets:')}</span>
                      <span className="text-slate-800 dark:text-slate-300 font-medium truncate text-right">{p.markets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('কার্বন স্কোর:', 'Carbon Footprint:')}</span>
                      <span className="text-slate-800 dark:text-slate-300 font-mono">{p.co2}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('মার্জিন লাভ:', 'Margin Gain:')}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{p.margin}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchPreset(p.id)}
                  className="w-full btn-secondary text-xs py-2.5 justify-center font-bangla shadow-sm cursor-pointer"
                >
                  {t('ডিল রুমে লোড করুন', 'Open in Deal Room')}
                </button>
              </div>
            ))}
          </div>

        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 7. SOVEREIGN SECURITY & COMPLIANCE ARCHITECTURE (#security-proof)  */}
        {/* ------------------------------------------------------------------ */}
        <section id="security-proof" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla">
                    {t('সার্বভৌম ডাটা সুরক্ষা ও ব্যাংক-কমপ্লায়েন্স নিশ্চয়তা', 'Sovereign Data Security & Regulatory Compliance Guarantee')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla">
                  {t('বাংলাদেশের কারখানার বাণিজ্য গোপনীয়তা রক্ষা ও আন্তর্জাতিক নিয়মনীতি পরিপালনের সার্বিক কাঠামো।', 'Enterprise privacy architecture protecting factory secrets, national banking circular compliance, and EU CBAM standards.')}
                </p>
              </div>

              <Link
                to="/security"
                className="btn-secondary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5 font-bangla"
              >
                <span>{t('সিকিউরিটি ল্যাব টেস্ট করুন', 'Explore Security Lab')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-bangla">
                  {t('ক্লায়েন্ট-সাইড PII ফিল্টারিং', 'Client-Side PII Masking')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bangla">
                  {t('ব্রাউজারেই জাতীয় পরিচয়পত্র (NID), টিআইএন এবং মোবাইল নম্বর আড়াল করা হয়। কোনো ক্লাউড এলএলএম-এ সংবেদনশীল তথ্য পৌঁছায় না।', 'Bangla NID, TIN, and factory phone numbers are masked client-side before trade advisory calls. No private factory data leaves the browser.')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-bangla">
                  {t('বাংলাদেশ ব্যাংক নগদ সহায়তা সার্কুলার', 'Bangladesh Bank Circular Validation')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bangla">
                  {t('রপ্তানি চালানের এইচএস কোড অনুযায়ী এফই সার্কুলার মোতাবেক প্রাপ্য প্রণোদনা (৪% থেকে ২০%) স্বয়ংক্রিয়ভাবে অডিট নথিতে অন্তর্ভুক্ত হয়।', 'Official FE circular incentive rates (4% to 20%) are validated automatically against export HS codes for bank submission.')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-bangla">
                  {t('ইউরোপীয় ইউনিয়ন CBAM কার্বন অডিট', 'European Union CBAM Ready')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bangla">
                  {t('পল্লী বিদ্যুৎ বা কারখানার ইউটিলিটি বিল থেকে স্বয়ংক্রিয়ভাবে কার্বন হিসাব করে ইউরোপীয় বায়ারদের জন্য কমপ্লায়েন্স সার্টিফিকেট ড্রাফট তৈরি হয়।', 'Automated Scope 1 & 2 carbon calculation from factory utility bills to satisfy European Carbon Border Adjustment Mechanism (CBAM) rules.')}
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 8. EXPORT FAQ SECTION (#export-faq)                                */}
        {/* ------------------------------------------------------------------ */}
        <section id="export-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <header className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-bangla">
              {t('রপ্তানি প্রস্তুতি নিয়ে সাধারণ প্রশ্ন', 'Export preparation questions')}
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 font-bangla">
              {t('শুল্ক, উৎপত্তির নিয়ম ও কমপ্লায়েন্স চালানের আগে সংশ্লিষ্ট কর্তৃপক্ষ ও বায়ারের সঙ্গে যাচাই করুন।', 'Confirm tariffs, origin rules, and compliance requirements with the relevant authorities and buyer before shipment.')}
            </p>
          </header>
          
          {/* Accessible React Accordion */}
          <div className="space-y-3">
            {seoConfig.homeFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.questionEn}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 font-bangla">
                      {t(faq.questionBn, faq.questionEn)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-bangla">
                        {t(faq.answerBn, faq.answerEn)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium font-bangla">
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/savar">{t('সাভার', 'Savar')}</Link>
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/gazipur">{t('গাজীপুর', 'Gazipur')}</Link>
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/bogura">{t('বগুড়া', 'Bogura')}</Link>
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/chattogram">{t('চট্টগ্রাম', 'Chattogram')}</Link>
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/features/hs-classification">{t('HS কোড গবেষণা', 'HS code research')}</Link>
            <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/features/export-documents">{t('রপ্তানি কাগজপত্র', 'Export documents')}</Link>
          </div>
        </section>

      </div>
    </div>
  );
};
