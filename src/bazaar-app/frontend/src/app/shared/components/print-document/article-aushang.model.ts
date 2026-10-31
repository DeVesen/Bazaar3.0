/** Eine Artikelzeile des Aushangs (Bezeichnung, Marke, Farbe, Größe, Preis); die Kategorie bildet die Gruppe. */
export interface AushangArticle {
  name: string;
  brand: string;
  category: string;
  size: string | null;
  color: string | null;
  price: number;
}

/** Freitext 1/2: Kopfzeile links/Mitte · 3/4: Fußzeile links/Mitte (Markdown). Rechts stehen feste Werte. */
export interface AushangFreitexts {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
}

export interface AushangGroup {
  category: string;
  articles: AushangArticle[];
}

export type AushangRow =
  | { kind: 'group'; label: string }
  | { kind: 'article'; article: AushangArticle };

export interface AushangModel {
  printedAt: Date;
  freitexts: AushangFreitexts;
  groups: AushangGroup[];
}

export interface AushangInput {
  articles: AushangArticle[];
  freitexts: AushangFreitexts;
  printedAt: Date;
}

/**
 * Deutsche Sortierung, Zahlen als Zahlen (86 vor 104), Groß-/Kleinschreibung egal. Texte wie
 * „XL" ordnen sich alphabetisch zwischen die Zahlen ein.
 */
const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });

function isEmpty(value: string | null): boolean {
  return value === null || value.trim() === '';
}

/** Leere Werte stehen hinter gefüllten, untereinander sind sie gleich. */
function compareOptional(left: string | null, right: string | null): number {
  const leftEmpty = isEmpty(left);
  const rightEmpty = isEmpty(right);
  if (leftEmpty || rightEmpty) {
    return Number(leftEmpty) - Number(rightEmpty);
  }
  return collator.compare(left as string, right as string);
}

function compareArticles(left: AushangArticle, right: AushangArticle): number {
  return (
    compareOptional(left.brand, right.brand) ||
    compareOptional(left.size, right.size) ||
    compareOptional(left.color, right.color) ||
    collator.compare(left.name, right.name)
  );
}

/**
 * Gruppiert nach Kategorie (alphabetisch) und sortiert je Kategorie nach Marke → Größe → Farbe →
 * Bezeichnung. Das Eingabe-Array bleibt unverändert.
 */
export function buildArticleAushangModel(input: AushangInput): AushangModel {
  const byCategory = new Map<string, AushangArticle[]>();
  for (const entry of input.articles) {
    const category = entry.category.trim();
    const bucket = byCategory.get(category);
    if (bucket) {
      bucket.push(entry);
    } else {
      byCategory.set(category, [entry]);
    }
  }

  const groups = [...byCategory.entries()]
    .sort(([left], [right]) => collator.compare(left, right))
    .map(([category, articles]): AushangGroup => ({
      category,
      articles: [...articles].sort(compareArticles),
    }));

  return { printedAt: input.printedAt, freitexts: input.freitexts, groups };
}

export function flattenAushangGroups(groups: AushangGroup[]): AushangRow[] {
  return groups.flatMap((group): AushangRow[] => [
    { kind: 'group', label: group.category },
    ...group.articles.map((entry): AushangRow => ({ kind: 'article', article: entry })),
  ]);
}
