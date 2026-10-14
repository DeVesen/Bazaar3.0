import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESULT_OVERLAY_DURATION_MS, ResultOverlay } from './result-overlay';
import { ResultEvent, ResultKind, createResultEvent } from './result-event';

const closeContext = vi.fn();

function createAudioContextMock() {
  return vi.fn().mockImplementation(function (this: object) {
    Object.assign(this, {
      currentTime: 0,
      destination: {},
      close: closeContext,
      createGain: vi.fn(() => ({ connect: vi.fn() })),
      createOscillator: vi.fn(() => ({
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      })),
    });
  });
}

function createOverlay(event: ResultEvent | null) {
  const fixture = TestBed.createComponent(ResultOverlay);
  fixture.componentRef.setInput('event', event);
  fixture.detectChanges();
  return fixture;
}

function iconOf(fixture: ReturnType<typeof createOverlay>): HTMLElement | null {
  return (fixture.nativeElement as HTMLElement).querySelector('.result-overlay__icon');
}

function announcementOf(fixture: ReturnType<typeof createOverlay>): string {
  const element = (fixture.nativeElement as HTMLElement).querySelector('.result-overlay__announcement');
  return element?.textContent?.trim() ?? '';
}

describe('ResultOverlay', () => {
  beforeEach(async () => {
    closeContext.mockClear();
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', createAudioContextMock());
    Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), writable: true, configurable: true });
    await TestBed.configureTestingModule({ imports: [ResultOverlay] }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('event_Null_ShowsNothing', () => {
    // Arrange & Act
    const fixture = createOverlay(null);

    // Assert
    expect(iconOf(fixture)).toBeNull();
    expect(announcementOf(fixture)).toBe('');
  });

  it.each([
    ['failed', 'pi-times', 'Fehlgeschlagen'],
    ['success', 'pi-check', 'Erfolgreich'],
    ['already', 'pi-check', 'Bereits erledigt'],
    ['cart', 'pi-shopping-cart', 'Im Warenkorb'],
    ['paid', 'pi-dollar', 'Bezahlt'],
  ] as [ResultKind, string, string][])('event_%sKind_ShowsMatchingIconAndAnnouncement', (kind, iconClass, text) => {
    // Arrange & Act
    const fixture = createOverlay(createResultEvent(kind));

    // Assert
    const icon = iconOf(fixture);
    expect(icon?.classList.contains(iconClass)).toBe(true);
    expect(icon?.classList.contains(`result-overlay__icon--${kind}`)).toBe(true);
    expect(announcementOf(fixture)).toBe(text);
  });

  it('event_Shown_AnnouncesAsPoliteStatusWithoutTakingFocus', () => {
    // Arrange & Act
    const fixture = createOverlay(createResultEvent('failed'));

    // Assert
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
    expect(host.querySelector('[tabindex]')).toBeNull();
  });

  it('event_Shown_UsesFixedAnimationDurationOf1500ms', () => {
    // Arrange & Act
    const fixture = createOverlay(createResultEvent('success'));

    // Assert
    expect(RESULT_OVERLAY_DURATION_MS).toBe(1500);
    expect(iconOf(fixture)?.style.animationDuration).toBe('1500ms');
  });

  it('event_Shown_IsStillVisibleAt1499msAndGoneAt1500ms', () => {
    // Arrange
    const fixture = createOverlay(createResultEvent('success'));

    // Act
    vi.advanceTimersByTime(1499);
    fixture.detectChanges();
    const visibleBeforeEnd = iconOf(fixture) !== null;
    vi.advanceTimersByTime(1);
    fixture.detectChanges();

    // Assert
    expect(visibleBeforeEnd).toBe(true);
    expect(iconOf(fixture)).toBeNull();
    expect(announcementOf(fixture)).toBe('');
  });

  it('event_NewEventAfter700ms_ReplacesRunningOneAndRestartsFromZero', () => {
    // Arrange
    const fixture = createOverlay(createResultEvent('failed'));
    vi.advanceTimersByTime(700);

    // Act
    fixture.componentRef.setInput('event', createResultEvent('success'));
    fixture.detectChanges();

    // Assert
    expect(iconOf(fixture)?.classList.contains('pi-check')).toBe(true);
    vi.advanceTimersByTime(1499);
    fixture.detectChanges();
    expect(iconOf(fixture)).not.toBeNull();
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(iconOf(fixture)).toBeNull();
  });

  it('event_NewEventAfter700ms_CancelsRunningToneAndVibration', () => {
    // Arrange
    const fixture = createOverlay(createResultEvent('failed'));
    vi.advanceTimersByTime(700);

    // Act
    fixture.componentRef.setInput('event', createResultEvent('success'));
    fixture.detectChanges();

    // Assert
    expect(closeContext).toHaveBeenCalledTimes(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });

  it('event_SameKindTwice_RendersANewIconElement', () => {
    // Arrange
    const fixture = createOverlay(createResultEvent('failed'));
    const firstIcon = iconOf(fixture);

    // Act
    fixture.componentRef.setInput('event', createResultEvent('failed'));
    fixture.detectChanges();

    // Assert
    expect(iconOf(fixture)).not.toBe(firstIcon);
  });

  it('event_ReducedMotionPreferred_RunsWithSameTimeline', () => {
    // Arrange
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const fixture = createOverlay(createResultEvent('already'));

    // Act
    vi.advanceTimersByTime(1499);
    fixture.detectChanges();
    const visibleBeforeEnd = iconOf(fixture) !== null;
    vi.advanceTimersByTime(1);
    fixture.detectChanges();

    // Assert
    expect(visibleBeforeEnd).toBe(true);
    expect(iconOf(fixture)).toBeNull();
  });

  it('event_NoAudioAndNoVibration_StillShowsIconWithoutError', () => {
    // Arrange
    vi.stubGlobal('AudioContext', undefined);
    Object.defineProperty(navigator, 'vibrate', { value: undefined, writable: true, configurable: true });

    // Act
    const fixture = createOverlay(createResultEvent('failed'));

    // Assert
    expect(iconOf(fixture)).not.toBeNull();
  });

  it('host_Shown_DoesNotInterceptPointerEvents', () => {
    // Arrange
    const fixture = createOverlay(createResultEvent('failed'));

    // Act
    const pointerEvents = getComputedStyle(fixture.nativeElement as HTMLElement).pointerEvents;

    // Assert
    expect(pointerEvents).toBe('none');
  });
});
