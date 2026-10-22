import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, RotateCcw, Tv, ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, ExternalLink } from 'lucide-react';

export const PresentationMode: React.FC = () => {
  const { t } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Determine active segment based on seconds elapsed (180 - secondsLeft)
  const elapsed = 180 - secondsLeft;
  useEffect(() => {
    if (elapsed < 30) setActiveSegmentIndex(0);
    else if (elapsed < 60) setActiveSegmentIndex(1);
    else if (elapsed < 120) setActiveSegmentIndex(2);
    else if (elapsed < 150) setActiveSegmentIndex(3);
    else setActiveSegmentIndex(4);
  }, [elapsed]);

  const segments = [
    {
      time: '0:00 - 0:30',
      title: t('১. জাতীয় সমস্যা ও দালালদের মার্জিন লোপাট', '1. Problem: Middleman Margin Squeeze'),
      talking_points: [
        'বাংলাদেশে ৪,০০০+ গার্মেন্টস ও ৫০,০০০+ এসএমই কারখানা সাভার, গাজীপুর, বগুড়ায় বিস্তৃত।',
        '৮-ডিজিট এইচএস কোড ও ইইউ কার্বন আইন না বোঝার কারণে ৩২% থেকে ৪০% মুনাফা বায়িং হাউসের দালালেরা নিয়ে যায়।',
        'কারখানা মালিকদের ২০-ফিল্ডের ইংরেজি ইআরপি দিলে তারা ছুড়ে ফেলে দেয়।'
      ],
      quick_action: { label: t('লাভ ক্যালকুলেটর দেখুন', 'View Loss Aversion Meter'), link: '/' }
    },
    {
      time: '0:30 - 1:00',
      title: t('২. সমাধান: এক্সপোর্টপাইলট এআই (গ্লোবাল-ব্যাপারী)', '2. Solution: ExportPilot AI Zero-Hassle'),
      talking_points: [
        'ইউজারের জন্য জিরো প্যারা: মাত্র ১টি পণ্যের ছবি অথবা ১০ সেকেন্ডের বাংলা ভয়েস।',
        'ব্যাকগ্রাউন্ডে ৫টি FastMCP এজেন্ট সমান্তরালে সব টেকনিক্যাল জটিলতা সমাধান করে।',
        '৬০ সেকেন্ডের মধ্যে ভেরিফায়েড বায়ার ও স্বাক্ষরযোগ্য ডলারে এক্সপোর্ট ডিল।'
      ],
      quick_action: { label: t('ডিল রুম দেখুন', 'Open Deal Room'), link: '/app' }
    },
    {
      time: '1:00 - 2:00',
      title: t('৩. লাইভ কেস স্টাডি: সাভারের গোল্ডেন জুট ব্যাগ কেস', '3. Case Study: Savar Golden Jute Bag'),
      talking_points: [
        'ছবি ড্রপ -> OpenCV দিয়ে স্টুডিও কোয়ালিটি ইমেজ ও HS 4202.22.10 নির্ণয়।',
        'বিদ্যুৎ বিল PDF পার্স -> 0.31 kg CO2e/unit (EU CBAM Pass)।',
        'GraphRAG বায়ার ম্যাচ -> জার্মানির NordicEco GmbH (0% EBA Duty)।',
        'FOB প্রাইস $3.40 USD -> প্রতি চালানে অতিরিক্ত +$17,080 USD লাভ!'
      ],
      quick_action: { label: t('ট্রেড ডিল রুম খুলুন', 'Open Live Deal Room'), link: '/app?preset=preset_jute_bag' }
    },
    {
      time: '2:00 - 2:30',
      title: t('৪. আর্কিটেকচার, ওপেন-সোর্স স্ট্যাক ও সার্বভৌমত্ব', '4. Open-Source Stack & Sovereignty'),
      talking_points: [
        '১০০% ওপেন-সোর্স: PyMuPDF + pdfplumber + OpenCV + NetworkX + ReportLab।',
        'কোনো ক্লাউড বা এলএলএম-এ যাওয়ার আগে NID, TIN, BIN ও ফোন নম্বর লোকালি মাস্কড।',
        'Microsoft Azure Container Apps Scale-to-Zero দিয়ে $0.00 আইডল কস্ট।'
      ],
      quick_action: { label: t('আর্কিটেকচার ব্লুপ্রিন্ট', 'View System Blueprint'), link: '/architecture' }
    },
    {
      time: '2:30 - 3:00',
      title: t('৫. জাতীয় অর্থনৈতিক প্রভাব ও বিজনেস মডেল', '5. National Impact & Commercial Model'),
      talking_points: [
        'প্রতিটি সফল এক্সপোর্ট চালানে কারখানা পায় ১৮ থেকে ৭২ লাখ টাকা বাড়তি মুনাফা।',
        'বিজনেস মডেল: ১% সাকসেস-বেসড কনফার্মেশন ফি (জিরো সাবস্ক্রিপশন ফি)।',
        'বাংলাদেশের জন্য বছরে $১০০ মিলিয়ন+ অতিরিক্ত বৈদেশিক মুদ্রা রেমিট্যান্স।'
      ],
      quick_action: { label: t('ইনভেস্টর ডেক দেখুন', 'View Pitch Deck'), link: '/pitchdeck' }
    }
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Pitch Timer Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-700/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
            CONGRESS-DAY 180s PITCH MODE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('৩ মিনিটের বিচারক পিচ মোড (১৮০ সেকেন্ড)', '3-Minute Structured Pitch Mode')}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-bangla">
            {t(
              'ডিআইইউ স্টেজ প্রেজেন্টেশনের জন্য অফিসিয়াল গাইডলাইনের ৫টি সেগমেন্ট সময় অনুযায়ী অটোমেটিক হাইলাইট হয়।',
              'Timed structured pitch conforming to Section 9.2 of the International AI Builders Congress Guide.'
            )}
          </p>
        </div>

        {/* Stopwatch Display */}
        <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${secondsLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {formatTime(secondsLeft)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {isRunning ? 'RUNNING' : secondsLeft === 0 ? 'TIME UP' : 'PAUSED'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              aria-label={isRunning ? t('টাইমার থামান', 'Pause Pitch Timer') : t('টাইমার শুরু করুন', 'Start Pitch Timer')}
              className={`p-3 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={() => { setIsRunning(false); setSecondsLeft(180); }}
              aria-label={t('টাইমার রিসেট করুন', 'Reset Pitch Timer')}
              className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Structured Segments Timeline */}
      <div className="space-y-4">
        {segments.map((seg, idx) => {
          const isActive = activeSegmentIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border p-5 transition-all ${
                isActive
                  ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-950/40'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {seg.time}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">{seg.title}</h3>
                </div>

                <Link
                  to={seg.quick_action.link}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <span>{seg.quick_action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-bangla">
                {seg.talking_points.map((pt, pidx) => (
                  <li key={pidx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

    </div>
  );
};
