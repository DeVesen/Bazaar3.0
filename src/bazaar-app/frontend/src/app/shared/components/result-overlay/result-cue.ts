import { ResultKind } from './result-event';

/** Handle to a running tone/vibration; `cancel()` ends both immediately. */
export interface ResultCue {
  cancel(): void;
}

interface Tone {
  startHz: number;
  endHz: number;
  offsetSeconds: number;
  durationSeconds: number;
}

interface CuePattern {
  tones: Tone[];
  vibrationMs: number[];
}

/*
 * Kept in sync on purpose: PING and ZONK (tones and vibration) exist identically in
 * `../scan-feedback/scan-feedback.ts` (`playTone`, `vibrate`), which stays untouched for the intake
 * page. When changing a frequency, ramp or vibration pattern here, change it there as well.
 */
const PING: CuePattern = {
  tones: [{ startHz: 880, endHz: 1320, offsetSeconds: 0, durationSeconds: 0.15 }],
  vibrationMs: [100],
};

const ZONK: CuePattern = {
  tones: [{ startHz: 180, endHz: 120, offsetSeconds: 0, durationSeconds: 0.15 }],
  vibrationMs: [80, 60, 80],
};

/** Two short tones (80 ms at 1000 Hz) with a 60 ms pause; vibration mirrors that rhythm. */
const DOUBLE_BEEP: CuePattern = {
  tones: [
    { startHz: 1000, endHz: 1000, offsetSeconds: 0, durationSeconds: 0.08 },
    { startHz: 1000, endHz: 1000, offsetSeconds: 0.14, durationSeconds: 0.08 },
  ],
  vibrationMs: [60, 60, 60],
};

const PATTERN_BY_KIND: Record<ResultKind, CuePattern> = {
  success: PING,
  cart: PING,
  paid: PING,
  failed: ZONK,
  already: DOUBLE_BEEP,
};

/**
 * Plays the tone and vibration for a result. Both are feature-detected and silently skipped when the
 * device lacks Web Audio or `navigator.vibrate` — the visual overlay never depends on them.
 */
export function playResultCue(kind: ResultKind): ResultCue {
  const pattern = PATTERN_BY_KIND[kind];
  const context = startTones(pattern.tones);
  navigator.vibrate?.(pattern.vibrationMs);
  return {
    cancel: () => {
      closeQuietly(context);
      navigator.vibrate?.(0);
    },
  };
}

/** Returns `undefined` when there is no sound — the caller (and the overlay) carries on silently. */
function startTones(tones: Tone[]): AudioContext | undefined {
  const context = createAudioContext();
  if (!context) return undefined;

  resumeIfSuspended(context);
  try {
    const now = context.currentTime;
    const oscillators = tones.map((tone) => scheduleTone(context, tone, now));
    oscillators[oscillators.length - 1].onended = () => closeQuietly(context);
    return context;
  } catch {
    // Scheduling failed on a real context — release it, the result still shows without sound.
    closeQuietly(context);
    return undefined;
  }
}

/** Feature-detects Web Audio; a throwing constructor (context limit, autoplay policy) counts as "no sound". */
function createAudioContext(): AudioContext | undefined {
  const AudioContextCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return undefined;

  try {
    return new AudioContextCtor();
  } catch {
    return undefined;
  }
}

/** Created outside a user gesture (e.g. in an HTTP response) a context may start suspended; a rejection just means no sound. */
function resumeIfSuspended(context: AudioContext): void {
  if (context.state !== 'suspended') return;
  Promise.resolve(context.resume()).catch(() => undefined);
}

function scheduleTone(context: AudioContext, tone: Tone, now: number): OscillatorNode {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  const start = now + tone.offsetSeconds;
  const end = start + tone.durationSeconds;
  oscillator.frequency.setValueAtTime(tone.startHz, start);
  oscillator.frequency.linearRampToValueAtTime(tone.endHz, end);
  oscillator.start(start);
  oscillator.stop(end);
  return oscillator;
}

/** `close()` rejects when the context is already closed (e.g. cancel after the last tone ended). */
function closeQuietly(context: AudioContext | undefined): void {
  if (!context) return;
  Promise.resolve(context.close()).catch(() => undefined);
}
