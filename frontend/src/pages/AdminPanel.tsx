import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Cpu, DollarSign, Database, CheckCircle2, Lock, LogOut, AlertCircle, ArrowRight } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user, login, logout, t } = useAuth();
  const [modelRouter, setModelRouter] = useState('local_deterministic');
  
  // Login form state
  const [adminEmail, setAdminEmail] = useState('admin@exportpilot.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user && user.role === 'admin';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const success = await login(adminEmail, adminPassword);
      if (!success) {
        setLoginError(t('ভুল ইমেইল অথবা সিকিউরিটি পাসওয়ার্ড। দয়া করে সঠিক ক্রেডেনশিয়াল দিন।', 'Invalid administrator email or security password. Access denied.'));
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If NOT authenticated as admin, render the privileged login gateway
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 uppercase tracking-wider">
              Privileged Console Access
            </span>
            <h1 className="text-xl font-bold text-white">
              {t('অ্যাডমিন কনসোল গেটওয়ে', 'Administrator Gateway')}
            </h1>
            <p className="text-xs text-slate-400 font-bangla">
              {t(
                'সিস্টেম কনফিগারেশন, Azure ক্রেডিট মনিটর ও মডেল রাউটার অ্যাক্সেস করতে আপনার অ্যাডমিন ক্রেডেনশিয়াল দিন।',
                'Enter privileged security credentials to access system telemetry and Azure cloud guards.'
              )}
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t('অ্যাডমিনিস্ট্রেটর ইমেইল', 'Administrator Email')}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                placeholder="admin@exportpilot.ai"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t('সিকিউরিটি পাসওয়ার্ড', 'Security Passphrase')}
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                placeholder="••••••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? t('যাচাই করা হচ্ছে...', 'Verifying...') : t('কনসোল আনলক করুন', 'Unlock Admin Console')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400 font-mono">
              Canonical Route: <span className="text-amber-400">/admin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Once authenticated as admin, render the full admin cockpit
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Admin Status & Sign Out */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
              SYSTEM ADMINISTRATION
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              AUTHENTICATED: {user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {t('অ্যাডমিন কন্ট্রোল সেন্টার ও ক্লাউড টেলিম্যাট্রি', 'Admin Control Center & Cloud Telemetry')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-bangla">
            {t(
              'Microsoft Azure ($১০০ স্টুডেন্ট ক্রেডিট) রিসোর্স মনিটর, ডিপগ্রাম ভয়েস স্টেটাস ও এআই মডেল রাউটার।',
              'Azure for Students resource monitor, Deepgram Nova-3 voice state, and model router controls.'
            )}
          </p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{t('লক ও সাইন আউট', 'Lock & Sign Out')}</span>
        </button>
      </div>

      {/* Azure for Students $100 Credit Burn Tracker */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>{t('Microsoft Azure B1 প্ল্যান ও ক্রেডিট ড্যাশবোর্ড', 'Azure B1 Plan & Credit Dashboard')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('Azure App Service (B1 Basic Linux): 1.75 GB RAM, কাস্টম ডোমেইন, SSL এবং WebSockets সক্রিয়।', 'App Service (B1 Basic Linux): 1.75 GB RAM, Custom Domain, SSL, and WebSockets active.')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              STATUS: RUNNING (B1 BASIC)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">{t('স্টুডেন্ট ক্রেডিট:', 'Student Grant:')}</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">$100.00 USD</div>
            <div className="text-[11px] text-slate-400">Valid for 365 Days</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">{t('আনুমানিক মাসিক খরচ:', 'Plan Rate:')}</span>
            <div className="text-2xl font-extrabold text-blue-400 font-mono">~$12.50 / mo</div>
            <div className="text-[11px] text-emerald-400">8+ Months Runway on Credit</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">{t('কাস্টম ডোমেইন ও SSL:', 'Custom Domain & SSL:')}</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">UNLOCKED</div>
            <div className="text-[11px] text-slate-400">Subdomain Ready</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">{t('ক্লাউড রিজিয়ন:', 'Azure Cloud Region:')}</span>
            <div className="text-2xl font-extrabold text-white font-mono">East Asia</div>
            <div className="text-[11px] text-slate-400">Optimized routing to Dhaka</div>
          </div>
        </div>
      </div>

      {/* AI Model & Open-Source Engine Router */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>{t('এআই মডেল ও ওপেন-সোর্স ইঞ্জিন রাউটার', 'AI Model & Open-Source Engine Router')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('কোন ইঞ্জিন দিয়ে ব্যাকএন্ডের ৫টি এজেন্ট রান হবে তা নির্বাচন করুন:', 'Select primary execution provider for the 5-agent pipeline:')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'local_deterministic',
              name: '100% Open-Source Engine (Default)',
              badge: '$0.00 COST • ACTIVE',
              desc: 'PyMuPDF + OpenCV + NetworkX GraphRAG + ReportLab + Deepgram Nova-3. Zero rate limits, instantaneous response.'
            },
            {
              id: 'azure_openai',
              name: 'Azure OpenAI (gpt-4o-mini)',
              badge: 'STUDENT CREDIT READY',
              desc: 'Connects to Azure OpenAI endpoint using the developer $100 student credit for extended reasoning.'
            },
            {
              id: 'gemini_flash',
              name: 'Google Gemini 2.5 Flash Free Tier',
              badge: 'FREE TIER',
              desc: 'Utilizes Gemini API free quota for complex multimodal multilingual document translation.'
            }
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => setModelRouter(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                modelRouter === m.id
                  ? 'bg-slate-950 border-2 border-emerald-500 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-1">
                  <span>{m.badge}</span>
                  {modelRouter === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <h3 className="text-sm font-bold text-white">{m.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-bangla leading-relaxed">{m.desc}</p>
              </div>
              <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-900">
                Active Provider: {modelRouter === m.id ? 'SELECTED' : 'STANDBY'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User & Database Summary */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>{t('ইউজার ও ট্রেড ডেটাবেজ স্ট্যাটাস', 'Database & Active Exporter Accounts')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 font-mono">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">User Email</th>
                <th className="p-3">Full Name (Bangla)</th>
                <th className="p-3">Role</th>
                <th className="p-3">Factory Affiliation</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
              <tr>
                <td className="p-3 text-emerald-400">exporter@exportpilot.com</td>
                <td className="p-3 font-sans">রহিম উদ্দিন</td>
                <td className="p-3 font-bold text-white">exporter</td>
                <td className="p-3 font-sans">সাভার গোল্ডেন জুট অ্যান্ড ইকো-ক্রাফটস লিঃ</td>
                <td className="p-3 text-emerald-400 font-bold">ACTIVE (VERIFIED)</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400">admin@exportpilot.com</td>
                <td className="p-3 font-sans">সিস্টেম অ্যাডমিনিস্ট্রেটর</td>
                <td className="p-3 font-bold text-white">admin</td>
                <td className="p-3 font-sans">ExportPilot Sovereign Governance Center</td>
                <td className="p-3 text-emerald-400 font-bold">SUPERUSER (ACTIVE)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
