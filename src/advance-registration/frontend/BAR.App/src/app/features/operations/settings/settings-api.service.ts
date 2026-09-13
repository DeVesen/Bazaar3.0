import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsDto {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultTypeId: string | null;
  infoText: string | null;
  startNumber: number | null;
  blockSize: number | null;
  defaultBlockCount: number | null;
}

export interface SettingsPayload {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultTypeId: string | null;
  infoText: string | null;
  startNumber: number;
  blockSize: number;
  defaultBlockCount: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);

  get(): Observable<SettingsDto | null> {
    return this.http.get<SettingsDto | null>('/api/settings');
  }

  update(payload: SettingsPayload): Observable<SettingsDto> {
    return this.http.put<SettingsDto>('/api/settings', payload);
  }
}
