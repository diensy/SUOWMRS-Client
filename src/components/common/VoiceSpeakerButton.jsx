import React, { useMemo, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { isTTSSupported } from '../../services/ttsService';
import { useSnackbar } from '../../context/SnackbarContext';

/**
 * VoiceSpeakerButton — reads the supplied text aloud in the active UI language.
 * Used for critical alerts, AI predictions, weather reports, water level status and SOS notices.
 *
 * `text` may be a string or a function returning a string (evaluated at click time so the
 * spoken text always reflects the latest telemetry).
 */
export default function VoiceSpeakerButton({
  text,
  label,
  showLabel = true,
  size = 'sm',
  variant = 'subtle', // 'subtle' | 'pill' | 'emergency' | 'ghost'
  id,
  className = '',
}) {
  const { t, currentLanguage } = useLanguage();
  const speakerId = useMemo(
    () => id || (typeof text === 'string' ? `tts-${text.slice(0, 32)}` : 'tts-btn'),
    [id, text]
  );
  const { isSpeaking, toggle, error, errorLang } = useTextToSpeech(speakerId);
  const { showSnackbar } = useSnackbar();
  const startedRef = useRef(false);

  // If this button started speech and the device has no voice for the language, tell the user
  useEffect(() => {
    if (error && startedRef.current) {
      if (error === 'not-allowed') { startedRef.current = false; return; } // autoplay blocked: user just needs to click again
      startedRef.current = false;
      const langName = LANGUAGES.find((l) => l.code === errorLang)?.label || errorLang;
      showSnackbar(t('tts_noVoice', { lang: langName }), 'warning', 5000);
    }
  }, [error, errorLang, showSnackbar, t]);

  if (!isTTSSupported()) return null;

  const resolvedLabel = label ?? t('tts_listen');
  const langLabel = currentLanguage?.native || 'English';

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const value = typeof text === 'function' ? text() : text;
    if (!value) return;
    startedRef.current = !isSpeaking;
    toggle(value);
  };

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 rounded-lg gap-1',
    sm: 'text-xs px-2.5 py-1 rounded-xl gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-xl gap-2',
  };

  const getVariantClasses = () => {
    if (isSpeaking) {
      return 'bg-rose-500 text-white border border-rose-600 shadow-md shadow-rose-500/25';
    }
    switch (variant) {
      case 'emergency':
        return 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      case 'pill':
        return 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25';
      case 'ghost':
        return 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      case 'subtle':
      default:
        return 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isSpeaking ? t('tts_stop') : `${t('tts_listen')} · ${langLabel}`}
      className={`inline-flex items-center font-bold transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/50 ${sizeClasses[size]} ${getVariantClasses()} ${className}`}
      aria-label={isSpeaking ? t('tts_stop') : `${t('tts_listen')}: ${resolvedLabel}`}
      aria-pressed={isSpeaking}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSpeaking ? (
          <motion.div
            key="speaking"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-current animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-current animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-current animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
            </div>
            <Square className="w-3 h-3 fill-current ml-0.5" />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center"
          >
            <Volume2 className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabel && <span className="tracking-tight">{isSpeaking ? t('tts_stop') : resolvedLabel}</span>}
    </button>
  );
}
