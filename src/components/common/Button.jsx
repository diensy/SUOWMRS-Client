import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  const isButtonLoading = isLoading || loading;

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-brand-deep hover:bg-brand-dark text-white shadow-sm hover:shadow focus:ring-brand-deep",
    secondary: "bg-brand-accent hover:bg-sky-600 text-white shadow-sm hover:shadow focus:ring-brand-accent",
    outline: "border border-slate-300 dark:border-white/20 hover:border-brand-deep dark:hover:border-sky-400 text-slate-700 dark:text-slate-200 hover:text-brand-deep dark:hover:text-white bg-white/70 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 focus:ring-brand-deep",
    ghost: "text-slate-600 dark:text-slate-400 hover:text-brand-deep dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 focus:ring-slate-300",
    danger: "bg-status-critical hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-status-critical",
    success: "bg-status-normal hover:bg-emerald-600 text-white shadow-sm hover:shadow focus:ring-status-normal",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-base gap-2.5",
  };

  const renderIcon = (iconProp) => {
    if (!iconProp) return null;
    if (React.isValidElement(iconProp)) {
      return iconProp;
    }
    const IconComp = iconProp;
    return <IconComp className="w-4 h-4 flex-shrink-0" />;
  };

  return (
    <button
      type={type}
      disabled={disabled || isButtonLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isButtonLoading ? (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
          {Icon && iconPosition === 'left' && renderIcon(Icon)}
          {children}
          {Icon && iconPosition === 'right' && renderIcon(Icon)}
        </span>
      )}
    </button>
  );
}
