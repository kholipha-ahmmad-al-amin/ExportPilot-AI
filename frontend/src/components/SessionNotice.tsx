import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SessionNotice: React.FC = () => {
  const { sessionNotice, t, refreshSession, logout } = useAuth();
  const [busy, setBusy] = React.useState(false);
  if (!sessionNotice) return null;
  const retry = async () => {
    setBusy(true);
    try { await (sessionNotice === 'logout_failed' ? logout() : refreshSession()); }
    finally { setBusy(false); }
  };
  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p>{sessionNotice === 'logout_failed'
          ? t('লগআউট হয়নি। সংযোগ ফিরে এলে আবার চেষ্টা করুন।', 'You are still signed in. Reconnect and try signing out again.')
          : sessionNotice === 'expired'
          ? t('আপনার সেশন শেষ হয়েছে বা প্রবেশাধিকার বদলেছে। কাজ চালাতে আবার লগইন করুন।', 'Your session ended or access changed. Sign in again to continue.')
          : t('সার্ভারের সঙ্গে যোগাযোগ হচ্ছে না। আবার চেষ্টা করুন।', 'The server could not be reached. Please try again.')}</p>
        {sessionNotice !== 'expired' && <button type="button" onClick={() => void retry()} disabled={busy} className="flex min-h-10 items-center gap-2 rounded-lg border border-amber-400 px-3 py-2 font-medium disabled:opacity-60 dark:border-amber-600">
          <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />{t('আবার চেষ্টা করুন', 'Try again')}
        </button>}
      </div>
    </div>
  );
};
