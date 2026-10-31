import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Obergrenze je Freitext — identisch zu `PrintTexts.MaxLength` im Backend. */
export const PRINT_TEXT_MAX_LENGTH = 5000;

export type PrintTextField = 'text1' | 'text2' | 'text3' | 'text4' | 'text5';
export type PrintTextSection = 'abgabeBeleg' | 'verkaeuferUebersicht';
export type PrintTextSet = Record<PrintTextField, string>;

/** Artikel-Aushang: vier Freitexte — Kopfzeile links/Mitte, Fußzeile links/Mitte. */
export type AushangTextField = 'text1' | 'text2' | 'text3' | 'text4';
export type AushangTextSet = Record<AushangTextField, string>;

export interface PrintTexts {
  abgabeBeleg: PrintTextSet;
  verkaeuferUebersicht: PrintTextSet;
  articleAushang: AushangTextSet;
}

function emptyTextSet(): PrintTextSet {
  return { text1: '', text2: '', text3: '', text4: '', text5: '' };
}

function emptyAushangTextSet(): AushangTextSet {
  return { text1: '', text2: '', text3: '', text4: '' };
}

export function emptyPrintTexts(): PrintTexts {
  return {
    abgabeBeleg: emptyTextSet(),
    verkaeuferUebersicht: emptyTextSet(),
    articleAushang: emptyAushangTextSet(),
  };
}

/**
 * `GET`/`PUT /api/settings/print-texts` — die vierzehn Freitexte der Druckdokumente
 * (Abgabe-Beleg und Verkäufer-Übersicht je fünf, Artikel-Aushang vier). Lesen darf jeder angemeldete Nutzer (der Druck braucht sie),
 * Schreiben nur ein Admin.
 */
@Injectable({ providedIn: 'root' })
export class PrintTextsApi {
  private readonly http = inject(HttpClient);

  get(): Observable<PrintTexts> {
    return this.http.get<PrintTexts>('/api/settings/print-texts');
  }

  update(texts: PrintTexts): Observable<void> {
    return this.http.put<void>('/api/settings/print-texts', texts);
  }
}
