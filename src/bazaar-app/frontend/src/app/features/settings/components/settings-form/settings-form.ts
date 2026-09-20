import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
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
 */
@Component({
  selector: 'app-settings-form',
  imports: [ButtonModule, InputGroup],
  templateUrl: './settings-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsForm implements AfterViewInit {
  private readonly settingsApi = inject(SettingsApi);
  private readonly messageService = inject(MessageService);

  private readonly inputGroupRef = viewChild<InputGroup>('scannerPauseInput');

  readonly scannerPauseMs = signal<number>(0);
  readonly saving = signal(false);
  readonly fieldError = signal<string | null>(null);

  readonly helpText = `Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor automatisch weitergescannt werden kann. Gültige Werte: ${MIN_SCANNER_PAUSE_MS}–${MAX_SCANNER_PAUSE_MS} ms.`;

  ngAfterViewInit(): void {
    this.settingsApi.get().subscribe((settings) => {
      this.scannerPauseMs.set(settings.scannerPauseMs);
      this.inputGroupRef()?.applyExternalValue(String(settings.scannerPauseMs));
    });
  }

  onValueChange(value: string | number): void {
    this.scannerPauseMs.set(typeof value === 'number' ? value : Number(value));
  }

  onSave(): void {
    this.fieldError.set(null);
    this.saving.set(true);

    this.settingsApi.update(this.scannerPauseMs()).subscribe({
      next: () => {
        this.saving.set(false);
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

  private fieldErrorOf(error: HttpErrorResponse): string | null {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    return errors['scannerPauseMs']?.[0] ?? null;
  }
}
