import { Component, computed, effect, input, output } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { computePasswordStrength, PasswordStrength } from './password-strength';

const LABELS = { weak: 'Schwach', medium: 'Mittel', strong: 'Stark' } as const;
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
      <p-tag [value]="label()" [severity]="severity()" />
    }
  `
})
export class PasswordStrengthMeter {
  readonly password = input.required<string>();
  readonly level = output<PasswordStrengthLevel>();

  readonly strength = computed<PasswordStrength>(() => computePasswordStrength(this.password()));
  readonly label = computed(() => LABELS[this.strength()]);
  readonly severity = computed(() => SEVERITIES[this.strength()]);
  readonly value = computed(() => VALUES[this.strength()]);
  readonly color = computed(() => COLORS[this.strength()]);

  constructor() {
    effect(() => this.level.emit(LEVELS[this.strength()]));
  }
}
