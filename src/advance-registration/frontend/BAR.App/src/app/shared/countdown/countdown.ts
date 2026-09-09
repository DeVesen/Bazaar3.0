import { Component, OnDestroy, computed, input, signal } from '@angular/core';
import { selectActivePhase, CountdownPhase } from './select-active-phase';
import { computeRemainingTime, formatDateLabel, formatDaysLabel, pad2 } from './format-countdown';

/**
 * Visuelle Darstellungsvariante (component.md §2). Diese Komponente implementiert aktuell nur
 * `'info-box'` (Login-Seite, R01 Zugang) — `'kpi'` und `'timeline'` gehören zu späteren
 * Roadmap-Schritten (Home-Seiten, Countdown-Embed-Widget) und sind bewusst nicht gebaut.
 */
export type CountdownVariant = 'kpi' | 'info-box' | 'timeline';

interface CountdownDisplay {
  readonly label: string;
  readonly daysLabel: string;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
  readonly dateLabel: string;
}

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.html',
  styleUrl: './countdown.scss'
})
export class Countdown implements OnDestroy {
  /** Geordnete Phasen-Liste im Sequence-Mode (component.md §2). */
  readonly phases = input<CountdownPhase[]>([]);
  /** Default `'info-box'` — einzige hier implementierte Variante. */
  readonly variant = input<CountdownVariant>('info-box');

  private readonly tick = signal(0);
  private readonly intervalId = setInterval(() => this.tick.update((v) => v + 1), 1000);

  readonly display = computed<CountdownDisplay | null>(() => {
    this.tick();

    const active = selectActivePhase(this.phases());
    if (!active) {
      return null;
    }

    const { phase, completed } = active;
    const remaining = completed ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : computeRemainingTime(phase.targetDate);

    return {
      label: phase.label,
      daysLabel: formatDaysLabel(remaining.days),
      hours: pad2(remaining.hours),
      minutes: pad2(remaining.minutes),
      seconds: pad2(remaining.seconds),
      dateLabel: formatDateLabel(phase.targetDate)
    };
  });

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
