import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface ArticleImportResult {
  importedCount: number;
}

/** Längste Wartezeit auf die Antwort des synchronen Imports (Spec: 3 Minuten). */
export const IMPORT_TIMEOUT_MS = 180_000;

@Injectable({ providedIn: 'root' })
export class ArticleImportApi {
  private readonly http = inject(HttpClient);

  /** Sendet die Datei und die Browser-Sprache (bestimmt das Dezimalzeichen einer CSV) als multipart-Request. */
  importArticles(sellerId: string, file: File, locale: string): Observable<ArticleImportResult> {
    const body = new FormData();
    body.append('file', file, file.name);
    body.append('locale', locale);
    return this.http
      .post<ArticleImportResult>(`/api/sellers/${sellerId}/articles/import`, body)
      .pipe(timeout(IMPORT_TIMEOUT_MS));
  }
}
