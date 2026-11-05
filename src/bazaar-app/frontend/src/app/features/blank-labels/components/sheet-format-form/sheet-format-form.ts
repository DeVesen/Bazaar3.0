import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SheetFormat } from '../../data/blank-labels-api';
import { SHEET_FORMAT_FIELDS, SheetFormatErrors, SheetFormatField, SheetFormatTexts } from '../../model/sheet-format-rules';

export interface SheetFormatFieldChange {
  field: SheetFormatField;
  text: string;
}

const FIELD_LABELS: Record<SheetFormatField, string> = {
  sheetWidth: 'Bogenbreite (mm)',
  sheetHeight: 'Bogenhöhe (mm)',
  labelWidth: 'Etikettbreite (mm)',
  labelHeight: 'Etiketthöhe (mm)',
  marginTop: 'Rand oben (mm)',
  marginRight: 'Rand rechts (mm)',
  marginBottom: 'Rand unten (mm)',
  marginLeft: 'Rand links (mm)',
  gapHorizontal: 'Abstand waagerecht (mm)',
  gapVertical: 'Abstand senkrecht (mm)',
  columns: 'Spalten',
  rows: 'Zeilen',
  offsetX: 'Offset X (mm)',
  offsetY: 'Offset Y (mm)',
};

/** Leaf: Eingaben von Bereich A (Bogenformat) samt Auswahl, Name, Speichern und Löschen. */
@Component({
  selector: 'app-sheet-format-form',
  imports: [FormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './sheet-format-form.html',
  styleUrl: './sheet-format-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetFormatForm {
  readonly texts = input.required<SheetFormatTexts>();
  readonly errors = input<SheetFormatErrors>({});
  readonly formats = input<SheetFormat[]>([]);
  readonly selectedFormatId = input<string | null>(null);
  readonly name = input<string>('');
  readonly nameError = input<string | null>(null);
  readonly perSheet = input<number | null>(null);
  readonly canSave = input<boolean>(false);

  readonly fieldChange = output<SheetFormatFieldChange>();
  readonly formatSelected = output<string>();
  readonly nameChange = output<string>();
  readonly save = output<void>();
  readonly remove = output<void>();

  readonly fields = SHEET_FORMAT_FIELDS.map((field) => ({ field, label: FIELD_LABELS[field], inputId: `sheet-format-${field}` }));

  readonly perSheetText = computed(() => {
    const perSheet = this.perSheet();
    return perSheet === null ? 'Anzahl pro Seite: –' : `${perSheet} Etiketten pro Seite`;
  });
}
