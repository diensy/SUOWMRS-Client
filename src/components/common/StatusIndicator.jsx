import React from 'react';

export default function StatusIndicator({
  status = 'normal', // normal, warning, danger, critical, offline
  label,
  size = 'md',
  className = '',
}) {
  const configs = {
    normal: {
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: label || 'Normal',
    },
    warning: {
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      text: 'text-amber-800 dark:text-amber-400',
      label: label || 'Warning',
    },
    danger: {
      dot: 'bg-orange-500',
      ping: 'bg-orange-400',
      text: 'text-orange-800 dark:text-orange-400',
      label: label || 'High Risk',
    },
    critical: {
      dot: 'bg-rose-500',
      ping: 'bg-rose-400',
      text: 'text-rose-700 dark:text-rose-400',
      label: label || 'Critical Flood Alert',
    },
    offline: {
      dot: 'bg-slate-400',
      ping: 'bg-slate-300',
      text: 'text-slate-500 dark:text-slate-400',
      label: label || 'Offline',
    }
  };

  const current = configs[status] || configs.normal;

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center">
        {status !== 'offline' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSizes[size] || dotSizes.md} ${current.dot}`}
        />
      </span>
      {label !== null && (
        <span className={`text-xs font-semibold uppercase tracking-wider ${current.text}`}>
          {current.label}
        </span>
      )}
    </span>
  );
}
