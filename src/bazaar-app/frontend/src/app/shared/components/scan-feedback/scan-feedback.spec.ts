import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanFeedback } from './scan-feedback';
import { SettingsService } from '../../../core/settings/settings.service';

/**
 * Mocks the Web Audio constructors (`AudioContext`, its `createOscillator`/`createGain`)
 * rather than trying to make jsdom actually produce sound — jsdom has no audio pipeline,
 * so stubbing at the constructor boundary is the only way to assert the frequency ramp
 * calls the component makes.
 */
interface MockOscillator {
  frequency: { setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}

let lastOscillator: MockOscillator | undefined;

function createAudioContextMock() {
  return vi.fn().mockImplementation(function (this: { currentTime: number; destination: object }) {
    this.currentTime = 0;
    this.destination = {};
    (this as unknown as { createGain: () => object }).createGain = vi.fn(() => ({ connect: vi.fn() }));
    (this as unknown as { createOscillator: () => MockOscillator }).createOscillator = vi.fn(() => {
      lastOscillator = {
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };
      return lastOscillator;
    });
    (this as unknown as { close: () => void }).close = vi.fn();
  });
}

describe('ScanFeedback', () => {
  beforeEach(async () => {
    lastOscillator = undefined;
    vi.stubGlobal('AudioContext', createAudioContextMock());
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ScanFeedback],
      providers: [{ provide: SettingsService, useValue: { scannerPauseMs: () => 3000 } }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('plays the success ping (880→1320 Hz) and vibrates on a success result', () => {
    const fixture = TestBed.createComponent(ScanFeedback);
    fixture.componentRef.setInput('result', 'success');
    fixture.detectChanges();

    expect(lastOscillator).toBeDefined();
    expect(lastOscillator!.frequency.setValueAtTime).toHaveBeenCalledWith(880, expect.any(Number));
    expect(lastOscillator!.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(1320, expect.any(Number));
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });

  it.each(['already-set', 'unknown'] as const)(
    'plays the error zonk (180→120 Hz) and vibrates on a %s result',
    (result) => {
      const fixture = TestBed.createComponent(ScanFeedback);
      fixture.componentRef.setInput('result', result);
      fixture.detectChanges();

      expect(lastOscillator).toBeDefined();
      expect(lastOscillator!.frequency.setValueAtTime).toHaveBeenCalledWith(180, expect.any(Number));
      expect(lastOscillator!.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(120, expect.any(Number));
      expect(navigator.vibrate).toHaveBeenCalledWith([80, 60, 80]);
    },
  );

  it('renders no active feedback when result is null', () => {
    const fixture = TestBed.createComponent(ScanFeedback);
    fixture.componentRef.setInput('result', null);
    fixture.detectChanges();

    expect(lastOscillator).toBeUndefined();
    expect(navigator.vibrate).not.toHaveBeenCalled();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.scan-feedback--success')).toBeNull();
    expect(host.querySelector('.scan-feedback--error')).toBeNull();
  });

  it('does not throw when AudioContext is entirely absent', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);

    const fixture = TestBed.createComponent(ScanFeedback);
    expect(() => {
      fixture.componentRef.setInput('result', 'success');
      fixture.detectChanges();
    }).not.toThrow();

    // Visual countdown still runs even without sound.
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });

  it("drives the countdown ring's transition-duration from the pauseMs input", () => {
    const fixture = TestBed.createComponent(ScanFeedback);
    fixture.componentRef.setInput('pauseMs', 5000);
    fixture.componentRef.setInput('result', 'success');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('.scan-feedback__ring');
    expect(svg.style.getPropertyValue('--pause-duration')).toBe('5000ms');

    fixture.componentRef.setInput('pauseMs', 1200);
    fixture.componentRef.setInput('result', null);
    fixture.componentRef.setInput('result', 'unknown');
    fixture.detectChanges();

    expect(svg.style.getPropertyValue('--pause-duration')).toBe('1200ms');
  });

  it('resets the countdown ring once pauseMs elapses', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ScanFeedback);
    fixture.componentRef.setInput('pauseMs', 3000);
    fixture.componentRef.setInput('result', 'success');
    fixture.detectChanges();

    vi.advanceTimersByTime(0);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.scan-feedback--success')).not.toBeNull();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(host.querySelector('.scan-feedback--success')).toBeNull();
    expect(host.querySelector('.scan-feedback--error')).toBeNull();
  });

  it('resets the countdown ring immediately when result goes back to null', () => {
    const fixture = TestBed.createComponent(ScanFeedback);
    fixture.componentRef.setInput('result', 'unknown');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.scan-feedback--error')).not.toBeNull();

    fixture.componentRef.setInput('result', null);
    fixture.detectChanges();

    expect(host.querySelector('.scan-feedback--error')).toBeNull();
  });
});
