import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Settings } from '../../../core/settings/settings.service';

export type { Settings };

/**
 * Dedicated `GET`/`PUT /api/settings` client for `settings-form` (docs/components/settings-form,
 * Round-25 Task 6b). Separate from `SettingsService` (Round-25 Task 5), which is the app-wide,
 * cached READ-only signal for consumers like `scan-feedback`/`scan-dialog` — this form needs a
 * live server round-trip per load/save, including `400` field-error handling, not the cached
 * value. Reuses `SettingsService`'s `Settings` interface as the single source of truth for the
 * wire shape rather than declaring a duplicate.
 */
@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Settings> {
    return this.http.get<Settings>('/api/settings');
  }

  update(settings: Settings): Observable<void> {
    return this.http.put<void>('/api/settings', settings);
  }
}
