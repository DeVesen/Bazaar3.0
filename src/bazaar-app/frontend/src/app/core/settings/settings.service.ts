import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';

/** Shape of `GET /api/settings` / `PUT /api/settings` (docs/requirements/bazaar-app, Round-25). */
export interface Settings {
  scannerPauseMs: number;
  /** `true` = Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = sofort (nur bei Gebühr je Stück 0). */
  releaseOnClose: boolean;
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

  /**
   * `?? true` is the same deliberate pre-load fallback as above: until `GET /api/settings` has
   * answered, the Freigeben-Popup behaves as it always did (release on close).
   */
  readonly releaseOnClose = computed(() => this._settings()?.releaseOnClose ?? true);

  /**
   * Errors (401 for the common not-yet-logged-in case, but any HTTP failure) are swallowed
   * here, not propagated: `load()` is awaited by the `provideAppInitializer` in
   * `app.config.ts`, and a rejected app initializer stops `bootstrapApplication()` from
   * rendering the app at all (see `main.ts`'s `.catch(err => console.error(err))`). Every
   * fresh visit, logout, or expired token would otherwise blank the whole app instead of just
   * `/settings`. `scannerPauseMs`'s `?? 3000` fallback covers `settings()` staying `null`.
   */
  async load(): Promise<void> {
    const settings = await firstValueFrom(
      this.http.get<Settings>('/api/settings').pipe(
        catchError((err) => {
          console.error('SettingsService.load failed, falling back to defaults', err);
          return of(null);
        }),
      ),
    );
    if (settings) {
      this._settings.set(settings);
    }
  }
}
