import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, Globe, Award } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Sticky bottom navigation for the mobile tier (0-767px). Thumb-friendly
 * 56px targets, role-filtered exactly like the desktop navbar, with the
 * active route highlighted. Hidden on tablet and above.
 */
export const MobileTabBar: React.FC = () => {
  const { user, t } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role || '';
  const canExport = role === 'factory_owner' || role === 'admin';
  const canReview = role === 'compliance_auditor' || role === 'admin';
  const isBuyer = role === 'verified_buyer';

  const tabs: { to: string; labelBn: string; labelEn: string; Icon: typeof Globe }[] = [];
  if (canExport) {
    tabs.push(
      { to: '/app', labelBn: 'ওয়ার্কস্পেস', labelEn: 'Workspace', Icon: LayoutDashboard },
      { to: '/dealroom', labelBn: 'ডিল রুম', labelEn: 'Deals', Icon: TrendingUp },
    );
  }
  if (canExport || isBuyer) {
    tabs.push({ to: '/buyers', labelBn: 'বায়ার', labelEn: 'Buyers', Icon: Globe });
  }
  if (canReview || canExport) {
    tabs.push({ to: '/audit', labelBn: 'অডিট', labelEn: 'Audit', Icon: Award });
  }

  if (tabs.length === 0) return null;

  return (
    <nav
      aria-label={t('মোবাইল নেভিগেশন', 'Mobile navigation')}
      className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around">
        {tabs.map(({ to, labelBn, labelEn, Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-h-[56px] flex-1 px-2 py-1.5 text-[10px] font-semibold font-bangla transition-colors',
                active
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'drop-none')} aria-hidden="true" />
              <span>{t(labelBn, labelEn)}</span>
              {active && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
