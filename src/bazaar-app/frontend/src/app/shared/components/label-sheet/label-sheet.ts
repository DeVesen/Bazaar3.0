import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LabelCard } from './label-card';
import { EMPTY_LABEL_CONTENT, LabelContent } from './label-graphic';
import { LabelSheetGeometry, SlotRect, slotRects } from './label-geometry';
import { LabelSlot } from './label-slots';

type Style = Record<string, string>;

interface PlacedSlot {
  position: number;
  skipped: boolean;
  number: number | null;
  style: Style;
}

const EMPTY_SLOT: LabelSlot = { kind: 'empty' };

/**
 * Leaf: ein Etikettenbogen mit Rand und Raster (docs/components/label-sheet/component.md).
 * Breite als CSS-Länge (`100%` in der Vorschau, `<Bogenbreite>mm` im Druck), Höhe über das
 * Seitenverhältnis des Bogens; Plätze in Prozent der Bogengröße.
 */
@Component({
  selector: 'app-label-sheet',
  imports: [LabelCard],
  templateUrl: './label-sheet.html',
  styleUrl: './label-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelSheet {
  readonly geometry = input.required<LabelSheetGeometry>();
  readonly slots = input.required<LabelSlot[]>();
  readonly content = input<LabelContent>(EMPTY_LABEL_CONTENT);
  readonly width = input<string>('100%');
  /** Vorschau: höchstens so hoch; die Breite schrumpft mit, das Seitenverhältnis bleibt. */
  readonly maxHeight = input<string | null>(null);
  readonly outlineSlots = input<boolean>(false);
  readonly showFoldLines = input<boolean>(false);
  /** Druck: Offset X/Y des Bogenformats anwenden; die Vorschau bleibt unverschoben. */
  readonly applyOffset = input<boolean>(false);

  readonly sheetStyle = computed(() => sheetStyleOf(this.geometry(), this.width(), this.maxHeight()));

  readonly placedSlots = computed<PlacedSlot[]>(() => {
    const geometry = this.geometry();
    const slots = this.slots();
    return slotRects(geometry, { applyOffset: this.applyOffset() }).map((rect, index) => placeSlot(slots[index] ?? EMPTY_SLOT, rect, index, geometry));
  });
}

function sheetStyleOf(geometry: LabelSheetGeometry, width: string, maxHeight: string | null): Style {
  const ratio = `${geometry.sheetWidth} / ${geometry.sheetHeight}`;
  const style: Style = { width, 'aspect-ratio': ratio };
  if (maxHeight === null) return style;
  return { ...style, 'max-width': `calc(${maxHeight} * ${ratio})` };
}

function placeSlot(slot: LabelSlot, rect: SlotRect, index: number, geometry: LabelSheetGeometry): PlacedSlot {
  return {
    position: index + 1,
    skipped: slot.kind === 'skipped',
    number: slot.kind === 'label' ? slot.number : null,
    style: {
      left: `${(rect.left / geometry.sheetWidth) * 100}%`,
      top: `${(rect.top / geometry.sheetHeight) * 100}%`,
      width: `${(rect.width / geometry.sheetWidth) * 100}%`,
      height: `${(rect.height / geometry.sheetHeight) * 100}%`,
    },
  };
}
