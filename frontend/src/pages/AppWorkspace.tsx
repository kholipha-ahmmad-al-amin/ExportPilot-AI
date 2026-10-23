import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Upload, Mic, CheckCircle2, Globe, Shield, FileText,
  TrendingUp, Download, Volume2, Eye, RefreshCw, Cpu,
  ChevronRight, ArrowRight, ArrowLeft, Bot, MessageSquare,
  Copy, Check, Send, StopCircle, AlertCircle, Building2,
  DollarSign, CheckSquare, Compass, Handshake
} from 'lucide-react';
import { OnboardingTour } from '../components/OnboardingTour';
import { LiveTradeFeed } from '../components/LiveTradeFeed';
import { UserPersonaGuide } from '../components/UserPersonaGuide';
import { DealNegotiationRoom } from '../components/DealNegotiationRoom';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Buyer {
  buyer_id: string;
  company_name: string;
  city: string;
  country: string;
  country_code: string;
  tariff_for_bangladesh_pct: number;
  tariff_for_competitors_pct: number;
  trade_scheme: string;
  typical_moq_units: number;
  target_fob_usd: number;
  annual_import_usd: number;
}

interface AdvisorResponse {
  reply: string;
  strategy_summary: string;
  suggested_counter_offer: string;
  risk_factors: string[];
  pii_redacted_count: number;
  model_used: string;
  latency_ms: number;
  sovereignty_protected: boolean;
}

interface DealPackage {
  preset_id: string;
  title_bn: string;
  title_en: string;
  sample_image: string;
  studio_image: string;
  sample_voice_bn: string;
  hs_code_8digit: string;
  hs_chapter_name: string;
  unit_cost_bdt: number;
  buying_house_offer_bdt: number;
  recommended_fob_price_usd: number;
  recommended_fob_price_bdt: number;
  monthly_capacity_units: number;
  middleman_margin_saved_pct: number;
  extra_profit_per_shipment_usd: number;
  cbam_scope2_co2_kg_per_unit: number;
  eu_benchmark_co2_kg_per_unit: number;
  compliance_readiness_score: number;
  required_certificates: string[];
  fob_unit_economics?: { direct_export_gain_usd_per_unit?: number };
  factory_location?: string;
  matched_buyers: Buyer[];
  graph_data?: { nodes: unknown[]; edges: unknown[]; total_nodes?: number; total_edges?: number };
  uploaded_doc_metrics?: Record<string, number | undefined>;
  pitch_templates?: { english: string; german: string; japanese: string; bangla_summary: string };
  pdf_downloads?: { proforma_invoice: string; cbam_certificate: string; buyer_catalog: string };
}

const PRESET_DEFAULTS: Record<string, { cost: number; capacity: number }> = {
  preset_jute_bag: { cost: 180, capacity: 10000 },
  preset_denim_jacket: { cost: 720, capacity: 5000 },
  preset_leather_boot: { cost: 1650, capacity: 2500 },
  preset_terracotta: { cost: 420, capacity: 8000 },
};

type StepNumber = 1 | 2 | 3 | 4 | 5;

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */
function Waveform() {
  return (
    <span className="flex items-end gap-[3px] h-5 px-0.5" aria-hidden>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="waveform-bar h-4"
          style={{ animationDelay: `${(i - 1) * 0.12}s` }}
        />
      ))}
    </span>
  );
}

function MeterBar({
  label,
  sublabel,
  pct,
  colorClass,
  textClass,
}: {
  label: string;
  sublabel: string;
  pct: number;
  colorClass: string;
  textClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className={`flex justify-between text-[11px] font-semibold ${textClass}`}>
        <span className="font-bangla">{label}</span>
        <span className="font-mono">{sublabel}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */
interface AppWorkspaceProps {
  defaultMode?: 'pipeline' | 'dealroom';
}

export const AppWorkspace: React.FC<AppWorkspaceProps> = ({ defaultMode }) => {
  const { user, lang, t } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = defaultMode || (searchParams.get('mode') === 'dealroom' ? 'dealroom' : 'pipeline');
  const [workspaceMode, setWorkspaceMode] = useState<'pipeline' | 'dealroom'>(initialMode);

  /* --- Stepper State --------------------------------------------- */
  const initialStep = (parseInt(searchParams.get('step') || '1', 10) as StepNumber) || 1;
  const [currentStep, setCurrentStep] = useState<StepNumber>(initialStep >= 1 && initialStep <= 5 ? initialStep : 1);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('exportpilot_workspace_tour_seen');
    if (!seen) {
      const timer = setTimeout(() => setIsTourOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('exportpilot_workspace_tour_seen', 'true');
  };

  const handleOpenTour = () => {
    setIsTourOpen(true);
  };

  /* --- Workspace State ------------------------------------------- */
  const [activePreset, setActivePreset] = useState<string>(
    searchParams.get('preset') || 'preset_jute_bag'
  );
  const [deal, setDeal] = useState<DealPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineError, setPipelineError] = useState('');
  const [pipelineProgress, setPipelineProgress] = useState('');
  const [dealRecordId, setDealRecordId] = useState<string | null>(null);

  // Exporter customizable parameters
  const initialInputs = PRESET_DEFAULTS[activePreset] || PRESET_DEFAULTS.preset_jute_bag;
  const [customCostBdt, setCustomCostBdt] = useState<number>(initialInputs.cost);
  const [customCapacity, setCustomCapacity] = useState<number>(initialInputs.capacity);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceConsent, setIsVoiceConsent] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceText, setVoiceText] = useState('');

  // Audio / TTS / Drag state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Trade advisor state
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<AdvisorResponse | null>(null);
  const [advisorError, setAdvisorError] = useState('');
  const [advisorCopied, setAdvisorCopied] = useState(false);

  /* --- Refs ------------------------------------------------------ */
  const fileInputRef       = useRef<HTMLInputElement>(null);
  const billInputRef       = useRef<HTMLInputElement>(null);
  const customCostRef      = useRef(customCostBdt);
  const customCapacityRef  = useRef(customCapacity);
  const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
  const audioChunksRef     = useRef<Blob[]>([]);
  const recordTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* --- Preset Catalogue ------------------------------------------ */
  const presets = [
    { id: 'preset_jute_bag',     titleBn: 'সাভার গোল্ডেন জুট ব্যাগ',      titleEn: 'Savar Golden Jute Bag',        hs: '4202.22.10', fob: '$3.40', cost: 180, cap: 10000 },
    { id: 'preset_denim_jacket', titleBn: 'গাজীপুর রিসাইকেলড ডেনিম',     titleEn: 'Gazipur Recycled Denim',       hs: '6201.40.10', fob: '$13.80', cost: 720, cap: 5000 },
    { id: 'preset_leather_boot', titleBn: 'সাভার লেদার চেলসি বুট',      titleEn: 'Leather Chelsea Boot',         hs: '6403.91.60', fob: '$24.50', cost: 1650, cap: 2500 },
    { id: 'preset_terracotta',   titleBn: 'বগুড়া হ্যান্ডমেড টেরাকোটা',   titleEn: 'Bogura Handmade Terracotta',   hs: '6912.00.20', fob: '$11.20', cost: 420, cap: 8000 },
  ];

  useEffect(() => { customCostRef.current = customCostBdt; }, [customCostBdt]);
  useEffect(() => { customCapacityRef.current = customCapacity; }, [customCapacity]);

  /* --- Load Deal -------------------------------------------------- */
  const loadDeal = useCallback(async (presetId: string, customVoice?: string, file?: File, forceAnalysis = false) => {
    setIsProcessing(true);
    setPipelineError('');
    try {
      if (!forceAnalysis && !customVoice && !file) {
        const saved = await fetch(`/api/v1/export/deals/latest?preset_id=${encodeURIComponent(presetId)}`);
        if (saved.ok) {
          const data = await saved.json();
          setDeal(data.deal_package);
          setDealRecordId(data.deal_record_id);
          setCustomCostBdt(data.deal_package.unit_cost_bdt || customCostRef.current);
          setCustomCapacity(data.deal_package.monthly_capacity_units || customCapacityRef.current);
          setPipelineProgress('');
          return;
        }
        if (saved.status !== 404) throw new Error('Could not load the saved product analysis.');
      }

      let data: any;
      if (file) {
        const fd = new FormData();
        fd.append('preset_id', presetId);
        if (customVoice) fd.append('voice_text_bn', customVoice);
        fd.append('unit_cost_bdt', String(customCostRef.current));
        fd.append('monthly_capacity_units', String(customCapacityRef.current));
        fd.append(file.type === 'application/pdf' ? 'pdf' : 'image', file);
        const res = await fetch('/api/v1/export/analyze', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Product analysis could not be completed.');
        data = await res.json();
        setDeal(data.deal_package);
        setDealRecordId(data.pipeline?.deal_record_id || null);
      } else {
        setPipelineProgress(t('বিশ্লেষণ শুরু হচ্ছে', 'Starting analysis'));
        const res = await fetch('/api/v1/mcp/run-pipeline-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
          body: JSON.stringify({
            preset_id: presetId,
            voice_text_bn: customVoice || '',
            deal_data: { unit_cost_bdt: customCostRef.current, monthly_capacity_units: customCapacityRef.current },
          }),
        });
        if (!res.ok || !res.body) throw new Error('The trade analysis service is unavailable.');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let pipelineResult: any = null;
        let recordId: string | null = null;
        const processEvent = (block: string) => {
          const eventName = block.match(/^event:\s*(.+)$/m)?.[1]?.trim();
          const payload = block.match(/^data:\s*(.+)$/m)?.[1];
          if (!eventName || !payload) return;
          const eventData = JSON.parse(payload);
          if (eventName === 'agent_started') {
            setPipelineProgress(eventData.summary || eventData.agent_name);
          } else if (eventName === 'pipeline_completed') {
            pipelineResult = eventData;
            setDeal(eventData.deal_package);
            setPipelineProgress(t('বিশ্লেষণ সংরক্ষণ হচ্ছে', 'Saving analysis'));
          } else if (eventName === 'persistence_complete') {
            recordId = eventData.deal_record_id;
            if (eventData.pdf_downloads) {
              setDeal((current) => current ? { ...current, pdf_downloads: eventData.pdf_downloads } : current);
            }
          } else if (eventName === 'error') {
            throw new Error(eventData.detail || 'Trade analysis failed.');
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() || '';
          blocks.forEach(processEvent);
          if (done) break;
        }
        if (!pipelineResult) throw new Error('The trade analysis ended before returning a result.');
        if (!recordId) throw new Error('The analysis ran, but could not be saved to your account.');
        setDealRecordId(recordId);
        setPipelineProgress(t('বিশ্লেষণ সম্পন্ন', 'Analysis complete'));
      }

      if (data?.deal_package?.unit_cost_bdt) setCustomCostBdt(data.deal_package.unit_cost_bdt);
      if (data?.deal_package?.monthly_capacity_units) setCustomCapacity(data.deal_package.monthly_capacity_units);
    } catch (err) {
      setPipelineError(err instanceof Error ? err.message : t('বিশ্লেষণ সম্পন্ন করা যায়নি।', 'Analysis could not be completed.'));
    } finally {
      setIsProcessing(false);
    }
  }, [t]);

  useEffect(() => {
    loadDeal(activePreset);
  }, [activePreset, loadDeal]);

  useEffect(() => {
    const urlPreset = searchParams.get('preset');
    if (urlPreset && urlPreset !== activePreset) {
      setActivePreset(urlPreset);
    }
  }, [searchParams, activePreset]);

  // Sync step with URL
  const setStep = (s: StepNumber) => {
    setCurrentStep(s);
    setSearchParams({
      preset: activePreset,
      step: s.toString(),
      ...(workspaceMode === 'dealroom' ? { mode: 'dealroom' } : {})
    });
  };

  const handlePresetSelect = (pId: string) => {
    setActivePreset(pId);
    const defaults = PRESET_DEFAULTS[pId];
    if (defaults) {
      setCustomCostBdt(defaults.cost);
      setCustomCapacity(defaults.capacity);
    }
    setSearchParams({
      preset: pId,
      step: currentStep.toString(),
      ...(workspaceMode === 'dealroom' ? { mode: 'dealroom' } : {})
    });
  };

  /* --- Voice Input Handling --------------------------------------- */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecording(false);
  }, []);

  const handleToggleVoice = async () => {
    if (isRecording) { stopRecording(); return; }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', audioBlob, 'factory_voice.webm');
        fd.append('language', 'bn');

        try {
          setIsProcessing(true);
          const res = await fetch('/api/v1/voice/transcribe', { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Voice transcription failed. Please enter the brief manually.');
          const data = await res.json();
          const tx = data.sanitized_transcript || data.raw_transcript;
          if (typeof tx !== 'string' || !tx.trim()) throw new Error('No speech was transcribed. Please enter the brief manually.');
          setVoiceText(tx);
          await loadDeal(activePreset, tx.trim(), undefined, true);
        } catch (error) {
          setPipelineError(error instanceof Error ? error.message : t('ভয়েস লেখা তৈরি করা যায়নি।', 'Voice transcription failed.'));
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach((tr) => tr.stop());
        }
      };

      mr.start(200);
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);

    } catch (err) {
      console.warn('Mic permission denied:', err);
      setPipelineError(t('মাইক্রোফোনে প্রবেশাধিকার পাওয়া যায়নি। আপনি চাইলে নিচে লিখে brief দিতে পারেন।', 'Microphone access was not available. You can enter your brief below.'));
    }
  };

  /* --- TTS Audio -------------------------------------------------- */
  const handleSpeakSummary = () => {
    if (!deal?.pitch_templates?.bangla_summary) return;
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(deal.pitch_templates.bangla_summary);
    utt.rate = 0.92;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  /* --- Trade advisor request -------------------------------------- */

  const handleAskAdvisor = async (promptText?: string) => {
    const query = (promptText || advisorInput).trim();
    if (!query) return;
    setAdvisorLoading(true);
    setAdvisorError('');
    setAdvisorResponse(null);
    try {
      const payload = {
        message: query,
        deal_context: deal ? {
          commodity: deal.title_en,
          target_price: '$' + deal.recommended_fob_price_usd,
          moq: (customCapacity || 0).toLocaleString() + ' units',
          incoterm: 'FOB Chattogram',
        } : undefined,
        language: lang === 'bn' ? 'bn' : 'en',
      };
      const res = await fetch('/api/v1/azure-openai/negotiate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || t('এই মুহূর্তে পরামর্শ পাওয়া যায়নি। পরে আবার চেষ্টা করুন।', 'Advice is unavailable right now. Please try again later.'));
      }
      setAdvisorResponse(data);
    } catch (err) {
      setAdvisorError(err instanceof Error ? err.message : t('পরামর্শের অনুরোধ সম্পন্ন হয়নি।', 'The advice request could not be completed.'));
    } finally {
      setAdvisorLoading(false);
    }
  };
  const handleCopyCounterOffer = () => {
    if (!advisorResponse?.suggested_counter_offer) return;
    navigator.clipboard.writeText(advisorResponse.suggested_counter_offer);
    setAdvisorCopied(true);
    setTimeout(() => setAdvisorCopied(false), 2500);
  };

  const stepsList = [
    { num: 1, labelBn: 'পণ্য ও স্পেক', labelEn: 'Product Spec', Icon: Eye },
    { num: 2, labelBn: 'কারখানা ভয়েস', labelEn: 'Voice Brief', Icon: Mic },
    { num: 3, labelBn: 'কার্বন অডিট', labelEn: 'Carbon Audit', Icon: Shield },
    { num: 4, labelBn: 'বায়ার ও মার্জিন', labelEn: 'Buyers & Margin', Icon: Globe },
    { num: 5, labelBn: 'নেগোসিয়েশন ও চুক্তি', labelEn: 'Advisor & Deal', Icon: Bot },
  ] as const;

  const baseCapacity = deal?.monthly_capacity_units || 10000;
  const currentCapacity = (customCapacity && customCapacity > 0) ? customCapacity : baseCapacity;
  const gainPerUnitUsd = deal?.fob_unit_economics?.direct_export_gain_usd_per_unit || ((deal?.extra_profit_per_shipment_usd || 0) / baseCapacity);
  const dynamicExtraProfitUsd = Math.round(gainPerUnitUsd * currentCapacity);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">

      {/* ---- Factory Identity Header ------------------------------ */}
      <div data-tour="workspace-header" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-em">SOVEREIGN WORKSPACE</span>
            <span className="badge badge-gold">{t('নিরাপদ প্রবেশাধিকার', 'Secure access')}</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Role: <span className="text-emerald-400 font-semibold">{user?.role || 'Exporter'}</span>
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
            {user?.factory_name || t('সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ', 'Savar Golden Jute & Eco-Crafts Ltd.')}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
            {t(
              'ধাপভিত্তিক স্বয়ংক্রিয় রপ্তানি পাইপলাইন: পণ্য নির্বাচন থেকে শুরু করে আন্তর্জাতিক ক্রেতা ও চুক্তিপত্র তৈরি।',
              'Prepare product details, review market references, screen carbon estimates, and save export document drafts.'
            )}
          </p>
        </div>

        {/* Global Preset Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-bangla shrink-0">
            {t('পণ্য ক্যাটালগ:', 'Presets:')}
          </span>
          <div className="flex gap-1.5 items-center">
            <button
              type="button"
              onClick={handleOpenTour}
              className="px-3 py-1.5 rounded-xl border border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 font-bangla shrink-0 shadow-sm"
              title={t('অনবোর্ডিং গাইড ট্যুর দেখুন', 'Take Interactive Platform Tour')}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('ট্যুর দেখুন', 'Platform Tour')}</span>
            </button>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  activePreset === p.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800'
                }`}
              >
                <span className="font-bangla">{t(p.titleBn, p.titleEn)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Workspace View Mode Toggle (5-Step Pipeline vs Live Deal Room) ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('pipeline');
              setSearchParams({ preset: activePreset, step: currentStep.toString() });
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-bangla transition-all flex items-center gap-2 ${
              workspaceMode === 'pipeline'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('ধাপভিত্তিক রপ্তানি পাইপলাইন (৫ ধাপ)', '5-Step Export Pipeline')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('dealroom');
              setSearchParams({ preset: activePreset, mode: 'dealroom' });
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-bangla transition-all flex items-center gap-2 ${
              workspaceMode === 'dealroom'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-900'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>{t('লাইভ ডিল নেগোসিয়েশন রুম', 'Live Deal Room')}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-bangla px-3 hidden sm:block">
          {workspaceMode === 'dealroom'
            ? t('বাণিজ্য শর্তের খসড়া তৈরি ও সংরক্ষণ', 'Prepare and save trade terms drafts')
            : t('পণ্য বিশ্লেষণ, অডিট, বায়ার ম্যাচিং ও প্রস্তুতি মোড', 'Sequential Product Spec, Audit, & Preparation')}
        </div>
      </div>

      {pipelineError && (
        <div role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          {pipelineError}
        </div>
      )}
      {isProcessing && pipelineProgress && (
        <div aria-live="polite" className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
          {pipelineProgress}
        </div>
      )}

      {workspaceMode === 'dealroom' ? (
        <div className="space-y-6">
          {deal ? (
            <DealNegotiationRoom
              tradeDealId={dealRecordId || undefined}
              initialPresetId={deal.preset_id}
              productTitleBn={deal.title_bn}
              productTitleEn={deal.title_en}
              recommendedFobUsd={deal.recommended_fob_price_usd}
              defaultMoq={customCapacity || deal.monthly_capacity_units || 10000}
              unitCostBdt={customCostBdt || deal.unit_cost_bdt}
              hsCode={deal.hs_code_8digit}
              factoryLocation={deal.factory_location}
            />
          ) : (
            <div className="card p-12 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">
                {t('ডিল রুম ডাটা লোড হচ্ছে...', 'Loading deal room data...')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ---- Sequential Stepper Bar ------------------------------- */}
      <div data-tour="stepper-bar" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-5 gap-2">
          {stepsList.map(({ num, labelBn, labelEn, Icon }) => {
            const isActive = currentStep === num;
            const isCompleted = currentStep > num;

            return (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num as StepNumber)}
                className={`group flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-emerald-950/80 border border-emerald-700 dark:border-emerald-800 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-slate-700'
                    : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : num}
                </div>
                <div className="min-w-0 hidden md:block">
                  <div className={`text-[11px] font-bold font-bangla truncate ${isActive ? 'text-white' : isCompleted ? 'text-slate-900 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {t(labelBn, labelEn)}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                    {isActive ? t('বর্তমান ধাপ', 'Active') : isCompleted ? t('সম্পন্ন', 'Done') : t('অপেক্ষমাণ', 'Upcoming')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Stepped Content Canvas ------------------------------- */}
      {isProcessing && !deal ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            {t('আন্তর্জাতিক বাণিজ্য বুদ্ধিমত্তা ডাটা লোড হচ্ছে...', 'Loading sovereign trade intelligence data...')}
          </p>
        </div>
      ) : deal ? (
        <div className="card p-6 sm:p-8 space-y-6">

          {/* -------------------------------------------------------- */}
          {/* STEP 1: Product Selection & Photography                   */}
          {/* -------------------------------------------------------- */}
          {currentStep === 1 && (
            <div data-tour="product-canvas" className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ধাপ ১: পণ্য নির্বাচন, স্পেসিফিকেশন ও স্টুডিও লুক', 'Step 1: Product Selection, Specs & AI Studio')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
                  {t(
                    'আপনার কারখানার পণ্য নির্বাচন করুন অথবা সরাসরি ছবি আপলোড করুন। এআই ভিশন স্বয়ংক্রিয়ভাবে ৮-ডিজিট HS কোড নির্ধারণ করবে।',
                    'Choose your factory product preset or upload a high-res photo. AI Vision determines the 8-digit HS code automatically.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left: Product Showcase Image */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-square flex items-center justify-center p-6 shadow-inner">
                    <img
                      src={deal.studio_image || deal.sample_image}
                      alt={deal.title_en}
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                    <div className="absolute top-4 left-4 badge badge-em">
                      HS {deal.hs_code_8digit}
                    </div>
                    <div className="absolute bottom-4 right-4 badge badge-gold text-xs">
                      FOB ${deal.recommended_fob_price_usd.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-bangla">
                    <span>{t('স্বয়ংক্রিয় ব্যাকগ্রাউন্ড রিমুভ ও শ্যাডো ক্লিনআপ', 'Auto background removal & drop shadow cleanup')}</span>
                    <span className="font-mono text-emerald-400">WCO Taxonomy Approved</span>
                  </div>
                </div>

                {/* Right: Product Details & Parameter Adjustment */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      WCO CHAPTER {deal.hs_code_8digit.slice(0, 2)}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla mt-1">
                      {deal.title_bn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">{deal.hs_chapter_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-sm p-3.5 space-y-1.5">
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla block">
                        {t('কারখানা খরচ (প্রতি ইউনিট BDT):', 'Factory Cost (BDT/Unit):')}
                      </label>
                      <input
                        type="number"
                        value={customCostBdt}
                        onChange={(e) => setCustomCostBdt(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-base font-bold text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>

                    <div className="card-sm p-3.5 space-y-1.5">
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla block">
                        {t('মাসিক উৎপাদন ক্যাপাসিটি:', 'Monthly Capacity (Units):')}
                      </label>
                      <input
                        type="number"
                        value={customCapacity}
                        onChange={(e) => setCustomCapacity(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-base font-bold text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>

                    <div className="card-sm p-3.5 space-y-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bangla font-semibold">
                        {t('সরাসরি FOB সুপারিশ:', 'Recommended Direct FOB:')}
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        ${deal.recommended_fob_price_usd}
                        <span className="text-xs text-emerald-500 ml-1.5">({deal.recommended_fob_price_bdt} BDT)</span>
                      </div>
                    </div>

                    <div className="card-sm p-3.5 space-y-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 shadow-sm">
                      <div className="text-[11px] text-amber-800 dark:text-amber-400 font-bangla font-semibold">
                        {t('সরাসরি এক্সপোর্টে বাড়তি মুনাফা:', 'Extra Profit vs Middleman:')}
                      </div>
                      <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
                        +${dynamicExtraProfitUsd.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Drag-drop alternative custom photo */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) loadDeal(activePreset, undefined, e.target.files[0]);
                      }}
                    />
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
                      {t('কারখানার নিজস্ব নতুন ছবি আপলোড করতে চান? এখানে ক্লিক করুন', 'Upload custom factory photo instead')}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">JPG, PNG, WebP (Max 10MB)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadDeal(activePreset, voiceText || undefined, undefined, true)}
                    disabled={isProcessing}
                    className="btn-ghost w-full justify-center"
                  >
                    {t('খরচ ও উৎপাদন দিয়ে হিসাব হালনাগাদ করুন', 'Update analysis with cost and capacity')}
                  </button>

                  {/* Next Step Action */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary text-xs flex items-center gap-2 px-6 py-2.5 font-bangla"
                    >
                      <span>{t('পরবর্তী ধাপ: কারখানা ভয়েস ও শর্তাবলী', 'Next Step: Spoken Brief & Terms')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 2: Spoken Factory Brief */}
          {/* -------------------------------------------------------- */}
          {currentStep === 2 && (
            <div data-tour="voice-brief" className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ধাপ ২: কারখানা ভয়েস ও ট্রেড নির্দেশনা', 'Step 2: Spoken Factory Brief & Trade Guidance')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
                  {t(
                    'কোনো জটিল ফর্ম পূরণ করতে হবে না। মাইক্রোফোন চালু করে বাংলায় বলুন আপনার কারখানার উৎপাদন ক্ষমতা, বন্দর ও বায়ারের শর্ত। রেকর্ডিং থেকে লেখা তৈরি হয়, এরপর পরিচিত সংবেদনশীল নম্বর আড়াল করে বাণিজ্য বিশ্লেষণে পাঠানো হয়।',
                    'Speak in Bangla about your factory capacity, port, and buyer terms. The recording is transcribed first, then known sensitive numbers are masked before trade analysis.'
                  )}
                </p>
              </div>

              {/* Voice Station Box */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 space-y-6 text-center shadow-sm">
                <label className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-left cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVoiceConsent}
                    onChange={(event) => setIsVoiceConsent(event.target.checked)}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <span className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-bangla">
                    {t(
                      'ভয়েস লেখা তৈরি করতে রেকর্ডিং একটি বহিরাগত transcription service-এ পাঠানো হবে। NID, TIN, ব্যাংক বা ব্যক্তিগত নম্বর মুখে বলবেন না। ফেরত আসা লেখায় পরিচিত নম্বর গোপন করে বাণিজ্য বিশ্লেষণে পাঠানো হবে।',
                      'Audio is sent to an external transcription service. Do not speak NID, TIN, bank, or personal account numbers. Recognized identifiers in the returned transcript are masked before trade analysis.'
                    )}
                  </span>
                </label>
                <div className="space-y-2">
                  <button
                    onClick={handleToggleVoice}
                    disabled={isProcessing || (!isRecording && !isVoiceConsent)}
                    aria-label={isRecording ? t('রেকর্ডিং বন্ধ করুন', 'Stop recording') : t('রেকর্ড শুরু করুন', 'Start recording')}
                    className={`mx-auto w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                      isRecording
                        ? 'bg-rose-700 hover:bg-rose-800 text-white animate-pulse shadow-rose-700/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105'
                    }`}
                  >
                    {isRecording ? (
                      <StopCircle className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>

                  <div className="text-xs font-mono">
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-2 text-rose-400">
                        <Waveform />
                        <span className="font-bold">{formatTime(recordSeconds)}</span>
                        <span>{t('রেকর্ডিং চলছে...', 'Listening...')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bangla">
                        {t('মাইক্রোফোনে ক্লিক করে বাংলায় বলুন', 'Click mic to speak your factory brief')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transcribed Bangla Output */}
                <div className="text-left space-y-2 card-sm p-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bangla">
                      {t('শনাক্তকৃত ভয়েস ট্রান্সক্রিপ্ট:', 'Captured Spoken Parameters:')}
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">
                      {t('স্বয়ংক্রিয় বাংলা রূপান্তর', 'Auto Transcribed')}
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 font-bangla outline-none focus:border-emerald-500 leading-relaxed resize-none shadow-sm"
                    placeholder={t('ভয়েস থেকে পাওয়া লেখা এখানে দেখাবে। চাইলে নিজেও brief লিখুন।', 'The transcript will appear here. You can also type a brief.')}
                  />

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-bangla pt-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t('পরিচিত পরিচয় ও কর নম্বর বাণিজ্য বিশ্লেষণের আগে আড়াল করা হয়।', 'Known identity and tax numbers are masked before trade analysis.')}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 font-bangla"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('পূর্ববর্তী ধাপ', 'Previous Step')}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing || !voiceText.trim()}
                  onClick={() => loadDeal(activePreset, voiceText.trim(), undefined, true)}
                  className="btn-ghost text-xs flex items-center gap-2 px-4 py-2.5 font-bangla disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('এই brief দিয়ে বিশ্লেষণ করুন', 'Analyze this brief')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary text-xs flex items-center gap-2 px-6 py-2.5 font-bangla"
                >
                  <span>{t('পরবর্তী ধাপ: কার্বন ও ইউটিলিটি অডিট', 'Next Step: Scope 2 Carbon Audit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 3: Zero-Hardware Green & CBAM Audit                  */}
          {/* -------------------------------------------------------- */}
          {currentStep === 3 && (
            <div data-tour="sovereign-advisor" className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ধাপ ৩: জিরো-হার্ডওয়্যার EU CBAM ও কার্বন কমপ্লায়েন্স অডিট', 'Step 3: Zero-Hardware EU CBAM & Carbon Audit')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
                  {t(
                    'কোনো অতিরিক্ত সেন্সর ছাড়াই কারখানার বিদ্যুৎ বিলের তথ্য থেকে স্বয়ংক্রিয়ভাবে ইউরোপীয় ইউনিয়নের স্কোপ ২ কার্বন নির্গমন হিসাব করা হয়।',
                    'Calculates Scope 2 factory emissions directly from standard utility bills without expensive hardware.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    labelBn: 'প্রতি ইউনিটে Scope 2 কার্বন:',
                    labelEn: 'Scope 2 Emissions / Unit:',
                    value: `${deal.cbam_scope2_co2_kg_per_unit} kg CO2e`,
                    color: 'text-emerald-400',
                    sub: deal.uploaded_doc_metrics?.scope2_per_unit_kg_co2e != null
                      ? t('আপলোড করা বিল থেকে হিসাব; বিধি যাচাই বাকি', 'Calculated from uploaded bill; regulatory review required')
                      : t('নমুনা মান; বিদ্যুৎ বিল আপলোড করে হিসাব করুন', 'Illustrative value; upload a utility bill for analysis'),
                    subColor: 'text-amber-700 dark:text-amber-300',
                  },
                  {
                    labelBn: 'পাওয়ার ফ্যাক্টর (PF):',
                    labelEn: 'Power Factor (PF):',
                    value: deal.uploaded_doc_metrics?.power_factor != null ? String(deal.uploaded_doc_metrics.power_factor) : t('নেই', 'Not provided'),
                    color: 'text-amber-700 dark:text-amber-300',
                    sub: deal.uploaded_doc_metrics?.power_factor != null
                      ? t('আপলোড করা বিল থেকে', 'From uploaded bill')
                      : t('বিদ্যুৎ বিল আপলোড করা হয়নি', 'No utility bill uploaded'),
                    subColor: 'text-slate-400',
                  },
                  {
                    labelBn: 'কমপ্লায়েন্স স্কোর:',
                    labelEn: 'Compliance Readiness:',
                    value: `${deal.compliance_readiness_score} / 100`,
                    color: 'text-emerald-400',
                    sub: t('সনদ ও বিধি যাচাই করা হয়নি', 'Certificates and regulatory status not verified'),
                    subColor: 'text-amber-700 dark:text-amber-300',
                  },
                ].map(({ labelBn, labelEn, value, color, sub, subColor }) => (
                  <div key={labelEn} className="card-sm p-4 space-y-2">
                    <div className="text-[11px] text-slate-400 font-bangla">{t(labelBn, labelEn)}</div>
                    <div className={`text-2xl font-extrabold font-mono ${color}`}>{value}</div>
                    <div className={`text-[11px] font-semibold font-bangla ${subColor}`}>{sub}</div>
                  </div>
                ))}
              </div>

              <div
                onClick={() => billInputRef.current?.click()}
                className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <input
                  ref={billInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) loadDeal(activePreset, voiceText || undefined, e.target.files[0]);
                    e.currentTarget.value = '';
                  }}
                />
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-800 dark:text-slate-200 font-bangla">{t('কারখানার বিদ্যুৎ বিলের PDF আপলোড করুন', 'Upload a factory electricity bill PDF')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('সর্বোচ্চ ১০ MB। নমুনা মানের বদলে বিলের তথ্য ব্যবহার হবে।', 'Up to 10 MB. Parsed bill values replace the illustrative figures.')}</p>
              </div>

              {/* Verified Certificate Checklist */}
              <div className="card-sm p-5 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bangla block">
                  {t('যাচাইয়ের জন্য প্রাসঙ্গিক সনদ:', 'Certificates to verify for this product:')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deal.required_certificates.map((cert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-bangla truncate">{cert}</span>
                      </div>
                      <span className="badge badge-gold text-[9px] shrink-0 font-mono">{t('যাচাই বাকি', 'UNVERIFIED')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 font-bangla"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('পূর্ববর্তী ধাপ', 'Previous Step')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-primary text-xs flex items-center gap-2 px-6 py-2.5 font-bangla"
                >
                  <span>{t('পরবর্তী ধাপ: বায়ার ও মার্জিন অপটিমাইজার', 'Next Step: Buyers & Margin')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 4: Illustrative Market Profiles                      */}
          {/* -------------------------------------------------------- */}
          {currentStep === 4 && (
            <div data-tour="direct-buyers" className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ধাপ ৪: বায়ার ও বাজার নির্বাচন', 'Step 4: Buyers and Markets')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
                  {t(
                    'পণ্য -> ৮-ডিজিট HS কোড -> ০% শুল্কমুক্ত দেশ -> ভেরিফায়েড বায়ার। মধ্যস্বত্বভোগী ছাড়া সরাসরি এক্সপোর্টে আপনার সম্ভাব্য মুনাফা দেখুন।',
                    'Review illustrative market profiles and tariff references. No buyer contacts or order offers are available in this version.'
                  )}
                </p>
              </div>

              {/* Loss-Aversion Comparison Meter */}
              <div className="card-sm p-5 space-y-4 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-bangla">
                    {t('লোকাল এজেন্ট বনাম সরাসরি এক্সপোর্ট লাভ:', 'Local Agent vs Direct Export Margin:')}
                  </span>
                  <span className="badge badge-em text-[10px]">
                    +${dynamicExtraProfitUsd.toLocaleString()} PER SHIPMENT
                  </span>
                </div>

                <MeterBar
                  label={t('লোকাল বায়িং হাউস চ্যানেল:', 'Via Middleman / Agent:')}
                  sublabel="~8% typical margin"
                  pct={28}
                  colorClass="bg-rose-600"
                  textClass="text-rose-400"
                />
                <MeterBar
                  label={t('ExportPilot সরাসরি লাভ:', 'ExportPilot Direct:')}
                  sublabel={`+${deal.middleman_margin_saved_pct || 22}% extra margin retained`}
                  pct={85}
                  colorClass="bg-emerald-500"
                  textClass="text-emerald-400"
                />
              </div>

              {/* Illustrative market profiles */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bangla block">
                  {t('সম্ভাব্য বাজার প্রোফাইল:', 'Indicative Buyer Profiles:')}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
                  {t('এগুলো নমুনা বাজার তথ্য, যাচাইকৃত যোগাযোগ বা বায়ারের সম্মতি নয়। দর, শুল্ক ও ক্রেতার পরিচয় নিজ দায়িত্বে যাচাই করুন।', 'These are illustrative market profiles, not verified contacts or buyer inquiries. Confirm the company, tariff eligibility, and pricing independently.')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deal.matched_buyers.map((b) => (
                    <div key={b.buyer_id} className="card-sm p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{b.company_name}</span>
                        <span className="badge badge-em shrink-0 text-[9px]">
                          {t('শুল্ক যাচাই করুন', 'Verify tariff')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{b.city}, {b.country}</div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                        <div>
                          <span className="text-slate-400">Target FOB:</span>{' '}
                          <span className="text-emerald-400 font-bold">${b.target_fob_usd}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">MOQ:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-200">{(b.typical_moq_units || 0).toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400">{t('বার্ষিক আমদানি:', 'Annual Import:')}</span>{' '}
                          <span className="text-amber-400">${(b.annual_import_usd / 1_000_000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5 font-bangla"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t('নেগোসিয়েশন শুরু করুন', 'Proceed to Deal & AI Advisor')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 font-bangla"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('পূর্ববর্তী ধাপ', 'Previous Step')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="btn-primary text-xs flex items-center gap-2 px-6 py-2.5 font-bangla"
                >
                  <span>{t('পরবর্তী ধাপ: এআই নেগোসিয়েশন ও চুক্তিপত্র', 'Next Step: AI Advisor & Contracts')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 5: Trade Advice & Document Drafts                     */}
          {/* -------------------------------------------------------- */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              {/* Interactive Live Deal Negotiation Room */}
              <DealNegotiationRoom
                tradeDealId={dealRecordId || undefined}
                initialPresetId={deal.preset_id}
                productTitleBn={deal.title_bn}
                productTitleEn={deal.title_en}
                recommendedFobUsd={deal.recommended_fob_price_usd}
                defaultMoq={customCapacity || deal.monthly_capacity_units || 10000}
                unitCostBdt={customCostBdt || deal.unit_cost_bdt}
                hsCode={deal.hs_code_8digit}
                factoryLocation={deal.factory_location}
              />
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ধাপ ৫: বাণিজ্য পরামর্শ ও শর্তের খসড়া', 'Step 5: Trade advice and terms draft')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla">
                  {t(
                    'পণ্যের বিশ্লেষণ দেখে বাণিজ্য পরামর্শ নিন এবং নিজের শর্তের খসড়া সংরক্ষণ করুন। এতে বায়ার যোগাযোগ বা চুক্তি সম্পন্ন হয় না।',
                    'Use the product analysis for trade advice and save your own draft terms. This does not contact a buyer or complete a contract.'
                  )}
                </p>
              </div>

              {/* Trade advisor */}
              <div className="card-sm p-5 space-y-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                      {t('বাণিজ্য পরামর্শ', 'Trade Advisor')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold text-[9px] font-mono">
                      {t('সংবেদনশীল তথ্য গোপন রাখা হয়', 'Sensitive details are protected')}
                    </span>
                  </div>
                </div>

                {/* Prompt suggestions */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla block">
                    {t('বায়ারের সাথে দরকষাকষির জন্য তৈরি প্রশ্নসমূহ:', 'Negotiation Prompt Templates:')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        bn: 'বায়ার ১০% কম দাম চাইলে দর যাচাই করে কীভাবে জবাব দেব?',
                        en: 'How can I assess a request for a 10% discount on FOB pricing?',
                      },
                      {
                        bn: '৯০ দিনের ওপেন ক্রেডিট শর্তে কী কী ঝুঁকি যাচাই করব?',
                        en: 'What risks should I assess for 90-day open-account terms?',
                      },
                      {
                        bn: 'ইইউতে বর্তমান শুল্ক ও কার্বন সংক্রান্ত শর্ত কীভাবে যাচাই করব?',
                        en: 'How can I verify current EU tariff and carbon requirements for my product?',
                      },
                      {
                        bn: 'চট্টগ্রাম বন্দরে চালান দেরি হলে চুক্তিতে কোন দায়গুলো স্পষ্ট রাখব?',
                        en: 'Which contract terms should address delays and demurrage at Chattogram port?',
                      },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const text = lang === 'bn' ? chip.bn : chip.en;
                          setAdvisorInput(text);
                          handleAskAdvisor(text);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-700 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-300 transition-colors font-bangla text-left"
                      >
                        {t(chip.bn, chip.en)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input box */}
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={advisorInput}
                      onChange={(e) => setAdvisorInput(e.target.value)}
                      placeholder={t(
                        'যেমন: বায়ার প্রতি ইউনিটে দাম কমাতে বলছে এবং ওপেন একাউন্ট চাচ্ছে। মার্জিন রক্ষা করে কীভাবে অফার দেব?',
                        'e.g. Buyer asks for a discount and requests Open Account. How to protect margin and counter?'
                      )}
                      rows={3}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-bangla resize-none shadow-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('পরিচিত সংবেদনশীল নম্বর বাণিজ্য পরামর্শে পাঠানোর আগে আড়াল করা হয়।', 'Known sensitive numbers are masked before trade advice is requested.')}</span>
                    </div>

                    <button
                      type="button"
                      disabled={advisorLoading || !advisorInput.trim()}
                      onClick={() => handleAskAdvisor()}
                      className="btn-primary text-xs px-5 py-2 disabled:opacity-50 flex items-center gap-1.5 font-bangla"
                    >
                      {advisorLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('বিশ্লেষণ চলছে...', 'Analyzing...')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('উপদেশ চান', 'Get Strategy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {advisorError && (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                    {advisorError}
                  </div>
                )}                {/* Advisor Response Output */}
                {advisorResponse && (
                  <div className="space-y-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-slate-900/90 animate-fade-in shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                        {t('কৌশলগত বিশ্লেষণ ও সুপারিশ', 'Strategic Analysis & Recommendations')}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="badge badge-em">
                          {t('বাণিজ্য পরামর্শ', 'Trade advisor')}
                        </span>
                        
                        {advisorResponse.pii_redacted_count > 0 && (
                          <span className="badge badge-blue">
                            {advisorResponse.pii_redacted_count} {t('টি সংবেদনশীল নম্বর আড়াল', 'sensitive numbers masked')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-bangla whitespace-pre-wrap bg-white dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      {advisorResponse.reply}
                    </div>

                    {advisorResponse.suggested_counter_offer && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-bangla">
                            {t('প্রস্তাবিত কাউন্টার-অফার ড্রাফট:', 'Suggested Counter-Offer Draft:')}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyCounterOffer}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 dark:border-emerald-700/60 text-[11px] transition-colors font-bangla"
                          >
                            {advisorCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-300" />
                                <span>{t('কপি হয়েছে!', 'Copied!')}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{t('কপি করুন', 'Copy Draft')}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-950 p-3 rounded-lg border border-emerald-300 dark:border-emerald-900/40">
                          {advisorResponse.suggested_counter_offer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reference PDF downloads */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-bangla">
                    {t('নমুনা নথি ও প্রস্তুতি প্রতিবেদন:', 'Reference documents and preparation reports:')}
                  </span>
                  <button
                    onClick={handleSpeakSummary}
                    className={`btn-ghost text-xs ${isSpeaking ? 'border-amber-600 text-amber-300' : ''}`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isSpeaking ? t('অডিও চলছে...', 'Speaking...') : t('বাংলা অডিও শুনুন', 'Listen in Bangla')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      href: deal.pdf_downloads?.proforma_invoice ?? `/api/v1/reports/download/proforma_invoice/${deal.preset_id}`,
                      titleBn: 'প্রফর্মা ইনভয়েসের খসড়া',
                      titleEn: 'Proforma Invoice Draft',
                      sub: 'Review terms before sharing',
                      accent: true,
                    },
                    {
                      href: deal.pdf_downloads?.cbam_certificate ?? `/api/v1/reports/download/cbam_certificate/${deal.preset_id}`,
                      titleBn: 'কার্বন স্ক্রিনিং প্রতিবেদন',
                      titleEn: 'Carbon Screening Report',
                      sub: 'Estimate only, not a certificate',
                      accent: false,
                    },
                    {
                      href: deal.pdf_downloads?.buyer_catalog ?? `/api/v1/reports/download/buyer_catalog/${deal.preset_id}`,
                      titleBn: '৩-পৃষ্ঠার বায়ার ক্যাটালগ',
                      titleEn: '3-Page Lookbook',
                      sub: 'Sample product details, not test records',
                      accent: false,
                    },
                  ].map(({ href, titleBn, titleEn, sub, accent }) => (
                    <a
                      key={titleEn}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all group shadow-sm ${
                        accent
                          ? 'bg-emerald-50 border-emerald-300 text-slate-900 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-700/60 dark:hover:border-emerald-400 dark:hover:bg-emerald-950 dark:text-white'
                          : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-emerald-500/60 dark:hover:bg-slate-900 dark:text-white'
                      }`}
                      style={{ minHeight: '72px' }}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className={`text-xs font-bold font-bangla ${accent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                          {t(titleBn, titleEn)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{sub}</div>
                      </div>
                      <Download className="w-5 h-5 text-emerald-400 shrink-0 ml-3 group-hover:translate-y-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation Back */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 font-bangla"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('পূর্ববর্তী ধাপ: বায়ার ও মার্জিন', 'Previous Step: Buyers & Margin')}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      ) : null}
      </>
      )}

      {/* Live Export Trade Feed & Margin Savings */}
      <LiveTradeFeed />

      {/* 4 Defined User Roles & Operational Workflows */}
      <UserPersonaGuide />

      {/* Interactive Onboarding Spotlight Tour */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onNavigateStep={(s) => setStep(s)}
      />

    </div>
  );
};
