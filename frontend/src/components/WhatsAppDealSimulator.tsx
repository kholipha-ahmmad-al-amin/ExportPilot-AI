import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, Shield, ExternalLink, Download, X, Smartphone, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  dealCard?: {
    presetId: string;
    productTitle: string;
    hsCode: string;
    fobUsd: number;
    localOfferBdt: number;
    marginSavedPct: number;
    extraProfitUsd: number;
    piiCount: number;
    actionButtons: Array<{
      titleBn: string;
      titleEn: string;
      actionUrl: string;
    }>;
  };
}

export const WhatsAppDealSimulator: React.FC = () => {
  const { lang, t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const initialMessages: WhatsAppMessage[] = [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: t(
        'স্বাগতম! ExportPilot AI মোবাইল গেটওয়েতে আপনাকে স্বাগতম। আপনি কারখানার ফ্লোর থেকে যেকোনো পণ্যের বিবরণ, পরিমাণ বা বিদ্যুৎ বিলের তথ্য বাংলায় মেসেজ করতে পারেন। আপনার ব্যক্তিগত তথ্য স্বয়ংক্রিয়ভাবে গোপন রাখা হবে।',
        'Welcome to the ExportPilot AI Mobile Gateway. Message product details, quantities, or utility questions directly. Sensitive business details are automatically redacted locally.'
      ),
      timestamp: '10:00 AM',
    },
  ];

  const [messages, setMessages] = useState<WhatsAppMessage[]>(initialMessages);

  const samplePrompts = [
    {
      labelBn: 'পাটজাত ব্যাগ (১০,০০০ পিস)',
      labelEn: 'Jute Bags (10,000 pcs)',
      text: 'আমার কাছে ১০০০০ পিস এক্সপোর্ট গ্রেড জুট ব্যাগ আছে, জার্মানির বায়ারের জন্য এফওবি রেট কত হবে?',
    },
    {
      labelBn: 'ডেনিম জ্যাকেট (৫,০০০ পিস)',
      labelEn: 'Denim Jackets (5,000 pcs)',
      text: '৫০০০ পিস ডেনিম জ্যাকেটের সরাসরি এক্সপোর্ট প্রাইস ও বায়ার তথ্য প্রয়োজন। ফোন 01712984920।',
    },
    {
      labelBn: 'লেদার বুট (৪,০০০ জোড়া)',
      labelEn: 'Leather Boots (4,000 pairs)',
      text: '৪০০০ জোড়া জেনুইন লেদার জুতার এফওবি রেট ও নগদ সহায়তা হিসেব দিন।',
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: WhatsAppMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/mobile/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: '+8801712984920',
          message_body: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: lang === 'bn' ? data.reply_text_bn : data.reply_text_en,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dealCard: {
            presetId: data.matched_preset_id,
            productTitle: lang === 'bn' ? data.product_title_bn : data.product_title_en,
            hsCode: data.hs_code_8digit,
            fobUsd: data.recommended_fob_usd,
            localOfferBdt: data.local_buyer_offer_bdt,
            marginSavedPct: data.middleman_margin_saved_pct,
            extraProfitUsd: data.estimated_extra_profit_usd,
            piiCount: data.entities_masked_count,
            actionButtons: (data.action_buttons || []).map((b: { title_bn: string; title_en: string; action_url: string }) => ({
              titleBn: b.title_bn,
              titleEn: b.title_en,
              actionUrl: b.action_url,
            })),
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const fallbackMsg: WhatsAppMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: t(
            'দুঃখিত, তথ্য প্রক্রিয়া করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।',
            'Unable to process trade query. Please try again.'
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      const errorMsg: WhatsAppMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: t('সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।', 'Network connection failed.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2.5 font-medium text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 font-bangla border border-emerald-400/30"
        aria-label="Open WhatsApp Trade Simulator"
      >
        <Smartphone className="w-4 h-4" />
        <span>{t('মোবাইল ট্রেড বট', 'WhatsApp Trade Bot')}</span>
      </button>

      {/* Simulator Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header: WhatsApp Brand Style */}
            <div className="px-4 py-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight font-bangla">
                    {t('ExportPilot AI মোবাইল ডিল রুম', 'ExportPilot AI Mobile Deal Room')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-100 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>{t('সার্বভৌম এনক্রিপ্টেড গেটওয়ে', 'Sovereign Encrypted Gateway')}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Mobile Simulator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] shrink-0">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p.text)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap transition-colors font-bangla shrink-0"
                >
                  {lang === 'bn' ? p.labelBn : p.labelEn}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-100/60 dark:bg-slate-950/40 text-xs font-bangla">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Structured Deal Card Attachment */}
                    {m.dealCard && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {m.dealCard.productTitle}
                            </span>
                            <span className="badge badge-em font-mono text-[9px]">
                              {m.dealCard.hsCode}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>FOB: ${m.dealCard.fobUsd.toFixed(2)} USD</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              +{m.dealCard.marginSavedPct}% SAVED
                            </span>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="space-y-1.5 pt-1">
                          {m.dealCard.actionButtons.map((btn, bIdx) => (
                            <a
                              key={bIdx}
                              href={btn.actionUrl}
                              className="w-full py-1.5 px-2 rounded-lg border border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                            >
                              {btn.actionUrl.includes('download') ? (
                                <Download className="w-3 h-3" />
                              ) : (
                                <ExternalLink className="w-3 h-3" />
                              )}
                              <span>{lang === 'bn' ? btn.titleBn : btn.titleEn}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{m.timestamp}</span>
                      {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span>{t('সার্বভৌম এআই বিশ্লেষণ চলছে...', 'Sovereign AI analysing...')}</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('পণ্য, পরিমাণ বা ট্রেড প্রশ্ন লিখুন...', 'Type product query or export quantity...')}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-bangla"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
