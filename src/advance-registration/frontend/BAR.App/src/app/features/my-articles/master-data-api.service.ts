import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type MasterDataResource = 'brands' | 'categories';

export interface MasterDataItem {
  id: string;
  name: string;
  original: boolean;
  articleCount?: number;
}

export interface MasterDataUpdatePayload {
  name: string;
  original: boolean;
}

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
