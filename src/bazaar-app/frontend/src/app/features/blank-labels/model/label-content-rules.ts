import { parseDecimal } from './number-input';

export const MAX_LABEL_NUMBER = 2147483646;
export const MAX_LABEL_COUNT = 5000;
const CURRENCY_SYMBOL_MAX_LENGTH = 3;

export type LabelContentField = 'startNumber' | 'count' | 'currencySymbol' | 'startPosition';
export type LabelContentTexts = Record<LabelContentField, string>;
export type LabelContentErrors = Partial<Record<LabelContentField, string>>;

/** Ein gültiger Druckauftrag: Nummern, Startposition (leer = 1) und Währungssymbol. */
export interface LabelRun {
  startNumber: number;
  count: number;
  startPosition: number;
  currencySymbol: string;
}

export interface LabelContentValidation {
  errors: LabelContentErrors;
  run: LabelRun | null;
}

/** Erstes Öffnen: nur das Währungssymbol ist vorbelegt; Startnummer, Anzahl und Startposition nie. */
export const INITIAL_CONTENT_TEXTS: LabelContentTexts = { startNumber: '', count: '', currencySymbol: '€', startPosition: '' };

const MESSAGES = {
  required: 'Pflichtfeld',
  startNumberRange: `Zahl von 1 bis ${MAX_LABEL_NUMBER}`,
  countRange: `Zahl von 1 bis ${MAX_LABEL_COUNT}`,
  lastNumberTooLarge: `Letzte Nummer darf ${MAX_LABEL_NUMBER} nicht überschreiten`,
  currencyLength: `1 bis ${CURRENCY_SYMBOL_MAX_LENGTH} Zeichen`,
} as const;

interface NumberCheck {
  value: number;
  error: string | null;
}

/**
 * `perSheet` ist die Anzahl pro Seite des gültigen Bogenformats, sonst `null` (dann prüft die
 * Startposition nur die Untergrenze). Überschreitet die letzte Nummer die Grenze, steht der
 * Fehler am zuletzt geänderten der beiden Felder, sonst an „Anzahl".
 */
export function validateLabelContent(
  texts: LabelContentTexts,
  perSheet: number | null,
  lastEdited: LabelContentField | null,
): LabelContentValidation {
  const startNumber = checkWholeNumber(texts.startNumber, MAX_LABEL_NUMBER, MESSAGES.startNumberRange);
  const count = checkWholeNumber(texts.count, MAX_LABEL_COUNT, MESSAGES.countRange);
  const startPosition = checkStartPosition(texts.startPosition, perSheet);
  const errors = withoutNulls({
    startNumber: startNumber.error,
    count: count.error,
    currencySymbol: currencyErrorOf(texts.currencySymbol),
    startPosition: startPosition.error,
    ...lastNumberErrorOf(startNumber, count, lastEdited),
  });
  if (Object.keys(errors).length > 0) return { errors, run: null };
  return {
    errors,
    run: { startNumber: startNumber.value, count: count.value, startPosition: startPosition.value, currencySymbol: texts.currencySymbol },
  };
}

/** Nummer für das Etikett der Vorschau; ungültig oder leer → kein QR-Code und kein Klartext. */
export function previewStartNumber(text: string): number | null {
  const check = checkWholeNumber(text, MAX_LABEL_NUMBER, MESSAGES.startNumberRange);
  return check.error === null ? check.value : null;
}

/** Startposition der Vorschau von Bereich C; ungültig oder leer → 1. */
export function previewStartPosition(text: string, perSheet: number): number {
  const check = checkStartPosition(text, perSheet);
  return check.error === null ? check.value : 1;
}

function checkWholeNumber(text: string, max: number, rangeMessage: string): NumberCheck {
  const parsed = parseDecimal(text);
  if (parsed.kind === 'empty') return { value: Number.NaN, error: MESSAGES.required };
  if (parsed.kind === 'invalid' || parsed.decimals > 0) return { value: Number.NaN, error: rangeMessage };
  return parsed.value >= 1 && parsed.value <= max ? { value: parsed.value, error: null } : { value: Number.NaN, error: rangeMessage };
}

function checkStartPosition(text: string, perSheet: number | null): NumberCheck {
  if (text.trim() === '') return { value: 1, error: null };
  const max = perSheet ?? Number.MAX_SAFE_INTEGER;
  return checkWholeNumber(text, max, perSheet === null ? 'Ganze Zahl ab 1' : `Platz 1 bis ${perSheet}`);
}

/** Zählt Unicode-Zeichen wie das Backend (Runes), nicht UTF-16-Einheiten. */
function currencyErrorOf(symbol: string): string | null {
  const length = [...symbol].length;
  return length >= 1 && length <= CURRENCY_SYMBOL_MAX_LENGTH ? null : MESSAGES.currencyLength;
}

function lastNumberErrorOf(startNumber: NumberCheck, count: NumberCheck, lastEdited: LabelContentField | null): LabelContentErrors {
  if (startNumber.error !== null || count.error !== null) return {};
  if (startNumber.value + count.value - 1 <= MAX_LABEL_NUMBER) return {};
  const field = lastEdited === 'startNumber' ? 'startNumber' : 'count';
  return { [field]: MESSAGES.lastNumberTooLarge };
}

function withoutNulls(errors: Partial<Record<LabelContentField, string | null>>): LabelContentErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([, error]) => error !== null && error !== undefined),
  ) as LabelContentErrors;
}
