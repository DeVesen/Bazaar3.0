import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LabelContent } from './label-graphic';
import { LabelSheetGeometry } from './label-geometry';
import { LabelSheet } from './label-sheet';
import { LabelSlot } from './label-slots';

/** Alles, was ein Etiketten-Vordruck druckt: Bogenformat, alle Bögen mit ihren Plätzen, gleicher Inhalt. */
export interface LabelSheetsPrintModel {
  geometry: LabelSheetGeometry;
  sheets: LabelSlot[][];
  content: LabelContent;
}

/**
 * Leaf: Druckdokument des Etiketten-Vordrucks — je Bogen eine Druckseite in Originalgröße
 * (Breite in mm), mit Falzlinie und ohne Rasterlinien.
 */
@Component({
  selector: 'app-label-sheets-document',
  imports: [LabelSheet],
  template: `
    @for (sheet of model().sheets; track $index) {
      <app-label-sheet
        class="label-sheets-document__sheet"
        [geometry]="model().geometry"
        [slots]="sheet"
        [content]="model().content"
        [width]="sheetWidth()"
        [showFoldLines]="true"
      />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .label-sheets-document__sheet {
      break-after: page;
    }

    .label-sheets-document__sheet:last-child {
      break-after: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelSheetsDocument {
  readonly model = input.required<LabelSheetsPrintModel>();

  readonly sheetWidth = computed(() => `${this.model().geometry.sheetWidth}mm`);
}
