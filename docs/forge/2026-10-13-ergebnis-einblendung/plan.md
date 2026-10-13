# Ergebnis-Einblendung — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation <plan.md>`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Haupt-App blendet nach jeder Artikelnummer-Eingabe auf der Verkauf-Seite und in den Dialogen „Artikel freigeben" / „Artikel zurückgeben" ein großes Ergebnis-Icon (roter X, grüner Haken, gelber Haken, grüner Einkaufswagen) mit Ton und Vibration ein.
**Architektur:** Ein neuer, logikfreier Baustein `app-result-overlay` (`shared/components/result-overlay/`) nimmt ein `ResultEvent` entgegen, blendet das Icon 1,5 s per CSS-Animation ein/aus und spielt Ton/Vibration über `playResultCue`; Verkauf-Seite und `ScanDialog` bestimmen das Ergebnis und setzen ein frisches `ResultEvent` (`createResultEvent`). `ScanDialog` unterscheidet künftig „bereits freigegeben/zurückgegeben" (gelb) von „unbekannt/falsch" (rot) allein anhand des schon geladenen `status` aus `GET /api/articles/by-number/{number}`; Backend und API bleiben unverändert.
**Tech-Stack:** Angular 22 (standalone, Signals, OnPush), PrimeIcons, Web Audio API, `navigator.vibrate`, Vitest über `ng test`.
**Spec:** docs/forge/2026-10-13-ergebnis-einblendung/spec.md
**Basis:** 0e3015b6

## Global Constraints
- Ergebnisse: roter X (fehlgeschlagen), grüner Haken (erfolgreich), gelber Haken (Zustand bereits erreicht), grüner Einkaufswagen (in den Warenkorb übernommen).
- Zeiten fest: 500 ms einblenden, 500 ms voll sichtbar, 500 ms ausblenden, insgesamt 1,5 s, unabhängig von der Scanner-Pause der App-Einstellungen.
- Ton und Vibration nicht abschaltbar, keine Einstellung dafür; Vibration nur auf Geräten, die sie unterstützen; fehlender Ton/fehlende Vibration erzeugt keine Fehlermeldung.
- Grüner Haken und grüner Einkaufswagen: Ping 880 → 1320 Hz, Vibration 1 × 100 ms. Roter X: Zonk 180 → 120 Hz, Vibration 80/60/80 ms. Gelber Haken: zwei Töne à 80 ms mit 1000 Hz bei 60 ms Pause, Vibration 2 × 60 ms.
- Neue Einblendung bricht die laufende samt Ton und Vibration sofort ab; die neue startet bei 0 ms.
- Die Einblendung zeigt nur das Icon, zentriert, ohne Hochskalieren und ohne getönten Schleier; der Inhalt dahinter bleibt sichtbar; sie blockiert keine Eingabe (Tippen, Scannen, Klicken).
- Screenreader-Texte: „Fehlgeschlagen" (roter X), „Erfolgreich" (grüner Haken), „Bereits erledigt" (gelber Haken), „Im Warenkorb" (grüner Einkaufswagen), ohne den Eingabefokus zu verlieren. „Bewegung reduzieren" ändert nichts.
- Die Dialoge „Artikel freigeben" und „Artikel zurückgeben" unterscheiden „bereits freigegeben bzw. zurückgegeben" (gelber Haken) von „unbekannt/falsch" (roter X), allein anhand des bereits geladenen Artikel-`status` aus `GET /api/articles/by-number/{number}`; Backend und API bleiben unverändert.
- Infofläche der Verkauf-Seite und Text „Artikel nicht bekannt" im Dialog bleiben unverändert; im Kamera-Modus der Dialoge entfällt der Ring-Countdown; die Scan-Pause der App-Einstellungen (`pauseMs`) bleibt unverändert.
- Die Einblendung gilt nur für Verkauf-Seite, „Artikel freigeben" und „Artikel zurückgeben" der Haupt-App; `app-scan-feedback` bleibt für die Wareneingangs-Erfassung (`intake-article-entry`) unverändert bestehen.
- Projekt-`CLAUDE.md`: Code, Routen und JSON-Contract englisch, Doku deutsch; Commit-Messages Conventional Commits `type(scope): Beschreibung`, Text deutsch; Build/Test/Lint nur über `dv-angular-build|test|lint --root <R>/src/bazaar-app/frontend`.
- Projekt-`CLAUDE.md`: UI nur mit PrimeNG, für Fehlendes ein eigener Wrapper in `docs/components/<name>/component.md` (englischer Name) dokumentieren.
- dv-craft:craft-design-principles: keine Verschachtelung (Guard Clauses, Lookup-Tabellen statt `if`-Ketten); kleine Funktionen mit einer Aufgabe; `if`/`switch` nur in Integrations-Methoden, Branches delegieren; Leaf-Komponente rendert nur, Integration-Komponente orchestriert; kein `bool`-Flag, das Verhalten umschaltet.
- dv-craft:craft-unit-testing: Tests nach AAA mit `// Arrange` / `// Act` / `// Assert`; Naming `<Methode>_<Situation>_<Erwartung>`; Act genau eine Zeile; ein Test, eine Behauptung; Verhalten über die öffentliche API testen; Tests unabhängig.
- dv-angular:angular + angular-testing-vitest-conventions: standalone Komponenten mit `ChangeDetectionStrategy.OnPush`, `input()`/`signal()`/`computed()`, `inject()`; Specs mit Vitest (`vi.fn`, `vi.stubGlobal`), neue Specs neben der Quelle; bestehende `it`-Namen unverändert lassen.
- primeng:primeng-component-implementation: kein neues PrimeNG-Widget nötig — es werden nur `pi pi-*`-Icon-Klassen aus PrimeIcons verwendet (`pi-times`, `pi-check`, `pi-shopping-cart`, in `node_modules/primeicons` vorhanden).
- dv-dotnet:dotnet: nicht betroffen (keine Backend-Datei im Plan).

---

### Task 1: Ergebnis-Typen und Ton-/Vibrations-Muster

**ACs:** AC-24, AC-25, AC-26, AC-27

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.spec.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `result-event.ts`: `type ResultKind = 'failed' | 'success' | 'already' | 'cart'`; `interface ResultEvent { readonly kind: ResultKind; readonly id: number }`; `function createResultEvent(kind: ResultKind): ResultEvent` (jeder Aufruf liefert ein neues Objekt mit streng steigender `id`).
  - `result-cue.ts`: `interface ResultCue { cancel(): void }`; `function playResultCue(kind: ResultKind): ResultCue` (spielt Ton und Vibration sofort; `cancel()` schließt den Audio-Kontext und ruft `navigator.vibrate(0)`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.spec.ts`:
  ```ts
  import { describe, expect, it } from 'vitest';
  import { createResultEvent } from './result-event';

  describe('createResultEvent', () => {
    it('createResultEvent_GivenKind_ReturnsEventWithThatKind', () => {
      // Arrange
      const kind = 'cart';

      // Act
      const event = createResultEvent(kind);

      // Assert
      expect(event.kind).toBe('cart');
    });

    it('createResultEvent_CalledTwiceWithSameKind_ReturnsDistinctEventsWithIncreasingId', () => {
      // Arrange
      const first = createResultEvent('failed');

      // Act
      const second = createResultEvent('failed');

      // Assert
      expect(second).not.toBe(first);
      expect(second.id).toBeGreaterThan(first.id);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.spec.ts`:
  ```ts
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

  /** jsdom has no audio pipeline — stubbing the constructor is the only way to assert the tone pattern. */
  function createAudioContextMock() {
    return vi.fn().mockImplementation(function (this: object) {
      Object.assign(this, {
        currentTime: 0,
        destination: {},
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
      vi.stubGlobal('AudioContext', createAudioContextMock());
      stubVibrate(vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it.each(['success', 'cart'] as const)('playResultCue_%sKind_PlaysPingAndVibratesOnce', (kind) => {
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
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/result-overlay/result-event.spec.ts --include src/app/shared/components/result-overlay/result-cue.spec.ts` — erwartet: FAIL (Module `./result-event` und `./result-cue` existieren nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.ts`:
  ```ts
  /** The four outcomes the Ergebnis-Einblendung can show (docs/components/result-overlay/component.md). */
  export type ResultKind = 'failed' | 'success' | 'already' | 'cart';

  /**
   * One request to show a result. `id` makes every event distinct, so the same `kind` twice in a row
   * still restarts the overlay (a parent always sets a fresh object, never re-sets the old one).
   */
  export interface ResultEvent {
    readonly kind: ResultKind;
    readonly id: number;
  }

  let lastEventId = 0;

  export function createResultEvent(kind: ResultKind): ResultEvent {
    lastEventId += 1;
    return { kind, id: lastEventId };
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.ts`:
  ```ts
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
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/result-overlay/result-event.spec.ts --include src/app/shared/components/result-overlay/result-cue.spec.ts` — erwartet: PASS (alle 12 Tests: 2 in `result-event.spec.ts`, 10 in `result-cue.spec.ts` einschließlich der beiden `it.each`-Fälle)
- [ ] **Schritt 5: Lint und Commit**
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK. Dann `git add src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.ts src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-event.spec.ts src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.ts src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-cue.spec.ts` · `git commit -m "feat(result-overlay): Ergebnis-Typen sowie Ton- und Vibrationsmuster ergänzt"`

---

### Task 2: Komponente `app-result-overlay`

**ACs:** AC-16, AC-17, AC-18, AC-19, AC-27, AC-28, AC-29

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.spec.ts`
- Create: `docs/components/result-overlay/component.md`
- Modify: `docs/components/overview.md:65` · `**Scan-Dialog**` (neue Tabellenzeile direkt darunter)

**Interfaces:**
- Consumes: aus Task 1 `ResultEvent`, `ResultKind` (`./result-event`); `playResultCue(kind: ResultKind): ResultCue`, `ResultCue` (`./result-cue`).
- Produces: `class ResultOverlay` mit Selector `app-result-overlay`, Input `event: InputSignal<ResultEvent | null>` (Default `null`); Konstante `RESULT_OVERLAY_DURATION_MS = 1500` (exportiert). Der Host ist `position: absolute; inset: 0` und füllt den nächsten positionierten Vorfahren (der Konsument setzt `position: relative`); er hat `pointer-events: none`. DOM: `.result-overlay__icon` (Klassen `pi <icon>` und `result-overlay__icon--<kind>`) und `.result-overlay__announcement` (Screenreader-Text) existieren nur, solange eine Einblendung läuft.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.spec.ts`:
  ```ts
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
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/result-overlay/result-overlay.spec.ts` — erwartet: FAIL (Modul `./result-overlay` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.ts`:
  ```ts
  import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
  import { ResultCue, playResultCue } from './result-cue';
  import { ResultEvent, ResultKind } from './result-event';

  /** 500 ms fade in + 500 ms fully visible + 500 ms fade out (docs/components/result-overlay/component.md). */
  export const RESULT_OVERLAY_DURATION_MS = 1500;

  const ICON_CLASS_BY_KIND: Record<ResultKind, string> = {
    failed: 'pi pi-times',
    success: 'pi pi-check',
    already: 'pi pi-check',
    cart: 'pi pi-shopping-cart',
  };

  const ANNOUNCEMENT_BY_KIND: Record<ResultKind, string> = {
    failed: 'Fehlgeschlagen',
    success: 'Erfolgreich',
    already: 'Bereits erledigt',
    cart: 'Im Warenkorb',
  };

  /**
   * Dumb/leaf component showing a large result icon over its positioned parent, with tone and vibration
   * (docs/components/result-overlay/component.md). It decides nothing: the parent passes a fresh
   * `ResultEvent` (see `createResultEvent`) per result. A new event aborts the running one including its
   * tone and vibration; the overlay never blocks input (`pointer-events: none`). "Bewegung reduzieren"
   * deliberately changes nothing — there is no `prefers-reduced-motion` handling here.
   */
  @Component({
    selector: 'app-result-overlay',
    template: `
      @for (shown of shownList(); track shown.id) {
        <i
          class="result-overlay__icon result-overlay__icon--{{ shown.kind }} {{ iconClassOf(shown.kind) }}"
          aria-hidden="true"
          [style.animation-duration]="durationCss"
        ></i>
        <span class="result-overlay__announcement">{{ announcementOf(shown.kind) }}</span>
      }
    `,
    styleUrl: './result-overlay.scss',
    host: { role: 'status', 'aria-live': 'polite' },
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class ResultOverlay {
    readonly event = input<ResultEvent | null>(null);

    protected readonly durationCss = `${RESULT_OVERLAY_DURATION_MS}ms`;
    private readonly shown = signal<ResultEvent | null>(null);
    protected readonly shownList = computed<ResultEvent[]>(() => {
      const current = this.shown();
      return current ? [current] : [];
    });

    private cue: ResultCue | undefined;
    private hideHandle: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      effect(() => {
        const event = this.event();
        untracked(() => (event ? this.start(event) : this.stop()));
      });
      inject(DestroyRef).onDestroy(() => this.stop());
    }

    protected iconClassOf(kind: ResultKind): string {
      return ICON_CLASS_BY_KIND[kind];
    }

    protected announcementOf(kind: ResultKind): string {
      return ANNOUNCEMENT_BY_KIND[kind];
    }

    private start(event: ResultEvent): void {
      this.stop();
      this.shown.set(event);
      // Timer first: whatever happens in the cue, the icon is always removed after 1500 ms.
      this.hideHandle = setTimeout(() => this.stop(), RESULT_OVERLAY_DURATION_MS);
      this.cue = playResultCue(event.kind);
    }

    private stop(): void {
      clearTimeout(this.hideHandle);
      this.hideHandle = undefined;
      this.cue?.cancel();
      this.cue = undefined;
      this.shown.set(null);
    }
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.scss`:
  ```scss
  // Fills the nearest positioned ancestor (the consumer sets `position: relative`), centers the icon and
  // lets every pointer event through to the content below — no veil, no tint, no input blocking.
  :host {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  // 0–500 ms fade in, 500–1000 ms fully visible, 1000–1500 ms fade out (1/3 steps of the 1500 ms run).
  @keyframes result-overlay-fade {
    0% {
      opacity: 0;
    }
    33.333% {
      opacity: 1;
    }
    66.667% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .result-overlay__icon {
    font-size: 7rem;
    line-height: 1;
    opacity: 0;
    animation-name: result-overlay-fade;
    animation-timing-function: linear;
    animation-fill-mode: forwards;

    &--failed {
      color: var(--p-red-500, #ef4444);
    }

    &--success,
    &--cart {
      color: var(--p-green-500, #22c55e);
    }

    &--already {
      color: var(--p-yellow-500, #eab308);
    }
  }

  // Visually hidden, but read by screen readers through the host's `role="status"`.
  .result-overlay__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ```
  `docs/components/result-overlay/component.md`:
  ````markdown
  ---
  status: draft
  updated: 2026-10-13
  ---

  # Component: Result-Overlay (Ergebnis-Einblendung)

  ## Index
  - Kontext — Einsatzorte
  - Aussehen — Ergebnisse, Ablauf
  - Schnittstelle — Inputs
  - Verhalten — Ton, Vibration, Abbruch, Barrierefreiheit
  - Technik — Wrapper-Begründung
  - Akzeptanzkriterien — EARS-Kriterien

  **Verwendung:** Haupt-App — Verkauf-Seite sowie die Dialoge „Artikel freigeben" und „Artikel zurückgeben" (`scan-dialog`).

  Eigenständiger, wiederverwendbarer Baustein ohne eigene Fachlogik: Verkauf-Seite und Dialoge bestimmen, welches
  Ergebnis gemeldet wird. Nicht zu verwechseln mit dem Scan-Feedback (`app-scan-feedback`, Ring-Countdown der
  Wareneingangs-Erfassung).

  PrimeNG liefert keine solche Komponente — daher eigener Wrapper (Grundregel → [overview.md](../overview.md)).

  ---

  ## Aussehen

  Nur das Icon, zentriert über der Fläche des nächsten positionierten Vorfahren, ohne Hochskalieren und ohne
  getönten Schleier; der Inhalt dahinter bleibt sichtbar.

  | Ergebnis (`kind`) | Icon | Farbe | Ton | Vibration |
  |---|---|---|---|---|
  | `failed` | `pi-times` | Rot | Zonk 180 → 120 Hz | 80/60/80 ms |
  | `success` | `pi-check` | Grün | Ping 880 → 1320 Hz | 1 × 100 ms |
  | `already` | `pi-check` | Gelb | 2 Töne à 80 ms, 1000 Hz, 60 ms Pause | 2 × 60 ms (60 ms Pause) |
  | `cart` | `pi-shopping-cart` | Grün | Ping 880 → 1320 Hz | 1 × 100 ms |

  Ablauf fest 1,5 s: 0–500 ms einblenden, 500–1000 ms voll sichtbar, 1000–1500 ms ausblenden.

  ## Schnittstelle

  | Name | Typ | Art | Beschreibung |
  |---|---|---|---|
  | `event` | `ResultEvent \| null` | `input()` | Jede Einblendung ist ein frisches Objekt aus `createResultEvent(kind)`; `null` blendet nichts ein |

  Der Konsument setzt `position: relative` auf die Fläche und platziert `<app-result-overlay [event]="…" />` darin.

  ## Verhalten

  - Ton und Vibration laufen mit jeder Einblendung und sind nicht abschaltbar; fehlende Web-Audio- oder Vibrations-Unterstützung wird still übergangen.
  - Eine neue Einblendung bricht die laufende samt Ton und Vibration sofort ab und startet von vorn.
  - Die Einblendung blockiert keine Eingabe (`pointer-events: none`), nimmt keinen Fokus.
  - Screenreader: Textmeldung (`role="status"`) „Fehlgeschlagen", „Erfolgreich", „Bereits erledigt" bzw. „Im Warenkorb".
  - „Bewegung reduzieren" ändert nichts.

  ## Akzeptanzkriterien

  Siehe `docs/forge/2026-10-13-ergebnis-einblendung/spec.md` (AC-16 bis AC-19, AC-24 bis AC-29).
  ````
  `docs/components/overview.md` — direkt unter der Tabellenzeile mit `**Scan-Dialog**` einfügen:
  ```markdown
  | **Result-Overlay** | Ergebnis-Einblendung: großes Icon (roter X, grüner/gelber Haken, grüner Einkaufswagen) mit Ton und Vibration über Verkauf-Seite bzw. Scan-Dialog | [result-overlay/](result-overlay/component.md) |
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/result-overlay/result-overlay.spec.ts` — erwartet: PASS (alle Tests von `ResultOverlay`)
- [ ] **Schritt 5: Lint und Commit**
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK. Dann `git add src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.ts src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.scss src/bazaar-app/frontend/src/app/shared/components/result-overlay/result-overlay.spec.ts docs/components/result-overlay/component.md docs/components/overview.md` · `git commit -m "feat(result-overlay): Komponente Ergebnis-Einblendung mit Doku ergänzt"`

---

### Task 3: Ergebnis-Einblendung in den Dialogen „Artikel freigeben" / „Artikel zurückgeben"

**ACs:** AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-19, AC-21, AC-22, AC-23

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.ts` · `ScanDialog` (Imports, `pauseMs`-Kommentar, `scanFeedbackResult`, `onSubmit`, `onListboxSelect`, `onScanDetected`, `checkArticleNumber`, `handleArticleFound`, `handleLookupError`, `emitResult`)
- Modify: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.html` · `styleClass="scan-dialog dialog-responsive"` (Wurzelelement `p-dialog`; das ganze Template wird ersetzt)
- Modify: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.scss` · `.scan-dialog`
- Modify: `docs/components/scan-dialog/component.md` · `### Scan-Feedback-Overlay`, AC-3, AC-4
- Test: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts` · `Feedback colors per result (camera mode)`

**Interfaces:**
- Consumes: aus Task 1 `createResultEvent(kind: ResultKind): ResultEvent`, `ResultEvent`, `ResultKind` (`../result-overlay/result-event`); aus Task 2 `ResultOverlay` (`../result-overlay/result-overlay`, Selector `app-result-overlay`, Input `event`).
- Produces: `ScanDialog.resultEvent: WritableSignal<ResultEvent | null>` (ersetzt `scanFeedbackResult`); `ScanCompleteEvent`, `ScanDialogTargetField`, alle Inputs/Outputs unverändert (insbesondere `pauseMs`, `writeMode`, `scanComplete`, `sessionArticleIds`, `articleConfirmed`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `scan-dialog.spec.ts`:
  1. Import ergänzen (`By` aus `@angular/platform-browser` ist bereits importiert), direkt unter dem Import von `BarcodeScanner`:
     ```ts
     import { Numpad } from '../numpad/numpad';
     ```
  2. Im bestehenden `describe('Feedback colors per result (camera mode)')` in den vier Tests `shows success for a matching…`, `shows unknown for a number that does not belong…`, `shows unknown for a number that does not exist…`, `shows already-set for an article already captured…` die Assertion ersetzen: `expect(fixture.componentInstance.scanFeedbackResult()).toBe('success')` → `expect(fixture.componentInstance.resultEvent()?.kind).toBe('success')`; beide Vorkommen von `…scanFeedbackResult()).toBe('unknown')` → `expect(fixture.componentInstance.resultEvent()?.kind).toBe('failed')`; `…scanFeedbackResult()).toBe('already-set')` → `expect(fixture.componentInstance.resultEvent()?.kind).toBe('already')`. Der Test `ignores a repeated codeDetected while scan-feedback is still showing (dauerscan lock)` bleibt unverändert (sichert AC-23 ab).
  3. Direkt vor `describe('writeMode', () => {` ein neues `describe` einfügen:
     ```ts
     describe('Ergebnis-Einblendung (all dialogs, all input paths)', () => {
       type Fixture = Awaited<ReturnType<typeof create>>;
       type Path = 'keyboard' | 'numpad' | 'listbox' | 'camera';
       const ALL_PATHS: Path[] = ['keyboard', 'numpad', 'listbox', 'camera'];

       function byNumber(status: string, sellerId = 'SEL1'): ByNumberFixture {
         return { id: 'A1', number: 101, name: 'Jacke', sellerId, status };
       }

       function pendingFor(status: string): PendingArticleFixture[] {
         return [{ id: 'A1', number: 101, name: 'Jacke', status }];
       }

       function releaseDialog(article: ByNumberFixture | HttpErrorResponse | undefined) {
         const byNumberMap = article === undefined ? {} : { 101: article };
         return create(httpClientMock({ pending: pendingFor('registered'), byNumber: byNumberMap }), { pauseMs: 0 });
       }

       function returnDialog(article: ByNumberFixture | HttpErrorResponse | undefined) {
         const byNumberMap = article === undefined ? {} : { 101: article };
         return create(httpClientMock({ pending: pendingFor('selling'), byNumber: byNumberMap }), {
           pauseMs: 0,
           targetField: 'returnedAt',
           writeMode: 'immediate',
         });
       }

       function confirmNumber(fixture: Fixture, number = '101') {
         typeInto(fixture, number);
         fixture.componentInstance.onSubmit();
         fixture.detectChanges();
       }

       function confirmVia(fixture: Fixture, path: Path) {
         const dialog = fixture.componentInstance;
         if (path === 'keyboard') {
           confirmNumber(fixture);
         } else if (path === 'numpad') {
           dialog.onAddonClick('numpad');
           fixture.detectChanges();
           typeInto(fixture, '101');
           fixture.debugElement.query(By.directive(Numpad)).componentInstance.submitted.emit();
         } else if (path === 'listbox') {
           dialog.onListboxSelect({ value: { id: 'A1', number: 101, name: 'Jacke', status: 'registered' } });
         } else {
           dialog.onAddonClick('camera');
           fixture.detectChanges();
           fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance.codeDetected.emit('101');
         }
         fixture.detectChanges();
       }

       function kindOf(fixture: Fixture) {
         return fixture.componentInstance.resultEvent()?.kind;
       }

       it('onSubmit_ReleaseDialogUnreleasedArticleOfSeller_ShowsSuccess', async () => {
         // Arrange
         const fixture = await releaseDialog(byNumber('registered'));
         vi.useFakeTimers();

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('success');
       });

       it.each(['selling', 'sold', 'returned'])(
         'onSubmit_ReleaseDialogArticleAlreadyReleasedAs%s_ShowsAlready',
         async (status) => {
           // Arrange
           const fixture = await releaseDialog(byNumber(status));
           vi.useFakeTimers();

           // Act
           confirmNumber(fixture);

           // Assert
           expect(kindOf(fixture)).toBe('already');
         },
       );

       it('onSubmit_ReleaseDialogArticleAlreadyCapturedInSession_ShowsAlready', async () => {
         // Arrange
         const fixture = await releaseDialog(byNumber('registered'));
         vi.useFakeTimers();
         confirmNumber(fixture);

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('already');
       });

       it.each([
         ['unknown number', undefined],
         ['article of another seller', byNumber('registered', 'OTHER')],
       ])('onSubmit_ReleaseDialog%s_ShowsFailed', async (_label, article) => {
         // Arrange
         const fixture = await releaseDialog(article);
         vi.useFakeTimers();

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('failed');
       });

       it('onSubmit_ReturnDialogReleasedUnsoldArticleOfSeller_ShowsSuccessAndConfirmsArticle', async () => {
         // Arrange
         const fixture = await returnDialog(byNumber('selling'));
         vi.useFakeTimers();
         const confirmed: string[] = [];
         fixture.componentInstance.articleConfirmed.subscribe((id) => confirmed.push(id));

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('success');
         expect(confirmed).toEqual(['A1']);
       });

       it('onSubmit_ReturnDialogArticleAlreadyReturned_ShowsAlready', async () => {
         // Arrange
         const fixture = await returnDialog(byNumber('returned'));
         vi.useFakeTimers();

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('already');
       });

       it.each([
         ['unknown number', undefined],
         ['article of another seller', byNumber('selling', 'OTHER')],
         ['article not yet released', byNumber('registered')],
         ['article already sold', byNumber('sold')],
       ])('onSubmit_ReturnDialog%s_ShowsFailed', async (_label, article) => {
         // Arrange
         const fixture = await returnDialog(article);
         vi.useFakeTimers();

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('failed');
       });

       it.each([
         ['release', releaseDialog],
         ['return', returnDialog],
       ])('onSubmit_%sDialogServerNotReachable_ShowsFailedWithoutScanComplete', async (_label, openDialog) => {
         // Arrange
         const fixture = await openDialog(new HttpErrorResponse({ status: 500 }));
         vi.useFakeTimers();
         const completed: ScanCompleteEvent[] = [];
         fixture.componentInstance.scanComplete.subscribe((event) => completed.push(event));

         // Act
         confirmNumber(fixture);

         // Assert
         expect(kindOf(fixture)).toBe('failed');
         expect(completed).toEqual([]);
       });

       it.each(ALL_PATHS)('confirm_ReleaseDialogVia%s_ShowsSuccess', async (path) => {
         // Arrange
         const fixture = await releaseDialog(byNumber('registered'));
         vi.useFakeTimers();

         // Act
         confirmVia(fixture, path);

         // Assert
         expect(kindOf(fixture)).toBe('success');
       });

       it.each(ALL_PATHS)('confirm_ReturnDialogVia%s_ShowsSuccess', async (path) => {
         // Arrange
         const fixture = await returnDialog(byNumber('selling'));
         vi.useFakeTimers();

         // Act
         confirmVia(fixture, path);

         // Assert
         expect(kindOf(fixture)).toBe('success');
       });

       it('onSubmit_UnknownNumberTypedInKeyboardMode_KeepsUnknownTextAndShowsFailed', async () => {
         // Arrange
         const fixture = await create(httpClientMock({ pending: pendingFor('registered'), byNumber: {} }), { pauseMs: 0 });
         vi.useFakeTimers();

         // Act
         confirmNumber(fixture, '555');

         // Assert
         const message = fixture.debugElement.query(By.css('.scan-dialog__message'))?.nativeElement as HTMLElement | undefined;
         expect(message?.textContent?.trim()).toBe('Artikel nicht bekannt');
         expect(kindOf(fixture)).toBe('failed');
       });

       it('onScanDetected_CameraMode_RendersOverlayInsteadOfRingCountdown', async () => {
         // Arrange
         const fixture = await releaseDialog(byNumber('registered'));
         vi.useFakeTimers();

         // Act
         confirmVia(fixture, 'camera');

         // Assert
         expect(fixture.debugElement.query(By.css('app-scan-feedback'))).toBeNull();
         expect(fixture.debugElement.query(By.css('app-result-overlay .result-overlay__icon'))).not.toBeNull();
       });

       it('template_DialogContent_HostsOverlayInsidePositionedContentWrapper', async () => {
         // Arrange & Act
         const fixture = await releaseDialog(undefined);

         // Assert
         expect(fixture.debugElement.query(By.css('.scan-dialog__content app-result-overlay'))).not.toBeNull();
       });

       it('typing_WhileOverlayIsShown_StillAcceptsInput', async () => {
         // Arrange
         const fixture = await releaseDialog(undefined);
         vi.useFakeTimers();
         confirmNumber(fixture);

         // Act
         typeInto(fixture, '77');

         // Assert
         expect(fixture.componentInstance.articleNumber()).toBe('77');
       });
     });
     ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts` — erwartet: FAIL (u. a. `onSubmit_ReleaseDialogUnreleasedArticleOfSeller_ShowsSuccess`: `resultEvent` existiert nicht; Typfehler bei `resultEvent`)
- [ ] **Schritt 3: Minimal implementieren**
  `scan-dialog.ts`:
  1. Import-Zeile `import { ScanFeedback } from '../scan-feedback/scan-feedback';` ersetzen durch:
     ```ts
     import { ResultEvent, ResultKind, createResultEvent } from '../result-overlay/result-event';
     import { ResultOverlay } from '../result-overlay/result-overlay';
     ```
  2. Im Klassen-Kommentar den Satz `composing \`app-input\` (Modi über \`field-mode.ts\`) + \`app-numpad\` + \`app-barcode-scanner\` + \`app-scan-feedback\` + \`p-listbox\`` zu `… + \`app-result-overlay\` + \`p-listbox\`` ändern. Im `@Component`: `imports: [DialogModule, ListboxModule, Input, Numpad, BarcodeScanner, ResultOverlay],`.
  3. Direkt nach dem `ArticleByNumberResult`-Interface und vor `pendingStatusFor` einfügen:
     ```ts
     /** Statuses that mean "this timestamp was already set" for a seller's own article — yellow, not red. */
     const ALREADY_DONE_STATUSES: Record<ScanDialogTargetField, readonly string[]> = {
       releasedAt: ['selling', 'sold', 'returned'],
       returnedAt: ['returned'],
     };

     const RESULT_KIND_BY_SCAN_RESULT: Record<ScanCompleteEvent['result'], ResultKind> = {
       success: 'success',
       'already-set': 'already',
       unknown: 'failed',
     };

     /**
      * Verdict for an existing article: another seller's article is always `'unknown'`; an own article either
      * still needs the timestamp (`'success'`), already has it (`'already-set'`) or cannot take it (`'unknown'`).
      */
     function verdictFor(
       article: ArticleByNumberResult,
       sellerId: string,
       targetField: ScanDialogTargetField,
     ): ScanCompleteEvent['result'] {
       if (article.sellerId !== sellerId) return 'unknown';
       if (article.status === pendingStatusFor(targetField)) return 'success';
       return ALREADY_DONE_STATUSES[targetField].includes(article.status) ? 'already-set' : 'unknown';
     }
     ```
  4. `pauseMs`-Kommentar ersetzen: `* breaking change to this input's public shape). Forwarded to \`app-scan-feedback\`'s own\n   * \`pauseMs\` in camera mode.` → `* breaking change to this input's public shape). Only drives the camera dauerscan lock (\`scanLocked\`).`
  5. Die Zeile `readonly scanFeedbackResult = signal<'success' | 'already-set' | 'unknown' | null>(null);` ersetzen durch:
     ```ts
     /** Latest result to show over the dialog content (`app-result-overlay`); always a fresh event per lookup result. */
     readonly resultEvent = signal<ResultEvent | null>(null);
     ```
  6. `onSubmit`: `this.checkArticleNumber(raw, false);` → `this.checkArticleNumber(raw);`. `onListboxSelect`: `this.checkArticleNumber(event.value.number, false);` → `this.checkArticleNumber(event.value.number);`. `onScanDetected`: `this.checkArticleNumber(value, true);` → `this.checkArticleNumber(value);`.
  7. `checkArticleNumber` komplett ersetzen:
     ```ts
     private checkArticleNumber(rawNumber: string | number): void {
       const number = typeof rawNumber === 'number' ? rawNumber : Number.parseInt(rawNumber.trim(), 10);
       if (!Number.isFinite(number)) return;

       this.http.get<ArticleByNumberResult>(`/api/articles/by-number/${number}`).subscribe({
         next: (article) => this.handleArticleFound(article),
         error: (error: unknown) => this.handleLookupError(error),
       });
     }
     ```
  8. `handleArticleFound` komplett ersetzen (den bisherigen Kommentarblock `Result-mapping #2` entfällt, `verdictFor` ersetzt ihn):
     ```ts
     private handleArticleFound(article: ArticleByNumberResult): void {
       const verdict = verdictFor(article, this.sellerId(), this.targetField());
       if (verdict !== 'success') {
         this.emitResult(article.id, verdict);
         return;
       }

       if (this.writeMode() === 'immediate') {
         // Round-20 immediate path: no session collection at all (plan's "statt intern zu
         // sammeln") — instead drop the match straight out of the already-loaded pending list so
         // the AutoComplete reflects it without a reload, and let the parent do the actual write.
         this.pendingArticles.update((articles) => articles.filter((a) => a.id !== article.id));
         this.articleNumber.set('');
         this.articleConfirmed.emit(article.id);
         this.emitResult(article.id, 'success');
         return;
       }

       if (this.sessionIds().has(article.id)) {
         // Already scanned/entered in THIS session — `'already-set'` is the closest fit (yellow).
         this.emitResult(article.id, 'already-set');
         return;
       }

       // Add to the session, emit the full snapshot, clear the field so the next entry starts
       // fresh (doc's "Feld leert sich").
       this.sessionIds.update((ids) => new Set(ids).add(article.id));
       this.sessionArticleIds.emit(Array.from(this.sessionIds()));
       this.articleNumber.set('');
       this.emitResult(article.id, 'success');
     }
     ```
  9. `handleLookupError` und `emitResult` ersetzen:
     ```ts
     private handleLookupError(error: unknown): void {
       if (error instanceof HttpErrorResponse && error.status === 404) {
         // Result-mapping #1: the number does not belong to ANY article — there is no real
         // `articleId` to report, so `''` is emitted instead of inventing one (see `ScanCompleteEvent`
         // doc comment above).
         this.emitResult('', 'unknown');
         return;
       }

       // Any other HTTP failure (network/5xx): do NOT mutate the session and do NOT emit
       // `scanComplete` — only the red overlay reports it, in every input mode.
       this.showResult('unknown');
     }

     private emitResult(articleId: string, result: ScanCompleteEvent['result']): void {
       this.scanComplete.emit({ articleId, result });
       this.showResult(result);
     }

     private showResult(result: ScanCompleteEvent['result']): void {
       this.resultEvent.set(createResultEvent(RESULT_KIND_BY_SCAN_RESULT[result]));
     }
     ```
  `scan-dialog.html` komplett ersetzen:
  ```html
  <p-dialog
    styleClass="scan-dialog dialog-responsive"
    [header]="title()"
    [visible]="visible()"
    [modal]="true"
    [closable]="true"
    (visibleChange)="onVisibleChange($event)"
    (onShow)="onShown()"
  >
    <div class="scan-dialog__content">
      <app-input
        label="Artikelnummer"
        inputId="scan-dialog-number"
        [value]="articleNumber()"
        [debounceMs]="0"
        [addonRight]="inputAddons()"
        (valueChange)="onTyped($event)"
        (enter)="onSubmit()"
        (addonClick)="onAddonClick($event)"
      />

      @if (mode.active() === 'numpad') {
        <app-numpad
          class="scan-dialog__numpad"
          (keyPressed)="onNumpadKey($event)"
          (cleared)="onNumpadClear()"
          (submitted)="onSubmit()"
        />
      }

      @if (mode.cameraDenied()) {
        <p class="scan-dialog__camera-error">Kamerazugriff nicht möglich</p>
      }

      @if (isCameraActive()) {
        <app-barcode-scanner class="scan-dialog__camera" [active]="isCameraActive()" (codeDetected)="onScanDetected($event)" />
      } @else {
        @if (pendingList().length > 0) {
          <p-listbox [options]="pendingList()" styleClass="scan-dialog__list" (onChange)="onListboxSelect($event)">
            <ng-template #item let-a>{{ a.number }} — {{ a.name }}</ng-template>
          </p-listbox>
        } @else if (showUnknownMessage()) {
          <p class="scan-dialog__message">Artikel nicht bekannt</p>
        } @else {
          <p class="scan-dialog__message">{{ allDoneMessage() }}</p>
        }
      }

      <app-result-overlay [event]="resultEvent()" />
    </div>
  </p-dialog>
  ```
  `scan-dialog.scss`: im Block `.scan-dialog {` direkt vor `&__numpad {` einfügen:
  ```scss
    // Positioned parent for `app-result-overlay` (fills the dialog content, see result-overlay.scss).
    &__content {
      position: relative;
    }

  ```
  `docs/components/scan-dialog/component.md`:
  - Abschnitt von `### Scan-Feedback-Overlay` bis einschließlich der Zeile `- **Vibration:** …` ersetzen durch:
    ```markdown
    ### Ergebnis-Einblendung

    Jede Eingabe (Tastatur-Enter, Numpad-Bestätigung, Klick auf einen Listeneintrag, Kamera-Scan) löst die
    [Ergebnis-Einblendung](../result-overlay/component.md) über dem Dialog-Inhalt aus — fest 1,5 s, unabhängig von
    `pauseMs`. Der Ring-Countdown entfällt. `pauseMs` bleibt als Scan-Pause, die dasselbe Bild im Kamera-Modus nicht
    mehrfach auswertet.

    | Ergebnis | Einblendung | Bedeutung |
    |---|---|---|
    | Artikel des Verkäufers erfasst bzw. zurückgegeben (beim Freigeben schon beim Erfassen in der Sitzung) | Grüner Haken | Erfolg |
    | Freigeben: bereits freigegeben (auch verkauft/zurückgegeben) oder in der Sitzung schon erfasst; Zurückgeben: bereits zurückgegeben | Gelber Haken | Bereits erledigt |
    | Unbekannte Nummer, Artikel eines anderen Verkäufers, Zurückgeben: noch nicht freigegeben oder bereits verkauft, Such-Fehler (Netz/Server) | Roter X | Fehlgeschlagen |

    Der Text „Artikel nicht bekannt" im Tastatur-Modus bleibt zusätzlich bestehen. Ton und Vibration kommen aus der
    Einblendung.
    ```
  - AC-3 ersetzen durch: `3. **AC-3** — WHEN eine Nummer erfasst wird, deren Zeitstempel bereits gesetzt ist (Freigeben: bereits freigegeben oder in der Sitzung schon erfasst; Zurückgeben: bereits zurückgegeben), THEN SHALL das System in jedem Eingabeweg einen gelben Haken einblenden und \`scanComplete\` mit \`result: 'already-set'\` emittieren.`
  - AC-4 ersetzen durch: `4. **AC-4** — IF eine eingegebene oder gescannte Nummer keinem passenden Artikel des Verkäufers entspricht oder die Suche fehlschlägt, THEN SHALL das System in jedem Eingabeweg einen roten X einblenden und im Tastatur-Modus zusätzlich den Text „Artikel nicht bekannt" unterhalb des Felds anzeigen.`
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts --include src/app/features/sellers/components/release-dialog/release-dialog.spec.ts --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: PASS (die beiden Konsumenten-Specs belegen, dass `release-dialog` und `settlement-page` unverändert funktionieren)
- [ ] **Schritt 5: Lint und Commit**
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK. Dann `git add src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.ts src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.html src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.scss src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts docs/components/scan-dialog/component.md` · `git commit -m "feat(scan-dialog): Ergebnis-Einblendung in Freigeben- und Zurückgeben-Dialog eingebaut"`

---

### Task 4: Ergebnis-Einblendung auf der Verkauf-Seite

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-16, AC-19, AC-20

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.ts` · `CheckoutPage` (Imports, `imports`, Signals, `startLookup`, `handleArticleFound`, `handleArticleLookupError`, `addToCart`)
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html` · `<div class="checkout-page">`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss` · `.checkout-page`
- Test: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts` · `CheckoutPage`

**Interfaces:**
- Consumes: aus Task 1 `createResultEvent(kind: ResultKind): ResultEvent`, `ResultEvent`, `ResultKind` (`../../../../shared/components/result-overlay/result-event`); aus Task 2 `ResultOverlay` (`../../../../shared/components/result-overlay/result-overlay`, Input `event`).
- Produces: `CheckoutPage.resultEvent: WritableSignal<ResultEvent | null>`; alle bisherigen öffentlichen Member unverändert.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `checkout-page.spec.ts` direkt vor dem letzten Test `it('wires Enter on the app-input field itself through to the lookup', …)` einfügen:
  ```ts
  describe('Ergebnis-Einblendung', () => {
    async function setupWithArticle(overrides: Partial<ArticleByNumberResult>) {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub(overrides)));
      return setup(articlesApi);
    }

    it('onEnterPressed_SellingArticle_ShowsSuccess', async () => {
      // Arrange
      const { component } = await setupWithArticle({ status: 'selling' });
      component.onTyped('1042');

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()?.kind).toBe('success');
    });

    it('onEnterPressed_SecondEnterOnFoundArticle_ShowsCartAndAddsArticle', async () => {
      // Arrange
      const { component } = await setupWithArticle({ status: 'selling' });
      component.onTyped('1042');
      component.onEnterPressed();

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()?.kind).toBe('cart');
      expect(component.cartItems()).toHaveLength(1);
    });

    it('onEnterPressed_UnknownNumber_ShowsFailedAndKeepsInfoText', async () => {
      // Arrange
      const { component } = await setup();
      component.onTyped('1042');

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()?.kind).toBe('failed');
      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikelnummer 1042 ist nicht bekannt.' });
    });

    it.each(['registered', 'sold', 'returned', 'archived'])(
      'onEnterPressed_Article%sStatus_ShowsFailed',
      async (status) => {
        // Arrange
        const { component } = await setupWithArticle({ status });
        component.onTyped('1042');

        // Act
        component.onEnterPressed();

        // Assert
        expect(component.resultEvent()?.kind).toBe('failed');
      },
    );

    it('onEnterPressed_ServerNotReachable_ShowsFailed', async () => {
      // Arrange
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()?.kind).toBe('failed');
    });

    it('onEnterPressed_ArticleAlreadyInCart_ShowsAlreadyAndDoesNotAddTwice', async () => {
      // Arrange
      const articlesApi = articlesApiStub();
      const { component } = await setup(articlesApi);
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      component.onTyped('1042');

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()?.kind).toBe('already');
      expect(component.cartItems()).toHaveLength(1);
      expect(articlesApi.getByNumber).not.toHaveBeenCalled();
    });

    it('onEnterPressed_TwoFailuresInARow_SetsADistinctEventEachTime', async () => {
      // Arrange
      const { component } = await setup();
      component.onTyped('1042');
      component.onEnterPressed();
      const firstEvent = component.resultEvent();

      // Act
      component.onEnterPressed();

      // Assert
      expect(component.resultEvent()).not.toBe(firstEvent);
    });

    it('onTyped_WhileOverlayIsShown_StillAcceptsInputAndLookup', async () => {
      // Arrange
      const articlesApi = articlesApiStub();
      const { component } = await setup(articlesApi);
      component.onTyped('1042');
      component.onEnterPressed();

      // Act
      component.onTyped('77');

      // Assert
      expect(component.articleNumber()).toBe('77');
      component.onEnterPressed();
      expect(articlesApi.getByNumber).toHaveBeenLastCalledWith(77);
    });

    it('onCartRemoveItem_CartRowClickedWhileOverlayIsShown_StillRemovesArticle', async () => {
      // Arrange
      const { fixture, component } = await setup();
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      component.onTyped('555');
      component.onEnterPressed();
      fixture.detectChanges();
      const rowButton = fixture.debugElement.query(By.css('.cart__item button')).nativeElement as HTMLButtonElement;

      // Act
      rowButton.click();

      // Assert
      expect(component.cartItems()).toEqual([]);
    });

    it('template_CheckoutPage_HostsOverlayInsidePositionedPageArea', async () => {
      // Arrange & Act
      const { fixture } = await setup();

      // Assert
      expect(fixture.debugElement.query(By.css('.checkout-page app-result-overlay'))).not.toBeNull();
    });
  });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts` — erwartet: FAIL (`onEnterPressed_SellingArticle_ShowsSuccess`: `resultEvent` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `checkout-page.ts`:
  1. Nach der Zeile `import { BarcodeScanner } from '../../../../shared/components/barcode-scanner/barcode-scanner';` einfügen:
     ```ts
     import { ResultEvent, ResultKind, createResultEvent } from '../../../../shared/components/result-overlay/result-event';
     import { ResultOverlay } from '../../../../shared/components/result-overlay/result-overlay';
     ```
  2. `imports: [ButtonModule, DialogModule, Input, Page, Numpad, BarcodeScanner, Cart, PaymentPanel],` → `imports: [ButtonModule, DialogModule, Input, Page, Numpad, BarcodeScanner, Cart, PaymentPanel, ResultOverlay],`
  3. Nach `readonly infoState = signal<InfoState>(INITIAL_INFO_STATE);` einfügen:
     ```ts
       /** Latest lookup/cart result for `app-result-overlay` (green = like the InfoArea, see spec "Verkauf-Farben"). */
       readonly resultEvent = signal<ResultEvent | null>(null);
     ```
  4. In `startLookup` im Block `if (this.cartItems().some((item) => item.number === number)) {` nach `this.infoState.set({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });` die Zeile `this.showResult('already');` einfügen.
  5. `handleArticleFound` und `handleArticleLookupError` komplett ersetzen:
     ```ts
       private handleArticleFound(article: ArticleByNumberResult, number: number, matchedRaw: string): void {
         this.searching.set(false);
         switch (article.status) {
           case 'selling':
             this.infoState.set({
               type: 'success',
               text: `Artikel gültig – ${article.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} – Enter zum Übernehmen`,
             });
             this.foundArticle.set(article);
             this.resultNumber.set(matchedRaw);
             this.previousMode.set(this.activeMode());
             this.activeMode.set('keyboard');
             this.showResult('success');
             this.focusArticleNumberField(true);
             return;
           case 'registered':
             this.infoState.set({
               type: 'error',
               text: `Artikel ${number} ist noch nicht freigegeben — zuerst annehmen.`,
             });
             break;
           case 'sold':
             this.infoState.set({ type: 'error', text: `Artikel ${number} ist bereits verkauft.` });
             break;
           case 'returned':
             this.infoState.set({
               type: 'error',
               text: `Artikel ${number} wurde an den Verkäufer zurückgegeben.`,
             });
             break;
           default:
             // There is no `not_sellable`/settlement case reachable here — that only exists
             // server-side at booking time (spec.md: "Einen Fall „Verkäufer ist abgerechnet" gibt es
             // hier nicht"). Any other/unknown status is treated the same as a lookup failure.
             this.infoState.set({
               type: 'error',
               text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
             });
         }
         this.foundArticle.set(null);
         this.showResult('failed');
         this.focusArticleNumberField(true);
       }

       private handleArticleLookupError(error: unknown, number: number): void {
         this.searching.set(false);
         const unknownNumber = error instanceof HttpErrorResponse && error.status === 404;
         // Not part of the epic's six-state table (network/5xx only) — treated conservatively with a
         // generic error message rather than silently doing nothing.
         this.infoState.set({
           type: 'error',
           text: unknownNumber
             ? `Artikelnummer ${number} ist nicht bekannt.`
             : 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
         });
         this.foundArticle.set(null);
         this.showResult('failed');
         this.focusArticleNumberField(true);
       }
     ```
  6. In `addToCart` nach `this.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });` einfügen: `this.showResult('cart');`
  7. Direkt vor `private resetField(): void {` einfügen:
     ```ts
       private showResult(kind: ResultKind): void {
         this.resultEvent.set(createResultEvent(kind));
       }

     ```
  `checkout-page.html`: im Block `<div class="checkout-page">` direkt vor dem schließenden `</div>` (nach `<div class="checkout-page__column checkout-page__column--right">…</div>`) einfügen:
  ```html
    <app-result-overlay [event]="resultEvent()" />
  ```
  `checkout-page.scss`: `.checkout-page {\n  display: grid;` → `.checkout-page {\n  position: relative;\n  display: grid;` (Eltern-Fläche für `app-result-overlay`, deckt Eingabespalte und Warenkorb ab).
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts` — erwartet: PASS (neue und bestehende Tests, u. a. die sechs „lookup outcomes", die belegen, dass Infofläche und Texte unverändert bleiben)
- [ ] **Schritt 5: Gesamtlauf, Lint und Commit**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: PASS (gesamte Suite). Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK. Dann `git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.ts src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts` · `git commit -m "feat(checkout): Ergebnis-Einblendung auf der Verkauf-Seite eingebaut"`

---

## Entscheidungen
- Keine Fragen an den Menschen.
- **E · Komponentenname und Ablage** · Planer — `app-result-overlay` unter `shared/components/result-overlay/` (englischer Komponentenname laut CLAUDE.md, Doku „Ergebnis-Einblendung"); `shared -> shared` ist laut ESLint-Boundaries erlaubt, `ScanDialog` (shared) und `CheckoutPage` (feature) dürfen sie nutzen.
- **E · Schnittstelle als Event-Objekt** · Planer — Eingabe `event: ResultEvent | null`, wobei jede Einblendung ein neues Objekt aus `createResultEvent` ist. Grund: gleiches Ergebnis zweimal hintereinander muss die laufende Einblendung neu starten (AC-18); ein reiner `kind`-Input würde das nicht auslösen. Das Icon wird per `@for … track shown.id` neu gerendert, damit die CSS-Animation von vorn beginnt.
- **E · Fläche der Verkauf-Seite** · Planer — Der Wrapper `.checkout-page` (Eingabespalte + Warenkorb, ohne Seitentitel) ist die positionierte Fläche, wie in AC-16 beschrieben („ganze Seite mit Eingabespalte und Warenkorb"); in den Dialogen ein neuer `.scan-dialog__content` um den gesamten Dialog-Inhalt.
- **E · Zeitablauf per CSS-Animation** · Planer — Einblenden/Halten/Ausblenden als Keyframes (33,333 % / 66,667 % von 1500 ms) plus ein Timer, der das Icon nach 1500 ms entfernt; keine Auswertung von `prefers-reduced-motion` (AC-29). In jsdom ist der Ablauf nur über Timer, Animations-Dauer-Stil und Klassen prüfbar, nicht visuell.
- **E · Vibrationsmuster Gelb** · Planer — Spec nennt „2 × 60 ms" ohne Pause; gewählt `[60, 60, 60]` (60 ms Pause, wie bei den Tönen), damit zwei getrennte Impulse spürbar sind.
- **E · Töne mit Web Audio** · Planer — Ping/Zonk wie bisher in `scan-feedback.ts` (Rampe über 0,15 s, ohne Gain-Hüllkurve); Gelb als zwei Oszillatoren bei 0 s und 0,14 s mit je 0,08 s. Abbruch über `AudioContext.close()` und `navigator.vibrate(0)`.
- **E · `app-scan-feedback` bleibt** · Planer — wird weiter von `intake-article-entry` genutzt (Wareneingang) und liegt außerhalb der drei Einsatzstellen; nur der Einbau in `scan-dialog` entfällt.
- **E · Unterscheidung „bereits erledigt" ohne Backend-Änderung** · Planer — `GET /api/articles/by-number/{number}` liefert bereits `status` (`registered`/`selling`/`sold`/`returned`, `Article.Status` priorisiert `sold` vor `returned`); „bereits freigegeben" = `selling`, `sold`, `returned`; „bereits zurückgegeben" = `returned`; `verdictFor` in `scan-dialog.ts` bildet das ab.
- **E · Such-Fehler in Dialogen** · Planer — rote Einblendung in jedem Eingabeweg (bisher nur Kamera) ohne `scanComplete`-Emit und ohne Sitzungsänderung, wie bisher.
- **R1 · AC-19** — geändert — Task 2 prüft jetzt mit `host_Shown_DoesNotInterceptPointerEvents`, dass der Overlay-Host `pointer-events: none` hat; Task 4 prüft mit `onCartRemoveItem_CartRowClickedWhileOverlayIsShown_StillRemovesArticle` den Klick auf eine Warenkorb-Zeile bei sichtbarer Einblendung. Festlegung: Die Warenkorb-Zeile (`cart.html`, `.cart__item`) hat als einziges klickbares Element den Entfernen-Button; dessen Klick ist der Prüffall. Das Tippen war bereits abgedeckt, AC-19 ist damit vollständig; Task 2 führt AC-19 jetzt in seiner AC-Liste.
- **R1 · Global Constraints** — geändert — Neue Zeile: Die Dialoge unterscheiden „bereits freigegeben bzw. zurückgegeben" (gelb) von „unbekannt/falsch" (rot) allein anhand des geladenen `status`; Backend und API bleiben unverändert.
- **R1 · Task 1** — geändert — `startTones` fängt einen werfenden `AudioContext`-Konstruktor (neue Funktion `createAudioContext`) und Fehler bei der Tonplanung ab und läuft dann still ohne Ton weiter; neuer Test `playResultCue_AudioContextConstructorThrows_StillVibratesWithoutThrowing`; Testzahl in Schritt 4 auf 12 korrigiert. Zusätzlich setzt `ResultOverlay.start` (Task 2) den Ausblend-Timer vor `playResultCue`. Festlegung zur Duplizierung: `scan-feedback.ts` bleibt unverändert (Randbedingung „`app-scan-feedback` bleibt für den Wareneingang unverändert"); die Muster bleiben bewusst getrennt, zumal `scan-feedback` für `'already-set'` den Zonk spielt, die Einblendung dagegen den Doppelton.
- **R1 · Task 2** — geändert — Anker der `overview.md`-Zeile ohne Tabellen-Pipes: „Tabellenzeile mit `**Scan-Dialog**`".
- **R1 · Task 3** — geändert — Anker der Template-Datei ist jetzt `styleClass="scan-dialog dialog-responsive"`, Anker der Spec-Datei `Feedback colors per result (camera mode)` ohne `describe(…)`-Syntax.
- **R1 · Task 4** — geändert — Anker der Spec-Datei ist jetzt „Testgruppe `CheckoutPage`".
- **F · Task 2** — nicht geändert — Vorschlag 1: Der Plan steht schon im vorgeschlagenen Wortlaut (`docs/components/overview.md:65` · Tabellenzeile mit `**Scan-Dialog**` (neue Zeile direkt darunter), ohne `\|`, seit R1). Umsetzen änderte nichts, die Anker-Prüfung schlüge weiter fehl, denn sie sucht den Text nach `·` wörtlich und Zeile 65 enthält nur `| **Scan-Dialog** | …`. Abhilfe wäre der Anker `**Scan-Dialog**` allein; das ist ein anderer Vorschlag.
- **F · Task 4** — nicht geändert — Vorschlag 1: Der Anker „Testgruppe `CheckoutPage`" steht schon im Plan (R1). Neu wäre nur der Pfad `…/checkout-page.spec.ts`; den kann man nicht relativ zur Repo-Wurzel auflösen, damit fände man die Datei gar nicht mehr. Die Datei enthält `describe('CheckoutPage'` (Zeile 73); ein wörtlicher Anker `CheckoutPage` wäre ein anderer Vorschlag.
- **F · Task 1** — geändert — Vorschlag 1: Die Duplizierung bleibt. In `result-cue.ts` steht jetzt über `PING` ein Kommentar: Ping und Zonk (Töne und Vibration) liegen identisch in `scan-feedback.ts` (`playTone`, `vibrate`) vor, bei Änderungen sind beide Stellen anzupassen. `scan-feedback.ts` selbst wird nicht angefasst, denn die Randbedingung „`app-scan-feedback` bleibt unverändert" gilt weiter.
