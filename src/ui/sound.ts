/**
 * Sound, made rather than shipped.
 *
 * There are no audio files. Every cue is a handful of notes synthesised with the Web Audio API,
 * which keeps the build free of binaries, keeps the download where it was, and suits a game drawn
 * in pixels: the sounds are as coarse as the pictures, on purpose.
 *
 * **Off by default.** A page that makes noise unprompted is the one tab everybody closes, and a
 * browser will not let it start anyway before a gesture. Turning sound on is that gesture. The
 * choice is kept per device in `localStorage`, like the language, and is not part of a career.
 *
 * Nothing in here touches the engine or the game state. The UI calls `playCue`; if sound is off,
 * or there is no audio at all (tests, an old browser), it silently does nothing.
 */

import { useSyncExternalStore } from 'react';

export type Cue = 'tap' | 'event' | 'report' | 'promotion' | 'achievement' | 'farewell' | 'ministry' | 'ending';

/** One note of a cue: when it starts, how long it rings, and how loud, in a given waveform. */
export interface Note {
  /** Hz. */
  freq: number;
  /** Seconds after the cue begins. */
  at: number;
  /** Seconds it sounds for. */
  length: number;
  /** 0 to 1, before the master volume. */
  gain: number;
  wave: OscillatorType;
}

// A minor-ish palette in A, so no two cues clash if they overlap.
const A3 = 220;
const C4 = 261.63;
const E4 = 329.63;
const A4 = 440;
const C5 = 523.25;
const E5 = 659.25;
const A5 = 880;
const G4 = 392;
const D4 = 293.66;

export const CUES: Record<Cue, readonly Note[]> = {
  // A short, dry tick. Played for every button, so it must be quiet and must not have a tail.
  tap: [{ freq: 660, at: 0, length: 0.04, gain: 0.35, wave: 'square' }],

  // Something has landed on your desk.
  event: [
    { freq: E4, at: 0, length: 0.12, gain: 0.5, wave: 'triangle' },
    { freq: A4, at: 0.1, length: 0.2, gain: 0.5, wave: 'triangle' },
  ],

  // A stamp on a file: the month is closed.
  report: [
    { freq: A3, at: 0, length: 0.1, gain: 0.6, wave: 'square' },
    { freq: C4, at: 0.09, length: 0.18, gain: 0.5, wave: 'triangle' },
  ],

  // Up a rung.
  promotion: [
    { freq: A3, at: 0, length: 0.2, gain: 0.5, wave: 'triangle' },
    { freq: E4, at: 0.16, length: 0.2, gain: 0.5, wave: 'triangle' },
    { freq: A4, at: 0.32, length: 0.2, gain: 0.5, wave: 'triangle' },
    { freq: C5, at: 0.48, length: 0.7, gain: 0.55, wave: 'triangle' },
  ],

  // Something you started years ago has finished.
  achievement: [
    { freq: C4, at: 0, length: 0.25, gain: 0.45, wave: 'triangle' },
    { freq: E4, at: 0.2, length: 0.25, gain: 0.45, wave: 'triangle' },
    { freq: G4, at: 0.4, length: 0.25, gain: 0.45, wave: 'triangle' },
    { freq: C5, at: 0.6, length: 0.9, gain: 0.5, wave: 'triangle' },
  ],

  // Somebody leaves. Falling, and slow.
  farewell: [
    { freq: E5, at: 0, length: 0.5, gain: 0.35, wave: 'sine' },
    { freq: C5, at: 0.45, length: 0.5, gain: 0.35, wave: 'sine' },
    { freq: A4, at: 0.9, length: 1.4, gain: 0.35, wave: 'sine' },
  ],

  // The car. Wider and longer than the others, with an octave on top.
  ministry: [
    { freq: A3, at: 0, length: 0.4, gain: 0.5, wave: 'triangle' },
    { freq: E4, at: 0.3, length: 0.4, gain: 0.5, wave: 'triangle' },
    { freq: A4, at: 0.6, length: 0.4, gain: 0.5, wave: 'triangle' },
    { freq: C5, at: 0.9, length: 0.4, gain: 0.5, wave: 'triangle' },
    { freq: E5, at: 1.2, length: 0.4, gain: 0.5, wave: 'triangle' },
    { freq: A5, at: 1.5, length: 1.8, gain: 0.5, wave: 'triangle' },
  ],

  // The last page of any career. Quiet and unresolved.
  ending: [
    { freq: A4, at: 0, length: 0.6, gain: 0.3, wave: 'sine' },
    { freq: D4, at: 0.5, length: 1.6, gain: 0.3, wave: 'sine' },
  ],
};

/** The two voices of the ambient bed, a fifth apart. */
export const AMBIENT_VOICES: readonly number[] = [A3 / 2, A3 * 0.75];

/* ----------------------------------------------------------------- state */

const STORAGE_KEY = 'publicadmin.sound';
const MASTER_VOLUME = 0.25;
const AMBIENT_VOLUME = 0.035;

function readStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

let enabled = readStorage()?.getItem(STORAGE_KEY) === '1';
const listeners = new Set<() => void>();

let context: AudioContext | undefined;
let master: GainNode | undefined;
let ambient: { gain: GainNode; stop: () => void } | undefined;

function notify(): void {
  for (const listener of listeners) listener();
}

export function isSoundOn(): boolean {
  return enabled;
}

/** Whether this browser can make sound at all. The toggle is hidden when it cannot. */
export function soundAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
}

function ensureContext(): AudioContext | undefined {
  if (!soundAvailable()) return undefined;
  if (!context) {
    try {
      context = new window.AudioContext();
      master = context.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(context.destination);
    } catch {
      context = undefined;
      return undefined;
    }
  }
  return context;
}

/** A browser starts a context suspended until a gesture; every click is one. */
export function resumeAudio(): void {
  if (!enabled || !context) return;
  if (context.state === 'suspended') void context.resume().catch(() => {});
}

function startAmbient(): void {
  const ctx = ensureContext();
  if (!ctx || !master || ambient) return;

  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(AMBIENT_VOLUME, ctx.currentTime + 2);

  // A low-pass keeps it a murmur in the next room and not a tone.
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;

  // A very slow swell, so the bed breathes and never settles into a drone.
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoDepth.gain.value = AMBIENT_VOLUME * 0.5;
  lfo.connect(lfoDepth);
  lfoDepth.connect(gain.gain);

  const voices = AMBIENT_VOICES.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // Detune the pair apart so they beat against each other slowly.
    osc.detune.value = i === 0 ? -6 : 7;
    osc.connect(filter);
    osc.start();
    return osc;
  });

  filter.connect(gain);
  gain.connect(master);
  lfo.start();

  ambient = {
    gain,
    stop: () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      for (const osc of [...voices, lfo]) {
        try {
          osc.stop(now + 0.7);
        } catch {
          // Already stopped.
        }
      }
    },
  };
}

function stopAmbient(): void {
  ambient?.stop();
  ambient = undefined;
}

export function setSoundOn(on: boolean): void {
  enabled = on;
  try {
    readStorage()?.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    // A full or disabled store should not stop the sound.
  }

  if (on) {
    ensureContext();
    resumeAudio();
    startAmbient();
  } else {
    stopAmbient();
  }
  notify();
}

/** Brings the bed back for a returning player who left sound on, once a gesture allows it. */
export function resumeAmbientIfWanted(): void {
  if (!enabled) return;
  ensureContext();
  resumeAudio();
  startAmbient();
}

export function playCue(cue: Cue): void {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx || !master) return;
  resumeAudio();

  const start = ctx.currentTime + 0.01;
  for (const note of CUES[cue]) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = note.wave;
    osc.frequency.value = note.freq;

    // A fast attack and an exponential fall, so a note starts cleanly and leaves without a click.
    const t0 = start + note.at;
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(note.gain, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + note.length);

    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + note.length + 0.05);
  }
}

/** The pause button for a hidden tab: a game nobody is looking at should not be heard. */
export function setAudioHidden(hidden: boolean): void {
  if (!context) return;
  if (hidden) void context.suspend().catch(() => {});
  else resumeAudio();
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isSoundOn,
    () => false,
  );
}
