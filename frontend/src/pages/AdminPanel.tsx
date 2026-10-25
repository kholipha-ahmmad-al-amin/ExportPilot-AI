import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Shield, Cpu, Database, CheckCircle2, Lock, LogOut, AlertCircle, ArrowRight, Search, RefreshCw, Activity, Server, FileText} from 'lucide-react';

interface SystemUser {
  id: string;
  email: string;
  full_name_bn: string;
  role: string;
  factory_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
}

interface SystemStats {
  status: string;
  timestamp: string;
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  trade_metrics: {
    products_scanned: number;
    global_buyers_indexed: number;
    analysis_runs: number;
    illustrative_records_excluded: number;
  };
  cloud_telemetry: {
    plan: string;
    region: string;
    ram_allocated: string;
    cpu_cores: string;
    student_credit_total: number | null;
    estimated_burn_rate_usd: number | null;
    projected_runway_months: string;
    custom_domain_ssl: string;
    websockets: string;
  };
  engine_status: {
    trade_pipeline: string;
    mcp_protocol: string;
    voice_transcription: string;
    carbon_parser: string;
    trade_advisor: string;
  };
}

interface SecurityEvent {
  id: string;
  name: string;
  category: string;
  status: string;
  details: string;
  timestamp: string | null;
}

type TradeProvider = 'local_deterministic' | 'azure_openai' | 'gemini_flash';

export const AdminPanel: React.FC = () => {
  const { user, logout, t } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [activeTab, setActiveTab] = useState<'telemetry' | 'users' | 'security' | 'router'>('telemetry');
  const [modelRouter, setModelRouter] = useState<TradeProvider>('local_deterministic');
  const [providerAvailability, setProviderAvailability] = useState<Record<TradeProvider, boolean>>({
    local_deterministic: true,
    azure_openai: false,
    gemini_flash: false,
  });
  const [savingProvider, setSavingProvider] = useState(false);
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [telemetryError, setTelemetryError] = useState('');
  const [eventsError, setEventsError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch users & telemetry
  const fetchTelemetry = async () => {
    setTelemetryError('');
    try {
      const res = await fetch('/api/v1/auth/system-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        throw new Error('Failed to load telemetry');
      }
    } catch {
      setStats(null);
      setTelemetryError(t('সিস্টেম পরিসংখ্যান লোড করা যায়নি।', 'Could not load system statistics.'));
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const res = await fetch('/api/v1/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        throw new Error('Failed to load users');
      }
    } catch {
      setUsersList([]);
      setUsersError(t('ব্যবহারকারীর তালিকা লোড করা যায়নি।', 'Could not load the user directory.'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSecurityEvents = async () => {
    setEventsError('');
    try {
      const res = await fetch('/api/v1/audit/events');
      if (res.ok) setSecurityEvents(await res.json());
      else throw new Error('Failed to load events');
    } catch {
      setSecurityEvents([]);
      setEventsError(t('নিরাপত্তা ইভেন্ট লোড করা যায়নি।', 'Could not load security events.'));
    }
  };

  const fetchAuditScore = async () => {
    try {
      const res = await fetch('/api/v1/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) throw new Error('Audit is unavailable');
      const data = await res.json();
      setAuditScore(typeof data.total_score === 'number' ? data.total_score : null);
    } catch {
      setAuditScore(null);
    }
  };

  const fetchModelProvider = async () => {
    try {
      const res = await fetch('/api/v1/auth/admin/model-provider');
      if (!res.ok) throw new Error('Provider settings are unavailable');
      const data = await res.json();
      setModelRouter(data.provider as TradeProvider);
      setProviderAvailability(data.available);
    } catch {
      showToast(t('সেবার অবস্থা পাওয়া যায়নি।', 'Could not load provider settings.'));
    }
  };

  const updateModelProvider = async (provider: TradeProvider) => {
    if (!providerAvailability[provider] || savingProvider) return;
    setSavingProvider(true);
    try {
      const res = await fetch('/api/v1/auth/admin/model-provider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not update provider');
      setModelRouter(data.provider as TradeProvider);
      setProviderAvailability(data.available);
      showToast(t('বাণিজ্য পরামর্শের সেবা পরিবর্তন করা হয়েছে।', 'Trade advice provider updated.'));
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('সেবা পরিবর্তন করা যায়নি।', 'Could not update provider.'));
    } finally {
      setSavingProvider(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchTelemetry();
      fetchUsers();
      fetchSecurityEvents();
      fetchAuditScore();
      fetchModelProvider();
    }
  }, [isAdmin]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/auth/users/${userId}/toggle-status`, {
        method: 'POST',
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
        );
        showToast(
          currentStatus
            ? t('অ্যাকাউন্ট সফলভাবে নিষ্ক্রিয় করা হয়েছে।', 'Account suspended successfully.')
            : t('অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে।', 'Account activated successfully.')
        );
      } else {
        const err = await res.json();
        showToast(err.detail || t('অ্যাকশন সম্পন্ন করা যায়নি।', 'Failed to update account status.'));
      }
    } catch {
      showToast(t('অ্যাকশন সম্পন্ন করা যায়নি।', 'Could not reach the account service.'));
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/v1/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: updated.role, is_verified: updated.is_verified } : u))
        );
        showToast(t('অ্যাকাউন্টের ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে।', 'Account role updated successfully.'));
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || t('ভূমিকা পরিবর্তন করা যায়নি।', 'Failed to update account role.'));
      }
    } catch {
      showToast(t('ভূমিকা পরিবর্তন করা যায়নি।', 'Could not reach the account service.'));
    }
  };

  // If NOT authenticated as an administrator, show institutional access restricted gate
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
              PRIVILEGED ACCESS ONLY
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-3 font-bangla">
              {t('অ্যাডমিন প্রিভিলেজ প্রয়োজন', 'Administrator Privileges Required')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-bangla">
              {user ? (
                t(
                  `আপনি বর্তমানে '${user.role}' একাউন্ট হিসেবে লগইন আছেন। সিস্টেম কনসোল ও ক্লাউড টেলিম্যাট্রি শুধুমাত্র অনুমোদিত সিস্টেম অ্যাডমিনদের জন্য সংরক্ষিত।`,
                  `You are currently logged in with role '${user.role}'. This system console is strictly restricted to system administrators.`
                )
              ) : (
                t(
                  'এই কনসোলে প্রবেশের জন্য অনুমোদিত অ্যাডমিন একাউন্টে সাইন ইন করুন।',
                  'Please sign in with a verified administrator account to access this console.'
                )
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/app"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('ডিল রুমে ফিরুন', 'Back to Deal Room')}</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('অ্যাডমিন লগইন', 'Admin Login')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.full_name_bn.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.factory_name.toLowerCase().includes(userSearch.toLowerCase());

    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'exporter') return matchesSearch && (u.role === 'factory_owner' || u.role === 'exporter');
    if (roleFilter === 'buyer') return matchesSearch && (u.role === 'verified_buyer' || u.role === 'buyer');
    if (roleFilter === 'auditor') return matchesSearch && (u.role === 'compliance_auditor' || u.role === 'auditor');
    if (roleFilter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-emerald-500 shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
              {t('অ্যাকাউন্ট পরিচালনা', 'Account management')}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${stats?.status === 'healthy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800'}`}>
              {stats?.status === 'healthy' ? t('API সাড়া দিচ্ছে', 'API responding') : t('অবস্থা পাওয়া যায়নি', 'Status unavailable')}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {t('অ্যাডমিন:', 'Administrator:')} {user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {t('অ্যাকাউন্ট ও বাণিজ্য কার্যক্রম', 'Accounts and trade activity')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-bangla">
            {t(
              'ব্যবহারকারীর অ্যাকাউন্ট, বাণিজ্য কার্যক্রম এবং তথ্য সুরক্ষার অবস্থা দেখুন।',
              'Review user accounts, trade activity, and information privacy.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/audit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('সিস্টেম অডিট (১০০/১০০)', 'Run Audit (100/100)')}</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('সাইন আউট', 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div role="tablist" aria-label={t('অ্যাডমিন প্যানেল বিভাগ', 'Admin panel sections')} className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1 sm:space-x-4">
        {[
          { id: 'telemetry', labelBn: 'সিস্টেমের অবস্থা', labelEn: 'System status', icon: Server },
          { id: 'users', labelBn: 'ব্যবহারকারী ও প্রবেশাধিকার', labelEn: 'Users & access', icon: Database },
          { id: 'security', labelBn: 'নিরাপত্তা ও পিআইআই অডিট ট্রেইল', labelEn: 'Security & PII Logs', icon: Shield },
          { id: 'router', labelBn: 'বণিজ্য পরামর্শের সেটিংস', labelEn: 'Trade advice settings', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t(tab.labelBn, tab.labelEn)}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TELEMETRY & CLOUD OVERVIEW */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
      {telemetryError && (
        <div role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
          <span className="font-bangla">{telemetryError}</span>
          <button type="button" onClick={fetchTelemetry} className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 font-semibold font-bangla">{t('আবার চেষ্টা করুন', 'Try again')}</button>
        </div>
      )}

          {/* 4 High-Level Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bangla">
                <span>{t('নিবন্ধিত এক্সপোর্টার একাউন্ট', 'Registered Accounts')}</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {stats?.users.total ?? t('তথ্য নেই', 'Not available')}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                <span>{stats?.users.active ?? t('তথ্য নেই', 'Not available')} {t('টি সক্রিয় অ্যাকাউন্ট', 'active accounts')}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bangla">
                <span>{t('নমুনা বায়ার প্রোফাইল', 'Illustrative Buyer Profiles')}</span>
                <GlobeIcon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {stats?.trade_metrics.global_buyers_indexed ?? t('তথ্য নেই', 'Not available')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {t('যাচাইকৃত বায়ার যোগাযোগ নয়', 'Not verified buyer contacts')}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bangla">
                <span>{t('বিশ্লেষণ রেকর্ড', 'Analysis Runs')}</span>
                <FileText className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {stats?.trade_metrics.analysis_runs ?? t('তথ্য নেই', 'Not available')}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                {t('বিশ্লেষণ শেষ হয়েছে, লেনদেন নয়', 'Analysis completed, not a closed trade')}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bangla">
                <span>{t('সার্বভৌম সিস্টেম অডিট স্কোর', 'System Health')}</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className={`text-2xl font-bold font-mono ${auditScore === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}`}>
                {auditScore === null ? t('তথ্য নেই', 'Not available') : `${auditScore} / 100`}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {t('সর্বশেষ নিরীক্ষার ফল', 'Latest audit result')}
              </div>
            </div>
          </div>

          {/* Runtime details */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('পরিষেবা ও পরিবেশ', 'Service and environment')}</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-bangla">
                  {t(
                    'অ্যাপ থেকে জানা runtime তথ্য দেখানো হচ্ছে। বিলিং ও বরাদ্দ সংক্রান্ত মেট্রিক সংযুক্ত নেই।',
                    'Showing runtime values reported by the app. Billing and capacity telemetry are not connected.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${stats?.status === 'healthy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800'}`}>
                  {stats?.status === 'healthy' ? t('API সাড়া দিচ্ছে', 'API responding') : t('অবস্থা পাওয়া যায়নি', 'Status unavailable')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('API পরীক্ষা:', 'API check:')}</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{stats?.status === 'healthy' ? t('সাড়া দিচ্ছে', 'Responding') : t('অজানা', 'Unknown')}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : t('তথ্য নেই', 'No check recorded')}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('সাইটের ঠিকানা:', 'Site address:')}</span>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{window.location.protocol.replace(':', '').toUpperCase()}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{window.location.host || t('স্থানীয় পরিবেশ', 'Local environment')}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('পরিষেবা পরিকল্পনা:', 'Service plan:')}</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono truncate">{stats?.cloud_telemetry.plan ?? t('তথ্য নেই', 'Not reported')}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('পরিবেশ থেকে পাওয়া', 'Reported by the environment')}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('সেবা অঞ্চল:', 'Service region:')}</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono truncate">{stats?.cloud_telemetry.region ?? t('তথ্য নেই', 'Not reported')}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('পরিবেশ থেকে পাওয়া', 'Reported by the environment')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
              <div>{t('মেমোরি:', 'Memory:')} <span className="font-mono text-slate-900 dark:text-slate-100">{stats?.cloud_telemetry.ram_allocated ?? t('তথ্য নেই', 'Not reported')}</span></div>
              <div>{t('CPU:', 'CPU:')} <span className="font-mono text-slate-900 dark:text-slate-100">{stats?.cloud_telemetry.cpu_cores ?? t('তথ্য নেই', 'Not reported')}</span></div>
              <div>{t('ক্লাউড ক্রেডিট:', 'Cloud credit:')} <span className="font-mono text-slate-900 dark:text-slate-100">{stats?.cloud_telemetry.student_credit_total == null ? t('সংযুক্ত নয়', 'Not connected') : `$${stats.cloud_telemetry.student_credit_total.toFixed(2)}`}</span></div>
              <div>{t('ব্যবহারের হিসাব:', 'Usage estimate:')} <span className="font-mono text-slate-900 dark:text-slate-100">{stats?.cloud_telemetry.projected_runway_months ?? t('তথ্য নেই', 'Not reported')}</span></div>
            </div>
          </div>

          {/* Trade support status */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('বাণিজ্য সহায়তার অবস্থা', 'Trade support status')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('রপ্তানি কর্মপ্রবাহ', 'Export workflow')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">{stats?.engine_status.trade_pipeline.toUpperCase() ?? 'UNKNOWN'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                  {t('পণ্যের শ্রেণিবিন্যাস, বায়ার খোঁজা, কার্বন তথ্য ও নথি তৈরির সুবিধা সচল।', 'Product classification, buyer search, carbon information, and document preparation are available.')}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('বাংলা ভয়েস সুবিধা', 'Bangla voice')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stats?.engine_status.voice_transcription === 'configured' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{stats?.engine_status.voice_transcription.replace(/_/g, ' ').toUpperCase() ?? 'UNKNOWN'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                  {t('বাংলায় বলা কারখানার তথ্য গ্রহণ করা যাচ্ছে।', 'Spoken factory details can be submitted in Bangla.')}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('কার্বন তথ্য পর্যালোচনা', 'Carbon information review')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">{stats?.engine_status.carbon_parser.toUpperCase() ?? 'UNKNOWN'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                  {t('বিদ্যুৎ বিলের তথ্য থেকে কার্বন হিসাব পাওয়া যাচ্ছে।', 'Carbon estimates can be prepared from utility bill details.')}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('বাণিজ্য পরামর্শ', 'Trade advice')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">{stats?.engine_status.trade_advisor.replace(/_/g, ' ').toUpperCase() ?? 'UNKNOWN'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                  {t('বায়ারের দর ও শর্ত পর্যালোচনায় সহায়তা করে।', 'Available to help review buyer prices and terms.')}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: USERS & RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">

          {/* Search, Filter & Refresh Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <label htmlFor="admin-user-search" className="sr-only">
                {t('নাম, ইমেইল বা কারখানা দিয়ে খুঁজুন', 'Search by name, email, or facility')}
              </label>
              <input
                id="admin-user-search"
                type="text"
                placeholder={t('নাম, ইমেইল বা কারখানা দিয়ে খুঁজুন...', 'Search by name, email, or facility...')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                {[
                  { id: 'all', label: t('সকল', 'All') },
                  { id: 'exporter', label: t('এক্সপোর্টার', 'Exporter') },
                  { id: 'buyer', label: t('বায়ার', 'Buyer') },
                  { id: 'auditor', label: t('অডিটর', 'Auditor') },
                  { id: 'admin', label: t('অ্যাডমিন', 'Admin') },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRoleFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      roleFilter === f.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title={t('তালিকা রিফ্রেশ করুন', 'Refresh list')}
                aria-label={t('ব্যবহারকারীর তালিকা রিফ্রেশ করুন', 'Refresh user list')}
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 font-mono">
                  <tr>
                    <th className="p-4">{t('ব্যবহারকারী / ইমেইল', 'User / Email')}</th>
                    <th className="p-4">{t('কারখানা / প্রতিষ্ঠান', 'Factory / Organization')}</th>
                    <th className="p-4">{t('অ্যাকাউন্টের ধরন', 'Account type')}</th>
                    <th className="p-4">{t('ভেরিফিকেশন', 'Verification')}</th>
                    <th className="p-4">{t('অ্যাকাউন্ট স্ট্যাটাস', 'Account Status')}</th>
                    <th className="p-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  {usersError ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div role="alert" className="inline-flex flex-col items-center gap-3">
                          <span className="text-rose-700 dark:text-rose-300 font-bangla">{usersError}</span>
                          <button
                            type="button"
                            onClick={fetchUsers}
                            className="px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold font-bangla"
                          >
                            {t('আবার চেষ্টা করুন', 'Try again')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : loadingUsers && usersList.length === 0 ? (
                    [0, 1, 2].map((row) => (
                      <tr key={`skeleton-${row}`} className="animate-pulse" aria-hidden="true">
                        <td className="p-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" /></td>
                        <td className="p-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" /></td>
                        <td className="p-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" /></td>
                        <td className="p-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" /></td>
                        <td className="p-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/5" /></td>
                        <td className="p-4"><div className="h-3.5 ml-auto bg-slate-200 dark:bg-slate-800 rounded w-1/4" /></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-bangla">
                        {t('কোনো ব্যবহারকারী পাওয়া যায়নি।', 'No matching users found.')}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-900 dark:text-white font-bangla">{u.full_name_bn}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-4 font-bangla text-slate-600 dark:text-slate-300">
                          {u.factory_name}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                : u.role === 'verified_buyer'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                                : u.role === 'compliance_auditor'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border border-purple-300 dark:border-purple-800'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t('যাচাইকৃত', 'Verified')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t('অপেক্ষমাণ', 'Pending')}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.is_active
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {u.is_active ? t('সক্রিয়', 'ACTIVE') : t('নিষ্ক্রিয়', 'SUSPENDED')}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' ? (
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                aria-label={t(`${u.full_name_bn} এর ভূমিকা পরিবর্তন করুন`, `Change role for ${u.full_name_bn}`)}
                                className="px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                                title={t('ভূমিকা পরিবর্তন করুন', 'Change role')}
                              >
                                <option value="factory_owner">factory_owner</option>
                                <option value="verified_buyer">verified_buyer</option>
                                <option value="compliance_auditor">compliance_auditor</option>
                              </select>
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  u.is_active
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {u.is_active ? t('সাসপেন্ড', 'Suspend') : t('সক্রিয়', 'Activate')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SECURITY & PII AUDIT TRAIL */}
      {activeTab === 'security' && (
        <div className="space-y-6">
      {eventsError && (
        <div role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
          <span className="font-bangla">{eventsError}</span>
          <button type="button" onClick={fetchSecurityEvents} className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 font-semibold font-bangla">{t('আবার চেষ্টা করুন', 'Try again')}</button>
        </div>
      )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bangla">{t('পিআইআই ফিল্টার যাচাই', 'PII Filters Verified')}</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {securityEvents.filter((event) => event.category === 'security').length}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                {t('নথিভুক্ত তথ্য গোপন রাখার যাচাই।', 'Recorded privacy screening events.')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bangla">{t('সিবিএএম স্কোপ ২ অডিট', 'CBAM Scope 2 Audited')}</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {securityEvents.filter((event) => event.category === 'compliance').length}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                {t('নথিভুক্ত বিদ্যুৎ বিল ও কার্বন পর্যালোচনা।', 'Recorded utility bill and carbon reviews.')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bangla">{t('জিরো-কস্ট গার্ডরেল', 'Zero-Cost Guardrails')}</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {securityEvents.length}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bangla">
                {t('সর্বশেষ ৫০টি গোপনীয়তা ও নথি পর্যালোচনা।', 'Privacy and document review events, up to 50 records.')}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('নিরাপত্তা ও নথি পর্যালোচনার সাম্প্রতিক ঘটনা', 'Recent privacy and document review events')}</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              {securityEvents.length === 0 ? (
                <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                  {t('এখনও কোনো নিরাপত্তা বা নথি পর্যালোচনার ঘটনা নেই।', 'No privacy or document review events have been recorded yet.')}
                </p>
              ) : securityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{evt.category}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      {evt.status}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-sans font-medium">{evt.name}: {evt.details}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: MODEL ROUTER & ENGINE SETTINGS */}
      {activeTab === 'router' && (
        <div className="space-y-6">

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('বাণিজ্য পরামর্শের উৎস', 'Trade advice provider')}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-bangla">
                {t('বাণিজ্য পরামর্শের জন্য উপলভ্য সেবা নির্বাচন করুন:', 'Select the service used for trade advice:')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'local_deterministic',
                  name: 'Local trade rules',
                  desc: 'Runs trade advice on this service without an external model provider.',
                },
                {
                  id: 'azure_openai',
                  name: 'Azure OpenAI',
                  desc: 'Uses the configured Azure model for trade advice.',
                },
                {
                  id: 'gemini_flash',
                  name: 'Gemini Flash',
                  desc: 'Uses Gemini Flash when an API key is configured.',
                },
              ].map((m) => {
                const provider = m.id as TradeProvider;
                const available = providerAvailability[provider];
                return <button
                  key={m.id}
                  type="button"
                  disabled={!available || savingProvider}
                  onClick={() => updateModelProvider(provider)}
                  className={`text-left p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between disabled:cursor-not-allowed disabled:opacity-60 ${
                    modelRouter === m.id
                      ? 'bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 enabled:hover:border-slate-300 dark:enabled:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      <span>{available ? t('প্রস্তুত', 'Available') : t('সেটআপ বাকি', 'Not configured')}</span>
                      {modelRouter === provider && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bangla leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-3 border-t border-slate-200 dark:border-slate-800">
                    {modelRouter === provider ? t('বর্তমানে ব্যবহৃত', 'Currently selected') : available ? t('চালু করতে নির্বাচন করুন', 'Select to use') : t('প্রয়োজনীয় API key নেই', 'Required API key is missing')}
                  </div>
                </button>;
              })}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">
              {t('এই নির্বাচন পরবর্তী বাণিজ্য পরামর্শে কার্যকর হবে। বহিরাগত সেবায় পাঠানোর আগে ব্যক্তিগত পরিচয়সংক্রান্ত তথ্য গোপন করা হয়।', 'This setting applies to the next trade advice request. Personal identifiers are screened before any external provider receives the request.')}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

// Simple inline GlobeIcon helper
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);
