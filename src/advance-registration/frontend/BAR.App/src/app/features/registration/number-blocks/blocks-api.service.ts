import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface BlockDto {
  id: string;
  sellerId: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
  assignedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BlocksApiService {
  private readonly http = inject(HttpClient);

  getMine(): Observable<BlockDto[]> {
    return this.http.get<BlockDto[]>('/api/blocks/mine');
  }
}
