import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Shape of `GET /api/settings` / `PUT /api/settings` (docs/requirements/bazaar-app, Round-25). */
export interface Settings {
  scannerPauseMs: number;
}

/**
 * App-wide Basar settings (Round-25) — loaded once via `provideAppInitializer` in
 * `app.config.ts` (analogous to `AuthService`, Round-9) before the first navigation.
 *
 * No `localStorage`: this is a Basar-wide setting, not a per-device preference (spec.md is
 * explicit about this), so it is re-fetched fresh on every app start rather than persisted
 * client-side.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  private readonly _settings = signal<Settings | null>(null);
  readonly settings = this._settings.asReadonly();

  /**
   * `?? 3000` fallback is DELIBERATE (not dead code): it covers the brief window before the
   * initial `GET /api/settings` load completes, preventing an `undefined` value from reaching
   * `scan-feedback`/`scan-dialog` on the very first tick.
   */
  readonly scannerPauseMs = computed(() => this._settings()?.scannerPauseMs ?? 3000);

  async load(): Promise<void> {
    const settings = await firstValueFrom(this.http.get<Settings>('/api/settings'));
    this._settings.set(settings);
  }
}
