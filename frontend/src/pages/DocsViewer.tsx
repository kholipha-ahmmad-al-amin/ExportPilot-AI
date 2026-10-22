import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CANONICAL_DOCS_DATA, DocSection } from '../data/canonicalDocsData';
import {
  BookOpen, Search, Copy, Check, ChevronRight, ChevronLeft,
  Shield, Cpu, Mic, FileText, Globe, Terminal, ArrowUpRight,
  Menu, X, AlertTriangle, Lightbulb, CheckCircle2, Bookmark
} from 'lucide-react';

export const DocsViewer: React.FC = () => {
  const { lang, setLang, t } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active section tracking from URL query or default to 'overview'
  const activeSectionId = searchParams.get('topic') || 'overview';
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  // Group sections by category
  const categories = useMemo(() => {
    const map = new Map<string, { categoryBn: string; categoryEn: string; sections: DocSection[] }>();
    CANONICAL_DOCS_DATA.forEach((sec) => {
      const key = sec.categoryEn;
      if (!map.has(key)) {
        map.set(key, { categoryBn: sec.categoryBn, categoryEn: sec.categoryEn, sections: [] });
      }
      map.get(key)!.sections.push(sec);
    });
    return Array.from(map.values());
  }, []);

  // Filter sections by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();

    return categories.map((cat) => {
      const matchedSections = cat.sections.filter((s) => {
        return (
          s.titleBn.toLowerCase().includes(q) ||
          s.titleEn.toLowerCase().includes(q) ||
          s.descriptionBn.toLowerCase().includes(q) ||
          s.descriptionEn.toLowerCase().includes(q) ||
          s.subsections.some(
            (sub) =>
              sub.headingBn.toLowerCase().includes(q) ||
              sub.headingEn.toLowerCase().includes(q) ||
              sub.contentBn.toLowerCase().includes(q) ||
              sub.contentEn.toLowerCase().includes(q)
          )
        );
      });
      return { ...cat, sections: matchedSections };
    }).filter((cat) => cat.sections.length > 0);
  }, [categories, searchQuery]);

  // Active section data
  const activeSection = useMemo(() => {
    return CANONICAL_DOCS_DATA.find((s) => s.id === activeSectionId) || CANONICAL_DOCS_DATA[0];
  }, [activeSectionId]);

  // Section index for pagination
  const currentIndex = CANONICAL_DOCS_DATA.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIndex > 0 ? CANONICAL_DOCS_DATA[currentIndex - 1] : null;
  const nextSection = currentIndex < CANONICAL_DOCS_DATA.length - 1 ? CANONICAL_DOCS_DATA[currentIndex + 1] : null;

  const selectSection = (id: string) => {
    setSearchParams({ topic: id });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(id);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Scroll to hash on load
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeSectionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* Top Docs Sub-Header */}
      <div className="sticky top-16 z-40 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              aria-label="Toggle Documentation Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">DOCS</span>
              <span>/</span>
              <span className="hidden sm:inline font-bangla text-slate-300">
                {t(activeSection.categoryBn, activeSection.categoryEn)}
              </span>
              <span className="hidden sm:inline">/</span>
              <span className="text-white font-semibold font-bangla truncate max-w-[200px]">
                {t(activeSection.titleBn, activeSection.titleEn)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="badge badge-em text-[10px] hidden sm:inline-flex">v2026.10-CANONICAL</span>
            <Link
              to="/app"
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 font-bangla"
            >
              <span>{t('ডিল রুমে যান', 'Open Deal Room')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Documentation Three-Column Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-8">

        {/* Column 1: Left Navigation Sidebar */}
        <aside
          className={`lg:w-72 shrink-0 ${
            mobileMenuOpen
              ? 'fixed inset-x-0 top-28 bottom-0 z-50 bg-slate-950 p-6 overflow-y-auto border-r border-slate-800'
              : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-28 space-y-6">

            {/* Real-time Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('টপিক বা এপিআই খুঁজুন...', 'Search docs or API...')}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-bangla"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Navigation Category Groups */}
            <nav className="space-y-6" aria-label="Documentation Sidebar">
              {filteredCategories.map((cat) => (
                <div key={cat.categoryEn} className="space-y-2">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-bangla px-2 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 text-emerald-400" />
                    <span>{t(cat.categoryBn, cat.categoryEn)}</span>
                  </h3>
                  <div className="space-y-1">
                    {cat.sections.map((sec) => {
                      const isActive = sec.id === activeSection.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => selectSection(sec.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 min-h-tap ${
                            isActive
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm shadow-emerald-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                          }`}
                        >
                          <span className="font-bangla truncate">
                            {t(sec.titleBn, sec.titleEn)}
                          </span>
                          <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {sec.readTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

          </div>
        </aside>

        {/* Column 2: Central Documentation Article Body */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-8 animate-fade-in pb-16">

          {/* Article Header */}
          <div className="space-y-3 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="badge badge-em text-[10px]">
                {t(activeSection.categoryBn, activeSection.categoryEn)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeSection.readTime} read
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-bangla">
              {t(activeSection.titleBn, activeSection.titleEn)}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-bangla">
              {t(activeSection.descriptionBn, activeSection.descriptionEn)}
            </p>
          </div>

          {/* Subsections */}
          <div className="space-y-10">
            {activeSection.subsections.map((sub, idx) => (
              <section key={sub.id} id={sub.id} className="space-y-4 scroll-mt-28">
                <h2 className="text-lg sm:text-xl font-bold text-white font-bangla flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">#</span>
                  <span>{t(sub.headingBn, sub.headingEn)}</span>
                </h2>

                {/* Callout Box if present */}
                {sub.callout && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed font-bangla ${
                      sub.callout.type === 'important'
                        ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                        : sub.callout.type === 'compliance'
                        ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                        : sub.callout.type === 'tip'
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                        : 'bg-blue-950/20 border-blue-800/60 text-blue-200'
                    }`}
                  >
                    {sub.callout.type === 'important' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    {sub.callout.type === 'compliance' && <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {sub.callout.type === 'tip' && <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {sub.callout.type === 'note' && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">
                        {sub.callout.type}
                      </span>
                      <span>{t(sub.callout.textBn, sub.callout.textEn)}</span>
                    </div>
                  </div>
                )}

                <div className="text-sm text-slate-300 leading-relaxed font-bangla whitespace-pre-line">
                  {t(sub.contentBn, sub.contentEn)}
                </div>

                {/* Code Snippet if present */}
                {sub.codeSnippet && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-400">
                      <span>{sub.codeSnippet.language}</span>
                      <button
                        onClick={() => copyCode(sub.codeSnippet!.code, `${activeSection.id}-${idx}`)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedCodeIndex === `${activeSection.id}-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{t('কপি হয়েছে', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('কপি করুন', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{sub.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Article Footer Pagination */}
          <div className="pt-8 border-t border-slate-800 flex items-center justify-between gap-4">
            {prevSection ? (
              <button
                onClick={() => selectSection(prevSection.id)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all text-left max-w-[48%]"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bangla">
                    {t('পূর্ববর্তী পাতা', 'Previous')}
                  </span>
                  <span className="text-xs font-bold text-white font-bangla truncate block">
                    {t(prevSection.titleBn, prevSection.titleEn)}
                  </span>
                </div>
              </button>
            ) : <div />}

            {nextSection && (
              <button
                onClick={() => selectSection(nextSection.id)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all text-right max-w-[48%] ml-auto"
              >
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bangla">
                    {t('পরবর্তী পাতা', 'Next')}
                  </span>
                  <span className="text-xs font-bold text-white font-bangla truncate block">
                    {t(nextSection.titleBn, nextSection.titleEn)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>
            )}
          </div>

        </main>

        {/* Column 3: Right Sidebar Table of Contents */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-28 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bangla flex items-center gap-1.5">
              <span>{t('এই পৃষ্ঠায় সূচিপত্র', 'On this page')}</span>
            </h4>
            <nav className="space-y-1.5 text-xs border-l border-slate-800 pl-3">
              {activeSection.subsections.map((sub) => (
                <a
                  key={sub.id}
                  href={`#${sub.id}`}
                  className="block py-1 text-slate-400 hover:text-emerald-300 transition-colors font-bangla truncate"
                >
                  {t(sub.headingBn, sub.headingEn)}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] text-slate-500 block font-bangla">
                {t('ডকুমেন্টেশন সংস্করণ', 'Documentation Version')}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold block">
                2026.10.MASTER
              </span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
