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
  return {
    scale: k,
    foldX: width / 2,
    qr: { x: 4 * k, y: 2 * k, size: 20 * k },
    numberText: { x: 14 * k, y: 23 * k, fontSize: 3.5 * k },
    logo: { x: 26 * k, y: 2 * k, size: 20 * k },
    sellerSymbolTopRight: { x: width - 6.5 * k, y: 1.5 * k, size: 5 * k },
    sellerSymbolBottomLeft: { x: 1.5 * k, y: height - 6.5 * k, size: 5 * k },
    priceLine: { x1: width - 48 * k, x2: width - 14 * k, y: height - 11 * k },
    currency: { x: width - 12.5 * k, y: height - 17 * k, fontSize: 6 * k },
  };
}
