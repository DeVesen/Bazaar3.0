import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playResultCue } from './result-cue';

interface FakeOscillator {
  frequency: { setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}

const oscillators: FakeOscillator[] = [];
const closeContext = vi.fn();
const resumeContext = vi.fn();
let contextState: AudioContextState = 'running';

/** jsdom has no audio pipeline — stubbing the constructor is the only way to assert the tone pattern. */
function createAudioContextMock() {
  return vi.fn().mockImplementation(function (this: object) {
    Object.assign(this, {
      currentTime: 0,
      destination: {},
      state: contextState,
      resume: resumeContext,
      close: closeContext,
      createGain: vi.fn(() => ({ connect: vi.fn() })),
      createOscillator: vi.fn(() => {
        const oscillator: FakeOscillator = {
          frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          onended: null,
        };
        oscillators.push(oscillator);
        return oscillator;
      }),
    });
  });
}

function stubVibrate(value: unknown) {
  Object.defineProperty(navigator, 'vibrate', { value, writable: true, configurable: true });
}

describe('playResultCue', () => {
  beforeEach(() => {
    oscillators.length = 0;
    closeContext.mockClear();
    resumeContext.mockReset();
    resumeContext.mockResolvedValue(undefined);
    contextState = 'running';
    vi.stubGlobal('AudioContext', createAudioContextMock());
    stubVibrate(vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['success', 'cart', 'paid'] as const)('playResultCue_%sKind_PlaysPingAndVibratesOnce', (kind) => {
    // Arrange
    const expectedVibration = [100];

    // Act
    playResultCue(kind);

    // Assert
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(880, 0);
    expect(oscillators[0].frequency.linearRampToValueAtTime).toHaveBeenCalledWith(1320, 0.15);
    expect(navigator.vibrate).toHaveBeenCalledWith(expectedVibration);
  });

  it('playResultCue_FailedKind_PlaysZonkAndVibratesInPattern', () => {
    // Arrange
    const expectedVibration = [80, 60, 80];

    // Act
    playResultCue('failed');

    // Assert
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(180, 0);
    expect(oscillators[0].frequency.linearRampToValueAtTime).toHaveBeenCalledWith(120, 0.15);
    expect(navigator.vibrate).toHaveBeenCalledWith(expectedVibration);
  });

  it('playResultCue_AlreadyKind_PlaysTwoTonesOf80msAt1000HzWith60msPause', () => {
    // Arrange
    const expectedFirstStart = 0;
    const expectedSecondStart = 0.14;

    // Act
    playResultCue('already');

    // Assert
    expect(oscillators).toHaveLength(2);
    expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1000, expectedFirstStart);
    expect(oscillators[0].stop.mock.calls[0][0]).toBeCloseTo(0.08);
    expect(oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(1000, expectedSecondStart);
    expect(oscillators[1].stop.mock.calls[0][0]).toBeCloseTo(0.22);
  });

  it('playResultCue_AlreadyKind_VibratesTwiceFor60ms', () => {
    // Arrange
    const expectedVibration = [60, 60, 60];

    // Act
    playResultCue('already');

    // Assert
    expect(navigator.vibrate).toHaveBeenCalledWith(expectedVibration);
  });

  it('playResultCue_NoAudioContextAvailable_StillVibratesWithoutThrowing', () => {
    // Arrange
    vi.stubGlobal('AudioContext', undefined);

    // Act & Assert
    expect(() => playResultCue('success')).not.toThrow();
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });

  it('playResultCue_NoVibrationSupport_StillPlaysToneWithoutThrowing', () => {
    // Arrange
    stubVibrate(undefined);

    // Act & Assert
    expect(() => playResultCue('failed')).not.toThrow();
    expect(oscillators).toHaveLength(1);
  });

  it('playResultCue_AudioContextConstructorThrows_StillVibratesWithoutThrowing', () => {
    // Arrange
    vi.stubGlobal(
      'AudioContext',
      vi.fn().mockImplementation(() => {
        throw new Error('AudioContext limit reached');
      }),
    );

    // Act & Assert
    expect(() => playResultCue('success')).not.toThrow();
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });

  it('playResultCue_ContextSuspended_ResumesContext', () => {
    // Arrange
    contextState = 'suspended';

    // Act
    playResultCue('success');

    // Assert
    expect(resumeContext).toHaveBeenCalledTimes(1);
  });

  it('playResultCue_ContextRunning_DoesNotResumeContext', () => {
    // Arrange
    contextState = 'running';

    // Act
    playResultCue('success');

    // Assert
    expect(resumeContext).not.toHaveBeenCalled();
  });

  it('playResultCue_ResumeRejects_StillVibratesWithoutThrowing', async () => {
    // Arrange
    contextState = 'suspended';
    resumeContext.mockRejectedValue(new Error('autoplay blocked'));

    // Act & Assert
    expect(() => playResultCue('success')).not.toThrow();
    await Promise.resolve();
    expect(navigator.vibrate).toHaveBeenCalledWith([100]);
  });

  it('cancel_RunningCue_ClosesAudioContextAndStopsVibration', () => {
    // Arrange
    const cue = playResultCue('success');

    // Act
    cue.cancel();

    // Assert
    expect(closeContext).toHaveBeenCalledTimes(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });

  it('playResultCue_LastToneEnded_ClosesAudioContext', () => {
    // Arrange
    playResultCue('already');

    // Act
    oscillators[1].onended?.();

    // Assert
    expect(closeContext).toHaveBeenCalledTimes(1);
  });
});
