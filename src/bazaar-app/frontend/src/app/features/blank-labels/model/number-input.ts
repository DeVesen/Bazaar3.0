export type ParsedNumber = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number; decimals: number };

const DECIMAL_PATTERN = /^-?\d+(?:[.,](\d+))?$/;

/** Liest eine Eingabe wie „8,5" oder „8.5"; Leerraum an den Enden zählt nicht. */
export function parseDecimal(text: string): ParsedNumber {
  const trimmed = text.trim();
  if (trimmed === '') return { kind: 'empty' };
  const match = DECIMAL_PATTERN.exec(trimmed);
  if (match === null) return { kind: 'invalid' };
  return { kind: 'number', value: Number(trimmed.replace(',', '.')), decimals: match[1]?.length ?? 0 };
}

/** Zeigt mm-Werte mit deutschem Komma („8,5"). */
export function formatDecimal(value: number): string {
  return String(value).replace('.', ',');
}
