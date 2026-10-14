/** The five outcomes the Ergebnis-Einblendung can show (docs/components/result-overlay/component.md). */
export type ResultKind = 'failed' | 'success' | 'already' | 'cart' | 'paid';

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
