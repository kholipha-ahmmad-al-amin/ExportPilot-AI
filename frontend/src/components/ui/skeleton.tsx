import React from 'react';
import { cn } from '../../lib/cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn('animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/70', className)}
    aria-hidden="true"
  />
);

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900', className)}>
    <div className="flex items-start gap-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    {lines > 1 && (
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    )}
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ count = 3, className }) => (
  <div className={cn('space-y-3', className)} role="status" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);
