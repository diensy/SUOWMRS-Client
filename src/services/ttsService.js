/**
 * SUOWMRS Multilingual Text-to-Speech (TTS) Service
 * Built on native Web Speech API (window.speechSynthesis)
 * Seamlessly integrates with the 6 native Indian languages:
 * English (en), Hindi (hi), Odia (or), Telugu (te), Tamil (ta), Bengali (bn)
 */

const LANG_LOCALE_MAP = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi', 'en-IN'],
  or: ['or-IN', 'or', 'hi-IN', 'en-IN'], // Odia fallback to Indian Hindi/English if OS lacks Odia TTS
  te: ['te-IN', 'te', 'en-IN'],
  ta: ['ta-IN', 'ta', 'en-IN'],
  bn: ['bn-IN', 'bn-BD', 'bn', 'en-IN'],
};

let cachedVoices = [];

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  cachedVoices = window.speechSynthesis.getVoices() || [];
  return cachedVoices;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

/**
 * Locate best matched browser voice for the selected language code.
 */
export function getBestVoice(langCode = 'en') {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  const targetCodes = LANG_LOCALE_MAP[langCode] || ['en-IN', 'en-US'];

  for (const code of targetCodes) {
    // Exact match (e.g. 'hi-IN')
    const exact = voices.find((v) => v.lang && v.lang.toLowerCase() === code.toLowerCase());
    if (exact) return exact;

    // Prefix match (e.g. 'hi')
    const prefix = code.split('-')[0].toLowerCase();
    const matchPrefix = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
    if (matchPrefix) return matchPrefix;
  }

  // Fallback to any Indian English voice or default
  const indianEnglish = voices.find((v) => v.lang && v.lang.toLowerCase().includes('en-in'));
  if (indianEnglish) return indianEnglish;

  return voices.find((v) => v.default) || voices[0] || null;
}

// Global active speaker tracker to coordinate UI buttons
const listeners = new Set();
let activeSpeakerState = {
  isSpeaking: false,
  activeId: null,
  text: '',
};

function notifyListeners() {
  listeners.forEach((fn) => fn(activeSpeakerState));
}

export function subscribeSpeakerState(fn) {
  listeners.add(fn);
  fn(activeSpeakerState);
  return () => listeners.delete(fn);
}

/**
 * Cancel any ongoing speech.
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeSpeakerState = {
    isSpeaking: false,
    activeId: null,
    text: '',
  };
  notifyListeners();
}

/**
 * Speak text in the target language.
 * @param {string} text The text to speak.
 * @param {string} langCode Language code ('en', 'hi', 'or', 'te', 'ta', 'bn').
 * @param {string} speakerId Optional unique ID of the triggering UI element.
 */
export function speakText(text, langCode = 'en', speakerId = 'default') {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('[TTS] Web Speech API is not supported in this browser.');
    return;
  }

  if (!text || typeof text !== 'string' || !text.trim()) return;

  // If already speaking this exact text/id, clicking again stops it (toggle behavior)
  if (activeSpeakerState.isSpeaking && activeSpeakerState.activeId === speakerId) {
    stopSpeaking();
    return;
  }

  // Stop any active speech before starting new
  stopSpeaking();

  const cleanText = text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[•●|—]/g, ' ') // strip bullets
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set voice & language
  const voice = getBestVoice(langCode);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = (LANG_LOCALE_MAP[langCode] || ['en-IN'])[0];
  }

  // Natural speech pacing for announcements
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    activeSpeakerState = {
      isSpeaking: true,
      activeId: speakerId,
      text: cleanText,
    };
    notifyListeners();
  };

  utterance.onend = () => {
    activeSpeakerState = {
      isSpeaking: false,
      activeId: null,
      text: '',
    };
    notifyListeners();
  };

  utterance.onerror = (e) => {
    // Interrupted by cancel is normal
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      console.warn('[TTS] Speech synthesis error:', e);
    }
    activeSpeakerState = {
      isSpeaking: false,
      activeId: null,
      text: '',
    };
    notifyListeners();
  };

  window.speechSynthesis.speak(utterance);
}
