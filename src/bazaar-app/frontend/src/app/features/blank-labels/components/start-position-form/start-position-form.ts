import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

/** Leaf: Eingabe von Bereich C (Startposition auf dem ersten, angebrochenen Bogen). */
@Component({
  selector: 'app-start-position-form',
  imports: [FormsModule, InputTextModule],
  template: `
    <div class="start-position-form">
      <label for="start-position">Startposition</label>
      <input
        pInputText
        id="start-position"
        [invalid]="error() !== null"
        [ngModel]="text()"
        (ngModelChange)="textChange.emit($event)"
      />
      @if (error(); as message) {
        <small class="start-position-form__error" data-error-for="startPosition">{{ message }}</small>
      }
      <p class="start-position-form__help">{{ helpText() }}</p>
    </div>
  `,
  styles: `
    .start-position-form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .start-position-form__error {
      color: var(--p-red-500);
    }

    .start-position-form__help {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartPositionForm {
  readonly text = input<string>('');
  readonly error = input<string | null>(null);
  readonly perSheet = input<number | null>(null);

  readonly textChange = output<string>();

  readonly helpText = computed(() => {
    const perSheet = this.perSheet();
    return perSheet === null ? 'Leer = Platz 1' : `Platz 1 bis ${perSheet}, leer = Platz 1`;
  });
}
