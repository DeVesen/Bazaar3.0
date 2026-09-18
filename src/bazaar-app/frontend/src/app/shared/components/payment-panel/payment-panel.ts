import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { Numpad } from '../numpad/numpad';

/** docs/components/payment-panel/component.md §2 — emitted on "Bestätigen"/⏎. */
export interface PaymentConfirmedEvent {
  totalAmount: number;
  receivedAmount: number;
  change: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Shared, reusable payment/change component (docs/components/payment-panel/component.md) —
 * used both for Artikelannahme's "Speichern"-Popup (Round-17 Task 7) and, later, for Verkauf's
 * Bezahlpopup (only `totalLabel`/`totalAmount`/`confirmLabel` differ between the two callers, per
 * the doc's own Überblick table). This component is DIALOG CONTENT ONLY — it never renders its
 * own `p-dialog` (the doc's interface table, §2, gives it no `visible` input at all); the caller
 * owns the `p-dialog` wrapper around `<app-payment-panel>` (see `intake-session-list`).
 *
 * Numpad-Integration (doc §3, mirroring `input-group.ts`'s own established
 * `onNumpadKey`/`dispatchTarget` pattern for the price variant): a numpad key press is dispatched
 * as a synthetic `KeyboardEvent` onto `p-inputnumber`'s native `<input>`, which owns its own
 * internal keydown-buffer handling — no separate text buffer needs to be maintained here (unlike
 * `input-group.ts`'s search variant, which has no such internal buffer).
 *
 * Only two modes exist here — `keyboard`/`numpad`, no camera (doc §3) — so unlike `input-group`
 * there is no `visibleModes()` list to compute; the single mode-button just toggles between the
 * two and swaps its icon, following `input-group.ts`'s own `iconForMode()` PrimeIcons convention
 * (`pi-text` for "switch to keyboard" — no keyboard icon exists in the installed PrimeIcons
 * version — `pi-th-large` for "switch to numpad").
 */
@Component({
  selector: 'app-payment-panel',
  imports: [
    FormsModule,
    CurrencyPipe,
    AutoFocusModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    Numpad,
  ],
  templateUrl: './payment-panel.html',
  styleUrl: './payment-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPanel {
  readonly totalLabel = input.required<string>();
  readonly totalAmount = input.required<number>();
  readonly confirmLabel = input.required<string>();

  readonly confirmed = output<PaymentConfirmedEvent>();
  readonly cancelled = output<void>();

  private readonly amountInput = viewChild<InputNumber>('amountInput');

  /** Always starts in keyboard mode (doc §3/AC-4), independent of device. */
  readonly mode = signal<'keyboard' | 'numpad'>('keyboard');
  readonly receivedAmount = signal<number | null>(null);

  /** `receivedAmount − totalAmount`, rounded to 2 decimals (doc §3). Only meaningful once
   * `showChange()` is true; kept computed unconditionally so the template can bind it directly. */
  readonly change = computed(() => round2((this.receivedAmount() ?? 0) - this.totalAmount()));

  /** AC-1/AC-2: Rückgeld box appears only once `receivedAmount >= totalAmount`. */
  readonly showChange = computed(() => {
    const received = this.receivedAmount();
    return received !== null && received >= this.totalAmount();
  });

  /** AC-2/AC-8: `null` counts as below `totalAmount()` — drives both the confirm button and the
   * numpad's `⏎`. */
  readonly belowTotal = computed(() => {
    const received = this.receivedAmount();
    return received === null || received < this.totalAmount();
  });

  readonly modeButtonIcon = computed(() => (this.mode() === 'numpad' ? 'pi pi-text' : 'pi pi-th-large'));

  private get nativeInput(): HTMLInputElement | undefined {
    return this.amountInput()?.input()?.nativeElement;
  }

  onAmountChange(value: number | null): void {
    this.receivedAmount.set(value);
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'numpad' ? 'keyboard' : 'numpad');
  }

  onNumpadKey(init: KeyboardEventInit): void {
    const target = this.nativeInput;
    if (!target) return;
    target.focus();
    target.dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true }));
  }

  onNumpadClear(): void {
    this.receivedAmount.set(null);
  }

  onNumpadSubmit(): void {
    this.confirm();
  }

  confirm(): void {
    if (this.belowTotal()) return;
    this.confirmed.emit({
      totalAmount: this.totalAmount(),
      receivedAmount: this.receivedAmount()!,
      change: this.change(),
    });
  }

  /** AC-6: resets `receivedAmount`/mode and emits `cancelled`. */
  cancel(): void {
    this.receivedAmount.set(null);
    this.mode.set('keyboard');
    this.cancelled.emit();
  }
}
