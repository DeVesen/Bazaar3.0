/** Maßstab 1 des Etikett-Inhalts. */
export const LABEL_BASE_WIDTH_MM = 105;
export const LABEL_BASE_HEIGHT_MM = 35;

/** Einstellbare Größen in mm, absolut (nicht mit `labelScale` skaliert). */
export interface LabelElementSizes {
  /** Breite = Höhe des QR-Codes. */
  qrCode: number;
  /** Breite = Höhe beider Verkäufer-Symbole. */
  sellerSymbol: number;
  /** Feldhöhe = Schriftgröße der Artikel-Nummer. */
  numberHeight: number;
  /** Feldhöhe = Schriftgröße des Währungssymbols. */
  currencyHeight: number;
}

/** Vorgaben = frühere feste Werte bei 105 × 35 mm. */
export const DEFAULT_LABEL_ELEMENT_SIZES: LabelElementSizes = { qrCode: 21.5, sellerSymbol: 5, numberHeight: 10.5, currencyHeight: 12 };

/** Abstand um QR-Code und Logo-Fläche in mm, absolut (nicht mit `labelScale` skaliert). */
const GAP_MM = 1.5;

/** Quadratisches Element (QR-Code, Verkäufer-Symbol) in mm. */
export interface LabelBox {
  x: number;
  y: number;
  size: number;
}

/** Rechteck in mm (Logo-Fläche). */
export interface LabelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Artikel-Nummer in mm; `x` ist die horizontale Mitte. */
export interface LabelText {
  x: number;
  y: number;
  fontSize: number;
}

/** Preiszeile (Schreiblinie + rechtsbündiges Währungssymbol) in mm; Höhe = Schriftgröße. */
export interface LabelPriceRow extends LabelRect {
  fontSize: number;
}

export interface LabelLayout {
  scale: number;
  foldX: number;
  qr: LabelBox;
  numberText: LabelText;
  logo: LabelRect;
  sellerSymbolTopRight: LabelBox;
  sellerSymbolBottomLeft: LabelBox;
  priceRow: LabelPriceRow;
}

/** 105 × 35 mm = 1; bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse. */
export function labelScale(width: number, height: number): number {
  return Math.min(width / LABEL_BASE_WIDTH_MM, height / LABEL_BASE_HEIGHT_MM);
}

/**
 * Lage aller Elemente in mm. Linke Elemente hängen an der linken, rechte an der rechten
 * Kante, untere an der Unterkante. Größen kommen absolut aus `sizes`; Ränder und Anker skalieren
 * mit `labelScale`, außer den 1,5 mm um QR-Code und Logo-Fläche. Keine Kollisionsprüfung.
 */
export function labelLayout(width: number, height: number, sizes: LabelElementSizes): LabelLayout {
  const k = labelScale(width, height);
  const foldX = width / 2;
  // Gemeinsame Unterkante von Verkäufer-Symbol unten links, Artikel-Nummer und Preiszeile.
  const bottom = height - 1.5 * k;
  const numberText: LabelText = {
    // Horizontal mittig zwischen Verkäufer-Symbol unten links und Falzlinie.
    x: (8 * k + foldX - 1.5 * k) / 2,
    y: bottom - sizes.numberHeight,
    fontSize: sizes.numberHeight,
  };
  const logoX = GAP_MM + sizes.qrCode + GAP_MM;
  const priceLeft = width - 48 * k;
  return {
    scale: k,
    foldX,
    qr: { x: GAP_MM, y: GAP_MM, size: sizes.qrCode },
    numberText,
    logo: {
      x: logoX,
      y: GAP_MM,
      width: Math.max(0, foldX - GAP_MM - logoX),
      height: Math.max(0, numberText.y - GAP_MM - GAP_MM),
    },
    sellerSymbolTopRight: { x: width - 1.5 * k - sizes.sellerSymbol, y: 1.5 * k, size: sizes.sellerSymbol },
    sellerSymbolBottomLeft: { x: 1.5 * k, y: bottom - sizes.sellerSymbol, size: sizes.sellerSymbol },
    priceRow: {
      x: priceLeft,
      y: bottom - sizes.currencyHeight,
      width: width - 1.5 * k - priceLeft,
      height: sizes.currencyHeight,
      fontSize: sizes.currencyHeight,
    },
  };
}
