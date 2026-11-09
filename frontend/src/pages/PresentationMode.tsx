import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Play, Pause, RotateCcw, ArrowRight} from 'lucide-react';

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
      title: t('সমস্যা: রপ্তানির কাজে তথ্য ও নিয়ম সামলানো', 'Problem: managing export information and requirements'),
      talking_points: [
        'রপ্তানির আগে পণ্য, উৎপাদন, বাজার ও চালানের তথ্য একসঙ্গে গুছিয়ে নিতে হয়।',
        'HS কোড, শুল্ক, উৎপত্তির নিয়ম ও ক্রেতার শর্ত পণ্য ও গন্তব্যভেদে বদলায়।',
        'অনেক কারখানার জন্য প্রয়োজনীয় তথ্য ও নথির খসড়া প্রস্তুত করা সময়সাপেক্ষ।'
      ],
      quick_action: { label: t('নমুনা হিসাব দেখুন', 'View the illustrative estimate'), link: '/#calculator' }
    },
    {
      time: '0:30 - 1:00',
      title: t('সমাধান: এক্সপোর্টপাইলট এআই', 'Solution: ExportPilot AI'),
      talking_points: [
        'পণ্যের ছবি, বিবরণ বা বাংলায় বলা তথ্য দিয়ে কাজ শুরু করুন।',
        'পণ্য, বাজার-রেফারেন্স, আনুমানিক হিসাব ও নথির খসড়া এক জায়গায় রাখুন।',
        'তথ্য যাচাই ও বায়ারের সঙ্গে যোগাযোগ প্ল্যাটফর্মের বাইরে সম্পন্ন করুন।'
      ],
      quick_action: { label: t('ডিল রুম দেখুন', 'Open Deal Room'), link: '/app' }
    },
    {
      time: '1:00 - 2:00',
      title: t('নমুনা কাজ: পাটের ব্যাগের রপ্তানি প্রস্তুতি', 'Example: preparing a jute bag export'),
      talking_points: [
        'পণ্যের ছবি ও বিবরণ থেকে প্রাথমিক শ্রেণিবিন্যাস পরামর্শ দেখুন।',
        'বিদ্যুৎ বিল ও উৎপাদনের পরিমাণ দিলে আনুমানিক নির্গমন হিসাব দেখুন।',
        'নমুনা বাজার-প্রোফাইল ও শুল্ক-রেফারেন্স পর্যালোচনা করুন।',
        'প্রফর্মা ইনভয়েস ও বায়ার বার্তার খসড়া তৈরি করে সব তথ্য যাচাই করুন।'
      ],
      quick_action: { label: t('ট্রেড ডিল রুম খুলুন', 'Open Live Deal Room'), link: '/app?preset=preset_jute_bag' }
    },
    {
      time: '2:00 - 2:30',
      title: t('তথ্যের গোপনীয়তা ও ব্যবহার', 'Information privacy and use'),
      talking_points: [
        'পরিচিত কিছু পরিচয় ও কর নম্বর বাণিজ্য পরামর্শের আগে আড়াল করা হয়।',
        'স্বয়ংক্রিয় শনাক্তকরণ সব ব্যক্তিগত তথ্য ধরতে পারে না; পাঠানোর আগে দেখে নিন।',
        'ভয়েস ব্যবহার করলে রেকর্ডিং কথায় রূপান্তরের জন্য বহিরাগত সেবায় পাঠানো হয়।'
      ],
      quick_action: { label: t('রপ্তানি প্রক্রিয়া দেখুন', 'View the export process'), link: '/architecture' }
    },
    {
      time: '2:30 - 3:00',
      title: t('সম্ভাব্য ব্যবহার ও বর্তমান সীমা', 'Potential use and current limits'),
      talking_points: [
        'ক্যালকুলেটরের ফল নমুনা অনুমানের ওপর নির্ভর করে, নিশ্চিত মুনাফা নয়।',
        'বর্তমান সংস্করণে ক্রেতার সঙ্গে সরাসরি যোগাযোগ, লেনদেন বা পেমেন্ট নেই।',
        'বাণিজ্যিক মূল্য নির্ধারণ ও বাজারে ফল যাচাই বাকি।'
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
            180-SECOND PRESENTATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('৩ মিনিটের বিচারক পিচ মোড (১৮০ সেকেন্ড)', '3-Minute Structured Pitch Mode')}
          </h1>
          <p className="text-xs text-slate-200 mt-1 font-bangla">
            {t(
              'তিন মিনিটের উপস্থাপনার জন্য বিষয়গুলো সময় অনুযায়ী সাজানো হয়েছে।',
              'A timed outline for a three-minute presentation.'
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

      {/* Pitch Video Embed */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              OFFICIAL 180s COMPETITION PITCH FILM
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla mt-0.5">
              {t('১৮০-সেকেন্ড প্ল্যাটফর্ম পিচ ভিডিও', '180-Second Platform Pitch Video')}
            </h2>
          </div>
          <a
            href="https://youtu.be/fHR5ZNmKrxU"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Watch on YouTube</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
          <iframe
            src="https://www.youtube-nocookie.com/embed/fHR5ZNmKrxU"
            title="ExportPilot AI 180s Pitch Video"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

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

      {/* Multi-disciplinary Pitch Team & Global Advisory Panel */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            AIBC 2026 CONGRESS SUBMISSION TEAM
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla mt-1">
            {t('বহুমুখী দলীয় কাঠামো ও বৈশ্বিক উপদেষ্টা মণ্ডলী', 'Multidisciplinary Core Team & Global Advisors')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
            {t(
              'আন্তর্জাতিক মানদণ্ড অনুযায়ী সফটওয়্যার আর্কিটেকচার, ডেটা সায়েন্স, ইউআই/ইউএক্স এবং আন্তর্জাতিক বাণিজ্য অর্থনীতিবিদদের সমন্বয়ে গঠিত দল।',
              'A multidisciplinary execution unit combining software engineering, NLP data science, accessible UX design, and trade economics.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Team Lead & Architect</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Kholipha Ahmmad Al-Amin</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              সিস্টেম আর্কিটেকচার, ফাস্টএমসিপি ৫-এজেন্ট পাইপলাইন এবং অ্যাজিউর ডেপ্লয়মেন্ট পরিচালনা।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Data Scientist & AI</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Jannatul Ferdous</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ডিপগ্রাম নোভা-৩ কথ্য বাংলা এসটিটি পাইপলাইন এবং এনএলপি চেইন-অব-থট মডেল টিউনিং।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Lead UI/UX Architect</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Khadija Akter</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ডব্লিউসিএজি ২.১ এএ স্ট্যান্ডার্ড, রেসপনসিভ ফ্যাক্টরি ডিজাইন এবং ফাস্ট লাইট মোড।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Backend & GraphRAG</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Abu Hurayra</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ফাস্টএপিআই ব্যাকএন্ড, নেটওয়ার্কএক্স নলেজ গ্রাফ এবং অফলাইন পিডিএফ পার্সার ইন্টিগ্রেশন।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trade Economics Lead</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Kazi Sabbir</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              পোস্ট-এলডিসি ২০২৬ ট্যারিফ রুলস, আইসিসি ইউসিপি ৬০০ ও বাংলাদেশ ব্যাংক সার্কুলার রিসার্চ।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white font-bangla">
              {t('গ্লোবাল টেকনিক্যাল অ্যাডভাইজরি সহযোগিতা (NRB Mentorship)', 'Global Technical Advisory Mentorship (NRB)')}
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] font-bangla mt-0.5">
              আইআইটি রুড়কি এবং ট্রিনিটি কলেজ ডাবলিনের প্রবাসী বাংলাদেশি গবেষকদের প্রযুক্তিগত পরামর্শে সিস্টেমের স্কেলেবিলিটি যাচাইকৃত।
            </p>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
            AIBC 2026 Compliant
          </span>
        </div>
      </section>

    </div>
  );
};
