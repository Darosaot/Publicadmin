import { describe, expect, it } from 'vitest';
import { AMBIENT_VOICES, CUES, isSoundOn, playCue, setSoundOn, soundAvailable } from '../../src/ui/sound';

describe('the cues', () => {
  it('are all well formed, so none of them can throw inside Web Audio', () => {
    for (const [name, notes] of Object.entries(CUES)) {
      expect(notes.length, name).toBeGreaterThan(0);
      for (const note of notes) {
        expect(note.freq, name).toBeGreaterThan(20);
        expect(note.freq, name).toBeLessThan(5000);
        expect(note.at, name).toBeGreaterThanOrEqual(0);
        expect(note.length, name).toBeGreaterThan(0);
        // An exponential ramp cannot target zero, so the gain has to be a real, audible number.
        expect(note.gain, name).toBeGreaterThan(0);
        expect(note.gain, name).toBeLessThanOrEqual(1);
      }
    }
  });

  it('keeps the tap short, because it plays for every button in the game', () => {
    const end = Math.max(...CUES.tap.map((n) => n.at + n.length));
    expect(end).toBeLessThan(0.1);
  });

  it('keeps the ambient bed low and well below the cues', () => {
    for (const freq of AMBIENT_VOICES) expect(freq).toBeLessThan(220);
  });
});

describe('without audio support', () => {
  it('is off by default and does nothing, quietly', () => {
    expect(soundAvailable()).toBe(false);
    expect(isSoundOn()).toBe(false);
    expect(() => playCue('promotion')).not.toThrow();
    // Turning it on in a browser that cannot make sound must not throw either.
    expect(() => setSoundOn(true)).not.toThrow();
    expect(() => setSoundOn(false)).not.toThrow();
  });
});
