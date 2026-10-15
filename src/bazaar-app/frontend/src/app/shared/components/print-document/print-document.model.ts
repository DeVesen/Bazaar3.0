export interface PrintSeller {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
}

/** Eine Artikelzeile der Druck-Tabelle (Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis). */
export interface PrintArticle {
  number: number;
  name: string;
  category: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  price: number;
  status: string;
}

/** Freitext 1/2: Kopfzeile links/Mitte · 3: über der Artikelliste · 4/5: Fußzeile links/Mitte (Markdown). */
export interface PrintFreitexts {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
}

/** Kennzahl-Kachel: Titel links oben, darunter der größere Wert. */
export interface PrintTile {
  title: string;
  value: string;
}

export type PrintArticleStatus = 'registered' | 'selling' | 'sold' | 'returned';

export interface PrintGroup {
  status: PrintArticleStatus;
  label: string;
  articles: PrintArticle[];
}

export type PrintRow =
  | { kind: 'group'; label: string; count: number }
  | { kind: 'article'; article: PrintArticle };

export interface PrintDocumentModel {
  seller: PrintSeller;
  printedAt: Date;
  freitexts: PrintFreitexts;
  tilesA: PrintTile[];
  tilesB: PrintTile[];
  groups: PrintGroup[];
}

const GROUP_ORDER: readonly { status: PrintArticleStatus; label: string }[] = [
  { status: 'registered', label: 'Registriert' },
  { status: 'selling', label: 'Im Verkauf' },
  { status: 'sold', label: 'Verkauft' },
  { status: 'returned', label: 'Zurückgegeben' },
];

export const REGISTERED_STATUS: PrintArticleStatus = 'registered';

/**
 * de-DE ohne `CurrencyPipe`/`LOCALE_ID` (im Projekt ist keine Locale registriert).
 *
 * Gilt für die Druckdokumente. Gleichartige private Kopien stehen noch in `settlement-panel.ts`,
 * `verkaeufer-dialog.ts` und `statistics-page.ts`; sie in eine gemeinsame Hilfsfunktion
 * zusammenzuführen ist ein eigenes Folge-Refactoring und nicht Teil dieser Änderung.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

/**
 * Der Satz kommt schon in Prozent (12,5 heißt „12,5 %"), nicht als Bruch 0,125.
 *
 * Gleichartige private Kopien stehen noch in `verkaeufer-dialog.ts` und `statistics-page.ts`;
 * Zusammenführung wie bei `formatCurrency` als eigenes Folge-Refactoring.
 */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value)} %`;
}

export function groupArticles(articles: PrintArticle[]): PrintGroup[] {
  return GROUP_ORDER.map(({ status, label }) => ({
    status,
    label,
    articles: articles
      .filter((entry) => entry.status === status)
      .sort((left, right) => left.number - right.number),
  })).filter((group) => group.articles.length > 0);
}

export function flattenGroups(groups: PrintGroup[]): PrintRow[] {
  return groups.flatMap((group): PrintRow[] => [
    { kind: 'group', label: group.label, count: group.articles.length },
    ...group.articles.map((entry): PrintRow => ({ kind: 'article', article: entry })),
  ]);
}

function countArticles(groups: PrintGroup[]): number {
  return groups.reduce((sum, group) => sum + group.articles.length, 0);
}

function countInGroup(groups: PrintGroup[], status: PrintArticleStatus): number {
  return groups.find((group) => group.status === status)?.articles.length ?? 0;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Berechnete (nicht die tatsächlich bezahlte) Gebühr: Anzahl der Artikel im Dokument × Gebühr je Artikel. */
function feeTile(articleCount: number, feePerItem: number): PrintTile {
  return {
    title: `Gebühr ${formatCurrency(feePerItem)} / Artikel`,
    value: formatCurrency(roundToCents(articleCount * feePerItem)),
  };
}

export interface AbgabeBelegInput {
  seller: PrintSeller;
  articles: PrintArticle[];
  freitexts: PrintFreitexts;
  feePerItem: number;
  commissionRate: number;
  printedAt: Date;
}

export function buildAbgabeBelegModel(input: AbgabeBelegInput): PrintDocumentModel {
  const groups = groupArticles(input.articles);
  const count = countArticles(groups);
  return {
    seller: input.seller,
    printedAt: input.printedAt,
    freitexts: input.freitexts,
    groups,
    tilesA: [
      { title: 'Verkäufer-ID', value: input.seller.id },
      { title: 'Anzahl Artikel', value: String(count) },
    ],
    tilesB: [
      feeTile(count, input.feePerItem),
      { title: 'Provision', value: formatPercent(input.commissionRate) },
    ],
  };
}

export interface VerkaeuferUebersichtInput {
  seller: PrintSeller;
  articles: PrintArticle[];
  freitexts: PrintFreitexts;
  feePerItem: number;
  settlement: { revenue: number; commission: number; payout: number; commissionRate: number };
  printedAt: Date;
}

export function buildVerkaeuferUebersichtModel(input: VerkaeuferUebersichtInput): PrintDocumentModel {
  const groups = groupArticles(input.articles.filter((entry) => entry.status !== REGISTERED_STATUS));
  const count = countArticles(groups);
  const { settlement } = input;
  return {
    seller: input.seller,
    printedAt: input.printedAt,
    freitexts: input.freitexts,
    groups,
    tilesA: [
      { title: 'Verkäufer-ID', value: input.seller.id },
      { title: 'Anzahl Artikel', value: String(count) },
      { title: 'Anzahl offener Artikel', value: String(countInGroup(groups, 'selling')) },
      { title: 'Anzahl verkaufter Artikel', value: String(countInGroup(groups, 'sold')) },
      { title: 'Einnahmen', value: formatCurrency(settlement.revenue) },
    ],
    tilesB: [
      feeTile(count, input.feePerItem),
      {
        title: `Provision ${formatPercent(settlement.commissionRate)}`,
        value: formatCurrency(settlement.commission),
      },
      { title: 'Verdienst', value: formatCurrency(settlement.payout) },
    ],
  };
}
