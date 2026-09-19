/**
 * SUOWMRS Multilingual Text-to-Speech (TTS) Service
 * Supports the 6 platform languages: English (en), Hindi (hi), Odia (or), Telugu (te), Tamil (ta), Bengali (bn)
 *
 * Playback strategy:
 *   1. Server neural voices  — GET/POST /api/tts (Microsoft neural voices, Azure for Odia). Native
 *      speakers, correct pronunciation, identical on every device. Audio is cached server-side and
 *      in this module (blob URLs), so repeated phrases play instantly.
 *   2. Browser Web Speech API — fallback when offline, the server is unreachable, or the server has
 *      no voice for the language (e.g. Odia without an Azure key).
 *
 * Browser quirks handled here:
 *  - Chrome loads voices asynchronously → we wait for `voiceschanged` before the first utterance.
 *  - Chrome silently stops utterances longer than ~15 s → text is split into sentence chunks.
 *  - Calling speak() synchronously right after cancel() can drop the utterance → small defer.
 *  - Chrome pauses long speech when the tab is backgrounded → resume() keep-alive ticker.
 *  - If the OS has no voice for a language, we still set `utterance.lang` so the engine can
 *    pick a phonetically close voice instead of reading Indic text with an English voice.
 */

import { API_BASE_URL } from '../config/apiConfig';

const LANG_LOCALE_MAP = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi'],
  or: ['or-IN', 'or', 'hi-IN', 'bn-IN'], // Odia voices are rare; Hindi/Bengali are the closest fallbacks
  te: ['te-IN', 'te'],
  ta: ['ta-IN', 'ta'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
};

// Localized digits → ASCII so every engine can read numbers
const NATIVE_DIGITS = /[०-९୦-୯০-৯౦-౯௦-௯]/g;
const DIGIT_BASES = [0x0966, 0x0b66, 0x09e6, 0x0c66, 0x0be6];
const toAsciiDigit = (ch) => {
  const code = ch.charCodeAt(0);
  for (const base of DIGIT_BASES) {
    if (code >= base && code <= base + 9) return String(code - base);
  }
  return ch;
};

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export const isBrowserTTSSupported = () => !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';
export const isTTSSupported = () => typeof window !== 'undefined' && (typeof window.Audio !== 'undefined' || isBrowserTTSSupported());

// ─────────────────────────── Voice loading ───────────────────────────
let cachedVoices = [];
let voicesPromise = null;

function loadVoices() {
  if (!synth) return [];
  cachedVoices = synth.getVoices() || [];
  return cachedVoices;
}

/** Resolves with the voice list once the browser has populated it (max ~1.5 s wait). */
function ensureVoices() {
  if (!synth) return Promise.resolve([]);
  if (cachedVoices.length) return Promise.resolve(cachedVoices);
  if (loadVoices().length) return Promise.resolve(cachedVoices);
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener?.('voiceschanged', finish);
      resolve(loadVoices());
    };
    synth.addEventListener?.('voiceschanged', finish);
    // Some engines never fire voiceschanged — poll briefly then give up gracefully
    let tries = 0;
    const poll = setInterval(() => {
      tries++;
      if (loadVoices().length || tries > 15) {
        clearInterval(poll);
        finish();
      }
    }, 100);
  });
  return voicesPromise;
}

if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

/**
 * Locate the best matching browser voice for the selected language code.
 * Returns null when no voice for that language family exists (we then rely on utterance.lang).
 */
export function getBestVoice(langCode = 'en') {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  if (!voices.length) return null;

  const targets = LANG_LOCALE_MAP[langCode] || LANG_LOCALE_MAP.en;
  const norm = (s) => String(s || '').toLowerCase().replace('_', '-');

  for (const code of targets) {
    const c = norm(code);
    const exact = voices.filter((v) => norm(v.lang) === c);
    // Prefer Google / Microsoft "natural" voices when there are several
    const best = exact.find((v) => /google|natural|neural/i.test(v.name)) || exact[0];
    if (best) return best;
  }
  for (const code of targets) {
    const prefix = norm(code).split('-')[0];
    const match = voices.find((v) => norm(v.lang).split('-')[0] === prefix);
    if (match) return match;
  }
  return null;
}

/** Human readable list of languages this device actually has voices for. */
export function getAvailableVoiceLanguages() {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  const found = new Set();
  Object.keys(LANG_LOCALE_MAP).forEach((code) => {
    const prefixes = LANG_LOCALE_MAP[code].map((c) => c.split('-')[0].toLowerCase());
    if (voices.some((v) => prefixes.includes(String(v.lang || '').toLowerCase().split(/[-_]/)[0]))) found.add(code);
  });
  return [...found];
}

// ─────────────────────────── Speaker state ───────────────────────────
const listeners = new Set();
let activeSpeakerState = { isSpeaking: false, activeId: null, text: '', error: null, lang: null };
let currentSession = 0; // increments on every speak/stop so stale callbacks are ignored
let keepAliveTimer = null;

function setState(next) {
  activeSpeakerState = next;
  listeners.forEach((fn) => fn(activeSpeakerState));
}

export function subscribeSpeakerState(fn) {
  listeners.add(fn);
  fn(activeSpeakerState);
  return () => listeners.delete(fn);
}

export function getSpeakerState() {
  return activeSpeakerState;
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/** Cancel any ongoing speech. */
export function stopSpeaking() {
  currentSession++;
  stopKeepAlive();
  stopServerAudio();
  if (synth) {
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
  }
  setState({ isSpeaking: false, activeId: null, text: '', error: null, lang: null });
}

// ─────────────────────────── Text preparation ───────────────────────────
// "&" and "%" spoken in the target language (an engine reading "&" as "ampersand" mid-sentence is jarring)
const AND_WORD = { en: 'and', hi: 'और', or: 'ଓ', te: 'మరియు', ta: 'மற்றும்', bn: 'এবং' };
const PERCENT_WORD = { en: 'percent', hi: 'प्रतिशत', or: 'ପ୍ରତିଶତ', te: 'శాతం', ta: 'சதவீதம்', bn: 'শতাংশ' };

// Acronyms every voice otherwise tries to read as a word ("suomers", "yot") → spelled letter by letter.
// Mirrors server/services/ttsService.js so the browser fallback sounds the same as the neural voice.
const ACRONYMS = [
  ['SUOWMRS', 'S U O W M R S'],
  ['IoT', 'I o T'],
  ['AI', 'A I'],
  ['ESP32', 'E S P 32'],
  ['SOS', 'S O S'],
  ['GIS', 'G I S'],
  ['TDS', 'T D S'],
  ['PWA', 'P W A'],
  ['LED', 'L E D'],
  ['UPI', 'U P I'],
];

export function cleanForSpeech(text, langCode = 'en') {
  let out = String(text)
    .replace(/<[^>]*>/g, ' ') // strip HTML tags
    .replace(NATIVE_DIGITS, toAsciiDigit);
  for (const [abbr, spoken] of ACRONYMS) {
    out = out.replace(new RegExp(`(?<![A-Za-z])${abbr}(?![A-Za-z])`, 'g'), spoken);
  }
  return out
    .replace(/\s*&\s*/g, ` ${AND_WORD[langCode] || AND_WORD.en} `)
    .replace(/(\d)\s*%/g, `$1 ${PERCENT_WORD[langCode] || PERCENT_WORD.en}`)
    .replace(/\s*[—–/]\s*/g, ', ') // dashes and slashes → short pause instead of a run-on
    .replace(/[•●▪■◆|_*#`<>"]/g, ' ') // strip bullets/markdown
    .replace(/\s*,(\s*,)+/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.।॥!?])/g, '$1')
    .trim();
}

/** Split into speakable chunks (≤ ~180 chars) at sentence / clause boundaries. */
function chunkText(text, max = 180) {
  const sentences = text.split(/(?<=[.!?।॥])\s+|\n+/).filter(Boolean);
  const chunks = [];
  let buf = '';
  const push = () => {
    if (buf.trim()) chunks.push(buf.trim());
    buf = '';
  };
  for (let s of sentences) {
    if (s.length > max) {
      push();
      // very long sentence → split at commas / semicolons, then hard-split
      const parts = s.split(/(?<=[,;:])\s+/);
      let sub = '';
      for (const p of parts) {
        if ((sub + ' ' + p).length > max) {
          if (sub) chunks.push(sub.trim());
          sub = p;
          while (sub.length > max) {
            chunks.push(sub.slice(0, max));
            sub = sub.slice(max);
          }
        } else sub = sub ? sub + ' ' + p : p;
      }
      if (sub) chunks.push(sub.trim());
      continue;
    }
    if ((buf + ' ' + s).length > max) push();
    buf = buf ? buf + ' ' + s : s;
  }
  push();
  return chunks.length ? chunks : [text];
}

// ─────────────────────────── Server neural audio ───────────────────────────
let serverCaps = null; // { languages: { hi: { supported } } } from /api/tts/voices
let serverCapsPromise = null;
let serverDown = false; // flipped when the API is unreachable → skip straight to browser voice

function loadServerCapabilities() {
  if (serverCaps) return Promise.resolve(serverCaps);
  if (serverCapsPromise) return serverCapsPromise;
  serverCapsPromise = fetch(`${API_BASE_URL}/tts/voices`)
    .then((r) => (r.ok ? r.json() : null))
    .then((caps) => { serverCaps = caps; return caps; })
    .catch(() => { serverDown = true; return null; })
    .finally(() => { serverCapsPromise = null; });
  return serverCapsPromise;
}

/** true if the server can synthesize this language (unknown until capabilities are loaded → optimistic). */
export function serverSupports(langCode) {
  if (serverDown) return false;
  if (!serverCaps) return langCode !== 'or';
  return Boolean(serverCaps.languages?.[langCode]?.supported);
}

// Small LRU of blob URLs so re-playing a phrase does not hit the network
const audioCache = new Map();
const AUDIO_CACHE_MAX = 60;
function cacheAudio(key, url) {
  if (audioCache.has(key)) audioCache.delete(key);
  audioCache.set(key, url);
  if (audioCache.size > AUDIO_CACHE_MAX) {
    const [oldKey, oldUrl] = audioCache.entries().next().value;
    audioCache.delete(oldKey);
    URL.revokeObjectURL(oldUrl);
  }
}

async function fetchServerAudio(text, langCode, rate) {
  const key = `${langCode}|${rate}|${text}`;
  if (audioCache.has(key)) return audioCache.get(key);
  const res = await fetch(`${API_BASE_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang: langCode, rate }),
  });
  if (!res.ok) {
    if (res.status === 422) {
      // language not available on the server → remember it so we don't retry every click
      serverCaps = serverCaps || { languages: {} };
      serverCaps.languages[langCode] = { supported: false };
    }
    throw new Error(`server tts ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  cacheAudio(key, url);
  return url;
}

let currentAudio = null;
function stopServerAudio() {
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.src = ''; } catch { /* ignore */ }
    currentAudio = null;
  }
}

/** Warm the capability lookup early (called on app boot). */
export function primeTTS() {
  loadServerCapabilities();
}

// ─────────────────────────── Speaking ───────────────────────────
/**
 * Speak text in the target language.
 * @param {string} text        Text to speak.
 * @param {string} langCode    'en' | 'hi' | 'or' | 'te' | 'ta' | 'bn'
 * @param {string} speakerId   Unique ID of the triggering UI element (for toggle/highlight).
 * @param {object} [opts]      { rate, pitch, onEnd }
 * @returns {Promise<void>}    Resolves when speech finishes or is cancelled.
 */
export function speakText(text, langCode = 'en', speakerId = 'default', opts = {}) {
  if (!isTTSSupported()) {
    console.warn('[TTS] No audio playback available in this browser.');
    return Promise.resolve();
  }
  if (!text || typeof text !== 'string' || !text.trim()) return Promise.resolve();

  // Clicking the same speaker again while it is talking → stop (toggle behaviour)
  if (activeSpeakerState.isSpeaking && activeSpeakerState.activeId === speakerId) {
    stopSpeaking();
    return Promise.resolve();
  }

  stopSpeaking();
  const session = currentSession;
  const cleanText = cleanForSpeech(text, langCode);
  if (!cleanText) return Promise.resolve();

  // Reflect the "speaking" state immediately so buttons react even before playback starts
  setState({ isSpeaking: true, activeId: speakerId, text: cleanText, error: null, lang: langCode });

  const finishWith = (error = null) => {
    if (session !== currentSession) return;
    stopKeepAlive();
    setState({ isSpeaking: false, activeId: null, text: '', error, lang: langCode });
    opts.onEnd?.(error);
  };

  // ── 1. Server neural voice ──
  const rate = opts.rate ?? 1;
  const tryServer = async () => {
    await loadServerCapabilities();
    if (session !== currentSession) return 'cancelled';
    if (!serverSupports(langCode)) return 'unsupported';
    let url;
    try {
      url = await fetchServerAudio(cleanText, langCode, rate);
    } catch (e) {
      // Only a network failure marks the server down for the session; a 4xx/5xx for one phrase
      // must not push every later phrase onto the browser voice
      if (!/^server tts \d{3}$/.test(e.message)) serverDown = true;
      console.warn('[TTS] server voice unavailable, using browser voice:', e.message);
      return 'unsupported';
    }
    if (session !== currentSession) return 'cancelled';
    return new Promise((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => { if (currentAudio === audio) currentAudio = null; finishWith(); resolve('done'); };
      audio.onerror = () => { if (currentAudio === audio) currentAudio = null; resolve('unsupported'); };
      audio.play().catch((err) => {
        // Autoplay policy: playback must follow a user gesture — buttons satisfy this; announce() may not
        console.warn('[TTS] audio.play() rejected:', err?.message);
        if (currentAudio === audio) currentAudio = null;
        resolve(err?.name === 'NotAllowedError' ? 'blocked' : 'unsupported');
      });
    });
  };

  return tryServer().then((outcome) => {
    if (outcome === 'done' || outcome === 'cancelled') return;
    if (outcome === 'blocked') return finishWith('not-allowed');
    if (!isBrowserTTSSupported()) return finishWith('synthesis-unavailable');
    return speakWithBrowser();
  });

  // ── 2. Browser Web Speech fallback ──
  function speakWithBrowser() {
  return ensureVoices().then(
    () =>
      new Promise((resolve) => {
        if (session !== currentSession) return resolve(); // cancelled while loading voices

        const voice = getBestVoice(langCode);
        const lang = voice?.lang || (LANG_LOCALE_MAP[langCode] || LANG_LOCALE_MAP.en)[0];
        const chunks = chunkText(cleanText);
        let idx = 0;

        let spokeSomething = false;
        const finish = (error = null) => {
          if (session !== currentSession) return resolve();
          stopKeepAlive();
          setState({ isSpeaking: false, activeId: null, text: '', error, lang: langCode });
          opts.onEnd?.(error);
          resolve();
        };

        const speakNext = () => {
          if (session !== currentSession) return resolve();
          if (idx >= chunks.length) return finish();

          const utt = new SpeechSynthesisUtterance(chunks[idx++]);
          if (voice) utt.voice = voice;
          utt.lang = lang;
          utt.rate = opts.rate ?? (langCode === 'en' ? 0.95 : 0.9);
          utt.pitch = opts.pitch ?? 1.0;
          utt.volume = 1;

          utt.onstart = () => { spokeSomething = true; };
          utt.onend = speakNext;
          utt.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return resolve();
            console.warn('[TTS] Speech synthesis error:', e.error);
            // No engine/voice for this language on the device → stop and report instead of silently skipping
            if (!spokeSomething && /unavailable|synthesis-failed|not-allowed/.test(e.error || '')) {
              return finish(e.error || 'synthesis-failed');
            }
            speakNext();
          };
          synth.speak(utt);
        };

        // Chrome keep-alive: long speech gets paused after ~15 s in some builds
        stopKeepAlive();
        keepAliveTimer = setInterval(() => {
          if (!synth.speaking) return;
          try {
            synth.pause();
            synth.resume();
          } catch {
            /* ignore */
          }
        }, 10000);

        // Defer slightly — speaking synchronously after cancel() is unreliable in Chrome
        setTimeout(speakNext, 60);
      })
  );
  }
}

/** Convenience: speak and ignore toggle semantics (always restarts). */
export function announce(text, langCode = 'en', speakerId = 'announce') {
  stopSpeaking();
  return speakText(text, langCode, speakerId);
}
