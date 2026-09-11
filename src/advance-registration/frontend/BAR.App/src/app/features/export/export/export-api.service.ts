import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ExportOptions {
  includeBrands: boolean;
  includeCategories: boolean;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ExportApiService {
  private readonly http = inject(HttpClient);

  export(options: ExportOptions): Observable<ExportResult> {
    const params = {
      includeBrands: String(options.includeBrands),
      includeCategories: String(options.includeCategories)
    };

    return this.http
      .get('/api/export', { params, responseType: 'blob', observe: 'response' })
      .pipe(
        map((response) => ({
          blob: response.body!,
          fileName: this.extractFileName(response.headers.get('Content-Disposition'))
        }))
      );
  }

  private extractFileName(header: string | null): string {
    const match = header?.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? 'basar-export.json';
  }
}
