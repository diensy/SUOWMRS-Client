import React from 'react';
import { Volume2, VolumeX, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Premium VoiceSpeakerButton component for critical alerts, AI predictions,
 * weather reports, water level status, and emergency notices.
 */
export default function VoiceSpeakerButton({
  text,
  label = 'Listen',
  showLabel = true,
  size = 'sm',
  variant = 'subtle', // 'subtle' | 'pill' | 'emergency' | 'ghost'
  id,
  className = '',
}) {
  const speakerId = id || (typeof text === 'string' ? text.slice(0, 32) : 'tts-btn');
  const { isSpeaking, toggle, currentLang } = useTextToSpeech(speakerId);
  const { LANGUAGES } = useLanguage();

  const currentLangLabel = LANGUAGES?.find((l) => l.code === currentLang)?.label || 'English';

  const handleClick = (e) => {
    e.stopPropagation();
    if (!text) return;
    toggle(text);
  };

  // Size styling
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 rounded-lg gap-1',
    sm: 'text-xs px-2.5 py-1 rounded-xl gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-xl gap-2',
  };

  // Variant styling
  const getVariantClasses = () => {
    if (isSpeaking) {
      return 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25 animate-pulse';
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
      title={isSpeaking ? 'Stop speech' : `Listen in ${currentLangLabel}`}
      className={`inline-flex items-center font-bold transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/50 ${sizeClasses[size]} ${getVariantClasses()} ${className}`}
      aria-label={isSpeaking ? 'Stop speaking' : `Read aloud: ${label || 'Listen'}`}
    >
      <AnimatePresence mode="wait">
        {isSpeaking ? (
          <motion.div
            key="speaking"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1"
          >
            {/* Animated Sound Wave Bars */}
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

      {showLabel && (
        <span className="tracking-tight">
          {isSpeaking ? 'Stop' : label}
        </span>
      )}
    </button>
  );
}
