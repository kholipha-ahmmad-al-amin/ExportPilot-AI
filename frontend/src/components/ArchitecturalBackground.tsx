import React from 'react';
import { cn } from '../lib/cn';

/**
 * International-grade architectural background: 1px structural grid lines and
 * a dot matrix, radially faded, theme-adaptive through CSS tokens. Pure CSS,
 * zero runtime cost. Mount as the first child of a relatively positioned hero.
 */
export const ArchitecturalBackground: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn('pointer-events-none absolute inset-0 bg-architectural', className)}
  />
);
