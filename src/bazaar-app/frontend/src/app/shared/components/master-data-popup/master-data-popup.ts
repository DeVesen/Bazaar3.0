import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BooleanInput } from '../boolean-input/boolean-input';

export interface MasterDataPopupResult {
  name: string;
  original: boolean;
}

export interface MasterDataPopupInitialValue {
  name: string;
  original: boolean;
}

@Component({
  selector: 'app-master-data-popup',
  imports: [FormsModule, DialogModule, InputTextModule, ButtonModule, BooleanInput],
  templateUrl: './master-data-popup.html',
  styleUrl: './master-data-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDataPopup {
  readonly visible = input.required<boolean>();
  readonly entityLabel = input.required<string>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialValue = input<MasterDataPopupInitialValue | null>(null);

  readonly visibleChange = output<boolean>();
  readonly save = output<MasterDataPopupResult>();
  // `cancel` is the exact API contract from task-5-brief.md / master-data-popup component
  // spec; Task 7 consumes it as `(cancel)`.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly name = signal('');
  readonly original = signal(false);

  constructor() {
    effect(() => {
      if (this.visible()) {
        const initial = this.initialValue();
        this.name.set(initial?.name ?? '');
        this.original.set(initial?.original ?? false);
      }
    });
  }

  onSave(): void {
    if (!this.name().trim()) return;
    this.save.emit({ name: this.name().trim(), original: this.original() });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }
}
