import { ChangeDetectionStrategy, Component, OnDestroy, effect, input, signal, untracked } from '@angular/core';

/**
 * Cross-app dumb/leaf component giving audible/haptic/visual feedback for a scan result
 * (tone, vibration, countdown ring). No consumer wires this up in Round-16 — neither
 * seller-search's search view (`showScanButton` is NOT set there per spec.md) nor the
 * Schritt-2 placeholder. It exists standalone, component-testable in isolation; its first
 * real consumer is a later round (Round-17's Artikelnummer-Feld, or a later scan dialog).
 * Do not delete it as "dead code" — it is deliberately unwired this round.
 */
@Component({
  selector: 'app-scan-feedback',
  template: `
    <div
      class="scan-feedback"
      [class.scan-feedback--success]="variant() === 'success'"
      [class.scan-feedback--error]="variant() === 'error'"
    >
      <svg viewBox="0 0 40 40" class="scan-feedback__ring" [style.--pause-duration]="pauseMs() + 'ms'">
        <circle class="scan-feedback__ring-track" cx="20" cy="20" r="18" />
        <circle
          class="scan-feedback__ring-progress"
          cx="20"
          cy="20"
          r="18"
          [attr.stroke-dasharray]="circumference"
          [style.stroke-dashoffset.px]="countingDown() ? circumference : 0"
        />
      </svg>
    </div>
  `,
  styleUrl: './scan-feedback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanFeedback implements OnDestroy {
  readonly result = input<'success' | 'already-set' | 'unknown' | null>(null);
  /**
   * Plain code-constant default — this round does NOT read from application settings,
   * that wiring is deferred to Round-25 (out of scope here).
   */
  readonly pauseMs = input<number>(3000);

  /** Circle radius is fixed (r=18 in the 40x40 viewBox), so the circumference is a constant. */
  readonly circumference = 2 * Math.PI * 18;

  readonly variant = signal<'success' | 'error' | null>(null);
  readonly countingDown = signal(false);

  private timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  private restartHandle: ReturnType<typeof setTimeout> | undefined;

  /**
   * `effect()` rather than `computed()` — this component has real side effects (tone,
   * vibration), same reasoning as barcode-scanner's use of `effect()` over `computed()`.
   * Reacts to `result` transitioning from `null`/a previous value to a non-null value.
   * `pauseMs` is read `untracked` so that changing it mid-countdown doesn't retrigger this
   * effect — it only takes effect on the next scan result.
   */
  constructor() {
    effect(() => {
      const result = this.result();
      if (result === null) {
        this.reset();
        return;
      }

      const isSuccess = result === 'success';
      this.variant.set(isSuccess ? 'success' : 'error');
      this.playTone(isSuccess);
      this.vibrate(isSuccess);
      this.startCountdown(untracked(this.pauseMs));
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutHandle);
    clearTimeout(this.restartHandle);
  }

  /**
   * Success: ping 880→1320 Hz. Error (`'already-set'` or `'unknown'`): zonk 180→120 Hz.
   * Feature-detects `AudioContext`/`webkitAudioContext` and no-ops the sound (visual
   * countdown still runs) when Web Audio is unavailable, e.g. some test environments.
   */
  private playTone(isSuccess: boolean): void {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    const [startHz, endHz] = isSuccess ? [880, 1320] : [180, 120];
    const now = context.currentTime;
    const rampDuration = 0.15;
    oscillator.frequency.setValueAtTime(startHz, now);
    oscillator.frequency.linearRampToValueAtTime(endHz, now + rampDuration);

    oscillator.start(now);
    oscillator.stop(now + rampDuration);
    oscillator.onended = () => context.close();
  }

  /**
   * No exact pattern mandated by the spec — a single short buzz for success (`[100]`),
   * a slightly longer double-buzz for error (`[80, 60, 80]`) so the two are
   * distinguishable by feel alone, without looking at the screen.
   */
  private vibrate(isSuccess: boolean): void {
    navigator.vibrate?.(isSuccess ? [100] : [80, 60, 80]);
  }

  /**
   * Starts (or restarts) the visual countdown ring over `pauseMs`. The ring resets to its
   * base/full-circle state and is re-triggered a tick later so the CSS transition restarts
   * even when the same variant fires twice in a row. Auto-resets to the base state once
   * `pauseMs` elapses, on top of the explicit reset when `result` becomes `null` again —
   * whichever happens first (a parent clearing `result` before the pause ends, or the pause
   * simply running out).
   */
  private startCountdown(pauseMs: number): void {
    clearTimeout(this.timeoutHandle);
    clearTimeout(this.restartHandle);

    this.countingDown.set(false);
    this.restartHandle = setTimeout(() => this.countingDown.set(true), 0);
    this.timeoutHandle = setTimeout(() => this.reset(), pauseMs);
  }

  private reset(): void {
    clearTimeout(this.timeoutHandle);
    clearTimeout(this.restartHandle);
    this.timeoutHandle = undefined;
    this.restartHandle = undefined;
    this.countingDown.set(false);
    this.variant.set(null);
  }
}
