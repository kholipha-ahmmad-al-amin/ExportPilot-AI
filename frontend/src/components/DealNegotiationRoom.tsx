import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Handshake, CheckCircle2, FileText, Download, DollarSign,
  Clock, ArrowRight, MessageSquare, Send, AlertTriangle,
  Building, Globe, Copy, ExternalLink, Printer,
  RefreshCw, Lock
} from 'lucide-react';

export interface BuyerProfile {
  id: string;
  name: string;
  company: string;
  country: string;
  city: string;
  avatar: string;
  annual_import_usd: number;
  target_fob_usd: number;
  typical_moq: number;
  tariff_scheme: string;
  eori_number: string;
}

const DEFAULT_BUYERS: BuyerProfile[] = [
  {
    id: 'buyer-nordic-de',
    name: 'Markus Schneider',
    company: 'NordicEco Retail GmbH',
    country: 'Germany',
    city: 'Hamburg',
    avatar: 'MS',
    annual_import_usd: 2400000,
    target_fob_usd: 3.10,
    typical_moq: 10000,
    tariff_scheme: 'EU GSP (0% Duty)',
    eori_number: 'DE 948210344',
  },
  {
    id: 'buyer-ecomode-fr',
    name: 'Pierre Laurent',
    company: 'EcoMode Direct',
    country: 'France',
    city: 'Lyon',
    avatar: 'PL',
    annual_import_usd: 1800000,
    target_fob_usd: 3.25,
    typical_moq: 8000,
    tariff_scheme: 'EU GSP (0% Duty)',
    eori_number: 'FR 882194012',
  },
  {
    id: 'buyer-muji-jp',
    name: 'Kenji Sato',
    company: 'Muji Eco Living Corp',
    country: 'Japan',
    city: 'Tokyo',
    avatar: 'KS',
    annual_import_usd: 3100000,
    target_fob_usd: 3.50,
    typical_moq: 12000,
    tariff_scheme: 'Japan GSP (0% Duty)',
    eori_number: 'JP 771204918',
  },
  {
    id: 'buyer-sustain-uk',
    name: 'Sarah Jenkins',
    company: 'SustainWear UK Ltd',
    country: 'United Kingdom',
    city: 'Manchester',
    avatar: 'SJ',
    annual_import_usd: 2200000,
    target_fob_usd: 3.20,
    typical_moq: 15000,
    tariff_scheme: 'UK DCTS (0% Duty)',
    eori_number: 'GB 552194883',
  },
];

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'exporter' | 'advisor';
  senderName: string;
  senderRole: string;
  textBn: string;
  textEn: string;
  timestamp: string;
  isOfferChange?: boolean;
  offeredPrice?: number;
  offeredMoq?: number;
  offeredPayment?: string;
}

interface DealNegotiationRoomProps {
  initialPresetId?: string;
  productTitleBn?: string;
  productTitleEn?: string;
  recommendedFobUsd?: number;
  defaultMoq?: number;
  onDealClosed?: () => void;
}

export const DealNegotiationRoom: React.FC<DealNegotiationRoomProps> = ({
  initialPresetId = 'preset_jute_bag',
  productTitleBn = 'সাভার গোল্ডেন জুট শপিং টোট ব্যাগ',
  productTitleEn = 'Savar Golden Jute Shopping Tote Bag',
  recommendedFobUsd = 3.40,
  defaultMoq = 10000,
}) => {
  const { user, lang, t } = useAuth();

  // Active Buyer selection
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile>(DEFAULT_BUYERS[0]);

  // Negotiable Terms
  const [fobPrice, setFobPrice] = useState<number>(recommendedFobUsd);
  const [moqUnits, setMoqUnits] = useState<number>(defaultMoq);
  const [incoterm, setIncoterm] = useState<string>('FOB Chattogram Port (Incoterms 2020)');
  const [paymentTerm, setPaymentTerm] = useState<string>('100% Irrevocable L/C at Sight');
  const [deliveryLeadDays, setDeliveryLeadDays] = useState<number>(35);

  // Buyer replies in this room are a local demonstration, not a live negotiation.
  const [dealStatus, setDealStatus] = useState<'negotiating' | 'agreed' | 'draft_ready'>('negotiating');
  const [isBuyerTyping, setIsBuyerTyping] = useState<boolean>(false);
  const [copiedInvoiceNumber, setCopiedInvoiceNumber] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [draftPreparedAt, setDraftPreparedAt] = useState<string>('');
  const [draftReference, setDraftReference] = useState<string>('');

  // Initial Conversation Stream
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'buyer',
      senderName: 'Markus Schneider',
      senderRole: 'VP Global Sourcing, NordicEco Retail GmbH',
      textBn: 'আমরা আপনাদের জিওটিএস (GOTS) ও সিবিএএম (CBAM) কার্বন সার্টিফাইড পাটের ব্যাগের স্পেক দেখেছি। আমাদের প্রাথমিক প্রস্তাব: প্রতি পিস $৩.১০ FOB চট্টগ্রাম, ১০,০০০ পিস অর্ডার এবং ৬০ দিনের ওপেন একাউন্ট পেমেন্ট। আপনারা কি এই শর্তে কাজ করতে প্রস্তুত?',
      textEn: 'We reviewed your GOTS and CBAM certified golden jute bag specifications. Our initial offer: $3.10 FOB Chattogram for 10,000 units on 60 days Open Account terms. Are you able to accept this?',
      timestamp: '১০:১৫ AM',
      isOfferChange: true,
      offeredPrice: 3.10,
      offeredMoq: 10000,
      offeredPayment: '60 Days Open Account',
    },
    {
      id: 'msg-2',
      sender: 'advisor',
      senderName: 'AI ট্রেড উপদেষ্টা (Trade Advisor)',
      senderRole: 'Sovereign Export Intelligence',
      textBn: 'ঝুঁকি সতর্কতা: ৬০ দিনের ওপেন একাউন্টে সম্পূর্ণ পেমেন্ট ঝুঁকি রপ্তানিকারকের ওপর বর্তায়। কৌশলগত পরামর্শ: ১০০% কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট (L/C at Sight) দাবি করুন। দাম $৩.৩৫ প্রস্তাব করুন এবং বাংলাদেশের ০% ইইউ জিএসপি শুল্ক সুবিধা ও ১৮ দিনের ফাস্ট ফ্রেইট রুট তুলে ধরুন।',
      textEn: 'Risk Warning: 60 days Open Account places full credit risk on the exporter. Strategic Advice: Insist on 100% Irrevocable L/C at Sight. Counter at $3.35 FOB, highlighting Bangladesh zero-tariff GSP advantage and 18-day express transit route.',
      timestamp: '১০:১৬ AM',
    },
  ]);

  // Financial Calculations
  const usdToBdtRate = 119.0;
  const totalDealValueUsd = fobPrice * moqUnits;
  const totalDealValueBdt = totalDealValueUsd * usdToBdtRate;
  
  // Production Cost per unit (approx $2.14 / unit for jute bag)
  const unitCostUsd = initialPresetId === 'preset_denim_jacket' ? 9.20 : initialPresetId === 'preset_leather_boot' ? 16.50 : 2.15;
  const totalCostUsd = unitCostUsd * moqUnits;
  const netProfitUsd = Math.max(0, totalDealValueUsd - totalCostUsd);
  const netMarginPct = totalDealValueUsd > 0 ? ((netProfitUsd / totalDealValueUsd) * 100).toFixed(1) : '0';
  
  // Middleman savings (Buying houses traditionally take ~25-32% cut)
  const middlemanSavedUsd = Math.round(totalDealValueUsd * 0.28);
  const middlemanSavedBdt = Math.round(middlemanSavedUsd * usdToBdtRate);

  // Switch Buyer
  const handleBuyerChange = (buyerId: string) => {
    const b = DEFAULT_BUYERS.find(item => item.id === buyerId) || DEFAULT_BUYERS[0];
    setSelectedBuyer(b);
    setDealStatus('negotiating');
    
    // Add greetings from new buyer
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buyer',
      senderName: b.name,
      senderRole: `${b.company} (${b.city}, ${b.country})`,
      textBn: `নমস্কার! আমি ${b.company} থেকে বলছি। আমরা ${productTitleBn} এর জন্য আপনার স্পেক পেয়েছি। আমাদের টার্গেট FOB দর $${b.target_fob_usd.toFixed(2)} এবং ন্যূনতম অর্ডার ${b.typical_moq.toLocaleString()} পিস।`,
      textEn: `Hello! I am contacting you from ${b.company}. We received your specs for ${productTitleEn}. Our target FOB is $${b.target_fob_usd.toFixed(2)} with a typical MOQ of ${b.typical_moq.toLocaleString()} units.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfferChange: true,
      offeredPrice: b.target_fob_usd,
      offeredMoq: b.typical_moq,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Exporter Sends Counter-Offer or Message
  const handleSendProposal = (customText?: string, overridePrice?: number, overridePayment?: string) => {
    const priceToOffer = overridePrice ?? fobPrice;
    const paymentToOffer = overridePayment ?? paymentTerm;
    
    const textBn = customText || `আমরা প্রস্তাব করছি: প্রতি পিস $${priceToOffer.toFixed(2)} FOB চট্টগ্রাম, মোট পরিমাণ ${moqUnits.toLocaleString()} পিস এবং পেমেন্ট শর্ত ${paymentToOffer}। পণ্য সম্পূর্ণ ইইউ সিবিএএম ও পরিবেশবান্ধব মানসম্পন্ন।`;
    const textEn = customText || `We submit our counter-proposal: $${priceToOffer.toFixed(2)} FOB Chattogram for ${moqUnits.toLocaleString()} units under ${paymentToOffer} terms, fully compliant with EU CBAM & sustainability standards.`;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'exporter',
      senderName: user?.factory_name || 'সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস',
      senderRole: 'Bangladeshi Manufacturer (Exporter)',
      textBn,
      textEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfferChange: true,
      offeredPrice: priceToOffer,
      offeredMoq: moqUnits,
      offeredPayment: paymentToOffer,
    };

    setMessages(prev => [...prev, userMsg]);
    setCustomInput('');
    setIsBuyerTyping(true);

    // Simulate Buyer Thoughtful Reaction
    setTimeout(() => {
      setIsBuyerTyping(false);
      
      const isPriceAcceptable = priceToOffer <= (selectedBuyer.target_fob_usd + 0.30);
      const isPaymentSecure = paymentToOffer.includes('L/C') || paymentToOffer.includes('Advance');

      if (isPriceAcceptable && isPaymentSecure) {
        // Buyer Accepts!
        const acceptMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'buyer',
          senderName: selectedBuyer.name,
          senderRole: selectedBuyer.company,
          textBn: `চমৎকার! আপনাদের উৎপাদন মান, কার্বন কমপ্লায়েন্স ও দ্রুত লিড-টাইম বিবেচনা করে আমরা প্রতি পিস $${priceToOffer.toFixed(2)} FOB চট্টগ্রাম এবং ${paymentToOffer} শর্ত মেনে নিচ্ছি। অনুগ্রহ করে ডিজিটাল চুক্তিপত্রে স্বাক্ষর করে প্রফর্মা ইনভয়েস ইস্যু করুন। আমাদের ব্যাংক এলসি খোলার প্রক্রিয়া শুরু করবে।`,
          textEn: `Excellent! Considering your verified production standards, CBAM zero-tariff status, and reliable transit timeline, we accept $${priceToOffer.toFixed(2)} FOB Chattogram under ${paymentToOffer}. Please execute the digital contract and issue the official Proforma Invoice. Our bank will initiate the L/C immediately.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, acceptMsg]);
        setDealStatus('agreed');
      } else if (!isPaymentSecure) {
        // Buyer rejects insecure payment
        const counterMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'buyer',
          senderName: selectedBuyer.name,
          senderRole: selectedBuyer.company,
          textBn: `আমরা মূল্য বিবেচনা করতে রাজি আছি, তবে উন্মুক্ত ঋণ (Open Account) বা সুরক্ষিত এসক্রো ছাড়া নগদ অর্থ প্রদান সম্ভব নয়। অন্ততপক্ষে ১০০% ইরেভোকেবল এলসি অ্যাট সাইট শর্তে যেতে হবে।`,
          textEn: `We can consider the price adjustment, but we require standard trade finance security. We can agree to 100% Irrevocable L/C at Sight to protect both parties.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, counterMsg]);
      } else {
        // Buyer negotiates price slightly
        const counterFob = (priceToOffer - 0.10).toFixed(2);
        const counterMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'buyer',
          senderName: selectedBuyer.name,
          senderRole: selectedBuyer.company,
          textBn: `আপনাদের প্রস্তাবের জন্য ধন্যবাদ। আমাদের ব্যবস্থাপনা কমিটি প্রতি পিস সর্বোচ্চ $${counterFob} FOB চট্টগ্রাম পর্যন্ত অনুমোদন দিতে প্রস্তুত। যদি আপনারা এই দরে রাজি হন, তবে আমরা অবিলম্বে চুক্তি স্বাক্ষর করতে পারি।`,
          textEn: `Thank you for your proposal. Our sourcing board can approve up to $${counterFob} FOB Chattogram. If you can meet us at this final level, we will execute the binding contract immediately.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, counterMsg]);
      }
    }, 1800);
  };

  // Prepare a local draft preview. No signatures or bank instructions are sent.
  const handlePrepareDraft = () => {
    const todayStr = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const reference = `PI-DRAFT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    setDraftPreparedAt(todayStr);
    setDraftReference(reference);
    setDealStatus('draft_ready');

    const draftNotice: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'advisor',
      senderName: 'ড্রাফট প্রস্তুত',
      senderRole: 'For review',
      textBn: `শর্তাবলির একটি খসড়া তৈরি হয়েছে (${reference})। এটি কোনো স্বাক্ষরিত চুক্তি নয় এবং কোনো ব্যাংকে পাঠানো হয়নি। বায়ার ও রপ্তানিকারকের অনুমোদনের আগে তথ্য যাচাই করুন।`,
      textEn: `A draft term sheet is ready (${reference}). It is not a signed contract and has not been sent to a bank. Review the details with the buyer before issuing documents.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, draftNotice]);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* Deal Room Header & Live Counterparties                          */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-em flex items-center gap-1">
                <Handshake className="w-3.5 h-3.5" />
                <span>{t('ডিলের শর্ত পর্যালোচনা', 'Deal Term Preview')}</span>
              </span>
              <span className="badge badge-gold">
                {t('নমুনা বায়ার', 'Sample buyer')}
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" />
                {t('ডিলের খসড়া কর্মক্ষেত্র', 'Deal draft workspace')}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla">
              {t(productTitleBn, productTitleEn)} {t('এক্সপোর্ট ডিল ক্লোজিং', 'Export Deal Closing')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
              {t(
                'এই নমুনা বায়ারের সঙ্গে শর্ত পর্যালোচনা করুন। বায়ারের উত্তরগুলো প্রদর্শনীর জন্য তৈরি, সরাসরি পাঠানো হয় না।',
                'Review draft terms with this sample buyer. Replies are simulated for demonstration and are not sent to a real buyer.'
              )}
            </p>
          </div>

          {/* Deal Status Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-3 rounded-xl border text-right ${
              dealStatus === 'draft_ready'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-600 dark:text-emerald-200'
                : dealStatus === 'agreed'
                ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/80 dark:border-blue-600 dark:text-blue-200'
                : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-600 dark:text-amber-200'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
                {t('ডিল স্ট্যাটাস', 'Deal Status')}
              </div>
              <div className="text-xs font-bold font-bangla flex items-center gap-1.5 justify-end mt-0.5">
                {dealStatus === 'draft_ready' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('খসড়া পর্যালোচনার জন্য প্রস্তুত', 'Draft Ready for Review')}</span>
                  </>
                ) : dealStatus === 'agreed' ? (
                  <>
                    <Handshake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('নমুনা কথোপকথনে শর্ত গৃহীত', 'Terms accepted in sample conversation')}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                    <span>{t('দরকষাকষি চলছে', 'Negotiating Terms')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Counterparties Comparison Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          
          {/* Exporter Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
                BD
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                  {user?.factory_name || t('সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ', 'Savar Golden Jute Ltd.')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                  {t('সাভার, ঢাকা - উৎপাদক ও সরাসরি রপ্তানিকারক', 'Savar, Dhaka - Manufacturer Exporter')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="badge badge-em text-[9px]">REX VERIFIED</span>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">HS: 4202.22.10</div>
            </div>
          </div>

          {/* Buyer Selector Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                {selectedBuyer.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {selectedBuyer.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">({selectedBuyer.city}, {selectedBuyer.country})</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                  {selectedBuyer.company}
                </div>
              </div>
            </div>

            <div className="text-right">
              <select
                value={selectedBuyer.id}
                onChange={(e) => handleBuyerChange(e.target.value)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-bangla focus:outline-none focus:border-emerald-500"
              >
                {DEFAULT_BUYERS.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.country})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {selectedBuyer.tariff_scheme}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2-Column Split: Terms Matrix & Realtime Chat                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: Interactive Commercial Term Sheet (5 Cols)     */}
        {/* ----------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
                  {t('বাণিজ্যিক শর্তাবলি ম্যাট্রিক্স (Term Sheet)', 'Commercial Term Sheet Matrix')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {t('রিয়েলটাইম হিসাব', 'Live Recalculation')}
              </span>
            </div>

            {/* Parameter 1: FOB Unit Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-bangla">
                  {t('FOB ইউনিট মূল্য (চট্টগ্রাম বন্দর):', 'FOB Unit Price (Chattogram Port):')}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  ${fobPrice.toFixed(2)} USD
                </span>
              </div>
              <input
                type="range"
                min="2.50"
                max="4.50"
                step="0.05"
                disabled={dealStatus === 'draft_ready'}
                value={fobPrice}
                onChange={(e) => {
                  setFobPrice(parseFloat(e.target.value));
                  if (dealStatus === 'agreed') setDealStatus('negotiating');
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Buyer Target: ${selectedBuyer.target_fob_usd.toFixed(2)}</span>
                <span className="text-emerald-500 font-semibold">Recommended: ${recommendedFobUsd.toFixed(2)}</span>
                <span>Max Ceiling: $4.50</span>
              </div>
            </div>

            {/* Parameter 2: Order Quantity (MOQ) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-bangla">
                  {t('অর্ডার ভলিউম / পরিমাণ (ইউনিট):', 'Order Volume / MOQ (Units):')}
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-bold text-sm">
                  {moqUnits.toLocaleString()} pcs
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5000, 10000, 20000, 50000].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    disabled={dealStatus === 'draft_ready'}
                    onClick={() => {
                      setMoqUnits(qty);
                      if (dealStatus === 'agreed') setDealStatus('negotiating');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      moqUnits === qty
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {(qty / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 3: Payment Terms */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block">
                {t('পেমেন্ট ও অর্থ পরিশোধ পদ্ধতি:', 'Payment Terms & Security:')}
              </label>
              <select
                value={paymentTerm}
                disabled={dealStatus === 'draft_ready'}
                onChange={(e) => {
                  setPaymentTerm(e.target.value);
                  if (dealStatus === 'agreed') setDealStatus('negotiating');
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bangla focus:outline-none focus:border-emerald-500"
              >
                <option value="100% Irrevocable L/C at Sight">
                  100% Irrevocable L/C at Sight (বাংলাদেশ ব্যাংক স্বীকৃত - সবচেয়ে নিরাপদ)
                </option>
                <option value="30% TT Advance + 70% against BL">
                  30% TT Advance + 70% against BL (টিটি অগ্রিম ও বিল অব লেডিং)
                </option>
                <option value="UPAS L/C 60 Days (Bank Guaranteed)">
                  UPAS L/C 60 Days (ব্যাংক গ্যারান্টিযুক্ত ইউপাস এলসি)
                </option>
                <option value="60 Days Open Account (High Risk)">
                  60 Days Open Account (উচ্চ ঝুঁকি - সুপারিশ করা হয় না)
                </option>
              </select>
            </div>

            {/* Parameter 4: Incoterm & Lead Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block">
                  {t('বাণিজ্য শর্ত (Incoterm):', 'Incoterm 2020:')}
                </label>
                <select
                  value={incoterm}
                  disabled={dealStatus === 'draft_ready'}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="FOB Chattogram Port (Incoterms 2020)">FOB Chattogram (Port)</option>
                  <option value="CIF Hamburg (Port of Discharge)">CIF Hamburg (Sea)</option>
                  <option value="CFR Rotterdam">CFR Rotterdam (Sea)</option>
                  <option value="FCA Dhaka Airport (Air Freight)">FCA Dhaka Airport (Air)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla block">
                  {t('শিপমেন্ট সময় (লিড টাইম):', 'Shipment Lead Time:')}
                </label>
                <select
                  value={deliveryLeadDays}
                  disabled={dealStatus === 'draft_ready'}
                  onChange={(e) => setDeliveryLeadDays(parseInt(e.target.value, 10))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-bangla focus:outline-none focus:border-emerald-500"
                >
                  <option value={30}>৩০ দিন (L/C খোলার পর)</option>
                  <option value={35}>৩৫ দিন (L/C খোলার পর - আদর্শ)</option>
                  <option value={45}>৪৫ দিন (L/C খোলার পর)</option>
                  <option value={60}>৬০ দিন (বৃহৎ চালান)</option>
                </select>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-950 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-bangla">
                  {t('মোট রপ্তানি মূল্য (Total Deal Value):', 'Total Shipment FOB Value:')}
                </span>
                <span className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                  ${totalDealValueUsd.toLocaleString()} USD
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla flex justify-between">
                <span>{t('স্থানীয় মুদ্রায় রূপান্তর (১ USD = ৳১১৯):', 'Equivalent in BDT (1 USD = ৳119):')}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  ৳{Math.round(totalDealValueBdt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px]">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-bangla">{t('কারখানার নিট মার্জিন:', 'Factory Net Margin:')}</span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {netMarginPct}% (${Math.round(netProfitUsd).toLocaleString()})
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-bangla">{t('দালালমুক্ত অতিরিক্ত লাভ:', 'Direct Gain Saved:')}</span>
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    +${middlemanSavedUsd.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: Push Proposal to Chat */}
            {dealStatus === 'negotiating' && (
              <button
                type="button"
                onClick={() => handleSendProposal()}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 font-bangla shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('কাউন্টার অফারের নমুনা দেখুন', 'Preview Counteroffer')}</span>
              </button>
            )}

            {dealStatus === 'agreed' && (
              <button
                type="button"
                onClick={handlePrepareDraft}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 font-bangla shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{t('প্রফর্মা ইনভয়েসের খসড়া তৈরি করুন', 'Prepare Invoice Draft')}</span>
              </button>
            )}

            {dealStatus === 'draft_ready' && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 font-bangla flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('খসড়াটি তৈরি হয়েছে, অনুমোদন বাকি', 'Draft prepared, approvals pending')}
                </span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                  {draftReference}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: Live Negotiation Chat & Documents (7 Cols)   */}
        {/* ----------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[640px]">
            
            {/* Chat Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
                  {t('সরাসরি বায়ার নেগোসিয়েশন ডায়ালগ', 'Live Buyer Dialogue & Trade Chat')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-slate-500 font-bangla">
                  {selectedBuyer.name} ({t('অনলাইন', 'Online')})
                </span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {messages.map((m) => {
                const isBuyer = m.sender === 'buyer';
                const isExporter = m.sender === 'exporter';
                const isAdvisor = m.sender === 'advisor';

                if (isAdvisor) {
                  return (
                    <div key={m.id} className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5 shadow-sm text-xs">
                      <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold font-bangla">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {m.senderName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-bangla leading-relaxed">
                        {lang === 'bn' ? m.textBn : m.textEn}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isExporter ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <span>{m.senderName}</span>
                      <span>-</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-bangla shadow-sm ${
                        isExporter
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{lang === 'bn' ? m.textBn : m.textEn}</p>
                      
                      {m.isOfferChange && (
                        <div className={`mt-2 pt-2 border-t text-[11px] font-mono grid grid-cols-2 gap-2 ${
                          isExporter ? 'border-emerald-500/50 text-emerald-100' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {m.offeredPrice && <div>FOB Price: ${m.offeredPrice.toFixed(2)}</div>}
                          {m.offeredMoq && <div>Quantity: {m.offeredMoq.toLocaleString()} pcs</div>}
                          {m.offeredPayment && <div className="col-span-2">Payment: {m.offeredPayment}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isBuyerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bangla italic py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>{selectedBuyer.name} {t('উত্তর লিখছেন...', 'is typing a reply...')}</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips */}
            {dealStatus === 'negotiating' && (
              <div className="py-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendProposal(undefined, 3.35, '100% Irrevocable L/C at Sight')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bangla transition-colors"
                >
                  {t('কাউন্টার অফার: $৩.৩৫ FOB + ১০০% L/C at Sight', 'Counter: $3.35 FOB + 100% L/C at Sight')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendProposal(
                    lang === 'bn'
                      ? 'আমাদের পণ্যের ইউরোপীয় ইউনিয়নের আরইএক্স (REX) ০% শুল্কমুক্ত সুবিধা রয়েছে এবং সিবিএএম স্কোপ-২ কার্বন নির্গমন ইউরোপীয় মানদণ্ডের চেয়ে ৩৫% কম।'
                      : 'Our shipment qualifies for 0% EU GSP duty under REX and our CBAM Scope-2 carbon intensity is 35% below the EU threshold.'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 font-bangla transition-colors"
                >
                  {t('০% শুল্ক ও সিবিএএম কার্বন সুবিধা তুলে ধরুন', 'Highlight 0% Tariff & CBAM Advantage')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendProposal(
                    lang === 'bn'
                      ? 'আমরা চট্টগ্রাম বন্দর থেকে ৩৫ দিনের মধ্যে প্রথম চালান জাহাজে তুলতে পারব। আপনাদের কি কোনো বিশেষ লেবেলিং প্রয়োজন?'
                      : 'We can dispatch the first container from Chattogram within 35 days of LC issuance. Do you have specific barcode labeling requirements?'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-bangla transition-colors"
                >
                  {t('৩৫ দিন লিড-টাইম প্রস্তাব করুন', 'Propose 35-Day Delivery Timeline')}
                </button>
              </div>
            )}

            {/* Custom Input Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <input
                type="text"
                disabled={dealStatus === 'draft_ready'}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    handleSendProposal(customInput.trim());
                  }
                }}
                placeholder={t(
                  'বায়ারকে আপনার বার্তা বা কাউন্টার শর্ত লিখুন...',
                  'Type your negotiation message or custom counter-term...'
                )}
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-bangla"
              />
              <button
                type="button"
                disabled={dealStatus === 'draft_ready' || !customInput.trim()}
                onClick={() => {
                  if (customInput.trim()) handleSendProposal(customInput.trim());
                }}
                className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 font-bangla disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('পাঠান', 'Send')}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* Draft term sheet and proforma invoice preview */}
      {/* ------------------------------------------------------------- */}
      {dealStatus === 'draft_ready' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla">
                  {t('প্রফর্মা ইনভয়েসের খসড়া', 'Proforma Invoice Draft')}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
                {t(
                  'এটি পর্যালোচনার জন্য একটি খসড়া। কোনো পক্ষ স্বাক্ষর করেনি, এবং এটি কোনো ব্যাংকে পাঠানো হয়নি।',
                  'Draft for review only. No party has signed it, and it has not been sent to a bank.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 font-bangla transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('প্রিন্ট করুন', 'Print')}</span>
              </button>
            </div>
          </div>

          {/* Draft invoice preview */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs font-mono">
            <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Document:</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">PROFORMA INVOICE DRAFT ({draftReference})</div>
                <div className="text-[11px] text-slate-500">Prepared: {draftPreparedAt}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Review required:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Confirm terms with both parties</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Loading Port: Chattogram (BDCGP)</div>
              </div>
            </div>

            {/* Spec Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 text-[11px]">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">HS Code</th>
                    <th className="py-2 text-right">Quantity</th>
                    <th className="py-2 text-right">Unit FOB</th>
                    <th className="py-2 text-right">Total Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  <tr>
                    <td className="py-2.5 font-sans font-bold">
                      {productTitleEn} (100% Eco-Friendly)
                    </td>
                    <td className="py-2.5 font-mono">4202.22.10</td>
                    <td className="py-2.5 text-right font-mono">{moqUnits.toLocaleString()} pcs</td>
                    <td className="py-2.5 text-right font-mono">${fobPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${totalDealValueUsd.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment & Delivery Clauses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block font-sans">Payment Terms:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{paymentTerm}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Delivery Terms & Incoterms:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{incoterm}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Lead Time / Shipment:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{deliveryLeadDays} days from L/C advising</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Trade Scheme:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedBuyer.tariff_scheme}</span>
              </div>
            </div>

            {/* Approval status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 font-sans">
              <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                <div className="text-amber-900 dark:text-amber-200 text-xs font-bold">
                  {t('রপ্তানিকারকের অনুমোদন বাকি', 'Exporter approval pending')}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  {user?.factory_name || t('কারখানার নাম যোগ করুন', 'Add factory name')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                <div className="text-amber-900 dark:text-amber-200 text-xs font-bold">
                  {t('বায়ারের অনুমোদন বাকি', 'Buyer approval pending')}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  {selectedBuyer.company} ({selectedBuyer.city}, {selectedBuyer.country})
                </div>
              </div>
            </div>

          </div>

          {/* 3 Download Links */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla block">
              {t('ডাউনলোডযোগ্য অফিশিয়াল রপ্তানি নথি:', 'Downloadable Official Export Documents:')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={`/api/v1/reports/download/proforma_invoice/${initialPresetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 font-bangla">
                    {t('প্রফর্মা ইনভয়েসের নমুনা PDF', 'Sample Proforma Invoice PDF')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {draftReference} (PDF)
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href={`/api/v1/reports/download/cbam_certificate/${initialPresetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('কার্বন হিসাবের প্রতিবেদন', 'Carbon Calculation Report')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {t('হিসাবের ভিত্তি যাচাই করুন', 'Review calculation inputs')} (PDF)
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href={`/api/v1/reports/download/buyer_catalog/${initialPresetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('এলসি ড্রাফট অ্যাপ্লিকেশন গাইড', 'L/C Application Guide for Bank')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Sonali / Deutsche Bank (PDF)
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
