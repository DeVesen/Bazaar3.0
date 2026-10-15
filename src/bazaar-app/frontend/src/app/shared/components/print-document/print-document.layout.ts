/**
 * Feste Maße des Druckdokuments in Millimetern. Kopf, Verkäufer-Block, Kennzahl-Kachel-Zeilen,
 * Fortsetzungszeile und Fußzeile haben feste Höhen; nur Freitext 3 ist variabel und wird zur
 * Laufzeit gemessen. Daraus ergibt sich, wie viele Tabellenzeilen auf eine Seite passen — die
 * Seitenaufteilung geschieht selbst, weil `counter(pages)`/Margin-Boxes unter iOS/Safari fehlen
 * und „Seite x von y" auf allen Geräten stehen muss.
 *
 * `pageHeightMm` liegt bewusst 1 mm unter 297 mm: eine Seite mit exakt A4-Höhe erzeugt durch
 * Rundung gelegentlich eine zusätzliche leere Seite.
 *
 * `maxFreitext3Mm` begrenzt Freitext 3 (bis 5000 Zeichen erlaubt): Ein längerer Text wird
 * abgeschnitten, statt Artikelliste und Fußzeile von Seite 1 zu verdrängen. 150 mm lassen
 * 28 mm Listenbereich, also Tabellenkopf und zwei Zeilen.
 */
export const PRINT_LAYOUT = {
  pageWidthMm: 210,
  pageHeightMm: 296,
  paddingMm: 10,
  headerMm: 18,
  sellerBlockMm: 33,
  tileRowAMm: 13.4,
  tileRowBMm: 13.3,
  continuationMm: 8,
  footerMm: 14,
  tableHeadMm: 7,
  rowMm: 7,
  safetyMm: 2,
  maxFreitext3Mm: 150,
} as const;

/** CSS rechnet 1 mm immer mit 96 / 25,4 px — auf dem Bildschirm wie im Druck. */
export const PX_PER_MM = 96 / 25.4;

function innerHeightMm(): number {
  return PRINT_LAYOUT.pageHeightMm - 2 * PRINT_LAYOUT.paddingMm;
}

/** Höhe des Listenbereichs auf Seite 1, abhängig von der gemessenen Höhe von Freitext 3. */
export function firstPageListHeightMm(freitext3Mm: number): number {
  const { headerMm, sellerBlockMm, tileRowAMm, tileRowBMm, footerMm } = PRINT_LAYOUT;
  return (
    innerHeightMm() - headerMm - sellerBlockMm - tileRowAMm - tileRowBMm - freitext3Mm - footerMm
  );
}

/** Höhe des Listenbereichs ab Seite 2: Kopfzeile, Fortsetzungszeile, Liste, Fußzeile. */
export function restPageListHeightMm(): number {
  const { headerMm, continuationMm, footerMm } = PRINT_LAYOUT;
  return innerHeightMm() - headerMm - continuationMm - footerMm;
}

/** Anzahl Zeilen, die unter dem Tabellenkopf in einen Listenbereich der Höhe `listHeightMm` passen. */
export function listCapacityRows(listHeightMm: number): number {
  const { tableHeadMm, safetyMm, rowMm } = PRINT_LAYOUT;
  return Math.max(0, Math.floor((listHeightMm - tableHeadMm - safetyMm) / rowMm));
}

/**
 * Verteilt Zeilen auf Seiten. Eine Gruppenüberschrift steht nie allein am Seitenende: Würde sie
 * die letzte Zeile einer Seite, rückt sie auf die nächste Seite (außer sie wäre dort die einzige
 * Zeile, sonst käme die Schleife nicht voran).
 */
export function paginateRows<T>(
  rows: readonly T[],
  firstCapacity: number,
  restCapacity: number,
  isHeading: (row: T) => boolean = () => false,
): T[][] {
  const pages: T[][] = [];
  const rest = Math.max(1, restCapacity);
  let capacity = Math.max(0, firstCapacity);
  let start = 0;

  do {
    let end = Math.min(rows.length, start + capacity);
    const headingWouldEndPage = end < rows.length && end - start > 1 && isHeading(rows[end - 1]);
    if (headingWouldEndPage) {
      end -= 1;
    }
    pages.push(rows.slice(start, end));
    start = end;
    capacity = rest;
  } while (start < rows.length);

  return pages;
}
