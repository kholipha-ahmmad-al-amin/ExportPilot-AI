import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon = Inbox, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
    {description && <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
);
