import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'exporter' | 'importer' | 'admin' | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading, t } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">
          {t('নিরাপদ সেশন যাচাই করা হচ্ছে...', 'Verifying sovereign security session...')}
        </p>
      </div>
    );
  }

  // Not logged in: strictly redirect to /login with state preservation
  if (!user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?from=${encodeURIComponent(returnTo)}`} replace />;
  }

  // Role validation if specified
  if (requiredRole) {
    const userRole = (user.role || '').toLowerCase();
    const normalizedUserRole =
      userRole === 'factory_owner' ? 'exporter' :
      userRole === 'verified_buyer' ? 'importer' :
      userRole;

    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole.map((r) => r.toLowerCase())
      : [requiredRole.toLowerCase()];

    const hasAccess =
      allowedRoles.includes(userRole) ||
      allowedRoles.includes(normalizedUserRole) ||
      userRole === 'admin'; // Admin has universal system oversight

    if (!hasAccess) {
      return (
        <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-bangla">
              {t('এক্সেস সীমাবদ্ধ (অননুমোদিত ভূমিকা)', 'Access Restricted (Insufficient Role)')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-bangla leading-relaxed max-w-md mx-auto">
              {t(
                `এই মডিউলে প্রবেশের জন্য '${Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}' ভূমিকা প্রয়োজন। আপনার বর্তমান অ্যাকাউন্ট ভূমিকা: '${user.role}'।`,
                `This workspace requires a '${Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}' role. Your current account role is '${user.role}'.`
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/app"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('মূল ডিল রুমে ফিরুন', 'Back to Deal Room')}</span>
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition-colors flex items-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('ভিন্ন অ্যাকাউন্টে লগইন', 'Switch Account')}</span>
            </Link>
          </div>
        </div>
      );
    }
  }

  return children;
};
