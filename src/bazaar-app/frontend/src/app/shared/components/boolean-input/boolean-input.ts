import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-boolean-input',
  imports: [FormsModule, CheckboxModule, ToggleSwitchModule],
  templateUrl: './boolean-input.html',
  styleUrl: './boolean-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanInput {
  readonly variant = input<'checkbox' | 'switch'>('switch');
  readonly label = input.required<string>();
  readonly value = input<boolean>(false);
  readonly valueChange = output<boolean>();

  onToggle(next: boolean): void {
    this.valueChange.emit(next);
  }
}
