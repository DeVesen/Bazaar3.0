import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { SettingsApi } from '../../data/settings-api';

interface ValidationProblemBody {
  errors?: Record<string, string[]>;
}

const MIN_SCANNER_PAUSE_MS = 500;
const MAX_SCANNER_PAUSE_MS = 15000;

/**
 * docs/components/settings-form/component.md — single-field admin form for `ScannerPauseMs`
 * (Round-25 Task 6b). Loads via its own `SettingsApi` (not `SettingsService`, Task 5's cached
 * app-wide READ signal — see the doc's Abschnitt 3 for why the two stay separate).
 *
 * Seeding the loaded value (design decision, see task report): `input-group` (Task 6a) exposes
 * no `@Input` to set its current value from a parent — its `rawValue`/`priceValue` signals are
 * internally owned, and the only public write entry point is `applyExternalValue()` (doc-comment:
 * "Öffentlicher Schreibzugriff für eine Verwendungsstelle … setzt den Feldwert und emittiert
 * `valueChange`, wie ein interner Scan-Treffer"). This component therefore calls
 * `applyExternalValue(String(settings.scannerPauseMs))` on the `#scannerPauseInput` view child
 * once the initial `GET /api/settings` response arrives — exactly the pattern the input-group
 * doc documents for Seller-Search's camera-mode consumer (Abschnitt 3). The load is kicked off
 * in `ngAfterViewInit` rather than the constructor specifically so the view child is guaranteed
 * resolved before the subscribe callback can fire, regardless of whether the HTTP response
 * arrives synchronously (tests) or asynchronously (real backend).
 *
 * Ungespeicherte Änderungen (docs/forge/2026-10-18-einstellungen-tabs/spec.md): `hasUnsavedChanges`
 * vergleicht die Eingabe mit dem zuletzt geladenen oder gespeicherten Wert; `discardChanges()`
 * stellt diesen Wert wieder her. Die Einstellungsseite fragt damit vor einem Tab-Wechsel nach.
 */
@Component({
  selector: 'app-settings-form',
  imports: [ButtonModule, InputGroup],
  templateUrl: './settings-form.html',
  styleUrl: './settings-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsForm implements AfterViewInit {
  private readonly settingsApi = inject(SettingsApi);
  private readonly messageService = inject(MessageService);

  private readonly inputGroupRef = viewChild<InputGroup>('scannerPauseInput');
  /** Zuletzt geladener oder gespeicherter Wert — Bezug für `hasUnsavedChanges` und `discardChanges()`. */
  private readonly savedScannerPauseMs = signal<number>(0);

  readonly scannerPauseMs = signal<number>(0);
  readonly saving = signal(false);
  readonly fieldError = signal<string | null>(null);
  readonly hasUnsavedChanges = computed(() => this.scannerPauseMs() !== this.savedScannerPauseMs());

  readonly helpText = `Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor automatisch weitergescannt werden kann. Gültige Werte: ${SettingsForm.formatMs(MIN_SCANNER_PAUSE_MS)}–${SettingsForm.formatMs(MAX_SCANNER_PAUSE_MS)} ms.`;

  private static formatMs(value: number): string {
    return new Intl.NumberFormat('de-DE').format(value);
  }

  ngAfterViewInit(): void {
    this.settingsApi.get().subscribe((settings) => {
      this.savedScannerPauseMs.set(settings.scannerPauseMs);
      this.showValue(settings.scannerPauseMs);
    });
  }

  onValueChange(value: string | number): void {
    this.scannerPauseMs.set(typeof value === 'number' ? value : Number(value));
  }

  onSave(): void {
    const value = this.scannerPauseMs();
    this.fieldError.set(null);
    this.saving.set(true);

    this.settingsApi.update(value).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedScannerPauseMs.set(value);
        this.messageService.add({ severity: 'success', summary: '✓ Einstellungen gespeichert' });
      },
      error: (error: unknown) => {
        this.saving.set(false);

        if (error instanceof HttpErrorResponse && error.status === 400) {
          this.fieldError.set(this.fieldErrorOf(error));
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Einstellungen konnten nicht gespeichert werden',
        });
      },
    });
  }

  /**
   * Verwirft die ungespeicherte Eingabe und zeigt wieder den zuletzt gespeicherten Wert.
   * Während eines laufenden Speicherns verwirft sie nichts: Die Antwort macht den gesendeten Wert
   * zum Bezug, Anzeige, Bezug und Server bleiben damit gleich.
   */
  discardChanges(): void {
    if (this.saving()) return;
    this.fieldError.set(null);
    this.showValue(this.savedScannerPauseMs());
  }

  private showValue(value: number): void {
    this.scannerPauseMs.set(value);
    this.inputGroupRef()?.applyExternalValue(String(value));
  }

  private fieldErrorOf(error: HttpErrorResponse): string | null {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    return errors['scannerPauseMs']?.[0] ?? null;
  }
}
