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
      tagline: 'THE CHALLENGE',
      title: t('মধ্যস্থতাকারীর ওপর নির্ভরতা', 'Reliance on intermediaries'),
      subtitle: t(
        'অনেক কারখানা বিদেশি বায়ারের সঙ্গে সরাসরি যোগাযোগ ও দর ঠিক করার সুযোগ পায় না।',
        'Many factories have limited access to direct buyer relationships and pricing discussions.'
      ),
      bullets: [
        t('কারখানা অনেক সময় বায়ারের চাহিদা ও বাজারদর জানতে পারে না।', 'Factories may have limited visibility into buyer requirements and market prices.'),
        t('বিদেশি ভাষায় দর ও পেমেন্ট শর্ত ঠিক করতে সহায়তা প্রয়োজন হয়।', 'Negotiating price and payment terms across languages can be difficult.'),
        t('রপ্তানির শুল্ক, নথি ও কমপ্লায়েন্সের নিয়মও বাজারভেদে বদলায়।', 'Tariff, document, and compliance requirements vary by market.')
      ],
      highlight: t('কারখানার হাতে বাজারের তথ্য ও দর আলোচনার সুযোগ থাকা দরকার।', 'Factories need access to market information and pricing discussions.')
    },
    {
      number: '03 / 10',
      tagline: 'EXPORT PREPARATION',
      title: t('সরাসরি রপ্তানির প্রস্তুতি', 'Preparing for direct export'),
      subtitle: t('পণ্যের শ্রেণি, বাজার, বায়ার ও চালানের শর্ত বুঝে সিদ্ধান্ত নিন।', 'Make informed decisions about product classification, markets, buyers, and shipment terms.'),
      bullets: [
        t('পণ্যের জন্য সঠিক এইচএস কোড ও শুল্ক তথ্য যাচাই করুন।', 'Check the tariff code and duty information for your product.'),
        t('বায়ারের কার্বন ও সনদের চাহিদা বুঝে নিন।', 'Understand buyer requirements for carbon information and certificates.'),
        t('বিদেশি বায়ারের জন্য দর, পেমেন্ট ও চালানের শর্ত সাজান।', 'Prepare prices, payment terms, and shipment terms for overseas buyers.')
      ],
      highlight: t('ধাপগুলো পরিষ্কার হলে রপ্তানির সিদ্ধান্ত নেওয়া সহজ হয়।', 'Clear steps make export decisions easier.')
    },
    {
      number: '04 / 10',
      tagline: 'A PRACTICAL WORKSPACE',
      title: t('রপ্তানির প্রস্তুতি এক জায়গায়', 'Export preparation in one place'),
      subtitle: t(
        'একটি পণ্যের ছবি বা সংক্ষিপ্ত ভয়েস বিবরণ দিয়ে কাজ শুরু করুন।',
        'Start with a product photo or a short spoken description.'
      ),
      bullets: [
        t('ছবি ও বিবরণ দিয়ে পণ্যের তথ্য সাজান।', 'Organize product details from a photo and description.'),
        t('সম্ভাব্য বায়ার ও বাজারের শর্ত দেখুন।', 'Review potential buyers and market requirements.'),
        t('বিদ্যুৎ বিল থেকে নির্গমনের হিসাব পর্যালোচনা করুন।', 'Review an emissions estimate from a utility bill.')
      ],
      highlight: t('দর, শর্ত ও নথি যাচাই করে বায়ারের সঙ্গে ভাগ করুন।', 'Review prices, terms, and documents before sharing them with a buyer.')
    },
    {
      number: '05 / 10',
      tagline: 'PRODUCT EXAMPLES',
      title: t('বাংলাদেশের রপ্তানি পণ্যের উদাহরণ', 'Examples of Bangladeshi export products'),
      subtitle: t('পণ্য ও গন্তব্য অনুযায়ী শুল্ক সুবিধা যাচাই করে নিন।', 'Check tariff information for each product and destination.'),
      bullets: [
        t('সাভারের পাটের ব্যাগ: জার্মানি ও জাপানের বাজারের তথ্য।', 'Savar jute bags: market information for Germany and Japan.'),
        t('গাজীপুরের ডেনিম: যুক্তরাজ্য ও সুইডেনের বাজারের তথ্য।', 'Gazipur denim: market information for the UK and Sweden.'),
        t('সাভারের চামড়ার জুতা: ইতালি ও জাপানের বাজারের তথ্য।', 'Savar leather footwear: market information for Italy and Japan.'),
        t('বগুড়ার টেরাকোটা: দুবাই ও জার্মানির বাজারের তথ্য।', 'Bogura terracotta: market information for Dubai and Germany.')
      ],
      highlight: t('চালানের আগে কোড, শুল্ক ও উৎপত্তির নিয়ম যাচাই করুন।', 'Confirm the tariff code, duty, and origin rules before shipment.')
    },
    {
      number: '06 / 10',
      tagline: 'EXPORT WORKFLOW',
      title: t('এক জায়গায় রপ্তানির প্রস্তুতি', 'Prepare an export deal in one place'),
      subtitle: t('পণ্যের তথ্য থেকে দর ও নথি পর্যন্ত, প্রতিটি কাজের ধাপ একসঙ্গে সাজানো।', 'Move from product details to pricing and documents in a clear sequence.'),
      bullets: [
        t('পণ্যের ছবি ও বিবরণ দিয়ে শুরু করুন।', 'Add a product photo and description.'),
        t('সম্ভাব্য বায়ার, বাজার ও শুল্ক সুবিধা পর্যালোচনা করুন।', 'Review buyers, markets, and potential tariff benefits.'),
        t('বিদ্যুৎ বিল থেকে কার্বন তথ্যের হিসাব দেখুন।', 'Review an emissions estimate from the electricity bill.'),
        t('এফওবি দর ও পেমেন্ট শর্ত ঠিক করুন।', 'Set the FOB price and payment terms.'),
        t('প্রফর্মা ইনভয়েস ও বায়ারের জন্য নথি তৈরি করুন।', 'Prepare a proforma invoice and buyer documents.')
      ],
      highlight: t('প্রতিটি প্রস্তাব পাঠানোর আগে যাচাই করে নিন।', 'Review every proposal before sharing it.')
    },
    {
      number: '07 / 10',
      tagline: 'PRIVACY & ACCESS',
      title: t('তথ্যের গোপনীয়তা ও অ্যাকাউন্ট সুরক্ষা', 'Information privacy and account access'),
      subtitle: t('বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত সংবেদনশীল নম্বর আড়াল করা হয়। ভয়েস রেকর্ডিং আগে কথায় রূপান্তর করা হয়।', 'Known sensitive numbers are masked before trade advice is requested. Voice recordings are sent for transcription first.'),
      bullets: [
        t('জাতীয় পরিচয়পত্র, কর নম্বর, ফোন ও ব্যাংক হিসাবের মতো তথ্য গোপন রাখুন।', 'Keep national IDs, tax details, phone numbers, and bank information private.'),
        t('কারখানার তথ্য কেবল প্রয়োজনীয় কাজে ব্যবহার করুন।', 'Use factory information only for the trade tasks it supports.'),
        t('আপনার অ্যাকাউন্টের প্রবেশাধিকার নিজে নিয়ন্ত্রণ করুন।', 'Manage who can access your account.')
      ],
      highlight: t('পাঠানোর আগে আপনার তথ্য নিজে দেখে নিন।', 'Review the information before sending it.')
    },
    {
      number: '08 / 10',
      tagline: 'BUSINESS & REVENUE MODEL',
      title: t('সাকসেস-বেসড ১% রেভিনিউ মডেল', '1% Success-Based Revenue Model'),
      subtitle: t('লেনদেনের ফি ও পেমেন্টের শর্ত ব্যবহারের আগে স্পষ্টভাবে জানানো হয়।', 'Transaction fees and payment terms should be clear before you use the service.'),
      bullets: [
        t('১% কনফার্মেশন ফি: বায়ারের সাথে এল/সি কনফার্ম হলেই কেবল ১% ফি প্রযোজ্য।', '1% FOB deal confirmation fee upon successful L/C issuance.'),
        t('ফ্যাক্টরি পায় অতিরিক্ত ৩৫% মার্জিন, তার মধ্যে ১% ExportPilot AI প্ল্যাটফর্ম ফি।', 'Factory gains +35% margin; 1% fee is a no-brainer value exchange.'),
        t('সেবার চার্জ ও প্রযোজ্য শর্ত আগে থেকে দেখে নিন।', 'Review any service charges and applicable terms in advance.')
      ],
      highlight: t('চালান নিশ্চিত করার আগে সব ফি ও পেমেন্টের শর্ত যাচাই করুন।', 'Check all fees and payment terms before confirming a shipment.')
    },
    {
      number: '09 / 10',
      tagline: 'BANGLADESH EXPORTS',
      title: t('বাংলাদেশের রপ্তানি বাজার', 'Bangladesh export markets'),
      subtitle: t('পাট, চামড়া, পোশাক, সিরামিক ও কৃষিপণ্যের জন্য আন্তর্জাতিক ক্রেতা খুঁজুন।', 'Find international buyers for jute, leather, garments, ceramics, and agricultural products.'),
      bullets: [
        t('পণ্যের গুণমান ও সময়মতো সরবরাহ আন্তর্জাতিক বাজারে গুরুত্বপূর্ণ।', 'Product quality and reliable delivery matter in global markets.'),
        t('সঠিক দর ও বায়ারের শর্ত জানা কারখানার সিদ্ধান্তে সহায়তা করে।', 'Clear pricing and buyer terms support better factory decisions.'),
        t('সরাসরি যোগাযোগ রপ্তানিকারক ও ক্রেতাকে কাছাকাছি আনে।', 'Direct communication brings exporters and buyers closer.')
      ],
      highlight: t('বাংলাদেশি কারখানার পণ্য সরাসরি বিশ্ববাজারে পৌঁছাক।', 'Help Bangladeshi factory products reach global buyers directly.')
    },
    {
      number: '10 / 10',
      tagline: 'FOR EXPORTERS',
      title: t('কারখানার রপ্তানি কাজে সহায়তা', 'Support for factory export work'),
      subtitle: t('পণ্যের তথ্য থেকে বায়ারের সঙ্গে চূড়ান্ত শর্ত পর্যন্ত কাজ গুছিয়ে নিন।', 'Organize the work from product details to final buyer terms.'),
      bullets: [
        t('পণ্যের তথ্য ও উৎপাদন সক্ষমতা যোগ করুন।', 'Add product details and production capacity.'),
        t('বায়ার, বাজার ও সম্ভাব্য শুল্ক সুবিধা পর্যালোচনা করুন।', 'Review buyers, markets, and potential tariff benefits.'),
        t('এফওবি দর ও পেমেন্ট শর্ত ঠিক করুন।', 'Set the FOB price and payment terms.'),
        t('প্রফর্মা ইনভয়েস ও রপ্তানি নথি প্রস্তুত করুন।', 'Prepare a proforma invoice and export documents.'),
        t('চালানের আগে সব তথ্য যাচাই করুন।', 'Check all details before shipment.')
      ],
      highlight: t('ব্যবসার শর্ত আপনার, সিদ্ধান্তও আপনার।', 'You set the business terms and make the final decision.')
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Deck Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('১০-স্লাইড ইনভেস্টর ডেক (Y-Combinator স্টাইল)', '10-Slide Investor Deck')}
          </h1>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
            [Use &larr; / &rarr; keys to navigate]
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/v1/reports/download/enterprise_audit/deal_active"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('ডেক PDF ডাউনলোড', 'Download Deck PDF')}</span>
          </a>
        </div>
      </div>

      {/* Main Slide Card (16:9 aspect container) */}
      <div className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-md dark:shadow-2xl min-h-[480px] flex flex-col justify-between relative overflow-hidden transition-colors">
        
        {/* Top Tag & Number */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 uppercase tracking-wider">
            {slide.tagline}
          </span>
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            {slide.number}
          </span>
        </div>

        {/* Slide Content */}
        <div className="space-y-4 my-auto py-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300 font-medium font-bangla max-w-3xl leading-relaxed">
            {slide.subtitle}
          </p>

          <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bangla max-w-3xl">
            {slide.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Highlight Banner */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-bangla">
            {slide.highlight}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ExportPilot AI • DIU Ashulia 2026
          </div>
        </div>

      </div>

      {/* Slide Navigation Dots & Buttons */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setCurrentSlide((c) => (c > 0 ? c - 1 : c))}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
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
                currentSlide === idx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((c) => (c < slides.length - 1 ? c + 1 : c))}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
        >
          <span>{t('পরবর্তী স্লাইড', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
