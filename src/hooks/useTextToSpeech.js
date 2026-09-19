import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakText, stopSpeaking, subscribeSpeakerState, isTTSSupported } from '../services/ttsService';

/**
 * React hook for Text-to-Speech playback, synchronised with the active UI language.
 *
 * const { isSpeaking, speak, stop, toggle, speakKey } = useTextToSpeech('my-button-id');
 *   speak('text')                     → speak raw text in the current language
 *   speakKey('tts_waterLevel', vars)  → speak a translation key with {var} interpolation
 *   toggle('text')                    → start, or stop if this id is already talking
 */
export function useTextToSpeech(id = 'default') {
  const { lang, t } = useLanguage();
  const langRef = useRef(lang);

  const [state, setState] = useState({ isSpeaking: false, activeId: null, anySpeaking: false, error: null, errorLang: null });

  useEffect(() => {
    const unsubscribe = subscribeSpeakerState((s) => {
      setState({
        isSpeaking: s.isSpeaking && s.activeId === id,
        activeId: s.activeId,
        anySpeaking: s.isSpeaking,
        // error is reported to the button that started the failed utterance
        error: s.error && s.lang && s.activeId === null ? s.error : null,
        errorLang: s.lang,
      });
    });
    return unsubscribe;
  }, [id]);

  // Switching UI language mid-sentence → stop so we don't keep talking in the old language
  useEffect(() => {
    if (langRef.current !== lang) {
      langRef.current = lang;
      stopSpeaking();
    }
  }, [lang]);

  const speak = useCallback(
    (text, overrideLang = null) => speakText(text, overrideLang || lang, id),
    [lang, id]
  );

  const speakKey = useCallback(
    (key, vars = {}, overrideLang = null) => speakText(t(key, vars), overrideLang || lang, id),
    [t, lang, id]
  );

  const stop = useCallback(() => stopSpeaking(), []);

  const toggle = useCallback(
    (text, overrideLang = null) => {
      if (state.isSpeaking) {
        stop();
      } else {
        speak(text, overrideLang);
      }
    },
    [state.isSpeaking, speak, stop]
  );

  return {
    isSpeaking: state.isSpeaking,
    anySpeaking: state.anySpeaking,
    error: state.error,
    errorLang: state.errorLang,
    isSupported: isTTSSupported(),
    speak,
    speakKey,
    stop,
    toggle,
    currentLang: lang,
  };
}
