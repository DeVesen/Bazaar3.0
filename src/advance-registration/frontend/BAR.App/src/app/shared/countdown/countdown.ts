import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { selectActivePhase, CountdownPhase } from './select-active-phase';
import { selectTimelinePhases, TimelinePhaseState } from './select-timeline-phases';
import { computeRemainingTime, formatDateLabel, formatDaysLabel, pad2 } from './format-countdown';

/**
 * Visuelle Darstellungsvariante (component.md §2). `'kpi'` gehört zu einem späteren
 * Roadmap-Schritt (Home-Seiten) und ist bewusst nicht gebaut.
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

interface TimelinePhaseDisplay {
  readonly label: string;
  readonly state: TimelinePhaseState;
  readonly daysLabel: string | null;
  readonly hours: string | null;
  readonly minutes: string | null;
  readonly seconds: string | null;
}

@Component({
  selector: 'app-countdown',
  imports: [TimelineModule, TranslatePipe],
  templateUrl: './countdown.html',
  styleUrl: './countdown.scss'
})
export class Countdown implements OnDestroy {
  private readonly translate = inject(TranslateService);

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
      daysLabel: formatDaysLabel(remaining.days, this.translate.instant('countdown.dayLabelSingular'), this.translate.instant('countdown.dayLabelPlural')),
      hours: pad2(remaining.hours),
      minutes: pad2(remaining.minutes),
      seconds: pad2(remaining.seconds),
      dateLabel: formatDateLabel(phase.targetDate, this.locale())
    };
  });

  readonly timelinePhases = computed<TimelinePhaseDisplay[]>(() => {
    this.tick();

    return selectTimelinePhases(this.phases()).map((p) => {
      if (p.countdownTarget === null) {
        return { label: p.label, state: p.state, daysLabel: null, hours: null, minutes: null, seconds: null };
      }

      const remaining = computeRemainingTime(p.countdownTarget);
      return {
        label: p.label,
        state: p.state,
        daysLabel: formatDaysLabel(remaining.days, this.translate.instant('countdown.dayLabelSingular'), this.translate.instant('countdown.dayLabelPlural')),
        hours: pad2(remaining.hours),
        minutes: pad2(remaining.minutes),
        seconds: pad2(remaining.seconds)
      };
    });
  });

  private locale(): string {
    return this.translate.currentLang() === 'en' ? 'en-US' : 'de-DE';
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
