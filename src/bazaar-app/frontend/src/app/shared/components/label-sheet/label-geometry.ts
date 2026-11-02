/** Maße eines Etikettenbogens in mm (Bogenformat ohne Namen); Feldnamen wie im JSON-Vertrag. */
export interface LabelSheetGeometry {
  sheetWidth: number;
  sheetHeight: number;
  labelWidth: number;
  labelHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  gapHorizontal: number;
  gapVertical: number;
  columns: number;
  rows: number;
}

/** Vorbelegung ohne gespeichertes Bogenformat: Avery 16er auf A4. */
export const AVERY_16_GEOMETRY: LabelSheetGeometry = {
  sheetWidth: 210,
  sheetHeight: 297,
  labelWidth: 105,
  labelHeight: 35,
  marginTop: 8.5,
  marginRight: 0,
  marginBottom: 8.5,
  marginLeft: 0,
  gapHorizontal: 0,
  gapVertical: 0,
  columns: 2,
  rows: 8,
};

/** So weit darf das Raster den Bogen überragen, ohne als widersprüchlich zu gelten. */
export const FIT_TOLERANCE_MM = 0.5;

/** Lage eines Etikettplatzes auf dem Bogen in mm, gemessen ab der linken oberen Bogenecke. */
export interface SlotRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function labelsPerSheet(geometry: LabelSheetGeometry): number {
  return geometry.columns * geometry.rows;
}

export function fitsSheetWidth(geometry: LabelSheetGeometry): boolean {
  const required =
    geometry.columns * geometry.labelWidth +
    (geometry.columns - 1) * geometry.gapHorizontal +
    geometry.marginLeft +
    geometry.marginRight;
  return roundToTenth(required) <= geometry.sheetWidth + FIT_TOLERANCE_MM;
}

export function fitsSheetHeight(geometry: LabelSheetGeometry): boolean {
  const required =
    geometry.rows * geometry.labelHeight +
    (geometry.rows - 1) * geometry.gapVertical +
    geometry.marginTop +
    geometry.marginBottom;
  return roundToTenth(required) <= geometry.sheetHeight + FIT_TOLERANCE_MM;
}

/** Alle Plätze eines Bogens zeilenweise: in der Zeile von links nach rechts, dann die nächste Zeile. */
export function slotRects(geometry: LabelSheetGeometry): SlotRect[] {
  return Array.from({ length: labelsPerSheet(geometry) }, (_, index) => slotRectAt(geometry, index));
}

function slotRectAt(geometry: LabelSheetGeometry, index: number): SlotRect {
  const column = index % geometry.columns;
  const row = Math.floor(index / geometry.columns);
  return {
    left: geometry.marginLeft + column * (geometry.labelWidth + geometry.gapHorizontal),
    top: geometry.marginTop + row * (geometry.labelHeight + geometry.gapVertical),
    width: geometry.labelWidth,
    height: geometry.labelHeight,
  };
}

/** Maße haben höchstens eine Nachkommastelle; Rundung entfernt Gleitkomma-Reste wie 297.40000000000003. */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
