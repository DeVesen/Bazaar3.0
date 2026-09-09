/** Eine Phase im Sequence-Mode des Countdowns (siehe docs/components/countdown/component.md §2). */
export interface CountdownPhase {
  readonly label: string;
  readonly targetDate: Date;
}

/** Ergebnis der Phasen-Auswahl: welche Phase angezeigt wird und ob sie bereits abgeschlossen ist. */
export interface ActivePhase {
  readonly phase: CountdownPhase;
  readonly completed: boolean;
}

/**
 * Wählt die anzuzeigende Phase aus einer geordneten Phasen-Liste (Sequence-Mode).
 *
 * Regel (component.md §2): die erste Phase, deren `targetDate` noch in der Zukunft liegt, wird
 * angezeigt (`completed: false`). Sind alle Phasen erreicht, wird die letzte Phase im
 * abgeschlossenen Zustand zurückgegeben (`completed: true`) — ihr Label bleibt sichtbar, die
 * Zeitanzeige zeigt `0 Tage 00:00:00`.
 *
 * `phases` leer → `null` (nichts anzuzeigen).
 */
export function selectActivePhase(phases: readonly CountdownPhase[], now: Date = new Date()): ActivePhase | null {
  if (phases.length === 0) {
    return null;
  }

  const nowMs = now.getTime();
  const upcoming = phases.find((phase) => phase.targetDate.getTime() > nowMs);
  if (upcoming) {
    return { phase: upcoming, completed: false };
  }

  return { phase: phases[phases.length - 1], completed: true };
}
