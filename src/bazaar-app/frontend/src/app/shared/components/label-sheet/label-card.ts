import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QrCode } from '../qr-code/qr-code';
import { LabelGraphic } from './label-graphic';
import { LabelGraphicView } from './label-graphic-view';
import { LabelBox, LabelLine, LabelText, labelLayout } from './label-layout';

type Style = Record<string, string>;

export type LabelCardStyles = Record<
  'fold' | 'qr' | 'numberText' | 'logo' | 'sellerSymbolTopRight' | 'sellerSymbolBottomLeft' | 'priceLine' | 'currency',
  Style
>;

/**
 * Leaf: ein Etikett (docs/components/label-sheet/component.md). Lage in Prozent der
 * Etikettgröße, Schrift in `cqw` des Etiketts: Dasselbe Markup skaliert in der Vorschau mit der
 * Containerbreite und liegt im Druck exakt in mm. Ohne Nummer (Vorschau vor gültiger
 * Startnummer) entfallen QR-Code und Klartext; ohne Logo oder Symbol bleibt deren Platz leer.
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

  /** Derselbe Wert für QR-Code und Klartext — genau die Nummer, ohne weitere Zeichen. */
  readonly numberText = computed(() => {
    const value = this.number();
    return value === null ? null : String(value);
  });

  readonly aspectRatio = computed(() => `${this.width()} / ${this.height()}`);

  readonly styles = computed<LabelCardStyles>(() => {
    const width = this.width();
    const height = this.height();
    const layout = labelLayout(width, height);
    return {
      fold: { left: percentOf(layout.foldX, width) },
      qr: boxStyle(layout.qr, width, height),
      numberText: { ...textStyle(layout.numberText, width, height), transform: 'translateX(-50%)' },
      logo: boxStyle(layout.logo, width, height),
      sellerSymbolTopRight: boxStyle(layout.sellerSymbolTopRight, width, height),
      sellerSymbolBottomLeft: boxStyle(layout.sellerSymbolBottomLeft, width, height),
      priceLine: lineStyle(layout.priceLine, width, height),
      currency: textStyle(layout.currency, width, height),
    };
  });
}

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function boxStyle(box: LabelBox, width: number, height: number): Style {
  return {
    left: percentOf(box.x, width),
    top: percentOf(box.y, height),
    width: percentOf(box.size, width),
    height: percentOf(box.size, height),
  };
}

/** `cqw` bezieht sich auf die Breite des Etiketts (`container-type: inline-size` in `.label-card`). */
function textStyle(text: LabelText, width: number, height: number): Style {
  return {
    left: percentOf(text.x, width),
    top: percentOf(text.y, height),
    'font-size': `${(text.fontSize / width) * 100}cqw`,
  };
}

function lineStyle(line: LabelLine, width: number, height: number): Style {
  return {
    left: percentOf(line.x1, width),
    width: percentOf(line.x2 - line.x1, width),
    top: percentOf(line.y, height),
  };
}
