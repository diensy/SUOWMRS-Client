import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

/**
 * Compact language dropdown for public pages (Landing / Login / Register / Forgot Password).
 * The dashboard Navbar has its own inline switcher with matching behaviour.
 */
export default function LanguageSwitcher({ className = '', align = 'right', compact = false }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl dark:bg-white/5 bg-slate-200/70 dark:border-white/10 border-slate-300 border text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition text-xs font-bold shadow-sm"
        aria-label={t('changeLanguage')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        {!compact && <span className="hidden sm:inline">{current.native}</span>}
        <span className={compact ? 'uppercase' : 'sm:hidden uppercase'}>{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} top-full mt-2 w-44 dark:bg-[#1E293B] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50`}
        >
          <div className="p-1.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 py-1.5">
              {t('language')}
            </p>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={lang === l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  lang === l.code
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{l.native}</span>
                <span className="flex items-center gap-1.5 text-[10px] opacity-70">
                  {l.label}
                  {lang === l.code && <Check className="w-3 h-3" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
