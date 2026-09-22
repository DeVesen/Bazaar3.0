import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounce, filter, of, timer } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';

export type InputAddonType = 'label' | 'icon' | 'button';

export interface InputAddon {
  type: InputAddonType;
  value: string;
  key: string;
  class?: string;
  style?: Record<string, string>;
}

/**
 * Eigenständige Text-Input-Komponente (docs/components/app-input/component.md), nach dem
 * PrimeNG-`p-iftalabel`-Muster aufgebaut. Verwendet ausschließlich PrimeNG-Elemente direkt,
 * keine anderen `app-...`-Komponenten (docs/spec/2026-09-22-app-input.md).
 */
@Component({
  selector: 'app-input',
  imports: [
    ButtonModule,
    FormsModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    IftaLabelModule,
    NgStyle,
    NgTemplateOutlet,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string>('');
  /** Spec: default 800ms, 0 means no debounce. */
  readonly debounceMs = input<number>(800);
  readonly addonLeft = input<InputAddon[]>([]);
  readonly addonRight = input<InputAddon[]>([]);
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly type = input<string>('text');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  /** Not `readonly readonly = ...`: the class-field modifier and the field name would collide. */
  readonly isReadonly = input<boolean>(false, { alias: 'readonly' });

  readonly valueChange = output<string>();
  readonly addonClick = output<string>();
  readonly enter = output<void>();
  readonly keyUp = output<KeyboardEvent>();
  readonly keyDown = output<KeyboardEvent>();
  /**
   * Named `blurred`, not `blur`: `eslint.config.js` extends `angular.configs.tsRecommended`,
   * which enforces `@angular-eslint/no-output-native` — an `@Output` literally named after a
   * native DOM event (`blur`) is rejected.
   */
  readonly blurred = output<FocusEvent>();

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

  onAddonClick(addon: InputAddon): void {
    this.addonClick.emit(addon.key);
  }

  onEnter(): void {
    this.enter.emit();
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keyUp.emit(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keyDown.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.blurred.emit(event);
  }
}
