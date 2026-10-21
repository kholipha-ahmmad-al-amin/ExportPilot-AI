import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { t } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('exporter');
  const [factoryName, setFactoryName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name_bn: fullName,
          email,
          password,
          role,
          factory_name: factoryName
        })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        navigate('/app');
      } else {
        setError(data.detail || t('রেজিস্ট্রেশন ব্যর্থ হয়েছে।', 'Registration failed.'));
      }
    } catch {
      setLoading(false);
      setError(t('সার্ভারে যোগাযোগ করা সম্ভব হয়নি।', 'Could not connect to server.'));
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('নতুন এক্সপোর্ট অ্যাকাউন্ট তৈরি করুন', 'Create Exporter Account')}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('বাংলাদেশি উৎপাদক, বায়ার ও মেন্টরদের জন্য প্ল্যাটফর্ম', 'For Bangladeshi SME producers, global buyers & trade mentors')}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('আপনার নাম (বাংলা বা ইংরেজি)', 'Full Name')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
              placeholder="যেমন: রহিম উদ্দিন"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('ইমেইল অ্যাড্রেস', 'Email Address')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
              placeholder="rahim@factory.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-bangla">
              {t('পাসওয়ার্ড', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              maxLength={72}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono outline-none transition-colors"
              placeholder={t('কমপক্ষে ১২ ক্যারেক্টার (e.g. ExportPilot2026!)', 'Minimum 12 characters (e.g. ExportPilot2026!)')}
            />
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              {t('এনক্রিপশন স্ট্যান্ডার্ড: BCrypt salted hash (min 12 chars)', 'Security standard: BCrypt salted hash (min 12 chars)')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('আপনার ভূমিকা', 'Role')}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
              >
                <option value="exporter">{t('কারখানা মালিক (Exporter)', 'SME Exporter')}</option>
                <option value="nrb_advisor">{t('প্রবাসী বিশেষজ্ঞ (NRB Advisor)', 'NRB Trade Mentor')}</option>
                <option value="buyer">{t('আন্তর্জাতিক বায়ার (Buyer)', 'Global Buyer')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('কারখানা / প্রতিষ্ঠানের নাম', 'Factory Name')}
              </label>
              <input
                type="text"
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
                placeholder="যেমন: সাভার গোল্ডেন জুট লিঃ"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 transition-colors mt-2"
          >
            <span>{loading ? t('অ্যাকাউন্ট তৈরি হচ্ছে...', 'Creating Account...') : t('রেজিস্ট্রেশন সম্পন্ন করুন', 'Complete Registration')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {t('ইতিমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')}{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            {t('লগইন করুন', 'Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
};
