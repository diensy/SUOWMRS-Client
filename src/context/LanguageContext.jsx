import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import en from '../i18n/en';
import hi from '../i18n/hi';
import or from '../i18n/or';
import te from '../i18n/te';
import ta from '../i18n/ta';
import bn from '../i18n/bn';

// ── Supported Indian Languages ──
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', locale: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', locale: 'hi-IN' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', locale: 'te-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', locale: 'ta-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', locale: 'bn-IN' },
];

// ── Translation Dictionary (one file per language in src/i18n) ──
export const translations = { en, hi, or, te, ta, bn };

const STORAGE_KEYS = ['suowmrs_lang', 'suowmrs-lang'];

const LanguageContext = createContext(null);

const readSavedLang = () => {
  try {
    for (const k of STORAGE_KEYS) {
      const saved = localStorage.getItem(k);
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    }
  } catch {
    /* localStorage unavailable */
  }
  return 'en';
};

export const getActiveLanguage = () => readSavedLang();

/** Replace `{var}` placeholders in a template with the supplied values. */
export const interpolate = (template, vars) => {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
};

/**
 * Translate outside React (services, utils). Falls back to English, then to the key itself.
 */
export const getTranslation = (key, customLang, vars) => {
  const lang = customLang || getActiveLanguage();
  const value = translations[lang]?.[key] ?? translations.en?.[key] ?? key;
  return interpolate(value, vars);
};

const DIGIT_MAPS = {
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  or: ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'],
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  te: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
  ta: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'],
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readSavedLang);

  useEffect(() => {
    try {
      STORAGE_KEYS.forEach((k) => localStorage.setItem(k, lang));
    } catch (e) {
      console.warn('LocalStorage unavailable for language setting', e);
    }
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  const setLang = useCallback((newLang) => {
    if (newLang && LANGUAGES.some((l) => l.code === newLang)) {
      setLangState(newLang);
    }
  }, []);

  /**
   * t(key)            → translated string (falls back to English, then the key)
   * t(key, { n: 3 })  → with `{n}` interpolation
   * t(key, 'fallback')→ custom fallback text when key is missing everywhere
   */
  const t = useCallback(
    (key, varsOrFallback) => {
      if (key == null) return '';
      const dict = translations[lang] || translations.en;
      let value = dict[key] ?? translations.en[key];
      if (value === undefined) {
        value = typeof varsOrFallback === 'string' ? varsOrFallback : key;
      }
      return typeof varsOrFallback === 'object' ? interpolate(value, varsOrFallback) : value;
    },
    [lang]
  );

  // Helper to convert numbers to localized digits
  const localizeNumber = useCallback(
    (num) => {
      if (num == null) return '';
      const str = String(num);
      const map = DIGIT_MAPS[lang];
      if (!map) return str;
      return str.replace(/\d/g, (d) => map[Number(d)] ?? d);
    },
    [lang]
  );

  // Helper to translate alerts dynamically with level interpolation
  const formatAlert = useCallback(
    (alert) => {
      if (!alert) return '';
      const key = alert.messageKey || (alert.type ? `alert_${alert.type}` : null);
      const template = key && translations.en[key] !== undefined ? t(key) : null;
      let levelStr = alert.level != null ? Number(alert.level).toFixed(1) : null;
      if (!levelStr && alert.message) {
        const match = String(alert.message).match(/(\d+(?:\.\d+)?)\s*%/);
        if (match) levelStr = match[1];
      }
      if (template && template.includes('{level}')) {
        return template.replace('{level}', levelStr ? localizeNumber(levelStr) : '—');
      }
      return template || alert.message || '';
    },
    [t, localizeNumber]
  );

  /**
   * Translate a raw status / enum string coming from the backend (e.g. "OPEN",
   * "in-progress", "Pending"). Looks up `status_<normalized>` and falls back to the
   * original text.
   */
  const tStatus = useCallback(
    (raw) => {
      if (raw == null || raw === '') return '';
      const norm = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
      const key = `status_${norm}`;
      return translations.en[key] !== undefined ? t(key) : String(raw);
    },
    [t]
  );

  const currentLanguage = useMemo(() => LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0], [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      language: lang,
      changeLanguage: setLang,
      currentLanguage,
      locale: currentLanguage.locale,
      t,
      tStatus,
      formatAlert,
      localizeNumber,
      LANGUAGES,
    }),
    [lang, setLang, currentLanguage, t, tStatus, formatAlert, localizeNumber]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
