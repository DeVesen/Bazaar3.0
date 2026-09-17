import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ImportSummary {
  created: number;
  updated: number;
  deleted: number;
}

export interface ImportRowError {
  row: number;
  errorCode: string;
  detail: string;
}

export interface DownloadResult {
  blob: Blob;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ArticlesImportExportApiService {
  private readonly http = inject(HttpClient);

  export(): Observable<DownloadResult> {
    return this.download('/api/articles/mine/export', 'meine-artikel.csv');
  }

  template(): Observable<DownloadResult> {
    return this.download('/api/articles/mine/template', 'meine-artikel-vorlage.csv');
  }

  import(file: File): Observable<ImportSummary> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImportSummary>('/api/articles/mine/import', formData);
  }

  private download(url: string, fallbackFileName: string): Observable<DownloadResult> {
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      map((response) => ({
        blob: response.body!,
        fileName: this.extractFileName(response.headers.get('Content-Disposition')) ?? fallbackFileName
      }))
    );
  }

  private extractFileName(header: string | null): string | null {
    const match = header?.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? null;
  }
}
