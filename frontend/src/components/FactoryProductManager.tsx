import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Package, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Profile {
  id: string;
  legal_name: string;
  country_code: string;
  address: string | null;
  registration_number: string | null;
  exporter_registration_number: string | null;
  verification_status: string;
  is_illustrative?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  hs_code: string | null;
  hs_description: string | null;
  unit_cost: number | null;
  currency: string;
  monthly_capacity: number | null;
  image_url: string | null;
  is_illustrative?: boolean;
}

interface ProfileForm {
  legal_name: string;
  country_code: string;
  address: string;
  registration_number: string;
  exporter_registration_number: string;
}
interface ProductForm {
  name: string;
  description: string;
  hs_code: string;
  hs_description: string;
  unit_cost: string;
  currency: string;
  monthly_capacity: string;
  image_url: string;
}

const emptyProfile: ProfileForm = { legal_name: '', country_code: 'BD', address: '', registration_number: '', exporter_registration_number: '' };
const emptyProduct: ProductForm = { name: '', description: '', hs_code: '', hs_description: '', unit_cost: '', currency: 'BDT', monthly_capacity: '', image_url: '' };
const inputStyle = 'field w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100';
const labelStyle = 'block space-y-1.5 text-sm font-medium text-slate-800 dark:text-slate-200';
const productImages = [
  ['/assets/samples/jute-tote-bag.png', 'পাটের ব্যাগ', 'Jute tote'],
  ['/assets/samples/showcase-jute-fibre.webp', 'পাটের আঁশ', 'Jute fibre'],
  ['/assets/samples/showcase-jute-rug.webp', 'পাটের মাদুর', 'Jute rug'],
  ['/assets/samples/denim-jacket-rmg.png', 'ডেনিম জ্যাকেট', 'Denim jacket'],
  ['/assets/samples/showcase-denim-trousers.webp', 'ডেনিম প্যান্ট', 'Denim trousers'],
  ['/assets/samples/showcase-cotton-tshirt.webp', 'সুতির টি-শার্ট', 'Cotton T-shirt'],
  ['/assets/samples/leather-chelsea-boot.png', 'চামড়ার বুট', 'Leather boots'],
  ['/assets/samples/showcase-leather-handbag.webp', 'চামড়ার ব্যাগ', 'Leather handbag'],
  ['/assets/samples/terracotta-tableware.png', 'সিরামিক বাসন', 'Ceramic tableware'],
  ['/assets/samples/showcase-ceramic-vase.webp', 'মাটির ফুলদানি', 'Ceramic vase'],
  ['/assets/samples/showcase-rice.webp', 'চাল', 'Rice'],
  ['/assets/samples/showcase-turmeric.webp', 'হলুদ', 'Turmeric'],
  ['/assets/samples/showcase-tea.webp', 'চা', 'Tea'],
  ['/assets/samples/showcase-seafood.webp', 'চিংড়ি', 'Shrimp'],
  ['/assets/samples/showcase-home-textile.webp', 'হোম টেক্সটাইল', 'Home textile'],
  ['/assets/samples/showcase-bamboo-basket.webp', 'বাঁশের ঝুড়ি', 'Bamboo basket'],
];

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === 'string' ? body.detail : 'Request could not be completed.');
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const FactoryProductManager: React.FC = () => {
  const { t, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, productData] = await Promise.all([
        request<{ profile: Profile | null }>('/api/v1/factory/profile'),
        request<{ items: Product[] }>('/api/v1/factory/products'),
      ]);
      setProfile(profileData.profile);
      setProducts(productData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('তথ্য লোড করা যায়নি।', 'Could not load factory information.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void load(); }, [load, user?.id]);

  const openProfile = () => {
    setProfileForm(profile ? {
      legal_name: profile.legal_name, country_code: profile.country_code,
      address: profile.address || '', registration_number: profile.registration_number || '',
      exporter_registration_number: profile.exporter_registration_number || '',
    } : { ...emptyProfile, legal_name: user?.factory_name || '' });
    setError('');
    setNotice('');
    setEditingProfile(true);
  };

  const openProduct = (product?: Product) => {
    setEditingProduct(product?.id || null);
    setProductForm(product ? {
      name: product.name, description: product.description || '', hs_code: product.hs_code || '',
      hs_description: product.hs_description || '', unit_cost: product.unit_cost == null ? '' : String(product.unit_cost),
      currency: product.currency || 'BDT', monthly_capacity: product.monthly_capacity == null ? '' : String(product.monthly_capacity),
      image_url: product.image_url || '',
    } : emptyProduct);
    setError('');
    setNotice('');
    setProductFormOpen(true);
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const saved = await request<Profile>('/api/v1/factory/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          address: profileForm.address.trim() || null,
          registration_number: profileForm.registration_number.trim() || null,
          exporter_registration_number: profileForm.exporter_registration_number.trim() || null,
        }),
      });
      setProfile(saved);
      setEditingProfile(false);
      setNotice(t('কারখানার তথ্য সংরক্ষিত হয়েছে।', 'Factory information saved.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('তথ্য সংরক্ষণ করা যায়নি।', 'Could not save factory information.'));
    } finally { setBusy(false); }
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const endpoint = '/api/v1/factory/products' + (editingProduct ? '/' + encodeURIComponent(editingProduct) : '');
      const saved = await request<Product>(endpoint, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          hs_code: productForm.hs_code.trim() || null,
          hs_description: productForm.hs_description.trim() || null,
          unit_cost: productForm.unit_cost === '' ? null : Number(productForm.unit_cost),
          currency: productForm.currency.toUpperCase(),
          monthly_capacity: productForm.monthly_capacity === '' ? null : Number(productForm.monthly_capacity),
          image_url: productForm.image_url.trim() || null,
        }),
      });
      setProducts(current => editingProduct ? current.map(p => p.id === saved.id ? saved : p) : [...current, saved]);
      setProductFormOpen(false);
      setNotice(t('পণ্যের তথ্য সংরক্ষিত হয়েছে।', 'Product saved.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('পণ্যের তথ্য সংরক্ষণ করা যায়নি।', 'Could not save the product.'));
    } finally { setBusy(false); }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(t('এই পণ্যটি আপনার তালিকা থেকে মুছে ফেলবেন?', 'Remove this product from your list?'))) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await request<void>('/api/v1/factory/products/' + encodeURIComponent(product.id), { method: 'DELETE' });
      setProducts(current => current.filter(p => p.id !== product.id));
      setNotice(t('পণ্যটি মুছে ফেলা হয়েছে।', 'Product removed.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('পণ্যটি মুছে ফেলা যায়নি।', 'Could not remove the product.'));
    } finally { setBusy(false); }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-labelledby="factory-products-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="factory-products-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-50 font-bangla">
            {t('আমার কারখানা ও পণ্য', 'My factory and products')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-bangla">
            {t('আপনার কারখানার তথ্য ও নিজস্ব পণ্য তালিকা দেখুন এবং হালনাগাদ করুন।', 'View and update your factory information and product list.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary inline-flex items-center gap-2 text-xs" onClick={openProfile} disabled={loading || busy}>
            <Building2 className="h-4 w-4" aria-hidden="true" /> {profile ? t('কারখানার তথ্য সম্পাদনা', 'Edit factory') : t('কারখানার তথ্য যোগ করুন', 'Add factory details')}
          </button>
          <button type="button" className="btn-primary inline-flex items-center gap-2 text-xs" onClick={() => openProduct()} disabled={loading || busy}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('পণ্য যোগ করুন', 'Add product')}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</p>}
      {loading ? <p className="mt-5 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">{t('তথ্য লোড হচ্ছে...', 'Loading information...')}</p> : (
        <>
          {profile && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{profile.legal_name}</p>
              {profile.is_illustrative && <span className="badge badge-blue">{t('নমুনা প্রোফাইল', 'Illustrative profile')}</span>}
              {profile.address && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{profile.address}</p>}
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t('প্রোফাইলের অবস্থা:', 'Profile status:')} {profile.verification_status}</p>
            </div>
          )}
          {products.length === 0 ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <Package className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{t('আপনার পণ্যের তালিকা এখনো খালি। পণ্যের নাম ও প্রয়োজনীয় তথ্য যোগ করুন।', 'Your product list is empty. Add a product and its details.')}</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60">
                  {product.image_url && product.image_url.startsWith('/') && !product.image_url.startsWith('//') ? (
                    <img src={product.image_url} alt={product.name} width={480} height={320} loading="lazy" className="h-40 w-full object-cover bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800"><Package className="h-8 w-8" aria-hidden="true" /></div>
                  )}
                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
                    {product.is_illustrative && <span className="badge badge-blue">{t('নমুনা পণ্য', 'Illustrative product')}</span>}
                    {product.description && <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{product.description}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {product.hs_code && <span>HS: {product.hs_code}</span>}
                      {product.unit_cost != null && <span>{t('একক খরচ:', 'Unit cost:')} {product.currency} {product.unit_cost.toLocaleString()}</span>}
                      {product.monthly_capacity != null && <span>{t('মাসিক সক্ষমতা:', 'Monthly capacity:')} {product.monthly_capacity.toLocaleString()}</span>}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => openProduct(product)} disabled={busy} className="btn-secondary inline-flex items-center gap-1.5 text-xs"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t('সম্পাদনা', 'Edit')}</button>
                      <button type="button" onClick={() => void deleteProduct(product)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('মুছুন', 'Remove')}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {editingProfile && (
        <form onSubmit={saveProfile} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('কারখানার নমুনা তথ্য সম্পাদনা করলে তার পণ্যগুলো সাধারণ প্রদর্শনী থেকে সরবে। আপনার অ্যাকাউন্টে সব তথ্য সংরক্ষিত থাকবে।', 'Editing a sample factory removes its products from the shared showcase. All information remains saved in your account.')}</p>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('কারখানার তথ্য', 'Factory information')}</h3>
            <button type="button" onClick={() => setEditingProfile(false)} aria-label={t('বন্ধ করুন', 'Close')}><X className="h-5 w-5 text-slate-600 dark:text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelStyle}><span>{t('প্রতিষ্ঠানের নাম', 'Legal name')}</span><input className={inputStyle} required maxLength={255} value={profileForm.legal_name} onChange={e => setProfileForm({ ...profileForm, legal_name: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('দেশের কোড', 'Country code')}</span><input className={inputStyle} required minLength={2} maxLength={2} value={profileForm.country_code} onChange={e => setProfileForm({ ...profileForm, country_code: e.target.value.toUpperCase() })} /></label>
            <label className={labelStyle + ' sm:col-span-2'}><span>{t('ঠিকানা', 'Address')}</span><input className={inputStyle} maxLength={1000} value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('ব্যবসা নিবন্ধন নম্বর', 'Business registration number')}</span><input className={inputStyle} maxLength={100} value={profileForm.registration_number} onChange={e => setProfileForm({ ...profileForm, registration_number: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('রপ্তানিকারক নিবন্ধন নম্বর', 'Exporter registration number')}</span><input className={inputStyle} maxLength={100} value={profileForm.exporter_registration_number} onChange={e => setProfileForm({ ...profileForm, exporter_registration_number: e.target.value })} /></label>
          </div>
          <button type="submit" className="btn-primary text-xs" disabled={busy}>{busy ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('তথ্য সংরক্ষণ করুন', 'Save information')}</button>
        </form>
      )}

      {productFormOpen && (
        <form onSubmit={saveProduct} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('সম্পাদিত তথ্য আপনার অ্যাকাউন্টেই থাকবে। নমুনা পণ্য সম্পাদনা করলে সেটি সাধারণ প্রদর্শনী থেকে সরবে।', 'Edited information stays in your account. Editing a sample product removes it from the shared showcase.')}</p>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{editingProduct ? t('পণ্যের তথ্য সম্পাদনা', 'Edit product') : t('নতুন পণ্য', 'New product')}</h3>
            <button type="button" onClick={() => setProductFormOpen(false)} aria-label={t('বন্ধ করুন', 'Close')}><X className="h-5 w-5 text-slate-600 dark:text-slate-400" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelStyle}><span>{t('পণ্যের নাম', 'Product name')}</span><input className={inputStyle} required maxLength={255} value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></label>
            <label className={labelStyle}><span>HS code</span><input className={inputStyle} maxLength={20} value={productForm.hs_code} onChange={e => setProductForm({ ...productForm, hs_code: e.target.value })} /></label>
            <label className={labelStyle + ' sm:col-span-2'}><span>{t('পণ্যের বিবরণ', 'Description')}</span><textarea className={inputStyle} maxLength={5000} rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('একক উৎপাদন খরচ', 'Unit cost')}</span><input className={inputStyle} type="number" min="0" step="0.01" value={productForm.unit_cost} onChange={e => setProductForm({ ...productForm, unit_cost: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('মুদ্রা', 'Currency')}</span><input className={inputStyle} required minLength={3} maxLength={3} value={productForm.currency} onChange={e => setProductForm({ ...productForm, currency: e.target.value.toUpperCase() })} /></label>
            <label className={labelStyle}><span>{t('মাসিক উৎপাদন সক্ষমতা', 'Monthly production capacity')}</span><input className={inputStyle} type="number" min="0" step="1" value={productForm.monthly_capacity} onChange={e => setProductForm({ ...productForm, monthly_capacity: e.target.value })} /></label>
            <label className={labelStyle}><span>{t('পণ্যের নমুনা ছবি', 'Illustrative product image')}</span><select className={inputStyle} value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}>
              <option value="">{t('ছবি ছাড়া রাখুন', 'No image')}</option>
              {productForm.image_url && !productImages.some(([path]) => path === productForm.image_url) && <option value={productForm.image_url}>{t('সংরক্ষিত ছবি', 'Saved image')}</option>}
              {productImages.map(([path, bn, en]) => <option key={path} value={path}>{t(bn, en)}</option>)}
            </select><span className="block text-xs font-normal text-slate-600 dark:text-slate-400">{t('পণ্যের সঙ্গে মেলে এমন নমুনা ছবি বেছে নিন।', 'Choose an illustrative image that matches your product.')}</span></label>
          </div>
          <button type="submit" className="btn-primary text-xs" disabled={busy}>{busy ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পণ্য সংরক্ষণ করুন', 'Save product')}</button>
        </form>
      )}
    </section>
  );
};
