import { ChangeDetectionStrategy, Component, computed, output, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Input, InputAddon } from '../input/input';
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
 * used both for Artikelannahme's "Speichern"-Popup and Verkauf's Bezahlpopup (only
 * `totalLabel`/`totalAmount`/`confirmLabel` differ). This component is DIALOG CONTENT ONLY — it
 * never renders its own `p-dialog`; the caller owns the `p-dialog` wrapper.
 *
 * "Betrag erhalten" is an `app-input` (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md),
 * following `intake-article-entry.ts`'s own established Preis-Feld pattern: `receivedText` is
 * the raw string source of truth, `receivedAmount` is derived from it via
 * `parseGermanDecimal()`, and numpad keys are applied directly onto `receivedText` — no native
 * `KeyboardEvent` is ever dispatched.
 *
 * Only two modes exist here — `keyboard`/`numpad`, no camera — so unlike `input-group` there is
 * no `visibleModes()` list to compute; the single mode-button just toggles between the two and
 * swaps its icon, following `input-group.ts`'s own `iconForMode()` PrimeIcons convention
 * (`pi-text` for "switch to keyboard" — no keyboard icon exists in the installed PrimeIcons
 * version — `pi-th-large` for "switch to numpad").
 */
@Component({
  selector: 'app-payment-panel',
  imports: [CurrencyPipe, ButtonModule, Input, Numpad],
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

  /** Always starts in keyboard mode (doc §3/AC-4), independent of device. */
  readonly mode = signal<'keyboard' | 'numpad'>('keyboard');

  /** Raw text of the "Betrag erhalten" `app-input` field — source of truth for what's on
   * screen; `receivedAmount()` below is derived from it. */
  readonly receivedText = signal('');
  readonly receivedAmount = computed(() => this.parseGermanDecimal(this.receivedText()));

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

  /** € label + mode-toggle icon, in that order (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md
   * AC "Addon-Layout") — same icon-addon convention `intake-article-entry.ts`'s `priceAddonRight`
   * already uses for its own Nummernblock-toggle. */
  readonly amountAddonRight = computed<InputAddon[]>(() => [
    { type: 'label', value: '€', key: 'currency' },
    { type: 'icon', value: this.modeButtonIcon(), key: 'mode' },
  ]);

  onAmountTyped(value: string): void {
    this.receivedText.set(value);
  }

  /** Tastatur-Tippen: nur Ziffern und ein Komma, max. 2 Nachkommastellen — alles andere wird
   * per `preventDefault()` gar nicht erst ins Feld übernommen (spec AC "Tipp-Validierung"). */
  onAmountKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (this.isControlKey(event.key)) return;
    if (event.key === ',') {
      if (this.receivedText().includes(',')) event.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      if (this.decimalsFull()) event.preventDefault();
      return;
    }
    event.preventDefault();
  }

  onAmountAddonClick(key: string): void {
    if (key === 'mode') this.toggleMode();
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'numpad' ? 'keyboard' : 'numpad');
  }

  /** Numpad-Dispatch (spec AC "Numpad-Modus"): the key is applied directly onto `receivedText`,
   * never dispatched as a synthetic `KeyboardEvent` onto a native input. */
  onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
      this.receivedText.update((text) => text.slice(0, -1));
      return;
    }
    if (key === ',') {
      if (!this.receivedText().includes(',')) this.receivedText.update((text) => text + ',');
      return;
    }
    if (this.decimalsFull()) return;
    this.receivedText.update((text) => text + key);
  }

  onNumpadClear(): void {
    this.receivedText.set('');
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

  /** AC-6: resets receivedText/mode and emits cancelled. */
  cancel(): void {
    this.receivedText.set('');
    this.mode.set('keyboard');
    this.cancelled.emit();
  }

  private isControlKey(key: string): boolean {
    return ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key);
  }

  private decimalsFull(): boolean {
    const text = this.receivedText();
    const commaIndex = text.indexOf(',');
    return commaIndex !== -1 && text.length - commaIndex - 1 >= 2;
  }

  /** Same parsing as `intake-article-entry.ts`'s identically named private method and
   * `input-group.ts`'s own copy — kept as its own copy here rather than extracted to a shared
   * util, matching the existing convention in this codebase for this small a helper. */
  private parseGermanDecimal(raw: string): number | null {
    const normalized = raw.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && normalized.length > 0 ? parsed : null;
  }
}
