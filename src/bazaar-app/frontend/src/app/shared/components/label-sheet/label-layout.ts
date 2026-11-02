/** Maßstab 1 des Etikett-Inhalts. */
export const LABEL_BASE_WIDTH_MM = 105;
export const LABEL_BASE_HEIGHT_MM = 35;

/** Quadratisches Element (QR-Code, Logo, Verkäufer-Symbol) in mm. */
export interface LabelBox {
  x: number;
  y: number;
  size: number;
}

/** Textelement in mm; `x` ist beim Klartext die horizontale Mitte, beim Währungssymbol die linke Kante. */
export interface LabelText {
  x: number;
  y: number;
  fontSize: number;
}

export interface LabelLine {
  x1: number;
  x2: number;
  y: number;
}

export interface LabelLayout {
  scale: number;
  foldX: number;
  qr: LabelBox;
  numberText: LabelText;
  logo: LabelBox;
  sellerSymbolTopRight: LabelBox;
  sellerSymbolBottomLeft: LabelBox;
  priceLine: LabelLine;
  currency: LabelText;
}

/** 105 × 35 mm = 1; bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse. */
export function labelScale(width: number, height: number): number {
  return Math.min(width / LABEL_BASE_WIDTH_MM, height / LABEL_BASE_HEIGHT_MM);
}

/**
 * Lage aller Elemente in mm. Linke Elemente hängen an der linken, rechte an der rechten
 * Kante, untere an der Unterkante; Abstände und Größen skalieren mit `labelScale`, damit der
 * Inhalt bei jedem Seitenverhältnis vollständig im Etikett liegt.
 */
export function labelLayout(width: number, height: number): LabelLayout {
  const k = labelScale(width, height);
  const foldX = width / 2;
  // Gemeinsame Unterkante von Verkäufer-Symbol unten links, Klartext, Schreiblinie und Währungssymbol.
  const bottom = height - 1.5 * k;
  const numberFontSize = 10.5 * k;
  const currencyFontSize = 12 * k;
  return {
    scale: k,
    foldX,
    qr: { x: 1.5 * k, y: 1 * k, size: 21.5 * k },
    // Horizontal mittig zwischen Verkäufer-Symbol unten links und Falzlinie.
    numberText: { x: (8 * k + foldX - 1.5 * k) / 2, y: bottom - numberFontSize, fontSize: numberFontSize },
    logo: { x: 26 * k, y: 2 * k, size: 20 * k },
    sellerSymbolTopRight: { x: width - 6.5 * k, y: 1.5 * k, size: 5 * k },
    sellerSymbolBottomLeft: { x: 1.5 * k, y: bottom - 5 * k, size: 5 * k },
    priceLine: { x1: width - 48 * k, x2: width - 14.5 * k, y: bottom - 0.3 * k },
    currency: { x: width - 13 * k, y: bottom - currencyFontSize, fontSize: currencyFontSize },
  };
}
