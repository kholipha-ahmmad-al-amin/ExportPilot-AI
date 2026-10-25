import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';
import { useDeviceTier } from '../../hooks/useDeviceTier';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Device-native overlay primitive: bottom-sheet drawer on the mobile tier,
 * centered dialog from tablet up. Focus is moved into the panel on open and
 * Escape closes. Styling follows the Swiss border-token system.
 */
export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children, className }) => {
  const { t } = useAuth();
  const tier = useDeviceTier();
  const panelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      panelRef.current?.focus();
    }, 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isMobile = tier === 'mobile';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm animate-fade-in',
        isMobile ? 'flex items-end' : 'flex items-center justify-center p-4',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl outline-none',
          isMobile
            ? 'max-h-[88vh] overflow-y-auto rounded-t-3xl animate-slide-up'
            : 'max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl',
          className,
        )}
      >
        {isMobile && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('বন্ধ করুন', 'Close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
