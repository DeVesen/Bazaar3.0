import { Component, computed, effect, inject, input, output } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TranslateService } from '@ngx-translate/core';
import { computePasswordStrength, PasswordStrength } from './password-strength';

const SEVERITIES = { weak: 'danger', medium: 'warn', strong: 'success' } as const;
const VALUES = { weak: 33, medium: 66, strong: 100 } as const;
const COLORS = { weak: 'var(--p-red-500)', medium: 'var(--p-amber-500)', strong: 'var(--p-green-500)' } as const;
const LEVELS = { weak: 'schwach', medium: 'mittel', strong: 'stark' } as const;

export type PasswordStrengthLevel = 'schwach' | 'mittel' | 'stark';

@Component({
  selector: 'app-password-strength-meter',
  imports: [ProgressBarModule, TagModule],
  template: `
    @if (password()) {
      <p-progressbar [value]="value()" [showValue]="false" [style]="{ height: '6px' }" [color]="color()" />
      <p-tag [value]="label" [severity]="severity()" />
    }
  `
})
export class PasswordStrengthMeter {
  private readonly translate = inject(TranslateService);

  readonly password = input.required<string>();
  readonly level = output<PasswordStrengthLevel>();

  readonly strength = computed<PasswordStrength>(() => computePasswordStrength(this.password()));
  readonly severity = computed(() => SEVERITIES[this.strength()]);
  readonly value = computed(() => VALUES[this.strength()]);
  readonly color = computed(() => COLORS[this.strength()]);

  get label(): string {
    return this.translate.instant(`passwordStrength.${this.strength()}`);
  }

  constructor() {
    effect(() => this.level.emit(LEVELS[this.strength()]));
  }
}
