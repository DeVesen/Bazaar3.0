import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * `POST /api/import/preview` response (docs/requirements/bazaar-app/api/import.md §1). Read-only —
 * this endpoint writes nothing.
 */
export interface ImportPreviewResult {
  sellerCount: number;
  articleCount: number;
  newSellers: number;
  replacedSellers: number;
  skippedSellers: SkippedSeller[];
  unknownSellerTypes: UnknownSellerType[];
  newBrands: number;
  newCategories: number;
}

/** A seller not replaced by the import because they already have sold/settled articles. */
export interface SkippedSeller {
  id: string;
  name: string;
  reason: string;
  soldCount?: number;
}

/** A seller type present in the import file that does not exist yet — blocks confirm until mapped. */
export interface UnknownSellerType {
  name: string;
  affectedSellers: number;
}

/** Admin decisions sent to `POST /api/import` alongside the file (§2). */
export interface ImportOptions {
  sellerTypeMapping: Record<string, string>;
  importBrands: boolean;
  importCategories: boolean;
}

/** `POST /api/import` response (§2) — the actually-applied counts after the transaction commits. */
export interface ImportRunResult {
  importedSellers: number;
  importedArticles: number;
  skippedSellers: number;
  importedBrands: number;
  importedCategories: number;
}

/**
 * `import-panel` (docs/components/import-panel/component.md, Round-26 Task 6). Two-step
 * multipart upload — preview writes nothing, run applies the transaction — see api/import.md
 * for why the file is sent twice rather than cached server-side.
 *
 * `FormData` bodies must NOT get a manual `Content-Type` header — `HttpClient` derives the
 * correct `multipart/form-data` boundary from the `FormData` instance itself; setting the header
 * by hand breaks that boundary.
 */
@Injectable({ providedIn: 'root' })
export class ImportApi {
  private readonly http = inject(HttpClient);

  preview(file: File): Observable<ImportPreviewResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportPreviewResult>('/api/import/preview', formData);
  }

  run(file: File, options: ImportOptions): Observable<ImportRunResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    return this.http.post<ImportRunResult>('/api/import', formData);
  }
}
