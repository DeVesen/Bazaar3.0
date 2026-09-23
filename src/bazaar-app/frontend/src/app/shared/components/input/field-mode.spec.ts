import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldModeState, applyNumpadKey, fieldModeAddons } from './field-mode';

describe('fieldModeAddons', () => {
  it('orders camera, numpad, clear, enter and marks the active mode', () => {
    const addons = fieldModeAddons(['keyboard', 'camera', 'numpad'], 'numpad');

    expect(addons.map((a) => a.key)).toEqual(['camera', 'numpad', 'clear', 'enter']);
    expect(addons.find((a) => a.key === 'numpad')?.class).toBe('app-input__addon--active');
    expect(addons.find((a) => a.key === 'camera')?.class).toBeUndefined();
  });

  it('omits the camera addon when camera is not an available mode', () => {
    expect(fieldModeAddons(['keyboard', 'numpad'], 'keyboard').map((a) => a.key)).toEqual([
      'numpad',
      'clear',
      'enter',
    ]);
  });
});

describe('applyNumpadKey', () => {
  it('appends digits, removes the last char on Backspace and ignores anything else', () => {
    expect(applyNumpadKey('10', { key: '4' })).toBe('104');
    expect(applyNumpadKey('104', { key: 'Backspace' })).toBe('10');
    expect(applyNumpadKey('10', { key: 'Enter' })).toBe('10');
    expect(applyNumpadKey('10', {})).toBe('10');
  });
});

describe('FieldModeState', () => {
  function createState(): FieldModeState {
    return TestBed.runInInjectionContext(() => new FieldModeState());
  }

  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: vi.fn() }, configurable: true });
  });

  it('starts in keyboard mode', () => {
    expect(createState().active()).toBe('keyboard');
  });

  it('toggles a mode on and back to keyboard', () => {
    const state = createState();
    state.toggle('numpad');
    expect(state.active()).toBe('numpad');
    state.toggle('numpad');
    expect(state.active()).toBe('keyboard');
  });

  it('remembers the mode active before entering camera', () => {
    const state = createState();
    state.switchTo('numpad');
    state.switchTo('camera');
    expect(state.previousMode()).toBe('numpad');
  });

  it('flags camera-denied and falls back to keyboard when no camera API exists', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    const state = createState();

    state.switchTo('camera');
    TestBed.tick();
    await Promise.resolve();

    expect(state.cameraDenied()).toBe(true);
    expect(state.active()).toBe('keyboard');
  });
});
