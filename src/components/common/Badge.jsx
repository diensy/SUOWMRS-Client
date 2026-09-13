import React from 'react';

export default function Badge({
  children,
  variant = 'normal', // normal, warning, danger, critical, info, neutral
  size = 'md',
  className = '',
  dot = false,
}) {
  const variants = {
    normal: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30',
    warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30',
    danger: 'bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-200/80 dark:border-orange-500/30',
    critical: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30',
    info: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/30',
    brand: 'bg-teal-50 dark:bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-200/80 dark:border-teal-500/30',
    neutral: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
  };

  const dotColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-orange-500',
    critical: 'bg-rose-500',
    info: 'bg-sky-500',
    brand: 'bg-brand-deep',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium border',
    lg: 'text-sm px-3 py-1.5 rounded-lg font-medium border',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />
      )}
      {children}
    </span>
  );
}
