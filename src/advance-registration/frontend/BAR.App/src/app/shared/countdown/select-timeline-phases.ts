/** Eine Phase im Timeline-Mode; `targetDate` kann `null` sein (nicht gepflegter Termin, AC-6/AC-7). */
export interface TimelinePhaseInput {
  readonly label: string;
  readonly targetDate: Date | null;
}

export type TimelinePhaseState = 'upcoming' | 'active' | 'completed';

/** Anzeigezustand einer Phase im Timeline-Mode (docs/components/countdown/component.md §2, Variante 'timeline'). */
export interface TimelinePhase {
  readonly label: string;
  readonly state: TimelinePhaseState;
  /** Zieldatum für den Live-Countdown: eigenes `targetDate` bei `upcoming`, das der nächsten Phase bei `active`, `null` bei `completed`. */
  readonly countdownTarget: Date | null;
}

/**
 * Bildet die geordnete Phasen-Liste auf ihren Timeline-Anzeigezustand ab (component.md §2,
 * Variante `'timeline'`). Phasen mit `targetDate: null` werden komplett übersprungen (AC-7) —
 * die Statuslogik arbeitet auf der gefilterten Liste, damit „die nächste Phase" die nächste
 * tatsächlich angezeigte Phase meint, nicht eine übersprungene.
 */
export function selectTimelinePhases(phases: readonly TimelinePhaseInput[], now: Date = new Date()): TimelinePhase[] {
  const known = phases.filter((phase): phase is { label: string; targetDate: Date } => phase.targetDate !== null);
  const nowMs = now.getTime();

  return known.map((phase, index) => {
    if (phase.targetDate.getTime() > nowMs) {
      return { label: phase.label, state: 'upcoming', countdownTarget: phase.targetDate };
    }

    const next = known[index + 1];
    if (next && next.targetDate.getTime() > nowMs) {
      return { label: phase.label, state: 'active', countdownTarget: next.targetDate };
    }

    return { label: phase.label, state: 'completed', countdownTarget: null };
  });
}
