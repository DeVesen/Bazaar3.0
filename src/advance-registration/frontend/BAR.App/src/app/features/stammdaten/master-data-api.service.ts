import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { MasterDataItem, MasterDataResource, MasterDataUpdatePayload } from '@shared/models/master-data-item';

export type { MasterDataItem, MasterDataResource, MasterDataUpdatePayload };

/**
 * Anlaufstelle des Fachbereichs Stammdaten fuer Marken/Kategorien (volle
 * CRUD-Flaeche, genutzt von den Admin-Seiten brands/ und categories/).
 */
@Injectable({ providedIn: 'root' })
export class MasterDataApiService {
  private readonly http = inject(HttpClient);

  getAll(resource: MasterDataResource): Observable<MasterDataItem[]> {
    return this.http.get<MasterDataItem[]>(`/api/${resource}`);
  }

  create(resource: MasterDataResource, name: string): Observable<MasterDataItem> {
    return this.http.post<MasterDataItem>(`/api/${resource}`, { name });
  }

  update(resource: MasterDataResource, id: string, payload: MasterDataUpdatePayload): Observable<MasterDataItem> {
    return this.http.put<MasterDataItem>(`/api/${resource}/${id}`, payload);
  }

  delete(resource: MasterDataResource, id: string): Observable<void> {
    return this.http.delete<void>(`/api/${resource}/${id}`);
  }
}
