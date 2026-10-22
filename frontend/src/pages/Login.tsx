import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Lock, Mail, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target
  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

    const ok = await login(email.trim(), password);
    setLoading(false);

    if (ok) {
      navigate(fromLocation, { replace: true });
    } else {
      setError(t('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। সঠিক ক্রেডেনশিয়াল দিয়ে পুনরায় চেষ্টা করুন।', 'Invalid email or password. Please verify your credentials and try again.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">

        {/* Left Column: Institutional Brand & Security Credentials */}
        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="pill-status pill-accent">SOVEREIGN RBAC</span>
              <span className="pill-status">ENTERPRISE ACCESS</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white leading-tight font-bangla">
                {t('আন্তর্জাতিক বাণিজ্য ওয়ার্কস্পেস', 'International Trade Workspace')}
              </h1>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-bangla">
                {t(
                  'বাংলাদেশের শীর্ষ রপ্তানিকারক ও আন্তর্জাতিক ক্রেতাদের জন্য তৈরি সার্বভৌম এআই বাণিজ্য প্ল্যাটফর্ম।',
                  'Sovereign AI trade intelligence platform engineered for Bangladeshi exporters and global sourcing directors.'
                )}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('ইউরোপীয় ইউনিয়ন সিবিএএম স্কোপ ২ কার্বন অডিট কমপ্লায়েন্স', 'EU CBAM Scope 2 carbon audit compliance ready')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('ডিপগ্রাম নোভা-৩ সমৃদ্ধ কথ্য বাংলা ভয়েস কমান্ড ইঞ্জিন', 'Deepgram Nova-3 powered spoken factory Bangla engine')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('অ্যাজিউর ওপেনএআই সার্বভৌম ট্রেড নেগোসিয়েশন উপদেষ্টা', 'Azure OpenAI sovereign trade negotiation advisor')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300 font-bangla">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('স্থানীয় এনআইডি ও টিআইএন ডেটা সার্বভৌমিকতা ফিল্টার', 'Local NID and TIN data sovereignty protection')}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bangla">
              {t('২৫৬-বিট টিএলএস এনক্রিপশন ও ভূমিকা-ভিত্তিক প্রবেশাধিকার নিশ্চিত।', 'Protected with 256-bit TLS encryption and role-based access control.')}
            </span>
          </div>
        </div>

        {/* Right Column: Standard Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-900/60">
          <div className="max-w-md w-full mx-auto space-y-6">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-bangla">
                {t('অ্যাকাউন্টে সাইন ইন করুন', 'Sign In to Your Account')}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400 font-bangla">
                {t(
                  'আপনার অনুমোদিত ইমেইল ও পাসওয়ার্ড প্রদান করে সিস্টেমে প্রবেশ করুন।',
                  'Enter your verified email and password to access your deal room.'
                )}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-rose-800/80 bg-rose-950/40 text-xs text-rose-300 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-bangla leading-relaxed">{error}</span>
              </div>
            )}

            {/* Quick Demo Credentials for Competition Evaluators and Judges */}
            <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                <span className="font-bold text-emerald-400 font-bangla">
                  {t('এক-ক্লিকে টেস্ট ক্রেডেনশিয়াল (জুরি ও মূল্যায়নকারী):', '1-Click Evaluation Credentials:')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('exporter@exportpilot.com');
                    setPassword('ExportPilot2026!');
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-left text-[11px] transition-colors group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-emerald-300 font-bangla">
                    {t('রপ্তানিকারক ডেমো', 'Exporter Demo')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    exporter@exportpilot.com
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@exportpilot.com');
                    setPassword('ExportPilotAdmin2026!');
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-left text-[11px] transition-colors group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-amber-300 font-bangla">
                    {t('অডিট অফিসার / অ্যাডমিন', 'Admin / Auditor Demo')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    admin@exportpilot.com
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-bangla">
                  {t('ইমেইল ঠিকানা', 'Email Address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-bangla">
                    {t('পাসওয়ার্ড', 'Password')}
                  </label>
                  <Link
                    to="/docs#security-governance"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-bangla"
                  >
                    {t('সহায়তা প্রয়োজন?', 'Need Help?')}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400 font-bangla">
                    {t('আমাকে মনে রাখুন', 'Remember me')}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-tap font-bangla"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-bangla">
                {t('নতুন এক্সপোর্টার বা বায়ার?', 'New exporter or buyer?')}{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
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
