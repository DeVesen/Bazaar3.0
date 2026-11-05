import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QrCode } from '../qr-code/qr-code';
import { LabelGraphic } from './label-graphic';
import { LabelGraphicView } from './label-graphic-view';
import { DEFAULT_LABEL_ELEMENT_SIZES, LabelBox, LabelElementSizes, LabelPriceRow, LabelRect, LabelText, labelLayout } from './label-layout';

type Style = Record<string, string>;

export type LabelCardStyles = Record<
  'fold' | 'qr' | 'numberText' | 'logo' | 'sellerSymbolTopRight' | 'sellerSymbolBottomLeft' | 'priceRow',
  Style
>;

/**
 * Leaf: ein Etikett (docs/components/label-sheet/component.md). Lage in Prozent der
 * Etikettgröße, Schrift in `cqw` des Etiketts: Dasselbe Markup skaliert in der Vorschau mit der
 * Containerbreite und liegt im Druck exakt in mm. Ohne Nummer (Vorschau vor gültiger
 * Startnummer) entfallen QR-Code und Klartext; ohne Logo oder Symbol bleibt deren Platz leer.
 * Das Logo füllt eingepasst die freie Fläche; ist sie 0 breit oder hoch, entfällt es.
 */
@Component({
  selector: 'app-label-card',
  imports: [QrCode, LabelGraphicView],
  templateUrl: './label-card.html',
  styleUrl: './label-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelCard {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly number = input<number | null>(null);
  readonly logo = input<LabelGraphic | null>(null);
  readonly sellerSymbol = input<LabelGraphic | null>(null);
  readonly currencySymbol = input<string>('€');
  readonly showFoldLine = input<boolean>(false);
  readonly sizes = input<LabelElementSizes>(DEFAULT_LABEL_ELEMENT_SIZES);

  /** Derselbe Wert für QR-Code und Klartext — genau die Nummer, ohne weitere Zeichen. */
  readonly numberText = computed(() => {
    const value = this.number();
    return value === null ? null : String(value);
  });

  readonly aspectRatio = computed(() => `${this.width()} / ${this.height()}`);

  private readonly layout = computed(() => labelLayout(this.width(), this.height(), this.sizes()));

  /** Logo nur, wenn seine freie Fläche nicht leer ist. */
  readonly hasLogoArea = computed(() => {
    const logo = this.layout().logo;
    return logo.width > 0 && logo.height > 0;
  });

  readonly styles = computed<LabelCardStyles>(() => {
    const width = this.width();
    const height = this.height();
    const layout = this.layout();
    return {
      fold: { left: percentOf(layout.foldX, width) },
      qr: boxStyle(layout.qr, width, height),
      numberText: { ...textStyle(layout.numberText, width, height), transform: 'translateX(-50%)' },
      logo: rectStyle(layout.logo, width, height),
      sellerSymbolTopRight: boxStyle(layout.sellerSymbolTopRight, width, height),
      sellerSymbolBottomLeft: boxStyle(layout.sellerSymbolBottomLeft, width, height),
      priceRow: priceRowStyle(layout.priceRow, width, height),
    };
  });
}

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function boxStyle(box: LabelBox, width: number, height: number): Style {
  return rectStyle({ x: box.x, y: box.y, width: box.size, height: box.size }, width, height);
}

function rectStyle(rect: LabelRect, width: number, height: number): Style {
  return {
    left: percentOf(rect.x, width),
    top: percentOf(rect.y, height),
    width: percentOf(rect.width, width),
    height: percentOf(rect.height, height),
  };
}

/** `cqw` bezieht sich auf die Breite des Etiketts (`container-type: inline-size` in `.label-card`). */
function fontSizeOf(fontSize: number, width: number): string {
  return `${(fontSize / width) * 100}cqw`;
}

function textStyle(text: LabelText, width: number, height: number): Style {
  return {
    left: percentOf(text.x, width),
    top: percentOf(text.y, height),
    'font-size': fontSizeOf(text.fontSize, width),
  };
}

function priceRowStyle(row: LabelPriceRow, width: number, height: number): Style {
  return { ...rectStyle(row, width, height), 'font-size': fontSizeOf(row.fontSize, width) };
}
