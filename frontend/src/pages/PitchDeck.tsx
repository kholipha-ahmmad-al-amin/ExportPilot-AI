import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Award, Download, TrendingUp, Users, Shield, Cpu, DollarSign } from 'lucide-react';

export const PitchDeck: React.FC = () => {
  const { t } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      number: '01 / 10',
      tagline: 'TITLE & VISION',
      title: 'ExportPilot AI (গ্লোবাল-ব্যাপারী)',
      subtitle: t(
        'মাত্র ১টি পণ্যের ছবি ও বাংলা ভয়েস থেকে ৬০ সেকেন্ডে আন্তর্জাতিক বায়ার, কমপ্লায়েন্স অডিট ও ডলারে এক্সপোর্ট ডিল!',
        'From 1 Product Photo & Bangla Voice to Verified Global Buyers, EU CBAM Compliance & Ready-to-Sign Export Deals in 60s.'
      ),
      bullets: [
        t('টার্গেটেড ট্র্যাক: International AI Builders Congress 2026 • Idea to Unicorn', 'Targeted Track: Idea to Unicorn 2026 • DIU Ashulia Campus'),
        t('সিলেক্টেড ডোমেইন: IndustrySphere AI (Domain 8) & CommerceSphere AI (Domain 9)', 'Domain: Industry 5.0 Manufacturing & Global Commerce'),
        t('স্পনসর ফোকাস: আনোয়ার গ্রুপ (আনোয়ার গ্যাভানাইজিং/ইন্ডাস্ট্রিয়াল এক্সপোর্ট)', 'Sponsor Alignment: Anwar Group (Industrial Conglomerate)')
      ],
      highlight: t('ভিশন: বাংলাদেশের প্রতিটি এসএমই কারখানাকে সরাসরি বিশ্ববাজারে পৌঁছে দেওয়া।', 'Vision: Direct global market access for every Bangladeshi SME.')
    },
    {
      number: '02 / 10',
      tagline: 'THE REALITY & PROBLEM',
      title: t('জাতীয় সংকট: মধ্যস্বত্বভোগীদের ৩২%-৪০% মার্জিন লোপাট', 'The Crisis: 32%-40% Middleman Margin Drain'),
      subtitle: t(
        'সাভার, গাজীপুর, বগুড়ার ৫০,০০০+ ক্ষুদ্র ও মাঝারি কারখানা কঠোর পরিশ্রম করে কিন্তু লাভের সিংহভাগ দালাল নিয়ে যায়।',
        'Over 50,000 SME factories lose their hardest-earned margins to buying houses.'
      ),
      bullets: [
        t('একটি পাটের ব্যাগ বানাতে খরচ ১৮০ টাকা, দালাল কেনে ২০৫ টাকায় (+২৫ টাকা লাভ)।', 'Factory cost 180 BDT, middleman pays 205 BDT (barely 25 BDT profit).'),
        t('সেই একই ব্যাগ ইউরোপের বায়ারের কাছে দালাল বিক্রি করে ৪০৮ টাকায় ($৩.৪০ USD)!', 'Middleman sells the exact same bag in Europe for 408 BDT ($3.40 USD)!'),
        t('প্রতিটি চালানে কারখানা মালিক হারাচ্ছে ১৪,৪০০ ডলার (১৭.২৮ লাখ টাকা)।', 'Factory loses $14,400 USD (17.28 Lakh BDT) per shipment.')
      ],
      highlight: t('দালালরা তথ্য গোপন করে কারখানা মালিকদের নির্ভরশীল করে রাখে।', 'Middlemen exploit knowledge asymmetry to keep factories captive.')
    },
    {
      number: '03 / 10',
      tagline: 'ROOT CAUSE ANALYSIS',
      title: t('কেন সরাসরি এক্সপোর্ট করতে পারে না?', 'Why Can SMEs Not Export Directly?'),
      subtitle: t('কারখানা মালিকদের ২০-ফিল্ডের ইংরেজি সফটওয়্যার দিলে তারা ব্যবহার করবে না।', 'SME owners immediately abandon complex 20-field ERP software.'),
      bullets: [
        t('১. ৮-ডিজিট এইচএস কোড নির্ধারণের জটিলতা (কাস্টমস শুল্ক ভুল হলে জরিমানা)।', '1. 8-digit HS code classification complexity.'),
        t('২. ইউরোপীয় ইউনিয়নের নতুন CBAM কার্বন আইন ও ইএসজি কমপ্লায়েন্স ভীতি।', '2. EU CBAM embedded emissions and ESG reporting fear.'),
        t('৩. বিদেশি ভাষায় (ইংরেজি, জার্মান, জাপানি) বিশ্বাসযোগ্য কোটেশন লেখার লোকবল নেই।', '3. Language barrier communicating directly with overseas buyers.')
      ],
      highlight: t('সমাধান হতে হবে: ইউজারের জন্য জিরো প্যারা (Zero User Para)।', 'The solution must demand ZERO effort from the user.')
    },
    {
      number: '04 / 10',
      tagline: 'THE INNOVATIVE SOLUTION',
      title: t('ExportPilot AI: ১টি ছবি ও ভয়েস ইনটেক', 'The Solution: 1-Photo & Voice Intake'),
      subtitle: t(
        'ইউজার শুধু ১টি ছবি বা ভয়েস নোট ড্রপ করবেন, বাকি ১০০% কাজ করবে ৫টি এজেন্ট।',
        'User takes only 1 action. 5 specialized FastMCP agents do 100% of the heavy lifting.'
      ),
      bullets: [
        t('১. মেকানিকাল ছবির ব্যাকগ্রাউন্ড ক্লিন করে স্টুডিও ক্যাটালগ ও ৮-ডিজিট এইচএস কোড।', '1. Auto studio photo cleaning + 8-digit HS classification.'),
        t('২. GraphRAG দিয়ে ০% শুল্কমুক্ত দেশ ও ভেরিফায়েড বায়ারের তালিকা।', '2. GraphRAG multi-hop matching for 0% duty markets & buyers.'),
        t('৩. বিদ্যুৎ বিল PDF দিয়ে বিনা হার্ডওয়্যারে EU CBAM কার্বন অডিট সার্টিফিকেট।', '3. Zero-hardware Scope 2 carbon audit directly from utility bills.')
      ],
      highlight: t('মাত্র ৬০ সেকেন্ডে পুরো এক্সপোর্ট ডিল প্রস্তুত।', 'Ready-to-sign export deal room generated in 60 seconds.')
    },
    {
      number: '05 / 10',
      tagline: 'FLAGSHIP PRODUCT PRESETS',
      title: t('৪টি জাতীয় ফ্ল্যাগশিপ প্রোডাক্ট ভ্যালিডেশন', '4 Flagship National Presets Validated'),
      subtitle: t('বাংলাদেশের প্রধান চারটি রপ্তানি খাতের জন্য প্রি-কনফিগার করা ডেটাবেজ।', 'Pre-configured datasets representing key Bangladeshi export verticals.'),
      bullets: [
        t('১. সাভার গোল্ডেন জুট ব্যাগ (HS 4202.22.10) -> জার্মানি ও জাপান (০% EBA/DFQF শুল্ক)।', '1. Savar Eco-Jute Bag -> Germany & Japan (0% EBA Duty).'),
        t('২. গাজীপুর রিসাইকেলড ডেনিম (HS 6201.40.10) -> ইউকে ও সুইডেন (০% DCTS)।', '2. Gazipur Recycled Denim -> UK & Sweden (0% Tariff).'),
        t('৩. সাভার লেদার চেলসি বুট (HS 6403.91.60) -> ইতালি ও জাপান (২১.৬% শুল্ক ছাড়)।', '3. Savar Leather Boots -> Italy & Japan (saves 21.6% quota tariff).'),
        t('৪. বগুড়ার হস্তশিল্প টেরাকোটা সেট (HS 6912.00.20) -> দুবাই ও জার্মানি।', '4. Bogura Terracotta Tableware -> UAE & Germany.')
      ],
      highlight: t('প্রতিটি পণ্যের জন্য ভেরিফায়েড বায়ার ও কমপ্লায়েন্স পাথ ম্যাপিং সম্পন্ন।', 'Verified buyer and compliance mapping complete for all verticals.')
    },
    {
      number: '06 / 10',
      tagline: 'AGENTIC ARCHITECTURE',
      title: t('FastMCP ৫-এজেন্ট সমান্তরাল ইঞ্জিন', 'FastMCP 5-Agent Autonomous Core'),
      subtitle: t('মাইক্রোসেকেন্ড ল্যাটেন্সিতে সমান্তরাল এক্সিকিউশন ও রিয়েল-টাইম SSE স্ট্রিম।', 'Low-latency orchestration streaming live progress via Server-Sent Events.'),
      bullets: [
        t('Agent 1: Vision Studio & 8-Digit HS Code Classifier (98.4% Confidence).', 'Agent 1: Vision Studio & 8-Digit HS Code Classifier.'),
        t('Agent 2: GraphRAG Global Buyer & 0% Tariff Matcher (NetworkX).', 'Agent 2: GraphRAG Global Buyer & 0% Tariff Matcher.'),
        t('Agent 3: Zero-Hardware EU CBAM Carbon & Utility Bill Auditor.', 'Agent 3: Zero-Hardware EU CBAM Carbon & Utility Bill Auditor.'),
        t('Agent 4: Loss-Aversion FOB Pricer & Margin Calculator.', 'Agent 4: Loss-Aversion FOB Pricer & Margin Calculator.'),
        t('Agent 5: Multilingual Pitch (EN/DE/JP) & ReportLab PDF Exporter.', 'Agent 5: Multilingual Pitch & ReportLab PDF Exporter.')
      ],
      highlight: t('এজেন্টিক পাইপলাইন কোনো হ্যালুসিনেশন ছাড়াই ডেটাবেইজ থেকে সত্য তথ্য পরিবেশন করে।', 'Deterministic grounded execution with zero LLM hallucination.')
    },
    {
      number: '07 / 10',
      tagline: 'DATA SOVEREIGNTY & TECH STACK',
      title: t('১০০% ওপেন-সোর্স ও ডাটা সার্বভৌমত্ব', '100% Open-Source & Data Sovereignty'),
      subtitle: t('জিরো ভেন্ডর লক-ইন ও সম্পূর্ণ সার্বভৌম বাংলা পিআইআই ফিল্টার।', 'Zero vendor lock-in with on-premise PII redaction.'),
      bullets: [
        t('পিআইআই ফিল্টার: NID (১৭/১৩/১০ ডিজিট), TIN, BIN ও ফোন নম্বর লোকালি মাস্কড।', 'Local regex redacting NID, TIN, BIN, and BD mobile numbers.'),
        t('ওপেন-সোর্স ইঞ্জিন: PyMuPDF + pdfplumber + OpenCV + ReportLab + NetworkX।', '100% free open-source Python stack ($0.00 SaaS dependencies).'),
        t('ক্লাউড কস্ট: Azure Container Apps Scale-to-Zero (min-replicas 0) -> $0.00 আইডল কস্ট।', 'Azure Scale-to-Zero protects the $100 student credit for 365 days.')
      ],
      highlight: t('আন্তর্জাতিক ক্লাউডে কোনো গোপন কারখানা তথ্য উন্মুক্ত হয় না।', 'Sensitive factory financials never leave sovereign boundaries.')
    },
    {
      number: '08 / 10',
      tagline: 'BUSINESS & REVENUE MODEL',
      title: t('সাকসেস-বেসড ১% রেভিনিউ মডেল', '1% Success-Based Revenue Model'),
      subtitle: t('কারখানা মালিকের কোনো মাসিক সাবস্ক্রিপশন ফি বা অগ্রিম চার্জ নেই।', 'Zero upfront barrier. We only win when the factory earns dollars.'),
      bullets: [
        t('১% কনফার্মেশন ফি: বায়ারের সাথে এল/সি কনফার্ম হলেই কেবল ১% ফি প্রযোজ্য।', '1% FOB deal confirmation fee upon successful L/C issuance.'),
        t('ফ্যাক্টরি পায় অতিরিক্ত ৩৫% মার্জিন, তার মধ্যে ১% ExportPilot AI প্ল্যাটফর্ম ফি।', 'Factory gains +35% margin; 1% fee is a no-brainer value exchange.'),
        t('প্রিমিয়াম কমপ্লায়েন্স অডিট ও কাস্টমাইজড ESG সার্টিফিকেট আপসেল।', 'Enterprise ESG auditing & custom buyer verification upselling.')
      ],
      highlight: t('মাসিক সাবস্ক্রিপশন থাকলে বাংলাদেশের এসএমই ব্যবহার করবে না, সাকসেস ফিতে নিশ্চিত প্রবৃদ্ধি।', 'Outcome-aligned monetization guarantees rapid grassroots adoption.')
    },
    {
      number: '09 / 10',
      tagline: 'MARKET SIZE & NATIONAL IMPACT',
      title: t('টোটাল মার্কেট (TAM) ও বৈদেশিক মুদ্রা প্রবাহ', 'Total Market Size & National Impact'),
      subtitle: t('বাংলাদেশের $৫৫ বিলিয়ন এক্সপোর্ট ইকোনমির রূপান্তর।', 'Transforming Bangladesh into a high-margin sovereign export powerhouse.'),
      bullets: [
        t('TAM: বাংলাদেশের বার্ষিক রপ্তানি বাজার $৫৫+ বিলিয়ন ডলার (BGMEA + EPB)।', 'TAM: $55B+ annual export market of Bangladesh.'),
        t('SAM: নন-গার্মেন্টস ও এসএমই এক্সপোর্ট (পাট, চামড়া, সিরামিক, হস্তশিল্প) = $৮ বিলিয়ন।', 'SAM: Non-apparel & SME exports (jute, leather, ceramics) = $8B.'),
        t('SOM: প্রথম ৩ বছরে ৫০০ কারখানা অন্তর্ভুক্তকরণ = $৫০ মিলিয়ন ডিল ভলিউম।', 'SOM: 500 factories onboarded in 3 years = $50M deal volume.')
      ],
      highlight: t('জাতীয় অর্থনীতিতে বছরে অতিরিক্ত ১০০ মিলিয়ন ডলার রেমিট্যান্স যোগ হবে।', 'Infuses $100M+ in direct foreign exchange directly to factory owners.')
    },
    {
      number: '10 / 10',
      tagline: 'THE TEAM & ROAD TO UNICORN',
      title: t('৫ সদস্যের টিম ও ইউনিকর্ন রোডম্যাপ', 'The 5-Member Team & Unicorn Roadmap'),
      subtitle: t('ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬ এ বাধ্যতামূলক ৫টি টিম রোল।', '5 dedicated roles defined by the Congress participants guide.'),
      bullets: [
        '1. Team Leader / Coordinator (Vision & Congress Execution Roadmap)',
        '2. Business Analyst / Data Scientist (Loss-Aversion Economics & GraphRAG)',
        '3. UI/UX / Frontend Developer (Zero-Hassle Bangla & Web Speech Interface)',
        '4. Backend / Data Engineer (FastAPI, 5 MCP Agents, Open-Source Parsers)',
        '5. Presentation / Communication Lead (180s Pitch, YC Deck & Audit Readiness)'
      ],
      highlight: t('শনিবার, ২৬ ডিসেম্বর ২০২৬ • ড্যাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটি (DIU), আশুলিয়া।', 'DIU Congress Ashulia: Ready for Seed Capital & VC Connect!')
    }
  ];

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((c) => (c < slides.length - 1 ? c + 1 : c));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((c) => (c > 0 ? c - 1 : c));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Deck Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold text-white">
            {t('১০-স্লাইড ইনভেস্টর ডেক (Y-Combinator স্টাইল)', '10-Slide Investor Deck')}
          </h1>
          <span className="text-xs font-mono text-slate-400 ml-2">
            [Use &larr; / &rarr; keys to navigate]
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/v1/reports/download/enterprise_audit/deal_active"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('ডেক PDF ডাউনলোড', 'Download Deck PDF')}</span>
          </a>
        </div>
      </div>

      {/* Main Slide Card (16:9 aspect container) */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl min-h-[480px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Top Tag & Number */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
            {slide.tagline}
          </span>
          <span className="font-mono text-xs font-bold text-amber-400">
            {slide.number}
          </span>
        </div>

        {/* Slide Content */}
        <div className="space-y-4 my-auto py-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm sm:text-base text-emerald-300 font-medium font-bangla max-w-3xl leading-relaxed">
            {slide.subtitle}
          </p>

          <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300 font-bangla max-w-3xl">
            {slide.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Highlight Banner */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-amber-400 font-bangla">
            {slide.highlight}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            ExportPilot AI • DIU Ashulia 2026
          </div>
        </div>

      </div>

      {/* Slide Navigation Dots & Buttons */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setCurrentSlide((c) => (c > 0 ? c - 1 : c))}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('পূর্ববর্তী স্লাইড', 'Previous')}</span>
        </button>

        {/* Progress Dots */}
        <div className="flex items-center space-x-1.5" role="group" aria-label="Slide navigation">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={t(`স্লাইড ${idx + 1}-এ যান`, `Go to slide ${idx + 1}`)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((c) => (c < slides.length - 1 ? c + 1 : c))}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors"
        >
          <span>{t('পরবর্তী স্লাইড', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
