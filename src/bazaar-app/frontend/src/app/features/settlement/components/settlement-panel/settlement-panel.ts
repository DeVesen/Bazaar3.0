import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BooleanInput } from '../../../../shared/components/boolean-input/boolean-input';
import { SellerSettlement } from '../../data/settlement-api';

/**
 * Round-21 Task 3 — replaces the Round-20 info-toast placeholder on "✓ Abrechnen". Shows the
 * payout calculation (Umsatz / Provision / Auszahlung) and lets the user confirm the booking.
 * Deliberately no `intakeFeePaid` row — spec.md is explicit this would double-count an amount
 * already collected at intake.
 *
 * Currency formatting deliberately does NOT use `CurrencyPipe:'EUR'` (falls back to `en-US`
 * formatting since this project registers no `LOCALE_ID`) — same `Intl.NumberFormat('de-DE', ...)`
 * pattern as `print-abgabe-beleg.ts`'s `formatCurrency`.
 */
@Component({
  selector: 'app-settlement-panel',
  imports: [DialogModule, ButtonModule, BooleanInput],
  templateUrl: './settlement-panel.html',
  styleUrl: './settlement-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementPanel {
  readonly visible = input.required<boolean>();
  readonly settlement = input.required<SellerSettlement>();
  /** Set by the parent after a failed booking attempt (409 articles_open / 400 payout
   * mismatch); null when there is nothing to show. Cleared by the parent, not by this
   * component — this component never mutates its own inputs. */
  readonly errorMessage = input<string | null>(null);

  readonly visibleChange = output<boolean>();
  /** Emitted when "Buchen" is clicked. Payload: Häkchen "nicht abgegebene Artikel löschen"
   * (true = löschen, Default). The parent already holds the exact payout amount in the same
   * `settlement` object it passed down as an input. */
  readonly confirmed = output<boolean>();

  /** Default true; wird bei jedem Öffnen des Dialogs auf true zurückgesetzt. */
  protected readonly removeNotDelivered = signal(true);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.removeNotDelivered.set(true);
      }
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    this.confirmed.emit(this.removeNotDelivered());
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
