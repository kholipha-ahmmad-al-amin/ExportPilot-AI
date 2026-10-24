import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Lock, Mail, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target. ProtectedRoute writes ?from=... while public CTAs use
  // ?redirect=...; both are honored with identical path-safety checks.
  const requestedPath =
    new URLSearchParams(location.search).get('from') ||
    new URLSearchParams(location.search).get('redirect');
  const statePath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  const fromLocation = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//') && !requestedPath.includes('\\')
    ? requestedPath
    : statePath || '/app';

  const destinationForRole = (role: string) => {
    const roleHome =
      role === 'admin'
        ? '/admin'
        : role === 'compliance_auditor'
        ? '/audit'
        : role === 'verified_buyer'
        ? '/buyers'
        : role === 'factory_owner'
        ? '/app'
        : '/';
    const publicPath = !['/app', '/dealroom', '/buyers', '/data', '/security', '/architecture', '/audit', '/admin', '/dashboard', '/catalog'].some(
      (path) => fromLocation === path || fromLocation.startsWith(`${path}/`) || fromLocation.startsWith(`${path}?`)
    );
    const allowedByRole =
      role === 'admin' ||
      (role === 'factory_owner' && ['/app', '/dealroom', '/buyers', '/data', '/security', '/architecture', '/audit', '/dashboard', '/catalog'].some((path) => fromLocation === path || fromLocation.startsWith(`${path}?`))) ||
      (role === 'verified_buyer' && ['/buyers', '/catalog', '/architecture', '/docs'].some((path) => fromLocation === path || fromLocation.startsWith(`${path}?`))) ||
      (role === 'compliance_auditor' && ['/data', '/security', '/architecture', '/audit'].some((path) => fromLocation === path || fromLocation.startsWith(`${path}?`)));
    return publicPath || allowedByRole ? fromLocation : roleHome;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড প্রদান করুন।', 'Please enter your email and password.'));
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.user) {
      navigate(destinationForRole(result.user.role), { replace: true });
    } else if (result.networkError) {
      setError(t(
        'সার্ভারে সংযোগ স্থাপন করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
        'Could not reach the server. Check your connection and try again.'
      ));
    } else {
      setError(t('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। সঠিক ক্রেডেনশিয়াল দিয়ে পুনরায় চেষ্টা করুন।', 'Invalid email or password. Please verify your credentials and try again.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl dark:shadow-2xl transition-colors">

        {/* Left Column: Institutional Brand & Trust Panel */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-50 dark:bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                {t('নিরাপদ বাণিজ্য অ্যাকাউন্ট', 'Secure trade access')}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium font-mono text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                ENTERPRISE
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight font-bangla">
                {t('আন্তর্জাতিক বাণিজ্য ওয়ার্কস্পেস', 'International Trade Workspace')}
              </h1>
              <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'বাংলাদেশের শীর্ষ রপ্তানিকারক ও আন্তর্জাতিক ক্রেতাদের জন্য তৈরি সার্বভৌম এআই বাণিজ্য প্ল্যাটফর্ম।',
                  'Trade support for Bangladeshi exporters and international buyers.'
                )}
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('বিদ্যুৎ বিল থেকে প্রাথমিক নির্গমন হিসাব', 'Preliminary emissions estimates from utility bills')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('সহজ ও নির্ভুল কথ্য বাংলা ভয়েস সুবিধা', 'Accurate natural spoken Bangla voice interface')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('দর ও বাণিজ্যিক শর্ত পর্যালোচনার সহায়তা', 'Support for reviewing prices and trade terms')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('পরিচিত এনআইডি ও টিআইএন নম্বর আড়াল', 'Masking recognized NID and TIN formats')}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bangla">
              {t('আপনার অ্যাকাউন্টে প্রবেশাধিকার অনুমোদিত ব্যবহারকারীদের জন্য সীমিত।', 'Workspace access is limited to authorized account holders.')}
            </span>
          </div>
        </div>

        {/* Right Column: Production Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto space-y-6">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla">
                {t('অ্যাকাউন্টে সাইন ইন করুন', 'Sign In to Your Account')}
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-bangla">
                {t(
                  'আপনার অনুমোদিত ইমেইল ও পাসওয়ার্ড প্রদান করে সিস্টেমে প্রবেশ করুন।',
                  'Enter the email address and password used for your account.'
                )}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="font-bangla leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">
                  {t('ইমেইল ঠিকানা', 'Email Address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bangla">
                    {t('পাসওয়ার্ড', 'Password')}
                  </label>
                  <Link
                    to="/docs"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline transition-colors font-bangla"
                  >
                    {t('সহায়তা প্রয়োজন?', 'Need Help?')}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-tap font-bangla"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('যাচাই করা হচ্ছে...', 'Verifying session...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('সাইন ইন করুন', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
                {t('নতুন এক্সপোর্টার?', 'New exporter?')}{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                >
                  {t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create Account')}
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
