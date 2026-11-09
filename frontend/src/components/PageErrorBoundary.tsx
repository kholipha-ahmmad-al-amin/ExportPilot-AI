import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

class Boundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode; routeKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous: Readonly<{ routeKey: string }>) {
    if (previous.routeKey !== this.props.routeKey && this.state.failed) this.setState({ failed: false });
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { t } = useAuth();
  return <Boundary routeKey={location.pathname} fallback={
    <section className="mx-auto max-w-xl px-6 py-20 text-center" role="alert">
      <AlertCircle className="mx-auto mb-5 text-amber-600 dark:text-amber-400" size={32} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{t('পেজটি খুলতে সমস্যা হয়েছে', 'This page could not be loaded')}</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{t('পেজটি আবার খুলে দেখুন। আপনার সংরক্ষিত তথ্য অ্যাকাউন্টেই আছে।', 'Try reloading the page. Your saved records remain in your account.')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}><RefreshCw size={16} />{t('আবার খুলুন', 'Reload page')}</button>
        <Link className="btn-ghost" to="/">{t('হোমে ফিরুন', 'Go to home')}</Link>
      </div>
    </section>
  }>{children}</Boundary>;
};
