import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Cross-app stateless event-relay component rendering a touch-optimized 4x4 numeric grid
 * (docs/components/numpad/component.md). It holds NO value/buffer of its own — every click
 * results in exactly one emitted event (`keyPressed`, `cleared` or `submitted`), and it is the
 * parent's job to apply the received key onto its own value (component doc, Abschnitt 4
 * "Empfehlung: Integration im Parent").
 *
 * Global layout (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md): all 14 keys are always
 * rendered — the former `showDecimal`/`showEnter` visibility toggles are gone, not defaulted.
 * `enterDisabled` still only controls ⏎'s disabled state, never its visibility.
 *
 * PrimeIcons note (Round-16 Task 4): the doc's PrimeNG-Basis section (Abschnitt 5) shows the
 * `data-p-icon` SVG-component icon form, but this codebase uses PrimeIcons as plain CSS classes
 * (`icon="pi pi-..."` on `p-button`, see `verkaeufer-dialog`). `pi-delete-left` (⌫) exists
 * verbatim in the installed `primeicons` 8.0.1. `pi-arrow-turn-down-left` (⏎) does NOT exist in
 * that version — `pi-reply` is used instead as the closest available visual/semantic match
 * (a left-curving return arrow).
 */
@Component({
  selector: 'app-numpad',
  imports: [ButtonModule],
  template: `
    <div class="numpad">
      <p-button label="7" class="numpad__key numpad__key--7" (onClick)="emitDigit('7')" />
      <p-button label="8" class="numpad__key numpad__key--8" (onClick)="emitDigit('8')" />
      <p-button label="9" class="numpad__key numpad__key--9" (onClick)="emitDigit('9')" />
      <p-button
        icon="pi pi-delete-left"
        severity="secondary"
        class="numpad__key numpad__key--backspace"
        (onClick)="emitBackspace()"
      />

      <p-button label="4" class="numpad__key numpad__key--4" (onClick)="emitDigit('4')" />
      <p-button label="5" class="numpad__key numpad__key--5" (onClick)="emitDigit('5')" />
      <p-button label="6" class="numpad__key numpad__key--6" (onClick)="emitDigit('6')" />
      <p-button label="C" severity="secondary" class="numpad__key numpad__key--clear" (onClick)="emitClear()" />

      <p-button label="1" class="numpad__key numpad__key--1" (onClick)="emitDigit('1')" />
      <p-button label="2" class="numpad__key numpad__key--2" (onClick)="emitDigit('2')" />
      <p-button label="3" class="numpad__key numpad__key--3" (onClick)="emitDigit('3')" />
      <p-button
        icon="pi pi-reply"
        severity="secondary"
        class="numpad__key numpad__key--enter"
        [disabled]="enterDisabled()"
        (onClick)="emitSubmit()"
      />

      <p-button label="0" class="numpad__key numpad__key--0" (onClick)="emitDigit('0')" />
      <p-button label="," severity="secondary" class="numpad__key numpad__key--comma" (onClick)="emitComma()" />
    </div>
  `,
  styleUrl: './numpad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Numpad {
  readonly enterDisabled = input<boolean>(false);

  /** Emits for 0-9, comma and Backspace only — never for C or ⏎ (component doc, Abschnitt 3). */
  readonly keyPressed = output<KeyboardEventInit>();
  readonly cleared = output<void>();
  readonly submitted = output<void>();

  emitDigit(digit: string): void {
    this.keyPressed.emit({ key: digit });
  }

  emitComma(): void {
    this.keyPressed.emit({ key: ',' });
  }

  emitBackspace(): void {
    this.keyPressed.emit({ key: 'Backspace' });
  }

  emitClear(): void {
    this.cleared.emit();
  }

  emitSubmit(): void {
    if (this.enterDisabled()) return;
    this.submitted.emit();
  }
}
