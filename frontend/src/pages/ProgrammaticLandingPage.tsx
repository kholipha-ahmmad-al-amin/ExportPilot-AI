import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSeoRoute } from '../components/SeoManager';
import { getSeoLandingPage, SeoPageKind } from '../data/seoLandingPages';

interface ProgrammaticLandingPageProps {
  kind: SeoPageKind;
}

export const ProgrammaticLandingPage: React.FC<ProgrammaticLandingPageProps> = ({ kind }) => {
  const { slug = '' } = useParams();
  const { t } = useAuth();
  const page = getSeoLandingPage(kind, slug);

  if (!page) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('পাতাটি পাওয়া যায়নি', 'Page not found')}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t('ঠিকানা মিলিয়ে আবার চেষ্টা করুন।', 'Check the address and try again.')}</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          {t('হোমে ফিরুন', 'Return home')} <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    );
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-emerald-700 dark:hover:text-emerald-400">
          {t('হোম', 'Home')}
        </Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span aria-current="page">{t(page.heading.bn, page.heading.en)}</span>
      </nav>

      <header className="max-w-4xl space-y-5">
        <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {kind === 'location' ? t('বাংলাদেশের উৎপাদক অঞ্চল', 'Manufacturing in Bangladesh') :
            kind === 'sector' ? t('খাতভিত্তিক রপ্তানি প্রস্তুতি', 'Sector export preparation') :
              kind === 'feature' ? t('রপ্তানি প্রস্তুতির টুল', 'Export preparation tool') :
                t('নমুনা পণ্য প্রোফাইল', 'Sample product profile')}
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-bangla leading-tight">
          {t(page.heading.bn, page.heading.en)}
        </h1>
        <p className="text-base sm:text-lg leading-8 text-slate-700 dark:text-slate-300 font-bangla max-w-3xl">
          {t(page.lead.bn, page.lead.en)}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            {t('অ্যাকাউন্ট তৈরি করুন', 'Create an account')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/docs" className="btn-secondary inline-flex items-center gap-2">
            {t('ব্যবহার নির্দেশিকা', 'Read the guide')}
          </Link>
        </div>
      </header>

      <section aria-labelledby="programmatic-details" className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-9 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 id="programmatic-details" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla">
            {t(page.sectionHeading.bn, page.sectionHeading.en)}
          </h2>
          <p className="text-sm sm:text-base leading-7 text-slate-700 dark:text-slate-300 font-bangla">
            {t(page.sectionBody.bn, page.sectionBody.en)}
          </p>
        </div>
        <ul className="space-y-3">
          {page.points.map((point) => (
            <li key={point.en} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-300 font-bangla">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />
              <span>{t(point.bn, point.en)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="related-guides" className="space-y-5">
        <h2 id="related-guides" className="text-xl font-bold text-slate-900 dark:text-white font-bangla">
          {t('সম্পর্কিত নির্দেশিকা', 'Related guides')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.related.map((path) => {
            const related = getSeoRoute(path);
            if (!related) return null;
            return (
              <li key={path}>
                <Link to={path} className="group flex h-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 transition-colors hover:border-emerald-300 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:text-emerald-300">
                  <span>{related.title}</span>
                  <ChevronRight className="ml-3 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
};

export default ProgrammaticLandingPage;
