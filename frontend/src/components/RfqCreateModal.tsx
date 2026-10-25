import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Drawer } from './ui/dialog';

interface RfqTemplate {
  id: string;
  labelBn: string;
  labelEn: string;
  product_title: string;
  hs_code: string;
  target_fob_usd: number;
  quantity_units: number;
  destination_country: string;
  target_co2_kg: number;
}

const TEMPLATES: RfqTemplate[] = [
  {
    id: 'jute-tote',
    labelBn: 'জুট শপিং টোট (৩০০ গ্রাম)',
    labelEn: 'Jute Shopping Tote (300g)',
    product_title: 'Eco Jute Shopping Tote Bags',
    hs_code: '4202.92.10',
    target_fob_usd: 3.45,
    quantity_units: 15000,
    destination_country: 'Germany',
    target_co2_kg: 1.2,
  },
  {
    id: 'denim-12oz',
    labelBn: '১২ আউন্স ডেনিম জ্যাকেট',
    labelEn: '12oz Denim Jacket',
    product_title: '12oz Organic Cotton Denim Jackets',
    hs_code: '6203.32.00',
    target_fob_usd: 19.2,
    quantity_units: 8000,
    destination_country: 'United Kingdom',
    target_co2_kg: 2.1,
  },
  {
    id: 'leather-boot',
    labelBn: 'ফুল-গ্রেইন লেদার চেলসি বুট',
    labelEn: 'Full-Grain Leather Chelsea Boot',
    product_title: 'Genuine Leather Oxford Formal Shoes',
    hs_code: '6403.51.00',
    target_fob_usd: 36.5,
    quantity_units: 4000,
    destination_country: 'Japan',
    target_co2_kg: 3.0,
  },
];

const inputCls =
  'field text-xs font-bangla';

/**
 * Buyer-facing RFQ composer. Posts to the buyer-gated /rfq/create endpoint
 * with one-click Bangladeshi commodity templates.
 */
export const RfqCreateModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const { t } = useAuth();
  const [form, setForm] = useState<RfqTemplate>({ ...TEMPLATES[0] });
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const set = <K extends keyof RfqTemplate>(key: K, value: RfqTemplate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !deadline) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product_title: form.product_title,
          hs_code: form.hs_code,
          target_fob_usd: form.target_fob_usd,
          quantity_units: form.quantity_units,
          destination_country: form.destination_country,
          target_co2_kg: form.target_co2_kg,
          delivery_deadline: deadline,
          specifications_note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'create failed');
      }
      setCreated(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1400);
    } catch (err) {
      setError(err instanceof Error && err.message !== 'create failed'
        ? err.message
        : t('আরএফকিউ প্রকাশ করা যায়নি। আবার চেষ্টা করুন।', 'Could not post the RFQ. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={true}
      onClose={onClose}
      title={t('আন্তর্জাতিক ক্রেতার চাহিদাপত্র প্রকাশ', 'Post an international RFQ')}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Megaphone className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
            {t('বাংলাদেশি যাচাইকৃত কারখানাগুলো সরাসরি কোটেশন দেবে।', 'Verified Bangladeshi factories will quote directly.')}
          </p>
        </div>

        {created ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" aria-hidden="true" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-bangla">
              {t('আপনার চাহিদাপত্র প্রকাশিত হয়েছে।', 'Your RFQ has been posted.')}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3.5">
            <fieldset>
              <legend className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla mb-1.5">
                {t('পণ্যের টেমপ্লেট', 'Commodity template')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setForm({ ...tpl })}
                    aria-pressed={form.id === tpl.id}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-bangla text-left transition-colors ${
                      form.id === tpl.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {t(tpl.labelBn, tpl.labelEn)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="rfq-title" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('পণ্যের নাম', 'Product title')}
                </label>
                <input id="rfq-title" type="text" required minLength={3} maxLength={255} value={form.product_title}
                  onChange={(e) => set('product_title', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="rfq-hs" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('এইচএস কোড', 'HS code')}
                </label>
                <input id="rfq-hs" type="text" required minLength={4} maxLength={20} value={form.hs_code}
                  onChange={(e) => set('hs_code', e.target.value)} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label htmlFor="rfq-country" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('গন্তব্য দেশ', 'Destination country')}
                </label>
                <input id="rfq-country" type="text" required minLength={2} maxLength={100} value={form.destination_country}
                  onChange={(e) => set('destination_country', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="rfq-fob" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('লক্ষ্য FOB দর (USD)', 'Target FOB (USD)')}
                </label>
                <input id="rfq-fob" type="number" required min="0.01" step="0.05" value={form.target_fob_usd}
                  onChange={(e) => set('target_fob_usd', Number(e.target.value))} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label htmlFor="rfq-qty" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('পরিমাণ (পিস)', 'Quantity (units)')}
                </label>
                <input id="rfq-qty" type="number" required min="1" step="100" value={form.quantity_units}
                  onChange={(e) => set('quantity_units', Number(e.target.value))} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label htmlFor="rfq-co2" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('কার্বন লক্ষ্য (kg CO2e/পিস)', 'Carbon target (kg CO2e/unit)')}
                </label>
                <input id="rfq-co2" type="number" required min="0.01" step="0.1" value={form.target_co2_kg}
                  onChange={(e) => set('target_co2_kg', Number(e.target.value))} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label htmlFor="rfq-deadline" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('ডেলিভারির শেষ তারিখ', 'Delivery deadline')}
                </label>
                <input id="rfq-deadline" type="date" required value={deadline}
                  onChange={(e) => setDeadline(e.target.value)} className={`${inputCls} font-mono`} />
              </div>
              <div className="col-span-2">
                <label htmlFor="rfq-note" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 font-bangla">
                  {t('অতিরিক্ত শর্ত (ঐচ্ছিক)', 'Specifications note (optional)')}
                </label>
                <textarea id="rfq-note" rows={2} maxLength={1000} value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('যেমন: OEKO-TEX সনদ, নির্দিষ্ট রঙ বা প্যাকেজিং শর্ত।', 'e.g. OEKO-TEX certification, specific colors, or packaging rules.')}
                  className={inputCls} />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-[11px] text-rose-700 dark:text-rose-300 font-bangla">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary text-xs font-bangla">
                {t('বাতিল', 'Cancel')}
              </button>
              <button type="submit" disabled={submitting || !deadline} className="btn-primary text-xs font-bangla inline-flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                <span>{submitting ? t('প্রকাশ হচ্ছে...', 'Posting...') : t('চাহিদাপত্র প্রকাশ করুন', 'Post RFQ')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
};
