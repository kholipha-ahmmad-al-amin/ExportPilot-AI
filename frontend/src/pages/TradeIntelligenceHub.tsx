import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VoiceGuideButton } from '../components/VoiceGuidePlayer';
import {
  Camera, Ship, Landmark, Languages, FileDown, Volume2, VolumeX,
  CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw,
  Upload, Copy, Check, Scale, FileText, Compass, Mic, MicOff, X
} from 'lucide-react';

type ActiveModule = 'vision' | 'supply' | 'finance' | 'negotiate';
type SectorKey = 'jute' | 'garments' | 'leather' | 'ceramics' | 'agro';

interface QuickPreset {
  id: SectorKey;
  labelBn: string;
  labelEn: string;
  productName: string;
  hsCode: string;
  noteBn: string;
  defaultPort: 'Rotterdam' | 'Hamburg' | 'Felixstowe' | 'Tokyo' | 'LosAngeles' | 'Jeddah';
  masterLcUsd: number;
  btbPct: number;
  buyerLang: 'de' | 'ja' | 'ar' | 'fr' | 'en';
  buyerCompany: string;
  buyerOfferUsd: number;
  factoryTargetUsd: number;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'jute',
    labelBn: 'পাটজাত ব্যাগ (EU/Germany)',
    labelEn: 'Jute Tote Bag (EU/Germany)',
    productName: 'Organic Jute Shopping Tote Bag (300 GSM)',
    hsCode: '4202.92.10',
    noteBn: '৩০০ জিএসএম ন্যাচারাল জুট টোট ব্যাগ, ডাবল ক্রস-স্টিচ হ্যান্ডেল, আজো-ফ্রি ডাই, ইউরোপে রপ্তানির জন্য প্রস্তুত।',
    defaultPort: 'Hamburg',
    masterLcUsd: 45000,
    btbPct: 38,
    buyerLang: 'de',
    buyerCompany: 'Hanseatic EcoRetail GmbH (Hamburg)',
    buyerOfferUsd: 1.65,
    factoryTargetUsd: 1.95,
  },
  {
    id: 'garments',
    labelBn: 'ডেনিম গার্মেন্টস (EU/Rotterdam)',
    labelEn: 'Selvedge Denim Jeans (EU)',
    productName: 'Men Organic Selvedge Denim Jeans (12 oz)',
    hsCode: '6203.42.10',
    noteBn: '১২ আউন্স অর্গানিক কটন ডেনিম জিন্স, OEKO-TEX সার্টিফায়েড ওয়াশ, ১০০% নিডল ডিটেকশন পাস।',
    defaultPort: 'Rotterdam',
    masterLcUsd: 120000,
    btbPct: 62,
    buyerLang: 'fr',
    buyerCompany: 'Maison Textile Europe SAS (Paris)',
    buyerOfferUsd: 8.20,
    factoryTargetUsd: 9.40,
  },
  {
    id: 'leather',
    labelBn: 'লেদার ফুটওয়্যার (Japan/Tokyo)',
    labelEn: 'Leather Ankle Boots (Japan)',
    productName: 'Full-Grain Vegetable-Tanned Leather Boots',
    hsCode: '6403.91.10',
    noteBn: 'ফুল-গ্রেইন কাউহাইড লেদার বুট, ক্রোমিয়াম-৬ মুক্ত (Cr6+ < 3 mg/kg), অ্যান্টি-স্লিপ রাবার সোল।',
    defaultPort: 'Tokyo',
    masterLcUsd: 95000,
    btbPct: 48,
    buyerLang: 'ja',
    buyerCompany: 'Tokyo Marunouchi Footwear Co., Ltd.',
    buyerOfferUsd: 21.50,
    factoryTargetUsd: 24.80,
  },
  {
    id: 'ceramics',
    labelBn: 'সিরামিক টেবিলওয়্যার (UK)',
    labelEn: 'Porcelain Tableware (UK)',
    productName: 'Bone China & Porcelain Dinnerware Set',
    hsCode: '6911.10.00',
    noteBn: 'লিড ও ক্যাডমিয়াম-মুক্ত ফাইন পোর্সেলিন ডিনার সেট, থার্মাল শক ও মাইক্রোওয়েভ রেজিস্ট্যান্ট।',
    defaultPort: 'Felixstowe',
    masterLcUsd: 68000,
    btbPct: 45,
    buyerLang: 'en',
    buyerCompany: 'Thames Home & Dining PLC (London)',
    buyerOfferUsd: 11.00,
    factoryTargetUsd: 12.80,
  },
  {
    id: 'agro',
    labelBn: 'প্রক্রিয়াজাত কৃষিপণ্য (Middle East)',
    labelEn: 'Processed Agro Spices (GCC)',
    productName: 'HACCP Vacuum-Packed Culinary Spice Pack',
    hsCode: '0910.91.10',
    noteBn: 'এইচএসিসিপি ও হালাল সার্টিফায়েড ভ্যাকুয়াম প্যাকড মসলা ও কৃষিপণ্য, আর্দ্রতা ১০% এর নিচে।',
    defaultPort: 'Jeddah',
    masterLcUsd: 52000,
    btbPct: 30,
    buyerLang: 'ar',
    buyerCompany: 'Al-Haramain Food Imports LLC (Jeddah)',
    buyerOfferUsd: 3.10,
    factoryTargetUsd: 3.60,
  },
];

export const TradeIntelligenceHub: React.FC = () => {
  const { lang } = useAuth();
  const isBn = lang === 'bn';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveModule) || 'vision';
  const [activeTab, setActiveTab] = useState<ActiveModule>(
    ['vision', 'supply', 'finance', 'negotiate'].includes(initialTab) ? initialTab : 'vision'
  );

  const [selectedSector, setSelectedSector] = useState<SectorKey>('jute');
  const [speaking, setSpeaking] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Module 1 State: Vision & Voice Quality Inspector
  const [visionProduct, setVisionProduct] = useState(QUICK_PRESETS[0].productName);
  const [visionNote, setVisionNote] = useState(QUICK_PRESETS[0].noteBn);
  const [visionMarket, setVisionMarket] = useState<'EU' | 'UK' | 'USA' | 'Japan' | 'MiddleEast' | 'Canada'>('EU');
  const [visionBatchSize, setVisionBatchSize] = useState(5000);
  const [visionImageB64, setVisionImageB64] = useState<string | null>(null);
  const [visionImageName, setVisionImageName] = useState<string>('');
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  // Module 2 State: Supply Chain & Port Risk Predictor
  const [supplyPort, setSupplyPort] = useState<'Rotterdam' | 'Hamburg' | 'Felixstowe' | 'Tokyo' | 'LosAngeles' | 'Jeddah'>('Rotterdam');
  const [supplyTeu, setSupplyTeu] = useState(2);
  const [supplyCargoUsd, setSupplyCargoUsd] = useState(48000);
  const [supplyIncoterm, setSupplyIncoterm] = useState<'FOB' | 'CIF' | 'CFR' | 'DDP'>('FOB');
  const [supplyLoading, setSupplyLoading] = useState(false);
  const [supplyResult, setSupplyResult] = useState<any>(null);

  // Module 3 State: Export Finance & BB Credit Scoring
  const [finMasterLcUsd, setFinMasterLcUsd] = useState(85000);
  const [finBtbPct, setFinBtbPct] = useState(48);
  const [finPastOrders, setFinPastOrders] = useState(14);
  const [finLeadDays, setFinLeadDays] = useState(60);
  const [finHasErc, setFinHasErc] = useState(true);
  const [finLoading, setFinLoading] = useState(false);
  const [finResult, setFinResult] = useState<any>(null);

  // Module 4 State: Multi-Language Negotiator & Auto-Contract
  const [negLang, setNegLang] = useState<'de' | 'ja' | 'ar' | 'fr' | 'en'>('de');
  const [negBuyerCompany, setNegBuyerCompany] = useState(QUICK_PRESETS[0].buyerCompany);
  const [negProduct, setNegProduct] = useState(QUICK_PRESETS[0].productName);
  const [negHsCode, setNegHsCode] = useState(QUICK_PRESETS[0].hsCode);
  const [negQty, setNegQty] = useState(10000);
  const [negBuyerOffer, setNegBuyerOffer] = useState(1.65);
  const [negFactoryTarget, setNegFactoryTarget] = useState(1.95);
  const [negIncoterm, setNegIncoterm] = useState<'FOB Chattogram' | 'CIF Rotterdam' | 'CIF Tokyo' | 'CIF Jeddah'>('FOB Chattogram');
  const [negBuyerMsg, setNegBuyerMsg] = useState('We want 10,000 units at USD 1.65 FOB with 90 days open account payment.');
  const [negLoading, setNegLoading] = useState(false);
  const [negResult, setNegResult] = useState<any>(null);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync URL query param `?tab=`
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveModule;
    if (tabParam && ['vision', 'supply', 'finance', 'negotiate'].includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const switchTab = (tab: ActiveModule) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Run API Calls
  const runVisionInspect = useCallback(async (overridePayload?: any) => {
    setVisionLoading(true);
    try {
      const payload = overridePayload || {
        sector: selectedSector,
        product_name: visionProduct,
        voice_or_text_note: visionNote,
        target_market: visionMarket,
        batch_size_units: Number(visionBatchSize) || 5000,
        image_base64: visionImageB64,
      };
      const res = await fetch('/api/v1/intelligence/vision-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setVisionResult(await res.json());
      }
    } catch {
      // Handled gracefully
    } finally {
      setVisionLoading(false);
    }
  }, [selectedSector, visionProduct, visionNote, visionMarket, visionBatchSize, visionImageB64]);

  const runSupplyChainRisk = useCallback(async (overridePayload?: any) => {
    setSupplyLoading(true);
    try {
      const payload = overridePayload || {
        sector: selectedSector,
        destination_port: supplyPort,
        containers_teu: Number(supplyTeu) || 2,
        cargo_value_usd: Number(supplyCargoUsd) || 48000,
        preferred_incoterm: supplyIncoterm,
      };
      const res = await fetch('/api/v1/intelligence/supply-chain-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSupplyResult(await res.json());
      }
    } catch {
      // Handled gracefully
    } finally {
      setSupplyLoading(false);
    }
  }, [selectedSector, supplyPort, supplyTeu, supplyCargoUsd, supplyIncoterm]);

  const runExportFinanceScore = useCallback(async (overridePayload?: any) => {
    setFinLoading(true);
    try {
      const payload = overridePayload || {
        sector: selectedSector,
        master_lc_value_usd: Number(finMasterLcUsd) || 85000,
        raw_material_import_pct: Number(finBtbPct) || 48,
        completed_export_orders: Number(finPastOrders) || 12,
        lead_time_days: Number(finLeadDays) || 60,
        has_erc_and_ud: finHasErc,
      };
      const res = await fetch('/api/v1/intelligence/export-finance-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFinResult(await res.json());
      }
    } catch {
      // Handled gracefully
    } finally {
      setFinLoading(false);
    }
  }, [selectedSector, finMasterLcUsd, finBtbPct, finPastOrders, finLeadDays, finHasErc]);

  const runNegotiateContract = useCallback(async (overridePayload?: any) => {
    setNegLoading(true);
    try {
      const payload = overridePayload || {
        buyer_language: negLang,
        buyer_company: negBuyerCompany,
        product_name: negProduct,
        hs_code: negHsCode,
        quantity_units: Number(negQty) || 10000,
        buyer_offered_fob_usd: Number(negBuyerOffer) || 1.65,
        factory_target_fob_usd: Number(negFactoryTarget) || 1.95,
        incoterm: negIncoterm,
        buyer_message: negBuyerMsg,
      };
      const res = await fetch('/api/v1/intelligence/negotiate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNegResult(await res.json());
      }
    } catch {
      // Handled gracefully
    } finally {
      setNegLoading(false);
    }
  }, [negLang, negBuyerCompany, negProduct, negHsCode, negQty, negBuyerOffer, negFactoryTarget, negIncoterm, negBuyerMsg]);

  // Initial load for all 4 modules so the user immediately sees live data
  useEffect(() => {
    runVisionInspect();
    runSupplyChainRisk();
    runExportFinanceScore();
    runNegotiateContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (preset: QuickPreset) => {
    setSelectedSector(preset.id);
    setVisionProduct(preset.productName);
    setVisionNote(preset.noteBn);
    setSupplyPort(preset.defaultPort);
    setSupplyCargoUsd(preset.masterLcUsd);
    setFinMasterLcUsd(preset.masterLcUsd);
    setFinBtbPct(preset.btbPct);
    setNegLang(preset.buyerLang);
    setNegBuyerCompany(preset.buyerCompany);
    setNegProduct(preset.productName);
    setNegHsCode(preset.hsCode);
    setNegBuyerOffer(preset.buyerOfferUsd);
    setNegFactoryTarget(preset.factoryTargetUsd);

    runVisionInspect({
      sector: preset.id,
      product_name: preset.productName,
      voice_or_text_note: preset.noteBn,
      target_market: visionMarket,
      batch_size_units: visionBatchSize,
      image_base64: visionImageB64,
    });
    runSupplyChainRisk({
      sector: preset.id,
      destination_port: preset.defaultPort,
      containers_teu: supplyTeu,
      cargo_value_usd: preset.masterLcUsd,
      preferred_incoterm: supplyIncoterm,
    });
    runExportFinanceScore({
      sector: preset.id,
      master_lc_value_usd: preset.masterLcUsd,
      raw_material_import_pct: preset.btbPct,
      completed_export_orders: finPastOrders,
      lead_time_days: finLeadDays,
      has_erc_and_ud: finHasErc,
    });
    runNegotiateContract({
      buyer_language: preset.buyerLang,
      buyer_company: preset.buyerCompany,
      product_name: preset.productName,
      hs_code: preset.hsCode,
      quantity_units: negQty,
      buyer_offered_fob_usd: preset.buyerOfferUsd,
      factory_target_fob_usd: preset.factoryTargetUsd,
      incoterm: negIncoterm,
      buyer_message: negBuyerMsg,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVisionImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const b64 = reader.result;
        setVisionImageB64(b64);
        runVisionInspect({
          sector: selectedSector,
          product_name: visionProduct,
          voice_or_text_note: visionNote,
          target_market: visionMarket,
          batch_size_units: Number(visionBatchSize) || 5000,
          image_base64: b64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setVisionImageB64(null);
    setVisionImageName('');
  };

  const toggleVoiceNoteDictation = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    if (recordingVoice) {
      setRecordingVoice(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = isBn ? 'bn-BD' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setRecordingVoice(true);
      rec.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setVisionNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setRecordingVoice(false);
      };
      rec.onerror = () => setRecordingVoice(false);
      rec.onend = () => setRecordingVoice(false);
      rec.start();
    } catch {
      setRecordingVoice(false);
    }
  };

  const speakSummary = (textBn: string, textEn: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(isBn ? textBn : textEn);
    utterance.lang = isBn ? 'bn-BD' : 'en-US';
    utterance.rate = 0.96;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const downloadOfficialPdf = async (
    moduleName: 'vision_inspect' | 'supply_chain_risk' | 'export_finance_score' | 'negotiate_contract',
    title: string,
    subtitle: string,
    rows: string[][]
  ) => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/v1/intelligence/report-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: moduleName,
          title,
          subtitle,
          rows,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exportpilot_${moduleName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const copyNativePitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isBn ? 'সার্বভৌম এআই ট্রেড ইন্টেলিজেন্স হাব' : 'Sovereign AI Trade Intelligence Hub'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isBn
                ? 'ভিশন কোয়ালিটি, সমুদ্রপথ ঝুঁকি, বাংলাদেশ ব্যাংক ফাইন্যান্স এবং বহুভাষিক চুক্তি ইঞ্জিন'
                : 'Vision Quality, Maritime Risk, Bangladesh Bank Finance & Multi-Language Contract Engine'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? 'বাংলাদেশের রপ্তানিকারকদের জন্য ৪টি বিশেষায়িত এআই মডিউল এক জায়গায়। নিচের যেকোনো প্রিসেটে ক্লিক করুন অথবা আপনার নিজস্ব পণ্যের তথ্য দিয়ে তাৎক্ষণিক বিশ্লেষণ ও অফিশিয়াল PDF রিপোর্ট ডাউনলোড করুন।'
                : 'Four specialized AI modules built for Bangladeshi exporters. Select a sector preset below or enter your shipment parameters to generate verified diagnostics and official PDF dossiers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <VoiceGuideButton trackKey="workspace" />
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'ওয়ার্কস্পেসে ফিরুন' : 'Back to Workspace'}
            </Link>
            <Link
              to="/dealroom"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              {isBn ? 'ডিল নেগোসিয়েশন রুম' : 'Open Deal Room'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Sector Quick Presets */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              {isBn ? 'দ্রুত খাত নির্বাচন:' : 'Quick Sector Preset:'}
            </span>
            {QUICK_PRESETS.map((preset) => {
              const active = selectedSector === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {isBn ? preset.labelBn : preset.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="tablist">
        {[
          {
            id: 'vision' as ActiveModule,
            Icon: Camera,
            titleBn: 'ভিশন ও ভয়েস কোয়ালিটি ইনস্পেক্টর',
            titleEn: 'Vision & Voice Quality Inspector',
            subBn: 'AQL 2.5 ডিফেক্ট ও ৮-ডিজিট HS কোড',
            subEn: 'AQL 2.5 Defect & 8-Digit HS Check',
          },
          {
            id: 'supply' as ActiveModule,
            Icon: Ship,
            titleBn: 'সাপ্লাই চেইন ও সমুদ্রপথ রিস্ক',
            titleEn: 'Supply Chain & Route Predictor',
            subBn: 'চট্টগ্রাম বন্দর ও সমুদ্র করিডোর তুলনা',
            subEn: 'Chattogram Port & Maritime Corridors',
          },
          {
            id: 'finance' as ActiveModule,
            Icon: Landmark,
            titleBn: 'এক্সপোর্ট ফাইন্যান্স ও ক্রেডিট স্কোর',
            titleEn: 'Export Finance & BB Credit Engine',
            subBn: 'ব্যাক-টু-ব্যাক এলসি, EDF ও নগদ সহায়তা',
            subEn: 'Back-to-Back LC, EDF & Cash Incentive',
          },
          {
            id: 'negotiate' as ActiveModule,
            Icon: Languages,
            titleBn: 'বহুভাষিক নেগোসিয়েশন ও চুক্তিপত্র',
            titleEn: 'Multi-Language Contract Generator',
            subBn: 'জার্মান, জাপানি, আরবি ও ফরাসি চুক্তি',
            subEn: 'German, Japanese, Arabic & French',
          },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const IconComponent = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => switchTab(tab.id)}
              className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/40'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {isBn ? tab.titleBn : tab.titleEn}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {isBn ? tab.subBn : tab.subEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          MODULE 1: VISION & VOICE QUALITY INSPECTOR
      ===================================================================== */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input Form */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                {isBn ? 'পণ্যের ছবি ও ভয়েস/টেক্সট ইনপুট' : 'Product Image & Voice/Text Input'}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'শিল্প খাত (Sector)' : 'Export Sector'}
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => {
                      const nextPreset = QUICK_PRESETS.find((p) => p.id === (e.target.value as SectorKey));
                      if (nextPreset) applyPreset(nextPreset);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="jute">{isBn ? 'পাট ও পাটজাত পণ্য (Jute)' : 'Jute & Allied Fibres'}</option>
                    <option value="garments">{isBn ? 'তৈরি পোশাক ও ডেনিম (RMG)' : 'RMG & Denim Apparel'}</option>
                    <option value="leather">{isBn ? 'চামড়া ও ফুটওয়্যার (Leather)' : 'Leather & Footwear'}</option>
                    <option value="ceramics">{isBn ? 'সিরামিক ও টেবিলওয়্যার' : 'Ceramic Tableware'}</option>
                    <option value="agro">{isBn ? 'প্রক্রিয়াজাত কৃষিপণ্য (Agro)' : 'Agro-Processing & Spices'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পণ্যের নাম (Product Name)' : 'Product Name'}
                  </label>
                  <input
                    type="text"
                    value={visionProduct}
                    onChange={(e) => setVisionProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'টার্গেট মার্কেট' : 'Target Market'}
                  </label>
                  <select
                    value={visionMarket}
                    onChange={(e) => setVisionMarket(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="EU">European Union (EBA 0%)</option>
                    <option value="UK">United Kingdom (DCTS 0%)</option>
                    <option value="Japan">Japan (GSP 0%)</option>
                    <option value="Canada">Canada (LDCT 0%)</option>
                    <option value="USA">United States (MFN)</option>
                    <option value="MiddleEast">Middle East (GCC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'লট বা ব্যাচ সাইজ (ইউনিট)' : 'Batch Size (Units)'}
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={1000000}
                    value={visionBatchSize}
                    onChange={(e) => setVisionBatchSize(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পণ্যের বিবরণ বা ভয়েস নোট (বাংলা/ইংরেজি)' : 'Product Spec or Voice Note (Bangla/English)'}
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceNoteDictation}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      recordingVoice
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {recordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {recordingVoice
                      ? isBn
                        ? 'শুনছি...'
                        : 'Listening...'
                      : isBn
                      ? 'কথা বলে লিখুন'
                      : 'Voice Input'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={visionNote}
                  onChange={(e) => setVisionNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'পণ্যের ছবি আপলোড (ঐচ্ছিক - না দিলে স্টুডিও প্রিসেট ব্যবহৃত হবে)' : 'Upload Product Photo (Optional)'}
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 cursor-pointer hover:border-emerald-500 transition-colors text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>
                    {visionImageName
                      ? visionImageName
                      : isBn
                      ? 'পণ্যের ছবি নির্বাচন করুন (JPG/PNG/WebP)'
                      : 'Choose Product Image (JPG/PNG/WebP)'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {visionImageB64 && (
                  <div className="mt-2.5 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={visionImageB64}
                        alt={visionImageName || 'Uploaded product'}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {visionImageName || (isBn ? 'আপলোডকৃত ছবি যুক্ত হয়েছে' : 'Uploaded image active')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearUploadedImage}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-600"
                      aria-label={isBn ? 'ছবি মুছুন' : 'Remove image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={visionLoading}
                onClick={() => runVisionInspect()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {visionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isBn ? 'ভিশন কোয়ালিটি ও HS কোড যাচাই করুন' : 'Run Vision Quality & HS Inspection'}
              </button>
            </div>
          </div>

          {/* Right Output Card */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            {visionResult ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {visionResult.aql_standard}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {visionResult.product_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {isBn ? 'রপ্তানি প্রস্তুতি স্কোর' : 'Export Readiness Score'}
                      </div>
                      <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {visionResult.export_readiness_score}/100
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      {visionResult.export_grade}
                    </span>
                  </div>
                </div>

                {/* Key Classification Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'বাংলাদেশ কাস্টমস HS কোড' : 'Bangladesh Customs HS Code'}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                      {visionResult.hs_code_8digit}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'শুল্ক সুবিধা (Tariff)' : 'Destination Tariff'}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {visionResult.tariff_treatment}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'ISO নমুনা ও মেজর ত্রুটি' : 'ISO Sample & Major Defects'}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {visionResult.iso_sample_size} units | Major: {visionResult.defects.major_found}/{visionResult.defects.major_limit}
                    </div>
                  </div>
                </div>

                {/* Quality Metrics Bars */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isBn ? 'ভিশন ও সারফেস কোয়ালিটি প্যারামিটার' : 'Vision & Surface Quality Parameters'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visionResult.quality_metrics.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span>{isBn ? m.name_bn : m.name_en}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{m.score}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                          Benchmark: {m.benchmark} ({m.status})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation Steps */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {isBn ? 'ফ্যাক্টরি ফ্লোর কোয়ালিটি নির্দেশনা' : 'Factory Floor Quality Remediation'}
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {(isBn ? visionResult.remediation_bn : visionResult.remediation_en).map(
                      (step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Action Bar: Voice & PDF */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => speakSummary(visionResult.summary_bn, visionResult.summary_en)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    {speaking
                      ? isBn
                        ? 'ভয়েস থামান'
                        : 'Stop Audio'
                      : isBn
                      ? 'বাংলায় ফলাফল শুনুন'
                      : 'Listen Executive Summary'}
                  </button>

                  <button
                    type="button"
                    disabled={downloadingPdf}
                    onClick={() =>
                      downloadOfficialPdf(
                        'vision_inspect',
                        `Quality & HS Inspection Dossier - ${visionResult.product_name}`,
                        `Standard: ${visionResult.aql_standard} | HS Code: ${visionResult.hs_code_8digit}`,
                        [
                          ['Product Name', visionResult.product_name],
                          ['Bangladesh Customs HS Code', visionResult.hs_code_8digit],
                          ['Destination Market & Tariff', `${visionResult.target_market} - ${visionResult.tariff_treatment}`],
                          ['Export Readiness Score', `${visionResult.export_readiness_score}/100 (${visionResult.export_grade})`],
                          ['Batch & Sample Size', `${visionResult.batch_size_units} units (ISO Sample: ${visionResult.iso_sample_size} units)`],
                          ['Defect Screening', `Critical: 0, Major: ${visionResult.defects.major_found}/${visionResult.defects.major_limit}, Minor: ${visionResult.defects.minor_found}/${visionResult.defects.minor_limit}`],
                          ['Executive Summary', visionResult.summary_en],
                        ]
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    {isBn ? 'অফিশিয়াল PDF রিপোর্ট ডাউনলোড' : 'Download Official PDF Report'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE 2: AUTONOMOUS SUPPLY CHAIN & SHIPPING ROUTE PREDICTOR
      ===================================================================== */}
      {activeTab === 'supply' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input Form */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ship className="w-5 h-5 text-emerald-600" />
              {isBn ? 'শিপমেন্ট ও বন্দর প্যারামিটার' : 'Shipment & Corridor Parameters'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'গন্তব্য সমুদ্রবন্দর (Destination Port)' : 'Destination Port'}
                </label>
                <select
                  value={supplyPort}
                  onChange={(e) => setSupplyPort(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Rotterdam">Rotterdam (Netherlands / EU)</option>
                  <option value="Hamburg">Hamburg (Germany / EU)</option>
                  <option value="Felixstowe">Felixstowe (United Kingdom)</option>
                  <option value="Tokyo">Tokyo Port (Japan)</option>
                  <option value="Jeddah">Jeddah Islamic Port (Saudi Arabia)</option>
                  <option value="LosAngeles">Port of Los Angeles (USA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'কন্টেইনার সংখ্যা (TEU)' : 'Containers (TEU)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={supplyTeu}
                    onChange={(e) => setSupplyTeu(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পছন্দের ইনকোটার্ম' : 'Preferred Incoterm'}
                  </label>
                  <select
                    value={supplyIncoterm}
                    onChange={(e) => setSupplyIncoterm(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="FOB">FOB Chattogram</option>
                    <option value="CIF">CIF Destination</option>
                    <option value="CFR">CFR Destination</option>
                    <option value="DDP">DDP Buyer Warehouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'মোট কার্গো মূল্য (USD)' : 'Total Cargo Value (USD)'}
                </label>
                <input
                  type="number"
                  min={1000}
                  value={supplyCargoUsd}
                  onChange={(e) => setSupplyCargoUsd(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                disabled={supplyLoading}
                onClick={() => runSupplyChainRisk()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {supplyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                {isBn ? 'সমুদ্রপথ ও বন্দর ঝুঁকি বিশ্লেষণ করুন' : 'Simulate Maritime Routes & Risk'}
              </button>
            </div>
          </div>

          {/* Right Output Card */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            {supplyResult ? (
              <>
                {/* Chattogram Port Status Banner */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {supplyResult.chattogram_port_status.origin_port}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {isBn
                        ? supplyResult.chattogram_port_status.congestion_note_bn
                        : supplyResult.chattogram_port_status.congestion_note_en}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">{isBn ? 'বার্থ লোড' : 'Berth Load'}</div>
                      <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        {supplyResult.chattogram_port_status.berth_occupancy_pct}%
                      </div>
                    </div>
                    <div className="text-center px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">{isBn ? 'কাস্টমস সময়' : 'ASYCUDA'}</div>
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {supplyResult.chattogram_port_status.customs_asycuda_clearance_hours}h
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Corridor Cards */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isBn
                      ? `চট্টগ্রাম থেকে ${supplyResult.destination_port} (${supplyResult.distance_nautical_miles} নটিক্যাল মাইল) - ৩টি বিকল্প সমুদ্রপথ তুলনা`
                      : `Chattogram to ${supplyResult.destination_port} (${supplyResult.distance_nautical_miles} NM) - 3 Maritime Corridors`}
                  </h3>

                  <div className="space-y-3">
                    {supplyResult.routes.map((rt: any) => (
                      <div
                        key={rt.route_id}
                        className={`p-4 rounded-xl border transition-all ${
                          rt.recommended
                            ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {isBn ? rt.name_bn : rt.name_en}
                            </span>
                            {rt.recommended && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                                {isBn ? 'প্রস্তাবিত রুট' : 'Recommended'}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rt.risk_level === 'LOW'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : rt.risk_level === 'MODERATE'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            Risk: {rt.risk_level}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">
                              {isBn ? 'ট্রানজিট সময়' : 'Transit Time'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {rt.transit_days} {isBn ? 'দিন' : 'days'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">
                              {isBn ? 'মোট ফ্রেইট ব্যয়' : 'Ocean Freight'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              USD {rt.freight_total_usd.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">
                              {isBn ? 'অন-টাইম সম্ভাবনা' : 'On-Time Reliability'}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              {rt.on_time_probability_pct}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">
                              {isBn ? 'ভয়েজ কার্বন (CBAM)' : 'Voyage CO2e'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {rt.co2_kg_total} kg
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                          {isBn ? rt.notes_bn : rt.notes_en}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incoterm Advisory */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {isBn ? supplyResult.incoterm_advice_bn : supplyResult.incoterm_advice_en}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => speakSummary(supplyResult.summary_bn, supplyResult.summary_en)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    {speaking
                      ? isBn
                        ? 'ভয়েস থামান'
                        : 'Stop Audio'
                      : isBn
                      ? 'বাংলায় রুট বিশ্লেষণ শুনুন'
                      : 'Listen Corridor Summary'}
                  </button>

                  <button
                    type="button"
                    disabled={downloadingPdf}
                    onClick={() =>
                      downloadOfficialPdf(
                        'supply_chain_risk',
                        `Maritime Supply Chain & Route Dossier - ${supplyResult.destination_port}`,
                        `Origin: Chattogram Port (BDCGP) | Volume: ${supplyResult.containers_teu} TEU | Incoterm: ${supplyResult.preferred_incoterm}`,
                        [
                          ['Destination Port', `${supplyResult.destination_port} (${supplyResult.destination_country})`],
                          ['Chattogram Berth Load', `${supplyResult.chattogram_port_status.berth_occupancy_pct}% (ASYCUDA Clearance: ${supplyResult.chattogram_port_status.customs_asycuda_clearance_hours}h)`],
                          ['Recommended Corridor', supplyResult.recommended_route.name_en],
                          ['Estimated Transit & Freight', `${supplyResult.recommended_route.transit_days} days | USD ${supplyResult.recommended_route.freight_total_usd}`],
                          ['Schedule Reliability', `${supplyResult.recommended_route.on_time_probability_pct}%`],
                          ['Incoterm Advisory', supplyResult.incoterm_advice_en],
                        ]
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    {isBn ? 'লজিস্টিকস PDF রিপোর্ট ডাউনলোড' : 'Download Corridor PDF Report'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE 3: EXPORT FINANCE & BANGLADESH BANK CREDIT SCORING ENGINE
      ===================================================================== */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input Form */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              {isBn ? 'মাস্টার এলসি ও ব্যাংকিং তথ্য' : 'Master LC & Banking Inputs'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'রপ্তানি খাত (Export Sector)' : 'Export Sector'}
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    const nextPreset = QUICK_PRESETS.find((p) => p.id === (e.target.value as SectorKey));
                    if (nextPreset) applyPreset(nextPreset);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="jute">{isBn ? 'পাট ও পাটজাত পণ্য (Max BTB 50%)' : 'Jute Products (Max BTB 50%)'}</option>
                  <option value="garments">{isBn ? 'তৈরি পোশাক ও ডেনিম (Max BTB 70%)' : 'RMG & Denim (Max BTB 70%)'}</option>
                  <option value="leather">{isBn ? 'চামড়া ও ফুটওয়্যার (Max BTB 60%)' : 'Leather & Footwear (Max BTB 60%)'}</option>
                  <option value="ceramics">{isBn ? 'সিরামিক টেবিলওয়্যার (Max BTB 60%)' : 'Ceramic Tableware (Max BTB 60%)'}</option>
                  <option value="agro">{isBn ? 'প্রক্রিয়াজাত কৃষিপণ্য (Max BTB 45%)' : 'Agro-Processing (Max BTB 45%)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'মাস্টার এলসি মূল্য (Master LC Value USD)' : 'Master LC Value (USD)'}
                </label>
                <input
                  type="number"
                  min={1000}
                  value={finMasterLcUsd}
                  onChange={(e) => setFinMasterLcUsd(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>{isBn ? 'কাঁচামাল আমদানি (Back-to-Back LC %)' : 'Raw Material Import (BTB LC %)'}</span>
                  <span className="text-emerald-600 font-bold">{finBtbPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={finBtbPct}
                  onChange={(e) => setFinBtbPct(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পূর্ববর্তী সফল শিপমেন্ট' : 'Past Export Orders'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={finPastOrders}
                    onChange={(e) => setFinPastOrders(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'উৎপাদন লিড টাইম (দিন)' : 'Lead Time (Days)'}
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={finLeadDays}
                    onChange={(e) => setFinLeadDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finHasErc}
                  onChange={(e) => setFinHasErc(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
                <span>{isBn ? 'নবায়নকৃত ERC, IRC এবং UD সনদ আছে' : 'Valid ERC, IRC & UD Certificates Active'}</span>
              </label>

              <button
                type="button"
                disabled={finLoading}
                onClick={() => runExportFinanceScore()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {finLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                {isBn ? 'বাংলাদেশ ব্যাংক ক্রেডিট স্কোর গণনা করুন' : 'Calculate BB Credit & BTB Eligibility'}
              </button>
            </div>
          </div>

          {/* Right Output Card */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            {finResult ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {finResult.circular_reference}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {isBn
                        ? 'এক্সপোর্ট ফাইন্যান্স, ব্যাক-টু-ব্যাক এলসি ও নগদ সহায়তা স্কোরকার্ড'
                        : 'Export Finance, Back-to-Back LC & Cash Incentive Scorecard'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">{isBn ? 'ব্যাংক রেডিনেস স্কোর' : 'Bank Credit Score'}</div>
                      <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {finResult.credit_readiness_score}/100
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      {finResult.credit_tier}
                    </span>
                  </div>
                </div>

                {!finResult.btb_within_bb_limit && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      {isBn
                        ? `সতর্কতা: কাঁচামাল আমদানি হার অনুমোদিত সীমা (${finResult.max_btb_lc_pct}%) অতিক্রম করেছে`
                        : `Notice: Raw material import exceeds permitted Back-to-Back LC ceiling (${finResult.max_btb_lc_pct}%)`}
                    </div>
                    <p>
                      {isBn
                        ? `অতিরিক্ত আমদানি মূল্য USD ${finResult.btb_excess_margin_usd.toLocaleString()} নিজস্ব তহবিল বা ERQ হিসাব থেকে পরিশোধ করতে হবে এবং ন্যূনতম ${finResult.min_domestic_value_addition_pct}% দেশীয় মূল্য সংযোজন পূরণ না হওয়া পর্যন্ত নগদ সহায়তা (USD ${finResult.potential_cash_incentive_if_compliant_usd.toLocaleString()}) প্রযোজ্য হবে না।`
                        : `Excess import value of USD ${finResult.btb_excess_margin_usd.toLocaleString()} must be funded via exporter equity/ERQ margin. Cash incentive (USD ${finResult.potential_cash_incentive_if_compliant_usd.toLocaleString()}) is suspended until domestic value addition reaches at least ${finResult.min_domestic_value_addition_pct}%.`}
                    </p>
                  </div>
                )}

                {/* Financial Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? 'অনুমোদিত BTB এলসি সীমা' : 'Max Allowed BTB LC'}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      USD {finResult.max_allowed_btb_lc_usd.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Max {finResult.max_btb_lc_pct}% of FOB
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? 'নিট বৈদেশিক মুদ্রা অর্জন' : 'Net FX Retention'}
                    </div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      USD {finResult.net_foreign_exchange_retention_usd.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Value Addition: {finResult.domestic_value_addition_pct}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? `সরকারি নগদ সহায়তা (${finResult.cash_incentive_rate_pct}%)` : `Cash Incentive (${finResult.cash_incentive_rate_pct}%)`}
                    </div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      USD {finResult.projected_cash_incentive_usd.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      BDT {finResult.projected_cash_incentive_bdt.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? 'EDF অর্থায়ন ও সুদ ব্যয়' : 'EDF Loan & Interest'}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      USD {finResult.edf_loan_principal_usd.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Est. Interest: USD {finResult.edf_estimated_interest_usd} ({finResult.edf_interest_rate_pct}%)
                    </div>
                  </div>
                </div>

                {/* Banking Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isBn ? 'এডি (AD) ব্যাংক ডকুমেন্টারি যাচাই তালিকা' : 'Authorized Dealer (AD) Bank Verification Checklist'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {finResult.banking_checklist.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/40 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                          {c.status === 'ACTION_REQUIRED' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <span>{isBn ? c.item_bn : c.item_en}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'ACTION_REQUIRED'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => speakSummary(finResult.summary_bn, finResult.summary_en)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    {speaking
                      ? isBn
                        ? 'ভয়েস থামান'
                        : 'Stop Audio'
                      : isBn
                      ? 'বাংলায় ব্যাংকিং সামারি শুনুন'
                      : 'Listen Finance Summary'}
                  </button>

                  <button
                    type="button"
                    disabled={downloadingPdf}
                    onClick={() =>
                      downloadOfficialPdf(
                        'export_finance_score',
                        'Bangladesh Bank Export Finance & Back-to-Back LC Assessment',
                        finResult.circular_reference,
                        [
                          ['Master LC Value', `USD ${finResult.master_lc_value_usd.toLocaleString()}`],
                          ['Requested vs Max Back-to-Back LC', `USD ${finResult.requested_btb_lc_usd.toLocaleString()} / Max USD ${finResult.max_allowed_btb_lc_usd.toLocaleString()}`],
                          ['Domestic Value Addition', `${finResult.domestic_value_addition_pct}% (Min Required: ${finResult.min_domestic_value_addition_pct}%)`],
                          ['Net Foreign Exchange Retention', `USD ${finResult.net_foreign_exchange_retention_usd.toLocaleString()}`],
                          ['Projected Cash Incentive', `USD ${finResult.projected_cash_incentive_usd.toLocaleString()} (BDT ${finResult.projected_cash_incentive_bdt.toLocaleString()})`],
                          ['Bank Credit Readiness Score', `${finResult.credit_readiness_score}/100 (${finResult.credit_tier})`],
                        ]
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    {isBn ? 'ব্যাংকিং ক্রেডিট ডসিয়ার (PDF)' : 'Download Banking Dossier PDF'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE 4: MULTI-LANGUAGE BUYER NEGOTIATION & AUTO-CONTRACT GENERATOR
      ===================================================================== */}
      {activeTab === 'negotiate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input Form */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-5 h-5 text-emerald-600" />
              {isBn ? 'বায়ারের ভাষা ও দরপত্রের শর্ত' : 'Buyer Language & Deal Terms'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বায়ারের ভাষা নির্বাচন করুন' : 'Select Buyer Native Language'}
              </label>
              <select
                value={negLang}
                onChange={(e) => setNegLang(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              >
                <option value="de">German (Deutsch - Germany/Austria/EU)</option>
                <option value="ja">Japanese (Nihongo - Japan)</option>
                <option value="ar">Arabic (Al-Arabiyyah - Saudi/UAE/GCC)</option>
                <option value="fr">French (Francais - France/Belgium/Canada)</option>
                <option value="en">English (Global Trade Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বায়ার কোম্পানির নাম' : 'Buyer Company Name'}
              </label>
              <input
                type="text"
                value={negBuyerCompany}
                onChange={(e) => setNegBuyerCompany(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'পণ্যের নাম' : 'Product Name'}
                </label>
                <input
                  type="text"
                  value={negProduct}
                  onChange={(e) => setNegProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'এইচএস কোড' : 'HS Code'}
                </label>
                <input
                  type="text"
                  value={negHsCode}
                  onChange={(e) => setNegHsCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'বায়ারের প্রস্তাব (USD)' : 'Buyer Offer (USD)'}
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={negBuyerOffer}
                  onChange={(e) => setNegBuyerOffer(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ফ্যাক্টরি টার্গেট (USD)' : 'Factory Target (USD)'}
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={negFactoryTarget}
                  onChange={(e) => setNegFactoryTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অর্ডার পরিমাণ (Units)' : 'Order Quantity'}
                </label>
                <input
                  type="number"
                  min={100}
                  value={negQty}
                  onChange={(e) => setNegQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ইনকোটার্ম ২০২০' : 'Incoterm 2020'}
                </label>
                <select
                  value={negIncoterm}
                  onChange={(e) => setNegIncoterm(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="FOB Chattogram">FOB Chattogram</option>
                  <option value="CIF Rotterdam">CIF Rotterdam</option>
                  <option value="CIF Tokyo">CIF Tokyo</option>
                  <option value="CIF Jeddah">CIF Jeddah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বায়ারের মেসেজ বা শর্ত' : 'Buyer Inquiry / Terms Message'}
              </label>
              <textarea
                rows={2}
                value={negBuyerMsg}
                onChange={(e) => setNegBuyerMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              disabled={negLoading}
              onClick={() => runNegotiateContract()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {negLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isBn ? 'বহুভাষিক পিচ ও চুক্তিপত্র তৈরি করুন' : 'Generate Native Pitch & Sales Contract'}
            </button>
          </div>

          {/* Right Output Card */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            {negResult ? (
              <>
                {/* Price Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      {isBn ? 'প্রস্তাবিত কাউন্টার-অফার (FOB)' : 'Recommended Counter-Offer'}
                    </div>
                    <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                      USD {negResult.recommended_counter_fob_usd.toFixed(2)} / unit
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? 'মোট চুক্তিমূল্য (Total Value)' : 'Total Contract Value'}
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      USD {negResult.total_contract_value_usd.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">
                      {isBn ? 'রক্ষা পাওয়া অতিরিক্ত মার্জিন' : 'Protected Margin Gain'}
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      +USD {negResult.margin_gain_over_buyer_offer_usd.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Native Buyer Pitch Box */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {isBn
                        ? `বায়ারকে পাঠানোর মেসেজ (${negResult.language_name_bn})`
                        : `Outbound Buyer Counter-Offer (${negResult.language_name_en})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyNativePitch(negResult.native_buyer_pitch)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500"
                    >
                      {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPitch ? (isBn ? 'কপি হয়েছে' : 'Copied') : isBn ? 'মেসেজ কপি করুন' : 'Copy Pitch'}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {negResult.native_buyer_pitch}
                  </pre>
                </div>

                {/* Bangla Strategic Briefing */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {negResult.bangla_strategy_explanation}
                  </pre>
                </div>

                {/* Bilingual Contract Clauses */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {negResult.contract_heading}
                  </h4>
                  <div className="space-y-2">
                    {negResult.contract_clauses.map((cl: any) => (
                      <div
                        key={cl.clause_no}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30"
                      >
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {cl.clause_no}: {isBn ? cl.title_bn : cl.title_en}
                        </div>
                        <div className="text-xs text-slate-800 dark:text-slate-200 mt-1">{cl.body_en}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cl.body_bn}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => speakSummary(negResult.summary_bn, negResult.summary_en)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    {speaking
                      ? isBn
                        ? 'ভয়েস থামান'
                        : 'Stop Audio'
                      : isBn
                      ? 'বাংলায় চুক্তির সারাংশ শুনুন'
                      : 'Listen Contract Summary'}
                  </button>

                  <button
                    type="button"
                    disabled={downloadingPdf}
                    onClick={() =>
                      downloadOfficialPdf(
                        'negotiate_contract',
                        negResult.contract_heading,
                        `Buyer: ${negResult.buyer_company} | Product: ${negResult.product_name} (HS ${negResult.hs_code})`,
                        [
                          ['Buyer Counterparty', negResult.buyer_company],
                          ['Commodity & HS Code', `${negResult.product_name} (HS ${negResult.hs_code})`],
                          ['Order Quantity', `${negResult.quantity_units.toLocaleString()} Units`],
                          ['Agreed Unit Price & Incoterm', `USD ${negResult.recommended_counter_fob_usd.toFixed(2)} (${negResult.incoterm}, Incoterms 2020)`],
                          ['Total Contract Value', `USD ${negResult.total_contract_value_usd.toLocaleString()}`],
                          ['Payment Security', '100% Irrevocable Letter of Credit at Sight (ICC UCP 600)'],
                          ['Inspection Standard', 'ISO 2859-1 (AQL 2.5 Major / 4.0 Minor) Pre-Shipment Inspection'],
                          ['Native Counter-Offer Pitch', negResult.native_buyer_pitch],
                        ]
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    {isBn ? 'অফিশিয়াল বিক্রয় চুক্তিপত্র (PDF)' : 'Download Sales Contract PDF'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeIntelligenceHub;
