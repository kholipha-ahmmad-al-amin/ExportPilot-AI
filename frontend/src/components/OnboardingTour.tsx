import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, X, Check, Compass, HelpCircle } from 'lucide-react';

export interface TourStep {
  targetSelector: string;
  workspaceStep?: 1 | 2 | 3 | 4 | 5;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  badgeBn: string;
  badgeEn: string;
}

export const WORKSPACE_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="workspace-header"]',
    workspaceStep: 1,
    titleBn: 'সার্বভৌম ওয়ার্কস্পেস পরিচিতি',
    titleEn: 'Sovereign Workspace Identity',
    descriptionBn: 'এখানে আপনার কারখানার নিবন্ধিত পরিচিতি, বর্তমান সক্রিয় ব্যবহারকারী ভূমিকা এবং সরাসরি ৪টি প্রি-কনফিগার করা এক্সপোর্ট পণ্যের মধ্যে দ্রুত পরিবর্তনের সুবিধা রয়েছে।',
    descriptionEn: 'View your verified factory identity, active user role, and rapidly switch between pre-configured export product catalogues.',
    badgeBn: 'সূচনা',
    badgeEn: 'Start'
  },
  {
    targetSelector: '[data-tour="stepper-bar"]',
    workspaceStep: 1,
    titleBn: '৫-ধাপবিশিষ্ট স্বায়ত্তশাসিত এক্সপোর্ট পাইপলাইন',
    titleEn: '5-Step Autonomous Export Pipeline',
    descriptionBn: 'পণ্য স্পেসিফিকেশন থেকে শুরু করে কথ্য বাংলা ভয়েস অডিও, স্কোপ ২ কার্বন অডিট, যাচাইকৃত আন্তর্জাতিক বায়ার এবং অফিসিয়াল চুক্তিপত্র তৈরি, পুরো রপ্তানি প্রক্রিয়া এই ৫টি ধাপে নিয়ন্ত্রিত।',
    descriptionEn: 'From product specifications to spoken voice briefing, Scope 2 carbon audit, verified global buyers, and official contracts, the pipeline is structured across 5 steps.',
    badgeBn: 'পাইপলাইন',
    badgeEn: 'Pipeline'
  },
  {
    targetSelector: '[data-tour="product-canvas"]',
    workspaceStep: 1,
    titleBn: 'পণ্য স্পেসিফিকেশন ও স্টুডিও লুক',
    titleEn: 'Product Spec & AI Studio Look',
    descriptionBn: 'কারখানার ছবি আপলোড বা নির্বাচন করুন। ডব্লিউসিও ট্যাক্সোনমি অনুযায়ী স্বয়ংক্রিয়ভাবে ৮-ডিজিট এইচএস কোড নির্ধারিত হবে এবং ব্যাকগ্রাউন্ড রিমুভ হয়ে আন্তর্জাতিক মানের স্টুডিও ছবি তৈরি হবে।',
    descriptionEn: 'Select or upload factory product photos. The system classifies 8-digit HS codes automatically via WCO taxonomy and cleans backdrops to studio standards.',
    badgeBn: 'ধাপ ১',
    badgeEn: 'Step 1'
  },
  {
    targetSelector: '[data-tour="voice-brief"]',
    workspaceStep: 2,
    titleBn: 'ভয়েস নির্দেশনা',
    titleEn: 'Voice Studio & Data Sovereignty',
    descriptionBn: 'কারখানার উৎপাদন ক্ষমতা ও লক্ষ্য কথ্য বাংলায় বলুন। কথাকে লেখায় রূপান্তরের পর পরিচিত পরিচয় ও কর নম্বর বাণিজ্য বিশ্লেষণের আগে আড়াল করা হয়।',
    descriptionEn: 'Speak about factory capacity in Bengali. Known identifiers are masked from the transcript before trade analysis.',
    badgeBn: 'ধাপ ২',
    badgeEn: 'Step 2'
  },
  {
    targetSelector: '[data-tour="direct-buyers"]',
    workspaceStep: 4,
    titleBn: 'যাচাইকৃত আন্তর্জাতিক বায়ার ও সরাসরি মার্জিন',
    titleEn: 'Verified Global Buyers & Margin Savings',
    descriptionBn: 'মধ্যস্বত্বভোগী বায়িং হাউসের ১৮ থেকে ২৫ শতাংশ কমিশন সাশ্রয় করে জার্মানি, ফ্রান্স, জাপান ও ইউকের ৫৪+ যাচাইকৃত বায়ারদের সাথে সরাসরি যুক্ত হয়ে এফওবি দর নির্ধারণ করুন।',
    descriptionEn: 'Bypass buying house broker fees of 18 to 25 percent and connect directly with 54+ verified buyers across Germany, France, Japan, and the UK.',
    badgeBn: 'ধাপ ৪',
    badgeEn: 'Step 4'
  },
  {
    targetSelector: '[data-tour="sovereign-advisor"]',
    workspaceStep: 5,
    titleBn: 'ট্রেড অ্যাডভাইজার ও অফিসিয়াল এক্সপোর্ট ডকুমেন্টস',
    titleEn: 'Trade Advisor & Official Export PDFs',
    descriptionBn: '১-ক্লিকে অফিশিয়াল এফওবি প্রফর্মা ইনভয়েস, ইইউ সিবিএএম কার্বন সার্টিফিকেট এবং বায়ার ক্যাটালগ ডাউনলোড করুন। এআই অ্যাডভাইজার থেকে সরাসরি কাউন্টার-অফার ড্রাফট কপি করুন।',
    descriptionEn: 'Download 1-click official FOB Proforma Invoices, EU CBAM Carbon Certificates, and Lookbooks. Copy verified counter-offer negotiation strategies directly.',
    badgeBn: 'ধাপ ৫',
    badgeEn: 'Step 5'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onNavigateStep
}) => {
  const { t } = useAuth();
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = WORKSPACE_TOUR_STEPS[currentTourIndex];

  // Update target rect on index or window resize/scroll
  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStepData) return;

    // If step change requested, trigger it
    if (currentStepData.workspaceStep && onNavigateStep) {
      onNavigateStep(currentStepData.workspaceStep);
    }

    // Small delay to allow react rendering of conditional step DOM
    setTimeout(() => {
      const el = document.querySelector(currentStepData.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    }, 150);
  }, [isOpen, currentStepData, onNavigateStep]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => {
        const el = document.querySelector(currentStepData.targetSelector);
        if (el) setTargetRect(el.getBoundingClientRect());
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, currentTourIndex, updatePosition, currentStepData.targetSelector]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentTourIndex < WORKSPACE_TOUR_STEPS.length - 1) {
          setCurrentTourIndex(prev => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentTourIndex > 0) {
          setCurrentTourIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentTourIndex, onClose]);

  if (!isOpen || !currentStepData) return null;

  const handleNext = () => {
    if (currentTourIndex < WORKSPACE_TOUR_STEPS.length - 1) {
      setCurrentTourIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentTourIndex > 0) {
      setCurrentTourIndex(prev => prev - 1);
    }
  };

  // Card Positioning
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
        maxWidth: '440px',
        width: '90vw'
      };
    }

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const cardHeightEst = 260;

    let top = targetRect.bottom + 16;
    if (spaceBelow < cardHeightEst && spaceAbove > cardHeightEst) {
      top = targetRect.top - cardHeightEst - 16;
    }

    // Horizontal centering relative to target
    let left = targetRect.left + (targetRect.width / 2) - 220;
    const padding = 16;
    if (left < padding) left = padding;
    if (left + 440 > window.innerWidth - padding) {
      left = window.innerWidth - 440 - padding;
    }

    return {
      position: 'fixed',
      top: Math.max(16, Math.min(top, window.innerHeight - cardHeightEst - 16)),
      left: Math.max(16, left),
      zIndex: 60,
      maxWidth: '440px',
      width: 'calc(100vw - 32px)'
    };
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto" role="dialog" aria-modal="true">
      {/* Dimmed Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_0_9999px_rgba(2,6,23,0.78)]"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            zIndex: 55,
          }}
        />
      )}

      {/* Interactive Tour Card */}
      <div
        style={getCardStyle()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 space-y-4 animate-scale-up"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono">
              {currentTourIndex + 1}
            </span>
            <span className="badge badge-em font-mono text-[10px]">
              {t(currentStepData.badgeBn, currentStepData.badgeEn)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentTourIndex + 1} / {WORKSPACE_TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('ট্যুর বন্ধ করুন', 'Close Tour')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Content */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t(currentStepData.titleBn, currentStepData.titleEn)}
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bangla">
            {t(currentStepData.descriptionBn, currentStepData.descriptionEn)}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {WORKSPACE_TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentTourIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentTourIndex
                    ? 'w-6 bg-emerald-400'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
                aria-label={`Go to tour step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentTourIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1 font-bangla"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t('পূর্ববর্তী', 'Back')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 font-bangla shadow-md shadow-emerald-500/20"
            >
              <span>
                {currentTourIndex === WORKSPACE_TOUR_STEPS.length - 1
                  ? t('সম্পন্ন করুন', 'Finish Tour')
                  : t('পরবর্তী', 'Next')}
              </span>
              {currentTourIndex === WORKSPACE_TOUR_STEPS.length - 1 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
