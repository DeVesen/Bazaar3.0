/** Ein Platz auf dem Etikettenbogen: vor der Startposition übersprungen, leer oder mit Etikett. */
export type LabelSlot = { kind: 'skipped' } | { kind: 'empty' } | { kind: 'label'; number: number };

const SKIPPED: LabelSlot = { kind: 'skipped' };
const EMPTY: LabelSlot = { kind: 'empty' };

/**
 * Verteilt `count` Etiketten ab `startNumber` zeilenweise auf ganze Bögen. Die Plätze vor der
 * Startposition (1-basiert) bleiben auf dem ersten Bogen leer; Folgebögen beginnen bei Platz 1.
 */
export function placeLabels(startNumber: number, count: number, startPosition: number, perSheet: number): LabelSlot[][] {
  const skipped = startPosition - 1;
  const sheetCount = Math.ceil((skipped + count) / perSheet);
  const slots = Array.from({ length: sheetCount * perSheet }, (_, index) => slotAt(index, skipped, startNumber, count));
  return chunk(slots, perSheet);
}

/** Erster Bogen der Vorschau von Bereich C: Plätze vor der Startposition ausgegraut. */
export function startPositionPreview(startPosition: number, perSheet: number): LabelSlot[] {
  return Array.from({ length: perSheet }, (_, index) => (index < startPosition - 1 ? SKIPPED : EMPTY));
}

function slotAt(index: number, skipped: number, startNumber: number, count: number): LabelSlot {
  if (index < skipped) return SKIPPED;
  if (index >= skipped + count) return EMPTY;
  return { kind: 'label', number: startNumber + index - skipped };
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}
