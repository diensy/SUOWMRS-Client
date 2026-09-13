import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakText, stopSpeaking, subscribeSpeakerState } from '../services/ttsService';

/**
 * Custom React Hook for Text-to-Speech playback.
 * Automatically synchronizes with the active language from LanguageContext.
 */
export function useTextToSpeech(id = 'default') {
  const { lang, language } = useLanguage();
  const currentLang = lang || language || 'en';

  const [state, setState] = useState({
    isSpeaking: false,
    activeId: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeSpeakerState((activeState) => {
      setState({
        isSpeaking: activeState.isSpeaking && activeState.activeId === id,
        activeId: activeState.activeId,
      });
    });
    return unsubscribe;
  }, [id]);

  const speak = useCallback(
    (text, overrideLang = null) => {
      speakText(text, overrideLang || currentLang, id);
    },
    [currentLang, id]
  );

  const stop = useCallback(() => {
    stopSpeaking();
  }, []);

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
    speak,
    stop,
    toggle,
    currentLang,
  };
}
