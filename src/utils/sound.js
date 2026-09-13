/**
 * SUOWMRS Industrial Control Room Audio Synthesizer
 * Built with standard Web Audio API — zero external mp3 files or network dependencies.
 *
 * NOTE: STRICTLY used for manual operator actions:
 *   - Manual OPEN / CLOSE valve
 *   - Manual override confirmed
 *   - Critical flood diversion triggered
 *   - Watering sequence start/stop
 *   - Maintenance mode switch
 *
 * NEVER call this on automated or Socket.io telemetry updates.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a single pure tone with exponential ramp down for crisp industrial sound.
 */
function playTone({ frequency = 880, targetFrequency = null, type = 'sine', duration = 0.09, volume = 0.18 }) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(frequency, now);
    if (targetFrequency) {
      osc.frequency.exponentialRampToValueAtTime(targetFrequency, now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('[Audio] Failed to play tone:', e);
  }
}

/**
 * Play tailored valve actuation beep.
 * @param {'OPEN'|'STANDBY'|'CLOSE'|'open'|'close'} action
 */
export function playValveBeep(action = 'open') {
  const isOpening = action.toUpperCase() === 'OPEN';
  if (isOpening) {
    // Upward crisp chirp: 750 Hz -> 1100 Hz
    playTone({ frequency: 750, targetFrequency: 1100, type: 'triangle', duration: 0.085, volume: 0.22 });
  } else {
    // Downward mechanical chirp: 1100 Hz -> 680 Hz
    playTone({ frequency: 1100, targetFrequency: 680, type: 'triangle', duration: 0.085, volume: 0.22 });
  }
}

/**
 * Double-chirp operator confirmation pulse (e.g., when an override is confirmed).
 */
export function playConfirmBeep() {
  playTone({ frequency: 880, type: 'sine', duration: 0.045, volume: 0.16 });
  setTimeout(() => {
    playTone({ frequency: 1250, type: 'sine', duration: 0.065, volume: 0.2 });
  }, 50);
}

/**
 * Twin-pulse warning sound for dangerous / critical actions before execution.
 */
export function playCriticalBeep() {
  playTone({ frequency: 580, type: 'square', duration: 0.08, volume: 0.12 });
  setTimeout(() => {
    playTone({ frequency: 580, type: 'square', duration: 0.08, volume: 0.12 });
  }, 100);
}

/**
 * Short UI click / toggle sound.
 */
export function playActionBeep() {
  playTone({ frequency: 920, type: 'sine', duration: 0.05, volume: 0.15 });
}

/**
 * Emergency Siren — rising-falling wail pattern (3 cycles, ~2.4 seconds total).
 * Mimics industrial flood-diversion alarm. Uses oscillators only — no mp3/wav.
 * Call ONLY on manual valve OPEN or critical flood diversion actions.
 */
export function playSirenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const CYCLES = 3;
    const CYCLE_DURATION = 0.8; // seconds per hi-lo sweep
    const LO = 440;
    const HI = 880;
    const VOLUME = 0.18;

    for (let i = 0; i < CYCLES; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const start = ctx.currentTime + i * CYCLE_DURATION;

      // Rising phase (lo → hi)
      osc.frequency.setValueAtTime(LO, start);
      osc.frequency.linearRampToValueAtTime(HI, start + CYCLE_DURATION * 0.5);
      // Falling phase (hi → lo)
      osc.frequency.linearRampToValueAtTime(LO, start + CYCLE_DURATION);

      // Envelope: fade in → sustain → fade out
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(VOLUME, start + 0.05);
      gain.gain.setValueAtTime(VOLUME, start + CYCLE_DURATION - 0.05);
      gain.gain.linearRampToValueAtTime(0.001, start + CYCLE_DURATION);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + CYCLE_DURATION);
    }
  } catch (e) {
    console.warn('[Audio] Siren sound failed:', e);
  }
}
