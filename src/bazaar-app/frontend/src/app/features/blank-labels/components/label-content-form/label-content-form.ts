import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
import { LabelContentErrors, LabelContentField, LabelContentTexts } from '../../model/label-content-rules';
import { GraphicPicker, LibraryImageOption } from '../graphic-picker/graphic-picker';

export interface LabelContentFieldChange {
  field: LabelContentField;
  text: string;
}

export interface ImageChoice {
  target: 'logo' | 'sellerSymbol';
  file: File;
}

type TextField = Exclude<LabelContentField, 'startPosition'>;

/** Leaf: Eingaben von Bereich B (Etiketten-Inhalt pro Druck). */
@Component({
  selector: 'app-label-content-form',
  imports: [FormsModule, InputTextModule, GraphicPicker],
  templateUrl: './label-content-form.html',
  styleUrl: './label-content-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelContentForm {
  readonly texts = input.required<LabelContentTexts>();
  readonly errors = input<LabelContentErrors>({});
  readonly logo = input<LabelGraphic | null>(null);
  readonly sellerSymbol = input<LabelGraphic | null>(null);
  readonly libraryImages = input<LibraryImageOption[]>([]);

  readonly fieldChange = output<LabelContentFieldChange>();
  readonly logoChange = output<LabelGraphic | null>();
  readonly sellerSymbolChange = output<LabelGraphic | null>();
  readonly imageChosen = output<ImageChoice>();
  /** Id des Bibliotheksbilds, dessen Löschen der Admin angestoßen hat. */
  readonly imageDeleteRequested = output<string>();

  readonly fields: { field: TextField; label: string; inputId: string }[] = [
    { field: 'startNumber', label: 'Startnummer', inputId: 'label-content-start-number' },
    { field: 'count', label: 'Anzahl Etiketten', inputId: 'label-content-count' },
    { field: 'currencySymbol', label: 'Währungssymbol', inputId: 'label-content-currency' },
    { field: 'qrCodeSize', label: 'Größe QR-Code (mm)', inputId: 'label-content-qr-code-size' },
    { field: 'sellerSymbolSize', label: 'Größe Verkäufer-Symbol (mm)', inputId: 'label-content-seller-symbol-size' },
    { field: 'numberHeight', label: 'Höhe Artikel-Nummer (mm)', inputId: 'label-content-number-height' },
    { field: 'currencyHeight', label: 'Höhe Währungssymbol (mm)', inputId: 'label-content-currency-height' },
  ];
}
