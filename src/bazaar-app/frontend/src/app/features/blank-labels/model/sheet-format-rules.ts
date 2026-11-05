import {
  LabelSheetGeometry,
  fitsSheetHeight,
  fitsSheetWidth,
} from '../../../shared/components/label-sheet/label-geometry';
import { formatDecimal, parseDecimal } from './number-input';

export type SheetFormatField = keyof LabelSheetGeometry;
export type SheetFormatTexts = Record<SheetFormatField, string>;
export type SheetFormatErrors = Partial<Record<SheetFormatField, string>>;

export interface SheetFormatValidation {
  errors: SheetFormatErrors;
  /** Nur gesetzt, wenn alle Felder gültig sind und das Raster auf den Bogen passt. */
  geometry: LabelSheetGeometry | null;
}

export const SHEET_FORMAT_FIELDS: readonly SheetFormatField[] = [
  'sheetWidth',
  'sheetHeight',
  'labelWidth',
  'labelHeight',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gapHorizontal',
  'gapVertical',
  'columns',
  'rows',
  'offsetX',
  'offsetY',
];

export const FORMAT_NAME_MAX_LENGTH = 50;

/** Obergrenzen des Backend-Validators: jedes Maß höchstens 10000 mm, Spalten und Zeilen höchstens 1000. */
export const MAX_MEASURE_MM = 10000;
export const MAX_GRID_COUNT = 1000;
/** Betrag des Druckversatzes höchstens 20 mm (wie Backend `LabelSheetGeometry.MaxOffsetMm`). */
export const MAX_OFFSET_MM = 20;

export const SHEET_FORMAT_MESSAGES = {
  required: 'Pflichtfeld',
  notANumber: 'Bitte eine Zahl eingeben',
  positive: 'Muss größer als 0 sein',
  nonNegative: 'Darf nicht negativ sein',
  oneDecimal: 'Höchstens eine Nachkommastelle',
  wholeNumber: 'Ganze Zahl ab 1',
  maxMeasure: `Höchstens ${MAX_MEASURE_MM} mm`,
  maxCount: `Höchstens ${MAX_GRID_COUNT}`,
  offsetRange: `Zwischen −${MAX_OFFSET_MM} und ${MAX_OFFSET_MM} mm`,
  widthOverflow: 'Etiketten passen nicht in die Bogenbreite',
  heightOverflow: 'Etiketten passen nicht in die Bogenhöhe',
} as const;

const POSITIVE_FIELDS: ReadonlySet<SheetFormatField> = new Set(['sheetWidth', 'sheetHeight', 'labelWidth', 'labelHeight']);
const COUNT_FIELDS: ReadonlySet<SheetFormatField> = new Set(['columns', 'rows']);
/** Vorzeichenbehaftet, nicht Teil der Rasterprüfung (nicht in WIDTH_FIELDS/HEIGHT_FIELDS). */
const OFFSET_FIELDS: ReadonlySet<SheetFormatField> = new Set(['offsetX', 'offsetY']);
const WIDTH_FIELDS: readonly SheetFormatField[] = ['sheetWidth', 'labelWidth', 'marginLeft', 'marginRight', 'gapHorizontal', 'columns'];
const HEIGHT_FIELDS: readonly SheetFormatField[] = ['sheetHeight', 'labelHeight', 'marginTop', 'marginBottom', 'gapVertical', 'rows'];

interface FieldCheck {
  field: SheetFormatField;
  value: number;
  error: string | null;
}

export function textsFromGeometry(geometry: LabelSheetGeometry): SheetFormatTexts {
  return Object.fromEntries(SHEET_FORMAT_FIELDS.map((field) => [field, formatDecimal(geometry[field])])) as SheetFormatTexts;
}

/**
 * Prüft jedes Feld und danach, ob das Raster auf den Bogen passt. Ein Fehler der Summe steht am
 * zuletzt geänderten Feld dieser Achse, sonst an „Spalten" (Breite) bzw. „Zeilen" (Höhe).
 */
export function validateSheetFormat(texts: SheetFormatTexts, lastEdited: SheetFormatField | null): SheetFormatValidation {
  const checks = SHEET_FORMAT_FIELDS.map((field) => checkField(field, texts[field]));
  const fieldErrors = errorsOf(checks);
  if (Object.keys(fieldErrors).length > 0) return { errors: fieldErrors, geometry: null };
  const geometry = Object.fromEntries(checks.map((check) => [check.field, check.value])) as unknown as LabelSheetGeometry;
  const fitErrors = fitErrorsOf(geometry, lastEdited);
  return { errors: fitErrors, geometry: Object.keys(fitErrors).length === 0 ? geometry : null };
}

export function normalizeFormatName(name: string): string {
  return name.trim();
}

/** Ein leerer Name ist kein Fehlertext am Feld, sperrt aber „Speichern" (`canSaveFormat`). */
export function formatNameError(name: string): string | null {
  return normalizeFormatName(name).length > FORMAT_NAME_MAX_LENGTH ? `Höchstens ${FORMAT_NAME_MAX_LENGTH} Zeichen` : null;
}

export function canSaveFormat(validation: SheetFormatValidation, name: string): boolean {
  const normalized = normalizeFormatName(name);
  return validation.geometry !== null && normalized.length > 0 && normalized.length <= FORMAT_NAME_MAX_LENGTH;
}

function checkField(field: SheetFormatField, text: string): FieldCheck {
  const parsed = parseDecimal(text);
  if (parsed.kind === 'empty') return { field, value: Number.NaN, error: SHEET_FORMAT_MESSAGES.required };
  if (parsed.kind === 'invalid') return { field, value: Number.NaN, error: SHEET_FORMAT_MESSAGES.notANumber };
  return { field, value: parsed.value, error: rangeErrorOf(field, parsed.value, parsed.decimals) };
}

function rangeErrorOf(field: SheetFormatField, value: number, decimals: number): string | null {
  if (COUNT_FIELDS.has(field)) return countErrorOf(value, decimals);
  if (OFFSET_FIELDS.has(field)) return offsetErrorOf(value, decimals);
  return measureErrorOf(field, value, decimals);
}

function offsetErrorOf(value: number, decimals: number): string | null {
  if (decimals > 1) return SHEET_FORMAT_MESSAGES.oneDecimal;
  return Math.abs(value) > MAX_OFFSET_MM ? SHEET_FORMAT_MESSAGES.offsetRange : null;
}

function countErrorOf(value: number, decimals: number): string | null {
  if (decimals > 0 || value < 1) return SHEET_FORMAT_MESSAGES.wholeNumber;
  return value > MAX_GRID_COUNT ? SHEET_FORMAT_MESSAGES.maxCount : null;
}

function measureErrorOf(field: SheetFormatField, value: number, decimals: number): string | null {
  if (decimals > 1) return SHEET_FORMAT_MESSAGES.oneDecimal;
  if (POSITIVE_FIELDS.has(field) && value <= 0) return SHEET_FORMAT_MESSAGES.positive;
  if (value < 0) return SHEET_FORMAT_MESSAGES.nonNegative;
  return value > MAX_MEASURE_MM ? SHEET_FORMAT_MESSAGES.maxMeasure : null;
}

function errorsOf(checks: FieldCheck[]): SheetFormatErrors {
  return Object.fromEntries(
    checks.filter((check) => check.error !== null).map((check) => [check.field, check.error]),
  ) as SheetFormatErrors;
}

function fitErrorsOf(geometry: LabelSheetGeometry, lastEdited: SheetFormatField | null): SheetFormatErrors {
  const widthError = fitsSheetWidth(geometry) ? {} : { [errorFieldOf(WIDTH_FIELDS, lastEdited, 'columns')]: SHEET_FORMAT_MESSAGES.widthOverflow };
  const heightError = fitsSheetHeight(geometry) ? {} : { [errorFieldOf(HEIGHT_FIELDS, lastEdited, 'rows')]: SHEET_FORMAT_MESSAGES.heightOverflow };
  return { ...widthError, ...heightError };
}

function errorFieldOf(
  axisFields: readonly SheetFormatField[],
  lastEdited: SheetFormatField | null,
  fallback: SheetFormatField,
): SheetFormatField {
  return lastEdited !== null && axisFields.includes(lastEdited) ? lastEdited : fallback;
}
