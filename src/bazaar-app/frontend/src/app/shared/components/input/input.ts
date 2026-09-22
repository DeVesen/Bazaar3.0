import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounce, filter, of, timer } from 'rxjs';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Eigenständige Text-Input-Komponente (docs/components/app-input/component.md), nach dem
 * PrimeNG-`p-iftalabel`-Muster aufgebaut. Verwendet ausschließlich PrimeNG-Elemente direkt,
 * keine anderen `app-...`-Komponenten (docs/spec/2026-09-22-app-input.md).
 */
@Component({
  selector: 'app-input',
  imports: [FormsModule, NgTemplateOutlet, IftaLabelModule, InputGroupModule, InputTextModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string>('');
  /** Spec: default 800ms, 0 means no debounce. */
  readonly debounceMs = input<number>(800);

  readonly valueChange = output<string>();

  private readonly _rawValue = signal<string>('');
  readonly rawValue = this._rawValue.asReadonly();

  /** Keystroke stream feeding the debounced valueChange emit; undefined until first keystroke. */
  private readonly typed = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      this._rawValue.set(this.value());
    });

    toObservable(this.typed)
      .pipe(
        filter((v): v is string => v !== undefined),
        debounce(() => {
          const ms = this.debounceMs();
          return ms === 0 ? of(undefined) : timer(ms);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((v) => this.valueChange.emit(v));
  }

  onTyped(value: string): void {
    this._rawValue.set(value);
    this.typed.set(value);
  }
}
