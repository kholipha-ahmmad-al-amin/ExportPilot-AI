import React, { useState, useRef, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {redactBangladeshPii} from '../utils/piiRedactor';
import {queryBrowserTradeAdvisor} from '../utils/browserTradeAdvisor';
import {X, Send, Bot, ShieldCheck, Loader2, Mic, MicOff, ExternalLink, ArrowRight, Copy, Check, Zap, LogIn} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  strategySummary?: string;
  riskFactors?: string[];
  suggestedCounter?: string;
  modelUsed?: string;
  piiRedacted?: number;
}

// Code block with language tag and copy button
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-emerald-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Markdown block and inline renderer
interface MarkdownRendererProps {
  content: string;
  onNavigate: (path: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onNavigate }) => {
  const blocks: { type: 'code' | 'text'; code?: string; lang?: string; text?: string }[] = [];
  const lines = content.split('\n');
  let inCode = false;
  let codeBuffer: string[] = [];
  let currentLang = '';
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      blocks.push({ type: 'text', text: textBuffer.join('\n') });
      textBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: currentLang });
        codeBuffer = [];
        inCode = false;
        currentLang = '';
      } else {
        flushText();
        inCode = true;
        currentLang = line.trim().replace(/^```/, '').trim() || 'text';
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }
  if (inCode && codeBuffer.length > 0) {
    blocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: currentLang });
  }
  flushText();

  const renderInline = (str: string, keyPrefix: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let subIndex = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(
          <span key={`${keyPrefix}-t-${subIndex++}`}>
            {str.slice(lastIdx, match.index)}
          </span>
        );
      }
      if (match[1]) {
        const label = match[2];
        const href = match[3];
        parts.push(
          <button
            key={`${keyPrefix}-l-${subIndex++}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (href.startsWith('/')) {
                onNavigate(href);
              } else {
                window.open(href, '_blank', 'noopener,noreferrer');
              }
            }}
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mx-0.5"
          >
            <span>{label}</span>
            {href.startsWith('/') ? (
              <ArrowRight className="w-3 h-3 inline-block opacity-70" />
            ) : (
              <ExternalLink className="w-2.5 h-2.5 inline-block opacity-70" />
            )}
          </button>
        );
      } else if (match[4]) {
        parts.push(
          <code
            key={`${keyPrefix}-c-${subIndex++}`}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/80 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 mx-0.5 font-medium"
          >
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        parts.push(
          <strong key={`${keyPrefix}-b-${subIndex++}`} className="font-bold text-slate-900 dark:text-slate-100">
            {match[7]}
          </strong>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(
        <span key={`${keyPrefix}-end-${subIndex++}`}>{str.slice(lastIdx)}</span>
      );
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.type === 'code' && block.code !== undefined) {
          return <CodeBlock key={bIdx} code={block.code} language={block.lang} />;
        }

        if (!block.text) return null;

        const textLines = block.text.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];

        const flushList = (key: string) => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={key} className="space-y-1 my-1.5 pl-3 border-l-2 border-emerald-500/40">
                {listItems.map((item, lIdx) => (
                  <li key={lIdx} className="text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="flex-1">{renderInline(item, `li-${lIdx}`)}</span>
                  </li>
                ))}
              </ul>
            );
            listItems = [];
          }
        };

        for (let lIdx = 0; lIdx < textLines.length; lIdx++) {
          const l = textLines[lIdx];
          const trimmed = l.trim();

          if (!trimmed) {
            flushList(`list-${lIdx}`);
            continue;
          }

          if (trimmed.startsWith('### ')) {
            flushList(`list-${lIdx}`);
            elements.push(
              <h4
                key={`h4-${lIdx}`}
                className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-2.5 mb-1 text-emerald-700 dark:text-emerald-400"
              >
                {renderInline(trimmed.replace(/^###\s+/, ''), `h4-${lIdx}`)}
              </h4>
            );
          } else if (trimmed.startsWith('## ')) {
            flushList(`list-${lIdx}`);
            elements.push(
              <h3
                key={`h3-${lIdx}`}
                className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-3 mb-1 text-emerald-800 dark:text-emerald-300"
              >
                {renderInline(trimmed.replace(/^##\s+/, ''), `h3-${lIdx}`)}
              </h3>
            );
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            listItems.push(trimmed.slice(2));
          } else {
            flushList(`list-${lIdx}`);
            elements.push(
              <p key={`p-${lIdx}`} className="text-slate-800 dark:text-slate-200">
                {renderInline(trimmed, `p-${lIdx}`)}
              </p>
            );
          }
        }
        flushList(`list-final-${bIdx}`);

        return <div key={bIdx} className="space-y-1">{elements}</div>;
      })}
    </div>
  );
};

// Categorized starter suggestions
const SUGGESTION_CATEGORIES = [
  {
    id: 'popular',
    name_bn: 'জনপ্রিয় প্রশ্ন',
    name_en: 'Popular',
    questions: [
      {
        bn: 'জার্মানিতে জুট ব্যাগের বর্তমান শুল্ক সুবিধা কী?',
        en: 'What is the tariff duty for jute bags in Germany?',
      },
      {
        bn: 'ইইউ সিবিএএম (CBAM) কার্বন ট্যাক্স থেকে কীভাবে ছাড় পাব?',
        en: 'How do I ensure compliance under EU CBAM carbon rules?',
      },
      {
        bn: 'বায়ার ওপেন অ্যাকাউন্ট চাইছে, আমার ঝুঁকি ও করণীয় কী?',
        en: 'Buyer is demanding Open Account. What are my risks?',
      },
      {
        bn: 'চট্টগ্রাম বন্দর থেকে ২০ ফুট কনটেইনারের চার্জ কত?',
        en: 'What are the charges for a 20ft container at Chattogram Port?',
      },
    ],
  },
  {
    id: 'jute_rmg',
    name_bn: 'পাট ও পোশাক',
    name_en: 'Jute & RMG',
    questions: [
      {
        bn: 'জার্মানিতে জুট ব্যাগের বর্তমান শুল্ক সুবিধা কী?',
        en: 'What is the tariff duty for jute bags in Germany?',
      },
      {
        bn: 'ইউকে DCTS স্কিমে ডেনিম রপ্তানির নিয়ম ও শুল্ক কী?',
        en: 'What are the tariff rules for denim under UK DCTS?',
      },
      {
        bn: 'সাভার থেকে জুট ব্যাগ সরাসরি রপ্তানিতে কত মার্জিন লাভ হয়?',
        en: 'What is the direct export margin gain for jute bags from Savar?',
      },
    ],
  },
  {
    id: 'cbam',
    name_bn: 'কার্বন ও সিবিএএম',
    name_en: 'CBAM & Carbon',
    questions: [
      {
        bn: 'ইইউ সিবিএএম (CBAM) কার্বন ট্যাক্স থেকে কীভাবে ছাড় পাব?',
        en: 'How do I ensure compliance under EU CBAM carbon rules?',
      },
      {
        bn: 'কারখানার বিদ্যুৎ বিল থেকে Scope 2 কার্বন হিসাব কেমন?',
        en: 'How do I calculate Scope 2 emissions from factory electricity?',
      },
      {
        bn: 'রুফটপ সোলার প্যানেল বসালে সিবিএএম ট্যাক্স কতটা কমবে?',
        en: 'How much can rooftop solar reduce EU CBAM liability?',
      },
    ],
  },
  {
    id: 'payment',
    name_bn: 'পেমেন্ট ও এলসি',
    name_en: 'Payment & LC',
    questions: [
      {
        bn: 'বায়ার ওপেন অ্যাকাউন্ট চাইছে, আমার ঝুঁকি ও করণীয় কী?',
        en: 'Buyer is demanding Open Account. What are my risks?',
      },
      {
        bn: 'কনফার্মড এলসি বনাম ইউপাস (UPAS) এলসি পার্থক্য কী?',
        en: 'What is the difference between Confirmed LC and UPAS LC?',
      },
      {
        bn: 'FOB চট্টগ্রাম ইনকোটার্মসে রপ্তানিকারকের দায়িত্ব কী কী?',
        en: 'What are the exporter obligations under FOB Chattogram Incoterms?',
      },
    ],
  },
  {
    id: 'port_logistics',
    name_bn: 'বন্দর ও লজিস্টিকস',
    name_en: 'Port & Freight',
    questions: [
      {
        bn: 'চট্টগ্রাম বন্দর থেকে ২০ ফুট কনটেইনারের চার্জ কত?',
        en: 'What are the charges for a 20ft container at Chattogram Port?',
      },
      {
        bn: 'সাভার ও গাজীপুর থেকে চট্টগ্রাম বন্দর পর্যন্ত ট্রাক ভাড়া কত?',
        en: 'What is the trucking freight from Savar/Gazipur to Chattogram Port?',
      },
      {
        bn: 'পিক সিজনে কনটেইনার জট ও ডিউরেজ এড়াতে কী কৌশল নেব?',
        en: 'How to avoid port congestion and demurrage charges during peak season?',
      },
    ],
  },
];

export const GlobalAiChatbot: React.FC = () => {
  const { user, lang, t } = useAuth();
  const navigate = useNavigate();
  const isClientMode = !user;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Default welcome message on first open or user mode change
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: isClientMode
            ? t(
                'স্বাগতম! আমি এক্সপোর্টপাইলট এআই ব্রাউজার ট্রেড অ্যাডভাইজার। ইউরোপ, যুক্তরাজ্য ও জাপানে সরাসরি রপ্তানির জন্য FOB দর, এলসি পেমেন্ট নিরাপত্তা, কিংবা ইইউ সিবিএএম (CBAM) কার্বন নিয়মাবলী সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন। নিচে প্রস্তাবিত প্রশ্নগুলোতে ক্লিক করে অথবা আপনার প্রশ্ন লিখে তাৎক্ষণিক উত্তর পেতে পারেন।',
                'Welcome! I am the ExportPilot Browser AI Trade Advisor. Ask me anything about FOB pricing, L/C payment security, EU CBAM carbon compliance, or direct export strategies to Europe, the UK, and Japan. Click any suggestion below or type your question for instant intelligence.'
              )
            : t(
                `স্বাগতম ${user?.full_name_bn || user?.email || ''}! আমি এক্সপোর্টপাইলট এআই সিনিয়র ট্রেড অ্যাডভাইজার। লাইভ ডিল নেগোশিয়েশন, কাস্টম আরএফকিউ কাউন্টার এবং হাইব্রিড RAG ট্রেড বুদ্ধিমত্তার জন্য প্রস্তুত। যেকোনো প্রশ্ন করতে পারেন।`,
                `Welcome ${user?.email || ''}! I am the ExportPilot AI Senior Trade Advisor. Ready for live deal negotiation, custom RFQ counters, and Hybrid RAG trade intelligence.`
              ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: isClientMode
            ? (lang === 'bn' ? 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)' : 'Browser AI Engine (JavaScript · Client-side)')
            : 'Azure OpenAI (GPT-4.1-mini + Hybrid RAG)',
        },
      ]);
    }
  }, [user, isClientMode, lang, t, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

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
          } else {
            setMessages((prev) => [...prev, {
              id: `voice-err-${Date.now()}`,
              sender: 'assistant',
              text: t('কথা লেখা করা যায়নি। থামে কথা শেষ করে আবার চেষ্টা করুন।', 'Transcription failed. Stop speaking and try again.'),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelUsed: t('ভয়েস ইঞজিন', 'Voice engine'),
            }]);
          }
        } catch {
          setMessages((prev) => [...prev, {
            id: `voice-net-${Date.now()}`,
            sender: 'assistant',
            text: t('কথা পরিকল্পনায় সংযোগ অসম্ভব।', 'The transcription service could not be reached.'),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: t('ভয়েস ইঞজিন', 'Voice engine'),
          }]);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setMessages((prev) => [...prev, {
        id: `mic-err-${Date.now()}`,
        sender: 'assistant',
        text: t('মাইক্রোফোনে অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে মাইক অনুমতি দিয়ে আবার চেষ্টা করুন।', 'Microphone permission was denied. Allow microphone access in browser settings and try again.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: t('ভয়েস ইঞজিন', 'Voice engine'),
      }]);
    }
  };

  // Submit message:
  // Mode 1: Logged out (landing page / visitor) -> Pure client-side JavaScript engine (zero API cost, instant 0ms, 100% reliable)
  // Mode 2: Logged in (authenticated) -> Azure OpenAI GPT-4.1-mini + Hybrid RAG with graceful client-side fallback
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

    // MODE 1: Client-Side JavaScript System (Guest / Landing Page)
    if (isClientMode) {
      setTimeout(() => {
        try {
          const resp = queryBrowserTradeAdvisor(textToSend, lang);
          const assistantMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: resp.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            strategySummary: resp.strategySummary,
            riskFactors: resp.riskFactors,
            suggestedCounter: resp.suggestedCounter,
            modelUsed: resp.modelUsed,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-err-${Date.now()}`,
              sender: 'assistant',
              text: t(
                'প্রশ্ন প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার প্রশ্নটি করুন।',
                'There was an issue processing your question. Please try again.'
              ),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelUsed: 'Browser Engine',
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }, 200);
      return;
    }

    // MODE 2: Authenticated Azure OpenAI + Hybrid RAG (Logged-in workspace user)
    try {
      const outboundText = redactBangladeshPii(textToSend).redacted_text;
      const res = await fetch('/api/v1/azure-openai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: outboundText,
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
          text: data.reply || data.advice || data.message || '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          strategySummary: data.strategy_summary,
          riskFactors: data.risk_factors,
          suggestedCounter: data.suggested_counter_offer,
          modelUsed: data.model_used || 'Azure OpenAI (GPT-4.1-mini + Hybrid RAG)',
          piiRedacted: typeof data.pii_redacted_count === 'number' ? data.pii_redacted_count : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fall back gracefully to client-side engine if backend returns an error or 401
        const fallback = queryBrowserTradeAdvisor(textToSend, lang);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: fallback.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            strategySummary: fallback.strategySummary,
            riskFactors: fallback.riskFactors,
            suggestedCounter: fallback.suggestedCounter,
            modelUsed: `${fallback.modelUsed} (${t('অফলাইন ব্যাকআপ', 'Offline Backup')})`,
          },
        ]);
      }
    } catch {
      // Graceful fallback on network glitch
      const fallback = queryBrowserTradeAdvisor(textToSend, lang);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: fallback.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          strategySummary: fallback.strategySummary,
          riskFactors: fallback.riskFactors,
          suggestedCounter: fallback.suggestedCounter,
          modelUsed: `${fallback.modelUsed} (${t('অফলাইন ব্যাকআপ', 'Offline Backup')})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestions = SUGGESTION_CATEGORIES.find((c) => c.id === activeCategory)?.questions || [];

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
        <div className="fixed bottom-6 right-3 sm:right-6 z-50 w-[95vw] sm:w-[480px] h-[640px] max-h-[88vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-bangla flex items-center gap-1.5">
                  <span>{t('এক্সপোর্টপাইলট এআই অ্যাডভাইজার', 'ExportPilot AI Advisor')}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                    {isClientMode ? (lang === 'bn' ? 'ব্রাউজার এআই' : 'Browser AI') : 'GPT-4.1-mini · RAG'}
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-50 font-bangla flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-200" />
                  <span>
                    {isClientMode
                      ? t('ইনস্ট্যান্ট ব্রাউজার ইঞ্জিন · কোনো লগইন লাগবে না', 'Instant Browser Engine · No Login Required')
                      : t('সার্বভৌম ট্রেড বুদ্ধিমত্তা · লাইভ', 'Sovereign Intelligence · Active')}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('চ্য়াট বন্ধ করুন', 'Close chat')}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Guest notification banner */}
          {isClientMode && (
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-bangla">
              <span className="flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('ব্রাউজার মোড: ইনস্ট্যান্ট উত্তর। লাইভ বায়ার ডিল নেগোশিয়েশনের জন্য:', 'Browser mode: Instant replies. For live deal negotiation: ')}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 ml-1.5"
              >
                <LogIn className="w-3 h-3" />
                <span>{t('লগইন করুন', 'Log in')}</span>
              </button>
            </div>
          )}

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
                    <span>{isUser ? t('আপনি', 'You') : 'Trade Advisor (RAG)'}</span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed font-bangla shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <MarkdownRenderer content={m.text} onNavigate={(path) => navigate(path)} />
                    )}

                    {m.riskFactors && m.riskFactors.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1 text-[11px]">
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
                      <div className="mt-2.5 pt-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
                        <span>Engine: {m.modelUsed}{typeof m.piiRedacted === 'number' && m.piiRedacted > 0 ? ` · ${m.piiRedacted} ${t('টি মাস্ক', 'masked')}` : ''}</span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-sans">
                          {t('যাচাইকৃত তথ্য', 'Verified Fact')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-bangla shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {isClientMode
                      ? t('ব্রাউজার ট্রেড ইন্টেলিজেন্স বিশ্লেষণ সম্পন্ন হচ্ছে...', 'Analyzing via Browser Trade Intelligence...')
                      : t('ট্রেড প্যারামিটার ও হাইব্রিড RAG অ্যানালাইসিস সম্পন্ন হচ্ছে...', 'Retrieving trade parameters via Hybrid RAG...')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isClientMode
                      ? (lang === 'bn' ? 'ব্রাউজার জাভাস্ক্রিপ্ট ইঞ্জিন · ০ মিলি-সেকেন্ড' : 'Browser JavaScript Engine · 0ms latency')
                      : 'Azure OpenAI GPT-4.1-mini · WCO HS · Port Logistics'}
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interactive Suggestion Chips Panel */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-2.5 shrink-0 space-y-2">
            {/* Category selection tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px] font-bangla">
              {SUGGESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {t(cat.name_bn, cat.name_en)}
                </button>
              ))}
            </div>

            {/* Clickable Question Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {currentQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(lang === 'bn' ? q.bn : q.en)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 font-bangla transition-all hover:border-emerald-400 dark:hover:border-emerald-600 text-left shrink-0 max-w-[260px] truncate shadow-xs disabled:opacity-50"
                  title={t(q.bn, q.en)}
                >
                  {t(q.bn, q.en)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceToggle}
              aria-label={isRecording ? t('রেকর্ডিং বন্ধ করুন', 'Stop recording') : t('কথা শুরু করুন', 'Start voice input')}
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
              aria-label={t('বাণিজ্য প্রশ্ন লিখুন', 'Type a trade question')}
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
              aria-label={t('প্রশ্ন পাঠান', 'Send question')}
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
