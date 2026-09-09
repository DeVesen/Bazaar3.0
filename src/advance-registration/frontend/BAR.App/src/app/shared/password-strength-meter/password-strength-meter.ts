import { Component, computed, input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { computePasswordStrength } from './password-strength';

const LABELS = { weak: 'Schwach', medium: 'Mittel', strong: 'Stark' } as const;
const SEVERITIES = { weak: 'danger', medium: 'warn', strong: 'success' } as const;
const VALUES = { weak: 33, medium: 66, strong: 100 } as const;

@Component({
  selector: 'app-password-strength-meter',
  imports: [ProgressBarModule, TagModule],
  template: `
    @if (password()) {
      <p-progressbar [value]="value()" [showValue]="false" [styleClass]="'strength-' + strength()" />
      <p-tag [value]="label()" [severity]="severity()" />
    }
  `
})
export class PasswordStrengthMeter {
  readonly password = input.required<string>();

  readonly strength = computed(() => computePasswordStrength(this.password()));
  readonly label = computed(() => LABELS[this.strength()]);
  readonly severity = computed(() => SEVERITIES[this.strength()]);
  readonly value = computed(() => VALUES[this.strength()]);
}
