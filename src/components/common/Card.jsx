import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerIcon: Icon,
  variant = 'glass', // glass, flat, elevated
  padding = 'normal', // none, sm, normal, lg
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    normal: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    glass: 'glass-card dark:glass-card-dark shadow-card hover:shadow-card-hover transition-shadow duration-300 rounded-2xl',
    flat: 'bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl',
    elevated: 'bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-white/10',
    dark: 'glass-card-dark text-white rounded-2xl shadow-xl',
  };

  return (
    <div className={`${variantStyles[variant] || variantStyles.glass} ${className}`} {...props}>
      {(title || Icon || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-brand-light/70 dark:bg-white/10 text-brand-deep dark:text-sky-400 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-slate-900 dark:text-white text-base">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
    </div>
  );
}
