import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ShowcaseProduct {
  id: string;
  name: string;
  description: string | null;
  hs_code: string | null;
  factory_name: string;
  country_code: string;
  image_url: string | null;
  is_illustrative: boolean;
}

export const ProductShowcase: React.FC = () => {
  const { t } = useAuth();
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ShowcaseProduct[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 12;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch('/api/v1/factory/showcase?offset=' + offset + '&limit=' + pageSize, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error(t('পণ্য তালিকা লোড করা যায়নি।', 'Could not load the product showcase.'));
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setHasMore(Boolean(data.has_more));
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : t('পণ্য তালিকা লোড করা যায়নি।', 'Could not load the product showcase.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [offset, t]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-bangla">{t('কারখানার পণ্য প্রদর্শনী', 'Factory product showcase')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-bangla">{t('প্রতিযোগিতার জন্য তৈরি নমুনা কারখানা ও পণ্য। এগুলো যাচাইকৃত সরবরাহকারী বা বিক্রয়ের প্রস্তাব নয়।', 'Illustrative factory profiles and products prepared for the showcase. They are not verified suppliers or sales offers.')}</p>
        </div>
        <span className="badge badge-blue">{t('নমুনা তথ্য', 'Illustrative')}</span>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
      {loading ? <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">{t('পণ্য লোড হচ্ছে...', 'Loading products...')}</p> : items.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('এখনো কোনো নমুনা পণ্য যোগ করা হয়নি।', 'No illustrative products have been added yet.')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(product => (
            <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
              {product.image_url && product.image_url.startsWith('/') && !product.image_url.startsWith('//') ? (
                <img src={product.image_url} alt={product.name} width={480} height={320} loading="lazy" className="h-40 w-full bg-slate-100 object-cover dark:bg-slate-800" />
              ) : (
                <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800"><Package className="h-8 w-8" aria-hidden="true" /></div>
              )}
              <div className="space-y-1.5 p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{product.factory_name} ({product.country_code})</p>
                {product.description && <p className="line-clamp-3 text-sm text-slate-700 dark:text-slate-300">{product.description}</p>}
                {product.hs_code && <p className="font-mono text-xs text-slate-600 dark:text-slate-400">HS {product.hs_code}</p>}
                <span className="badge badge-blue">{t('নমুনা পণ্য', 'Illustrative product')}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button type="button" className="btn-secondary text-xs" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - pageSize))}>{t('আগের পণ্য', 'Previous')}</button>
        <span className="text-xs text-slate-600 dark:text-slate-400">{t('পেজ', 'Page')} {Math.floor(offset / pageSize) + 1}</span>
        <button type="button" className="btn-secondary text-xs" disabled={!hasMore || loading} onClick={() => setOffset(offset + pageSize)}>{t('পরের পণ্য', 'Next')}</button>
      </div>
    </section>
  );
};
