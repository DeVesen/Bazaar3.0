import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Obergrenze je Freitext — identisch zu `PrintTexts.MaxLength` im Backend. */
export const PRINT_TEXT_MAX_LENGTH = 5000;

export type PrintTextField = 'text1' | 'text2' | 'text3' | 'text4' | 'text5';
export type PrintTextSection = 'abgabeBeleg' | 'verkaeuferUebersicht';
export type PrintTextSet = Record<PrintTextField, string>;
export type PrintTexts = Record<PrintTextSection, PrintTextSet>;

function emptyTextSet(): PrintTextSet {
  return { text1: '', text2: '', text3: '', text4: '', text5: '' };
}

export function emptyPrintTexts(): PrintTexts {
  return { abgabeBeleg: emptyTextSet(), verkaeuferUebersicht: emptyTextSet() };
}

/**
 * `GET`/`PUT /api/settings/print-texts` — die zehn Freitexte der Belege (Abgabe-Beleg und
 * Verkäufer-Übersicht, je fünf). Lesen darf jeder angemeldete Nutzer (der Druck braucht sie),
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
