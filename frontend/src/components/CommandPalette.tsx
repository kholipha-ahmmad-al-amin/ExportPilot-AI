import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CANONICAL_DOCS_DATA } from '../data/canonicalDocsData';
import { Command, Search, CornerDownLeft } from 'lucide-react';

interface PaletteItem {
  id: string;
  groupBn: string;
  groupEn: string;
  labelBn: string;
  labelEn: string;
  hintBn?: string;
  hintEn?: string;
  keywords: string;
  run: () => void;
}

interface BuyerLite {
  id: string;
  company_name: string;
  country?: string;
  preset_id?: string;
}

const PRESETS = [
  { id: 'preset_jute_bag', labelBn: 'সাভার সোনালী জুট ব্যাগ (HS 4202)', labelEn: 'Savar Jute Tote (HS 4202)' },
  { id: 'preset_denim_jacket', labelBn: 'গাজীপুর রিসাইকলড ডেনিম (HS 6201)', labelEn: 'Gazipur Denim (HS 6201)' },
  { id: 'preset_leather_boot', labelBn: 'সাভার লেদার চেলসি বুট (HS 6403)', labelEn: 'Savar Leather Boot (HS 6403)' },
  { id: 'preset_terracotta', labelBn: 'বগুড়া সিরামিক টেবিলওয়্যার (HS 6912)', labelEn: 'Bogura Ceramic Tableware (HS 6912)' },
];

export const CommandPalette: React.FC = () => {
  const { user, t, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [buyers, setBuyers] = useState<BuyerLite[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buyersLoadedRef = useRef(false);

  const role = user?.role || '';
  const canExport = role === 'factory_owner' || role === 'admin';
  const isBuyer = role === 'verified_buyer';
  const canReview = role === 'compliance_auditor' || role === 'admin';

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery('');
            setActiveIndex(0);
            return false;
          }
          setActiveIndex(0);
          return true;
        });
      }
      if (e.key === 'Escape') {
        setOpen((prev) => {
          if (prev) {
            setQuery('');
            return false;
          }
          return prev;
        });
      }
    };
    const onOpenEvent = () => openPalette();
    window.addEventListener('keydown', onKey);
    window.addEventListener('exportpilot:open-palette', onOpenEvent as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('exportpilot:open-palette', onOpenEvent as EventListener);
    };
  }, [openPalette]);

  useEffect(() => {
    if (open) {
      // Focus after the overlay mounts.
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || buyersLoadedRef.current || !user) return;
    buyersLoadedRef.current = true;
    fetch('/api/v1/buyers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.buyers)) {
          setBuyers(data.buyers.slice(0, 40).map((b: BuyerLite) => ({ id: b.id, company_name: b.company_name, country: b.country, preset_id: (b as BuyerLite & { preset_id?: string }).preset_id })));
        }
      })
      .catch(() => {});
  }, [open, user]);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    const push = (item: Omit<PaletteItem, 'groupBn' | 'groupEn'> & { groupBn: string; groupEn: string }) => list.push(item);

    const routes: { path: string; labelBn: string; labelEn: string; hintBn?: string; hintEn?: string }[] = [];
    if (!user) {
      routes.push(
        { path: '/docs', labelBn: 'ডকুমেন্টেশন', labelEn: 'Documentation' },
        { path: '/about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us' },
        { path: '/register', labelBn: 'নতুন অ্যাকাউন্ট', labelEn: 'Create Account' },
      );
    } else {
      if (canExport) {
        routes.push(
          { path: '/app', labelBn: 'রপ্তানি ওয়ার্কস্পেস', labelEn: 'Export Workspace' },
          { path: '/dealroom', labelBn: 'ডিল রুম', labelEn: 'Deal Room' },
          { path: '/data', labelBn: 'নথি ও বাজার তথ্য', labelEn: 'Trade Information' },
          { path: '/security', labelBn: 'তথ্যের গোপনীয়তা', labelEn: 'Information Privacy' },
        );
      }
      if (canExport || isBuyer) routes.push({ path: '/buyers', labelBn: 'বায়ার ডিরেক্টরি ও আরএফকিউ', labelEn: 'Buyer Directory & RFQ' });
      if (canReview || canExport) routes.push({ path: '/audit', labelBn: 'সিস্টেম অডিট স্কোরকার্ড', labelEn: 'System Audit Scorecard' });
      if (canReview) routes.push({ path: '/security', labelBn: 'তথ্যের গোপনীয়তা', labelEn: 'Information Privacy' });
      routes.push({ path: '/docs', labelBn: 'ডকুমেন্টেশন', labelEn: 'Documentation' });
    }
    routes.forEach((r, i) =>
      push({ id: `route-${i}`, groupBn: 'পৃষ্ঠা', groupEn: 'Pages', labelBn: r.labelBn, labelEn: r.labelEn, hintBn: r.path, hintEn: r.path, keywords: r.path, run: () => navigate(r.path) }),
    );

    PRESETS.forEach((p) =>
      push({
        id: `preset-${p.id}`,
        groupBn: 'পণ্য',
        groupEn: 'Products',
        labelBn: p.labelBn,
        labelEn: p.labelEn,
        hintBn: 'ডিল রুমে খুলুন',
        hintEn: 'Open in Deal Room',
        keywords: `${p.id} preset dealroom`,
        run: () => navigate(`/dealroom?preset=${p.id}`),
      }),
    );

    buyers.forEach((b) =>
      push({
        id: `buyer-${b.id}`,
        groupBn: 'বায়ার',
        groupEn: 'Buyers',
        labelBn: b.company_name,
        labelEn: b.company_name,
        hintBn: b.country,
        hintEn: b.country,
        keywords: `${b.id} ${b.country || ''} buyer catalog`,
        run: () => navigate('/buyers'),
      }),
    );

    CANONICAL_DOCS_DATA.slice(0, 12).forEach((d) =>
      push({
        id: `doc-${d.id}`,
        groupBn: 'নির্দেশিকা',
        groupEn: 'Guides',
        labelBn: d.titleBn,
        labelEn: d.titleEn,
        keywords: `docs ${d.id}`,
        run: () => navigate(`/docs?topic=${d.id}`),
      }),
    );

    push({
      id: 'action-audit',
      groupBn: 'অ্যাকশন',
      groupEn: 'Actions',
      labelBn: 'লাইভ সিস্টেম অডিট চালান',
      labelEn: 'Run live system audit',
      keywords: 'audit diagnostics scorecard',
      run: () => navigate('/audit'),
    });
    push({
      id: 'action-theme',
      groupBn: 'অ্যাকশন',
      groupEn: 'Actions',
      labelBn: 'ডে ও নাইট মোড বদলান',
      labelEn: 'Toggle Day and Night mode',
      keywords: 'theme dark light mode',
      run: () => toggleTheme(),
    });

    return list;
  }, [navigate, buyers, user, canExport, isBuyer, canReview, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 14);
    return items
      .map((item) => {
        const haystack = `${item.labelBn} ${item.labelEn} ${item.hintBn || ''} ${item.hintEn || ''} ${item.keywords}`.toLowerCase();
        const labelHit = item.labelBn.toLowerCase().includes(q) || item.labelEn.toLowerCase().includes(q);
        const anyHit = haystack.includes(q);
        const starts = item.labelBn.toLowerCase().startsWith(q) || item.labelEn.toLowerCase().startsWith(q);
        const score = starts ? 3 : labelHit ? 2 : anyHit ? 1 : 0;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
      .map((x) => x.item);
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) {
        item.run();
        close();
      }
    }
  };

  if (!open) return null;

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={t('কমান্ড প্যালেট', 'Command palette')}
    >
      <div
        className="max-w-xl mx-auto mt-[10vh] mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-label={t('পৃষ্ঠা, পণ্য বা বায়ার খুঁজুন', 'Search pages, products, or buyers')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('পৃষ্ঠা, পণ্য, বায়ার বা অ্যাকশন লিখুন...', 'Type a page, product, buyer, or action...')}
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none font-bangla"
          />
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400">
            <Command className="w-3 h-3" aria-hidden="true" />K
          </span>
        </div>

        <ul id="command-palette-list" role="listbox" ref={listRef} className="max-h-[46vh] overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-slate-400 font-bangla">
              {t('কিছু পাওয়া যায়নি', 'No matches found')}
            </li>
          )}
          {filtered.map((item, idx) => {
            const newGroup = t(item.groupBn, item.groupEn) !== lastGroup;
            if (newGroup) lastGroup = t(item.groupBn, item.groupEn);
            return (
              <React.Fragment key={item.id}>
                {newGroup && (
                  <li className="px-4 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400" aria-hidden="true">
                    {t(item.groupBn, item.groupEn)}
                  </li>
                )}
                <li
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`mx-2 flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs font-bangla transition-colors ${
                    idx === activeIndex
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.run();
                    close();
                  }}
                >
                  <span className="truncate">{t(item.labelBn, item.labelEn)}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {item.hintEn && (
                      <span className="hidden sm:inline text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                        {t(item.hintBn || item.hintEn, item.hintEn)}
                      </span>
                    )}
                    {idx === activeIndex && <CornerDownLeft className="w-3 h-3 text-slate-400" aria-hidden="true" />}
                  </span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>{t('↑↓ নির্বাচন · Enter খুলুন · Esc বন্ধ', 'Up/Down select · Enter open · Esc close')}</span>
          <span>{t('সার্বভৌম ইন্টারফেস', 'Sovereign interface')}</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
