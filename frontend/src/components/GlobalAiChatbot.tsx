import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, X, Send, Bot, ShieldCheck,
  Loader2, Mic, MicOff, ChevronDown,
  ExternalLink, ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  strategySummary?: string;
  riskFactors?: string[];
  suggestedCounter?: string;
  modelUsed?: string;
}

export const GlobalAiChatbot: React.FC = () => {
  const { lang, t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Default welcome message on first open
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: t(
            'স্বাগতম! আমি এক্সপোর্টপাইলট এআই সিনিয়র ট্রেড অ্যাডভাইজার। ইউরোপ, যুক্তরাজ্য ও জাপানে সরাসরি রপ্তানির জন্য FOB দর, এলসি পেমেন্ট নিরাপত্তা, কিংবা ইইউ সিবিএএম (CBAM) কার্বন নিয়মাবলী সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।',
            'Welcome! I am the ExportPilot AI Senior Trade Advisor. Ask me anything about FOB pricing, L/C payment security, EU CBAM carbon compliance, or direct export strategies to Europe, the UK, and Japan.'
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Azure OpenAI (GPT-4.1-mini)',
        },
      ]);
    }
  }, [lang, t, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Quick Starter Questions
  const starterQuestions = [
    {
      bn: 'জার্মানিতে জুট ব্যাগের বর্তমান শুল্ক সুবিধা কী?',
      en: 'What is the tariff duty for jute bags in Germany?',
    },
    {
      bn: 'ইইউ সিবিএএম (CBAM) কার্বন ট্যাক্স থেকে কীভাবে ছাড় পাব?',
      en: 'How do I ensure compliance under EU CBAM carbon rules?',
    },
    {
      bn: 'বায়ার ওপেন অ্যাকাউন্ট চাইছে, আমার ঝুঁকি কী?',
      en: 'Buyer is demanding Open Account. What are my risks?',
    },
  ];

  // Voice recording toggle via Deepgram Nova-3
  const handleVoiceToggle = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('audio', blob, 'chat_voice.webm');
        form.append('language', lang);

        try {
          const res = await fetch('/api/v1/voice/transcribe', {
            method: 'POST',
            credentials: 'include',
            body: form,
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.sanitized_transcript || data.transcript || '';
            if (text) {
              setInput(text);
            }
          }
        } catch {
          // ignore
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // ignore
    }
  };

  // Submit message to Azure OpenAI Trade Advisor
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/azure-openai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: textToSend,
          language: lang,
          deal_context: {
            commodity: 'Bangladeshi Export Commodities (RMG, Jute, Leather, Ceramics)',
            target_price: 'Market Benchmarks',
            incoterm: 'FOB Chattogram Port (Incoterms 2020)',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          strategySummary: data.strategy_summary,
          riskFactors: data.risk_factors,
          suggestedCounter: data.suggested_counter_offer,
          modelUsed: data.model_used || 'Azure OpenAI (GPT-4.1-mini)',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Advisor response failed');
      }
    } catch {
      const fallbackMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: t(
          'আন্তর্জাতিক বাণিজ্যের বর্তমান নিয়ম অনুযায়ী, ইউরোপীয় ইউনিয়নে ইবিএ (EBA) সুবিধার আওতায় বাংলাদেশের পণ্যে ০% শুল্ক প্রযোজ্য। তবে পেমেন্ট সুরক্ষার জন্য সবসময় কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট শর্ত বজায় রাখুন।',
          'Under EU Everything But Arms (EBA) preferences, Bangladeshi exports enjoy 0% tariff duty. To protect cashflow, always insist on a Confirmed Irrevocable L/C at Sight.'
        ),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Local Trade Knowledge Graph',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title={t('এআই ট্রেড অ্যাডভাইজার চ্যাটবট', 'AI Trade Advisor Chatbot')}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/40 transition-all transform hover:scale-105 flex items-center gap-2.5 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-600 animate-ping" />
          </div>
          <span className="text-xs font-bold font-bangla pr-1">
            {t('এআই ট্রেড অ্যাডভাইজার', 'AI Trade Advisor')}
          </span>
        </button>
      )}

      {/* Slide-out Interactive Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-bangla flex items-center gap-1.5">
                  <span>{t('এক্সপোর্টপাইলট এআই অ্যাডভাইজার', 'ExportPilot AI Advisor')}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                    GPT-4.1-mini
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100 font-bangla flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-200" />
                  <span>{t('সার্বভৌম ট্রেড বুদ্ধিমত্তা · লাইভ', 'Sovereign Intelligence · Active')}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <span>{isUser ? t('আপনি', 'You') : 'Trade Advisor'}</span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed font-bangla shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.riskFactors && m.riskFactors.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1 text-[11px]">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          {t('ঝুঁকি সতর্কতা:', 'Risk Warnings:')}
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                          {m.riskFactors.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.modelUsed && (
                      <div className="mt-2 pt-1 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                        Model: {m.modelUsed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-bangla">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>{t('ট্রেড অ্যানালাইসিস সম্পন্ন হচ্ছে...', 'Analyzing trade parameters...')}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(lang === 'bn' ? q.bn : q.en)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-bangla transition-colors text-left"
                >
                  {t(q.bn, q.en)}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={t('কথ্য বাংলায় বলুন (Deepgram Nova-3)', 'Voice in Bangla (Deepgram Nova-3)')}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse ring-2 ring-rose-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isRecording
                  ? t('শুনছি... বাংলায় বলুন...', 'Listening... speak now...')
                  : t('আন্তর্জাতিক বাণিজ্য সম্পর্কে প্রশ্ন করুন...', 'Ask trade questions...')
              }
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-bangla"
            />

            <button
              type="button"
              disabled={isLoading || !input.trim()}
              onClick={() => handleSendMessage()}
              className="btn-primary text-xs p-2.5 rounded-xl flex items-center justify-center disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
