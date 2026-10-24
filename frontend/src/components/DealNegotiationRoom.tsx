import React, { useEffect, useState } from 'react';
import { FileText, Info, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DealNegotiationRoomProps {
  tradeDealId?: string;
  initialPresetId?: string;
  productTitleBn?: string;
  productTitleEn?: string;
  recommendedFobUsd?: number;
  defaultMoq?: number;
  unitCostBdt?: number;
  hsCode?: string;
  factoryLocation?: string;
  buyerContext?: string;
  appliedCounter?: { price: number; payment?: string; nonce: number };
  onDealClosed?: () => void;
}

export const DealNegotiationRoom: React.FC<DealNegotiationRoomProps> = ({
  tradeDealId,
  productTitleBn = 'পণ্য',
  productTitleEn = 'Product',
  recommendedFobUsd = 0,
  defaultMoq = 0,
  hsCode = '',
  factoryLocation = '',
  buyerContext,
  appliedCounter,
}) => {
  const { t } = useAuth();
  const [price, setPrice] = useState(recommendedFobUsd);
  const [quantity, setQuantity] = useState(defaultMoq);
  const [incoterm, setIncoterm] = useState('FOB Chattogram');
  const [payment, setPayment] = useState('Irrevocable L/C at sight, subject to bank confirmation');
  const [leadDays, setLeadDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPrice(recommendedFobUsd);
    setQuantity(defaultMoq);
    setSaved(false);
  }, [recommendedFobUsd, defaultMoq, tradeDealId]);

  // Co-pilot counter proposals land here: fill price and payment, mark unsaved.
  useEffect(() => {
    if (!appliedCounter || appliedCounter.nonce === 0) return;
    setPrice(appliedCounter.price);
    if (appliedCounter.payment) setPayment(appliedCounter.payment);
    setSaved(false);
  }, [appliedCounter]);

  const total = price > 0 && quantity > 0 ? price * quantity : 0;

  const saveDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tradeDealId || quantity <= 0 || price <= 0) return;
    setSaving(true);
    setError('');
    setSaved(false);
    const reference = 'TERM-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6);
    try {
      const response = await fetch('/api/v1/mcp/deals/' + encodeURIComponent(tradeDealId) + '/interactions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'term_sheet_draft',
          notes: 'Non-binding term sheet draft. No buyer was contacted and no terms were agreed.',
          details: {
            reference,
            product: productTitleEn,
            hs_code: hsCode || null,
            factory_location: factoryLocation || null,
            buyer_reference: buyerContext || null,
            fob_price_usd_per_unit: price,
            quantity_units: quantity,
            payment_terms: payment,
            incoterm,
            delivery_lead_days: leadDays ? Number(leadDays) : null,
            total_value_usd: total,
            buyer_contacted: false,
            buyer_agreement: false,
          },
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || t('খসড়াটি সংরক্ষণ করা যায়নি।', 'Could not save the draft.'));
      }
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('খসড়াটি সংরক্ষণ করা যায়নি।', 'Could not save the draft.'));
    } finally {
      setSaving(false);
    }
  };

  const field = 'field w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 font-bangla">{t('বাণিজ্য শর্তের খসড়া', 'Trade terms draft')}</h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{t(productTitleBn, productTitleEn)}</p>
          {buyerContext && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-bangla">
              {t('প্রস্তুত খসড়ার প্রতিপক্ষ হিসেবে বিবেচিত ক্রেতা (নমুনা তালিকা থেকে):', 'Counterparty noted for this draft (from the sample directory):')}{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{buyerContext}</span>
            </p>
          )}
        </div>
      </div>

      <div role="note" className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="font-bangla">{t(
          'এখানে প্রকৃত বায়ার যোগাযোগ বা অর্ডার গ্রহণের ব্যবস্থা নেই। শর্তগুলো শুধু আপনার খসড়া হিসেবে সংরক্ষিত হবে; কোনো বায়ারের কাছে পাঠানো বা সম্মত বলে দেখানো হবে না।',
          'This workspace has no buyer contacts or order acceptance. Your terms are saved only as a draft and are not sent to a buyer or treated as agreed.'
        )}</p>
      </div>

      <form onSubmit={saveDraft} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="deal-fob-price" className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">{t('প্রতি পিস এফওবি দর (USD)', 'FOB price per unit (USD)')}</span>
            <input id="deal-fob-price" type="number" min="0.01" step="0.01" required value={price || ''} onChange={e => { setPrice(Number(e.target.value)); setSaved(false); }} className={field} />
          </label>
          <label htmlFor="deal-quantity" className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">{t('পরিমাণ (পিস)', 'Quantity (units)')}</span>
            <input id="deal-quantity" type="number" min="1" step="1" required value={quantity || ''} onChange={e => { setQuantity(Number(e.target.value)); setSaved(false); }} className={field} />
          </label>
          <label htmlFor="deal-delivery-term" className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">{t('ডেলিভারি শর্ত', 'Delivery term')}</span>
            <input id="deal-delivery-term" type="text" maxLength={100} value={incoterm} onChange={e => { setIncoterm(e.target.value); setSaved(false); }} className={field} />
          </label>
          <label htmlFor="deal-payment-terms" className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">{t('পেমেন্ট শর্ত', 'Payment terms')}</span>
            <input id="deal-payment-terms" type="text" maxLength={200} value={payment} onChange={e => { setPayment(e.target.value); setSaved(false); }} className={field} />
          </label>
          <label htmlFor="deal-lead-days" className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800 dark:text-slate-200">{t('সম্ভাব্য উৎপাদন ও চালানের সময় (দিন)', 'Estimated production and shipment lead time (days)')}</span>
            <input id="deal-lead-days" type="number" min="1" max="3650" step="1" value={leadDays} onChange={e => { setLeadDays(e.target.value); setSaved(false); }} placeholder={t('আপনার হিসাব অনুযায়ী লিখুন', 'Enter your estimate')} className={field} />
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">{t('খসড়ার মোট মূল্য', 'Draft total value')}</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
              USD {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button type="submit" disabled={!tradeDealId || saving || quantity <= 0 || price <= 0} className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('খসড়া সংরক্ষণ করুন', 'Save draft')}
          </button>
        </div>
      </form>

      {!tradeDealId && <p className="mt-4 text-sm text-amber-800 dark:text-amber-300 font-bangla">{t('খসড়া সংরক্ষণের আগে পণ্য বিশ্লেষণ সম্পন্ন করুন।', 'Run the product analysis before saving a draft.')}</p>}
      {saved && <p role="status" className="mt-4 text-sm text-emerald-800 dark:text-emerald-300 font-bangla">{t('খসড়া আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে। এটি কোনো বায়ারকে পাঠানো হয়নি।', 'Draft saved to your account. It was not sent to a buyer.')}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
      {hsCode && <p className="mt-5 text-xs text-slate-600 dark:text-slate-400">HS reference: {hsCode}</p>}
    </section>
  );
};

