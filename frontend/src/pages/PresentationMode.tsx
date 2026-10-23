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
      title: t('জাতীয় সমস্যা ও দালালদের মার্জিন লোপাট', 'Problem: Middleman Margin Squeeze'),
      talking_points: [
        'বাংলাদেশে ৪,০০০+ গার্মেন্টস ও ৫০,০০০+ এসএমই কারখানা সাভার, গাজীপুর, বগুড়ায় বিস্তৃত।',
        '৮-ডিজিট এইচএস কোড ও ইইউ কার্বন আইন না বোঝার কারণে ৩২% থেকে ৪০% মুনাফা বায়িং হাউসের দালালেরা নিয়ে যায়।',
        'কারখানা মালিকদের ২০-ফিল্ডের ইংরেজি ইআরপি দিলে তারা ছুড়ে ফেলে দেয়।'
      ],
      quick_action: { label: t('লাভ ক্যালকুলেটর দেখুন', 'View Loss Aversion Meter'), link: '/' }
    },
    {
      time: '0:30 - 1:00',
      title: t('সমাধান: এক্সপোর্টপাইলট এআই (গ্লোবাল-ব্যাপারী)', 'Solution: ExportPilot AI Zero-Hassle'),
      talking_points: [
        'ইউজারের জন্য জিরো প্যারা: মাত্র ১টি পণ্যের ছবি অথবা ১০ সেকেন্ডের বাংলা ভয়েস।',
        'পণ্যের তথ্য থেকে বায়ারের জন্য দর ও নথি প্রস্তুত করতে সহায়তা করে।',
        '৬০ সেকেন্ডের মধ্যে ভেরিফায়েড বায়ার ও স্বাক্ষরযোগ্য ডলারে এক্সপোর্ট ডিল।'
      ],
      quick_action: { label: t('ডিল রুম দেখুন', 'Open Deal Room'), link: '/app' }
    },
    {
      time: '1:00 - 2:00',
      title: t('লাইভ কেস স্টাডি: সাভারের গোল্ডেন জুট ব্যাগ কেস', 'Case Study: Savar Golden Jute Bag'),
      talking_points: [
        'পণ্যের ছবি ও বিবরণ থেকে পণ্যের শ্রেণি ও এইচএস কোড সাজেস্ট করা হয়।',
        'বিদ্যুৎ বিল থেকে প্রতি ইউনিটে 0.31 kg CO2e নির্গমনের হিসাব দেখানো হয়।',
        'জার্মানির সম্ভাব্য ক্রেতা ও শুল্ক সুবিধার তথ্য দেখানো হয়।',
        'FOB প্রাইস $3.40 USD -> প্রতি চালানে অতিরিক্ত +$17,080 USD লাভ!'
      ],
      quick_action: { label: t('ট্রেড ডিল রুম খুলুন', 'Open Live Deal Room'), link: '/app?preset=preset_jute_bag' }
    },
    {
      time: '2:00 - 2:30',
      title: t('তথ্যের গোপনীয়তা ও ব্যবহার', 'Information privacy and use'),
      talking_points: [
        'বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত পরিচয় ও কর নম্বর আড়াল করা হয়। ভয়েস রেকর্ডিং আগে কথায় রূপান্তর করা হয়।',
        'কারখানার তথ্য রপ্তানি প্রস্তুতি ও বায়ারের সঙ্গে যোগাযোগে ব্যবহার করা হয়।',
        'ব্যবহারকারীর অ্যাকাউন্ট অনুযায়ী তথ্য দেখার অধিকার নির্ধারিত হয়।'
      ],
      quick_action: { label: t('রপ্তানি প্রক্রিয়া দেখুন', 'View the export process'), link: '/architecture' }
    },
    {
      time: '2:30 - 3:00',
      title: t('জাতীয় অর্থনৈতিক প্রভাব ও বিজনেস মডেল', 'National Impact & Commercial Model'),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Pitch Timer Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-700/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
            CONGRESS-DAY 180s PITCH MODE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('৩ মিনিটের বিচারক পিচ মোড (১৮০ সেকেন্ড)', '3-Minute Structured Pitch Mode')}
          </h1>
          <p className="text-xs text-slate-200 mt-1 font-bangla">
            {t(
              'ডিআইইউ স্টেজ প্রেজেন্টেশনের জন্য অফিসিয়াল গাইডলাইনের ৫টি সেগমেন্ট সময় অনুযায়ী অটোমেটিক হাইলাইট হয়।',
              'Timed structured pitch conforming to Section 9.2 of the International AI Builders Congress Guide.'
            )}
          </p>
        </div>

        {/* Stopwatch Display */}
        <div className="flex items-center space-x-4 bg-slate-900/90 p-4 rounded-xl border border-slate-700">
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
              className={`p-3 rounded-lg font-bold text-xs flex items-center justify-center transition-all shadow-sm ${
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
              className={`rounded-xl border p-5 transition-all shadow-sm ${
                isActive
                  ? 'bg-emerald-50/60 dark:bg-slate-900 border-2 border-emerald-600 shadow-md shadow-emerald-600/10'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                    isActive ? 'bg-emerald-600 text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {seg.time}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{seg.title}</h3>
                </div>

                <Link
                  to={seg.quick_action.link}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  <span>{seg.quick_action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                {seg.talking_points.map((pt, pidx) => (
                  <li key={pidx} className="flex items-start space-x-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
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
