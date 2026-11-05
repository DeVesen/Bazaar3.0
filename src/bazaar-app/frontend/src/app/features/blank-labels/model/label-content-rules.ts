import { DEFAULT_LABEL_ELEMENT_SIZES, LabelElementSizes } from '../../../shared/components/label-sheet/label-layout';
import { formatDecimal, parseDecimal } from './number-input';

export const MAX_LABEL_NUMBER = 2147483646;
export const MAX_LABEL_COUNT = 5000;
const CURRENCY_SYMBOL_MAX_LENGTH = 3;
const MIN_ELEMENT_SIZE = 0.1;
const MAX_ELEMENT_SIZE = 100;
const MAX_ELEMENT_SIZE_DECIMALS = 1;

/** Formularfelder der Elementgrößen in mm; Zuordnung zu `LabelElementSizes` über `SIZE_FIELDS`. */
export type LabelSizeField = 'qrCodeSize' | 'sellerSymbolSize' | 'numberHeight' | 'currencyHeight';
export type LabelContentField = 'startNumber' | 'count' | 'currencySymbol' | LabelSizeField | 'startPosition';
export type LabelContentTexts = Record<LabelContentField, string>;
export type LabelContentErrors = Partial<Record<LabelContentField, string>>;

/** Ein gültiger Druckauftrag: Nummern, Startposition (leer = 1), Währungssymbol und Elementgrößen. */
export interface LabelRun {
  startNumber: number;
  count: number;
  startPosition: number;
  currencySymbol: string;
  sizes: LabelElementSizes;
}

/** Einzige Zuordnung Größenfeld → Elementgröße; alle Größen-Funktionen iterieren darüber. */
const SIZE_FIELDS: Record<LabelSizeField, keyof LabelElementSizes> = {
  qrCodeSize: 'qrCode',
  sellerSymbolSize: 'sellerSymbol',
  numberHeight: 'numberHeight',
  currencyHeight: 'currencyHeight',
};

const SIZE_FIELD_ENTRIES = Object.entries(SIZE_FIELDS) as [LabelSizeField, keyof LabelElementSizes][];

/** Wendet `map` auf jedes Größenfeld (mit seiner Elementgröße) an. */
function mapSizeFields<T>(map: (field: LabelSizeField, key: keyof LabelElementSizes) => T): Record<LabelSizeField, T> {
  return Object.fromEntries(SIZE_FIELD_ENTRIES.map(([field, key]) => [field, map(field, key)])) as Record<LabelSizeField, T>;
}

export interface LabelContentValidation {
  errors: LabelContentErrors;
  run: LabelRun | null;
}

/** Größen als Texte der Größenfelder („21,5"). */
export function sizeTexts(sizes: LabelElementSizes): Record<LabelSizeField, string> {
  return mapSizeFields((_, key) => formatDecimal(sizes[key]));
}

/** Erstes Öffnen: Währungssymbol und Größen sind vorbelegt; Startnummer, Anzahl und Startposition nie. */
export const INITIAL_CONTENT_TEXTS: LabelContentTexts = {
  startNumber: '',
  count: '',
  currencySymbol: '€',
  ...sizeTexts(DEFAULT_LABEL_ELEMENT_SIZES),
  startPosition: '',
};

const MESSAGES = {
  required: 'Pflichtfeld',
  startNumberRange: `Zahl von 1 bis ${MAX_LABEL_NUMBER}`,
  countRange: `Zahl von 1 bis ${MAX_LABEL_COUNT}`,
  lastNumberTooLarge: `Letzte Nummer darf ${MAX_LABEL_NUMBER} nicht überschreiten`,
  currencyLength: `1 bis ${CURRENCY_SYMBOL_MAX_LENGTH} Zeichen`,
  sizeRange: `Zahl von ${formatDecimal(MIN_ELEMENT_SIZE)} bis ${formatDecimal(MAX_ELEMENT_SIZE)} mit höchstens ${MAX_ELEMENT_SIZE_DECIMALS} Nachkommastelle`,
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
  const sizeChecks = checkSizes(texts);
  const errors = withoutNulls({
    startNumber: startNumber.error,
    count: count.error,
    currencySymbol: currencyErrorOf(texts.currencySymbol),
    ...sizeErrorsOf(sizeChecks),
    startPosition: startPosition.error,
    ...lastNumberErrorOf(startNumber, count, lastEdited),
  });
  if (Object.keys(errors).length > 0) return { errors, run: null };
  return {
    errors,
    run: {
      startNumber: startNumber.value,
      count: count.value,
      startPosition: startPosition.value,
      currencySymbol: texts.currencySymbol,
      sizes: sizesOf(sizeChecks, DEFAULT_LABEL_ELEMENT_SIZES),
    },
  };
}

/** Größen für das Etikett der Vorschau; ungültige oder leere Felder → jeweils die Vorgabe. */
export function previewElementSizes(texts: LabelContentTexts): LabelElementSizes {
  return sizesOf(checkSizes(texts), DEFAULT_LABEL_ELEMENT_SIZES);
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

function checkSize(text: string): NumberCheck {
  const parsed = parseDecimal(text);
  if (parsed.kind === 'empty') return { value: Number.NaN, error: MESSAGES.required };
  if (parsed.kind === 'invalid' || parsed.decimals > MAX_ELEMENT_SIZE_DECIMALS) return { value: Number.NaN, error: MESSAGES.sizeRange };
  return parsed.value >= MIN_ELEMENT_SIZE && parsed.value <= MAX_ELEMENT_SIZE
    ? { value: parsed.value, error: null }
    : { value: Number.NaN, error: MESSAGES.sizeRange };
}

function checkSizes(texts: LabelContentTexts): Record<LabelSizeField, NumberCheck> {
  return mapSizeFields((field) => checkSize(texts[field]));
}

function sizeErrorsOf(checks: Record<LabelSizeField, NumberCheck>): Record<LabelSizeField, string | null> {
  return mapSizeFields((field) => checks[field].error);
}

/** Gültige Werte übernehmen, sonst die Größe aus `fallback`. */
function sizesOf(checks: Record<LabelSizeField, NumberCheck>, fallback: LabelElementSizes): LabelElementSizes {
  const sizes = { ...fallback };
  for (const [field, key] of SIZE_FIELD_ENTRIES) {
    const check = checks[field];
    if (check.error === null) sizes[key] = check.value;
  }
  return sizes;
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
