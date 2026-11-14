import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, Download, Printer, Search, Settings2,
  ArrowUp, ArrowDown, Eye, EyeOff, Users, BarChart3, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonList } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';

interface DocSection {
  key: string;
  group: 'deck' | 'tech' | string;
  title_bn: string;
  title_en: string;
  body_md: string;
  sort_order: number;
  status: string;
  updated_at: string | null;
}

interface DocMember {
  id: string;
  name: string;
  name_bn: string | null;
  role_en: string;
  role_bn: string | null;
  email: string | null;
  photo_url: string | null;
  sort_order: number;
}

interface DocStats {
  accounts: number;
  factory_profiles: number;
  products: number;
  open_requests: number;
  agreements: number;
}

interface DocsPublic {
  visible: boolean;
  generated_at?: string;
  stats: DocStats | null;
  sections: DocSection[];
  members: DocMember[];
}

interface DocsAdmin extends DocsPublic {
  settings: { enabled: boolean; publish_at: string | null; unpublish_at: string | null; updated_at: string | null };
  publicly_visible: boolean;
}

const FEATURES: { bn: string; en: string; status: 'live' | 'planned'; to?: string }[] = [
  { bn: 'পণ্যের ক্যাটালগ', en: 'Product catalog', status: 'live', to: '/catalog' },
  { bn: 'ক্রেতার চাহিদাপত্র বোর্ড', en: 'Buyer RFQ board', status: 'live', to: '/buyers' },
  { bn: 'কোটেশন আলাপ', en: 'Quotation conversations', status: 'live' },
  { bn: 'ডিল এগ্রিমেন্ট', en: 'Deal agreements', status: 'live' },
  { bn: 'প্রফরমা ইনভয়েস PDF', en: 'Proforma invoice PDF', status: 'live' },
  { bn: 'কার্বন ও কমপ্লায়েন্স স্কোরিং', en: 'Carbon & compliance scoring', status: 'live' },
  { bn: 'এআই হাব ও অ্যাডভাইজর', en: 'AI hub & advisor', status: 'live', to: '/intelligence' },
  { bn: 'কমান্ড প্যালেট', en: 'Command palette', status: 'live' },
  { bn: 'বহিরাগত পেমেন্ট', en: 'External payments', status: 'planned' },
  { bn: 'শিপমেন্ট ট্র্যাকিং', en: 'Shipment tracking', status: 'planned' },
];

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-800 dark:bg-slate-800 dark:text-emerald-300">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function MarkdownBody({ body }: { body: string }) {
  const lines = body.split('\n');
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      out.push(<ul key={`u${key}`} className="my-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{list.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ul>);
      list = [];
    }
    if (ordered.length) {
      out.push(<ol key={`o${key}`} className="my-3 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{ordered.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ol>);
      ordered = [];
    }
  };
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) { flush(`l${idx}`); list.push(trimmed.slice(2)); return; }
    if (/^\d+\.\s/.test(trimmed)) { flush(`l${idx}`); ordered.push(trimmed.replace(/^\d+\.\s/, '')); return; }
    flush(`l${idx}`);
    if (trimmed.startsWith('### ')) out.push(<h3 key={idx} className="mt-5 mb-2 text-base font-bold text-slate-900 dark:text-slate-100">{renderInline(trimmed.slice(4))}</h3>);
    else if (trimmed.startsWith('## ')) out.push(<h3 key={idx} className="mt-6 mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">{renderInline(trimmed.slice(3))}</h3>);
    else if (trimmed) out.push(<p key={idx} className="my-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{renderInline(trimmed)}</p>);
  });
  flush('end');
  return <div>{out}</div>;
}

function FlowDiagram({ t }: { t: (bn: string, en: string) => string }) {
  const steps = [
    { bn: 'ইনপুট', en: 'Input', dBn: 'ফর্ম, চ্যাট, আপলোড', dEn: 'Forms, chat, uploads' },
    { bn: 'প্রক্রিয়াকরণ', en: 'Processing', dBn: 'Pydantic যাচাই, RBAC', dEn: 'Validation, role checks' },
    { bn: 'এআই', en: 'AI', dBn: 'মাস্কিং সহ মডেল কল', dEn: 'Masked model calls' },
    { bn: 'আউটপুট', en: 'Output', dBn: 'JSON বা PDF', dEn: 'JSON or PDF' },
    { bn: 'ফিডব্যাক', en: 'Feedback', dBn: 'টোস্ট, এরর, অডিট', dEn: 'Toasts, errors, audit' },
  ];
  return (
    <div className="my-4 grid gap-2 sm:grid-cols-5">
      {steps.map((s, i) => (
        <React.Fragment key={s.en}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{i + 1}. {t(s.bn, s.en)}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{t(s.dBn, s.dEn)}</p>
          </div>
          {i < steps.length - 1 && <ChevronRight className="hidden h-4 w-4 self-center text-slate-300 sm:block dark:text-slate-600" aria-hidden="true" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StackDiagram({ t }: { t: (bn: string, en: string) => string }) {
  const layers = [
    { bn: 'ইউজার ইন্টারফেস', en: 'UI', d: 'React 18, TypeScript, Vite, Tailwind' },
    { bn: 'API স্তর', en: 'API', d: 'FastAPI, JWT auth, RBAC' },
    { bn: 'সার্ভিস', en: 'Services', d: 'Matching, documents, scoring, MCP agents' },
    { bn: 'ডেটাবেজ', en: 'Database', d: 'SQLite on durable Azure storage' },
  ];
  return (
    <div className="my-4 space-y-2">
      {layers.map((l) => (
        <div key={l.en} className="flex items-center gap-3">
          <div className="w-28 shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            {t(l.bn, l.en)}
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {l.d}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamGrid({ members, lang }: { members: DocMember[]; lang: string }) {
  if (!members.length) return null;
  return (
    <div className="my-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {m.photo_url ? (
            <img src={m.photo_url} alt={m.name} width="72" height="72" loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-full border-2 border-emerald-200 object-cover dark:border-emerald-900" />
          ) : (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-lg font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300" aria-hidden="true">
              {m.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{lang === 'bn' && m.name_bn ? m.name_bn : m.name}</p>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{lang === 'bn' && m.role_bn ? m.role_bn : m.role_en}</p>
            {m.email && <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{m.email}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureMatrix({ t }: { t: (bn: string, en: string) => string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <th className="px-4 py-3 font-semibold">{t('ফিচার', 'Feature')}</th>
            <th className="px-4 py-3 font-semibold">{t('অবস্থা', 'Status')}</th>
            <th className="px-4 py-3 font-semibold">{t('লিংক', 'Link')}</th>
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((f) => (
            <tr key={f.en} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{t(f.bn, f.en)}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.status === 'live' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {f.status === 'live' ? t('লাইভ', 'Live') : t('পরিকল্পিত', 'Planned')}
                </span>
              </td>
              <td className="px-4 py-2.5">{f.to ? <Link to={f.to} className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400">{t('দেখুন', 'Open')}</Link> : <span className="text-xs text-slate-400">-</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const DocsLive: React.FC = () => {
  const { t, lang, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<DocsPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminData, setAdminData] = useState<DocsAdmin | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('published');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/docs/public', { credentials: 'include' });
      if (!res.ok) throw new Error('load failed');
      setData(await res.json());
    } catch {
      setError(t('ডকুমেন্টেশন লোড করা যায়নি।', 'Could not load documentation.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadAdmin = async () => {
    setAdminBusy(true);
    try {
      const res = await fetch('/api/v1/docs/admin', { credentials: 'include' });
      if (res.ok) setAdminData(await res.json());
    } finally {
      setAdminBusy(false);
    }
  };

  useEffect(() => { if (adminOpen) loadAdmin(); }, [adminOpen]);

  const deckSections = useMemo(() => (data?.sections || []).filter(s => s.group === 'deck'), [data]);
  const techSections = useMemo(() => (data?.sections || []).filter(s => s.group === 'tech'), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { deck: deckSections, tech: techSections };
    const match = (s: DocSection) =>
      s.title_bn.includes(q) || s.title_en.toLowerCase().includes(q) || s.body_md.toLowerCase().includes(q);
    return { deck: deckSections.filter(match), tech: techSections.filter(match) };
  }, [deckSections, techSections, query]);

  const exportMarkdown = () => {
    if (!data) return;
    const parts = [`# ExportPilot AI - ${t('ডকুমেন্টেশন', 'Documentation')}\n`];
    data.sections.forEach(s => {
      parts.push(`\n## ${lang === 'bn' ? s.title_bn : s.title_en}\n\n${s.body_md}\n`);
    });
    const blob = new Blob([parts.join('')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exportpilot-docs.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSection = async (key: string) => {
    setAdminBusy(true);
    try {
      await fetch(`/api/v1/docs/admin/sections/${encodeURIComponent(key)}`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body_md: editBody, status: editStatus }),
      });
      setEditKey(null);
      await loadAdmin();
      await load();
    } finally {
      setAdminBusy(false);
    }
  };

  const moveSection = async (key: string, dir: -1 | 1) => {
    if (!adminData) return;
    const keys = adminData.sections.map(s => s.key);
    const i = keys.indexOf(key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]];
    setAdminBusy(true);
    try {
      await fetch('/api/v1/docs/admin/sections/reorder', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      });
      await loadAdmin();
    } finally {
      setAdminBusy(false);
    }
  };

  const saveSettings = async (patch: Record<string, unknown>) => {
    setAdminBusy(true);
    try {
      await fetch('/api/v1/docs/admin/settings', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      await loadAdmin();
    } finally {
      setAdminBusy(false);
    }
  };

  const toLocalInput = (iso: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : '';

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-12"><SkeletonList count={4} /></div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState icon={BookOpen} title={t('ডকুমেন্টেশন পাওয়া যায়নি', 'Documentation unavailable')} description={error || ''} />
      </div>
    );
  }

  if (!data.visible) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={EyeOff}
          title={t('এই ডকুমেন্টেশনটি এখন উপলব্ধ নয়', 'This documentation is not currently available')}
          description={t('প্রকাশনা সময়সূচি অনুযায়ী এটি নির্ধারিত সময়ে দেখা যাবে।', 'It will be visible during its scheduled publishing window.')}
        />
      </div>
    );
  }

  const stats = data.stats;
  const statItems = stats ? [
    { label: t('অ্যাকাউন্ট', 'Accounts'), value: stats.accounts },
    { label: t('কারখানা প্রোফাইল', 'Factory profiles'), value: stats.factory_profiles },
    { label: t('পণ্য', 'Products'), value: stats.products },
    { label: t('খোলা চাহিদাপত্র', 'Open requests'), value: stats.open_requests },
    { label: t('চুক্তি', 'Agreements'), value: stats.agreements },
  ] : [];

  const renderSection = (s: DocSection, deckIndex?: number) => {
    const isTeam = s.key === 'deck_team';
    return (
      <section key={s.key} id={`doc-${s.key}`} className="scroll-mt-28">
        {deckIndex !== undefined ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{String(deckIndex + 1).padStart(2, '0')}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{lang === 'bn' ? s.title_bn : s.title_en}</h2>
            </div>
            <div className="mt-4">
              <MarkdownBody body={s.body_md} />
              {isTeam && <TeamGrid members={data.members} lang={lang} />}
            </div>
          </div>
        ) : (
          <div className="border-l-2 border-emerald-500/60 pl-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">{lang === 'bn' ? s.title_bn : s.title_en}</h2>
            {s.key === 'tech_features' && <FeatureMatrix t={t} />}
            {s.key === 'tech_dataflow' && <FlowDiagram t={t} />}
            {s.key === 'tech_architecture' && <StackDiagram t={t} />}
            <MarkdownBody body={s.body_md} />
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{t('ডকুমেন্টেশন ও পিচ ডেক', 'Documentation & Pitch Deck')}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">{t('এক্সপোর্টপাইলট এআই', 'ExportPilot AI')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          {t('পিচ ডেক ও কারিগরি ডকুমেন্টেশন এক জায়গায়। সব সংখ্যাই লাইভ সিস্টেম থেকে সরাসরি গোনা হয়।', 'Pitch deck and engineering docs in one place. Every number below is counted live from the production system.')}
        </p>
        {data.generated_at && (
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{t('সর্বশেষ আপডেট', 'Updated')} {new Date(data.generated_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
        )}
      </header>

      {/* Live stats strip */}
      {statItems.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {statItems.map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">{s.value.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('অনুচ্ছেদ খুঁজুন...', 'Search sections...')}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <button onClick={exportMarkdown} className="btn-secondary inline-flex items-center gap-1.5 text-xs" type="button">
          <Download className="h-3.5 w-3.5" /> {t('মার্কডাউন ডাউনলোড', 'Export Markdown')}
        </button>
        <button onClick={() => window.print()} className="btn-secondary inline-flex items-center gap-1.5 text-xs" type="button">
          <Printer className="h-3.5 w-3.5" /> {t('প্রিন্ট / PDF', 'Print / PDF')}
        </button>
        {isAdmin && (
          <button onClick={() => setAdminOpen(o => !o)} className="btn-primary inline-flex items-center gap-1.5 text-xs" type="button">
            <Settings2 className="h-3.5 w-3.5" /> {t('প্রশাসন', 'Manage')}
          </button>
        )}
      </div>

      {/* Admin panel */}
      {adminOpen && adminData && (
        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('প্রকাশনা নিয়ন্ত্রণ', 'Publishing controls')}</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${adminData.publicly_visible ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
              {adminData.publicly_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {adminData.publicly_visible ? t('এখন প্রকাশিত', 'Currently public') : t('এখন লুকানো', 'Currently hidden')}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={adminData.settings.enabled} disabled={adminBusy}
                onChange={e => saveSettings({ enabled: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
              {t('সর্বজনীনভাবে চালু', 'Publicly enabled')}
            </label>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('প্রকাশ শুরুর সময়', 'Publish from')}
              <input type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                defaultValue={toLocalInput(adminData.settings.publish_at)}
                onBlur={e => { const v = e.target.value; saveSettings({ publish_at: v ? new Date(v).toISOString() : null }); }} />
            </label>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('প্রকাশ শেষের সময়', 'Publish until')}
              <input type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                defaultValue={toLocalInput(adminData.settings.unpublish_at)}
                onBlur={e => { const v = e.target.value; saveSettings({ unpublish_at: v ? new Date(v).toISOString() : null }); }} />
            </label>
            <div className="flex items-end">
              <button type="button" disabled={adminBusy}
                onClick={() => saveSettings({ enabled: !adminData.settings.enabled })}
                className="btn-secondary w-full text-xs">
                {adminData.settings.enabled ? t('অফ করুন', 'Turn off') : t('চালু করুন', 'Turn on')}
              </button>
            </div>
          </div>

          <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('অনুচ্ছেদ সম্পাদনা', 'Edit sections')}</h3>
          <div className="mt-2 space-y-2">
            {adminData.sections.map((s, i) => (
              <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{s.key}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{lang === 'bn' ? s.title_bn : s.title_en}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{s.status}</span>
                  <button type="button" disabled={adminBusy || i === 0} onClick={() => moveSection(s.key, -1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('উপরে নিন', 'Move up')}><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" disabled={adminBusy || i === adminData.sections.length - 1} onClick={() => moveSection(s.key, 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('নিচে নিন', 'Move down')}><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => { setEditKey(editKey === s.key ? null : s.key); setEditBody(s.body_md); setEditStatus(s.status === 'draft' ? 'draft' : 'published'); }}
                    className="btn-ghost text-[11px]">{editKey === s.key ? t('বন্ধ করুন', 'Close') : t('সম্পাদনা', 'Edit')}</button>
                </div>
                {editKey === s.key && (
                  <div className="mt-3 space-y-2">
                    <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={10}
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
                    <div className="flex items-center gap-2">
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value as 'draft' | 'published')}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <option value="published">{t('প্রকাশিত', 'Published')}</option>
                        <option value="draft">{t('খসড়া', 'Draft')}</option>
                      </select>
                      <button type="button" disabled={adminBusy} onClick={() => saveSection(s.key)} className="btn-primary text-xs">{t('সংরক্ষণ', 'Save')}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile section index */}
      <details className="mb-8 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          {t('সকল সেকশনের তালিকা', 'All sections')}
          <ChevronRight className="ml-auto h-4 w-4 text-slate-400 transition-transform [[open]>&]:rotate-90" />
        </summary>
        <nav className="space-y-4 border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><BarChart3 className="h-3.5 w-3.5" /> {t('পিচ ডেক', 'Pitch deck')}</p>
            <ul className="space-y-1">
              {filtered.deck.map((s, i) => (
                <li key={s.key}><a href={`#doc-${s.key}`} className="block py-1.5 text-xs text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300">{String(i + 1).padStart(2, '0')} {lang === 'bn' ? s.title_bn : s.title_en}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><FileText className="h-3.5 w-3.5" /> {t('কারিগরি ডক', 'Technical docs')}</p>
            <ul className="space-y-1">
              {filtered.tech.map(s => (
                <li key={s.key}><a href={`#doc-${s.key}`} className="block py-1.5 text-xs text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300">{lang === 'bn' ? s.title_bn : s.title_en}</a></li>
              ))}
            </ul>
          </div>
        </nav>
      </details>

      {/* Content */}
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-5 text-sm">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><BarChart3 className="h-3.5 w-3.5" /> {t('পিচ ডেক', 'Pitch deck')}</p>
              <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
                {filtered.deck.map((s, i) => (
                  <li key={s.key}><a href={`#doc-${s.key}`} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">{String(i + 1).padStart(2, '0')} {lang === 'bn' ? s.title_bn : s.title_en}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><FileText className="h-3.5 w-3.5" /> {t('কারিগরি ডক', 'Technical docs')}</p>
              <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
                {filtered.tech.map(s => (
                  <li key={s.key}><a href={`#doc-${s.key}`} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">{lang === 'bn' ? s.title_bn : s.title_en}</a></li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <Users className="mb-1 h-3.5 w-3.5 text-emerald-600" />
              {t('এই পৃষ্ঠা একটি read-only পাবলিক ভিউ; এডিট করতে অ্যাডমিন অ্যাকাউন্ট লাগে।', 'This page is a read-only public view; editing requires an admin account.')}
            </div>
          </nav>
        </aside>

        {/* Sections */}
        <div className="min-w-0 space-y-10">
          {filtered.deck.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('পিচ ডেক', 'Pitch deck')}</h2>
              {filtered.deck.map((s, i) => renderSection(s, i))}
            </div>
          )}
          {filtered.tech.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('কারিগরি ডকুমেন্টেশন', 'Technical documentation')}</h2>
              {filtered.tech.map(s => renderSection(s))}
            </div>
          )}
          {filtered.deck.length === 0 && filtered.tech.length === 0 && (
            <EmptyState icon={Search} title={t('কোনো অনুচ্ছেদ পাওয়া যায়নি', 'No sections matched')} description={query} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsLive;
