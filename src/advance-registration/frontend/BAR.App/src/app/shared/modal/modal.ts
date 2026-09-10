import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

export type ModalSize = 'sm' | 'standard' | 'lg';

const MAX_WIDTHS: Record<ModalSize, string> = {
  sm: '420px',
  standard: '700px',
  lg: '940px'
};

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  readonly visible = input.required<boolean>();
  readonly header = input.required<string>();
  readonly size = input<ModalSize>('standard');
  readonly visibleChange = output<boolean>();

  readonly style = computed(() => ({
    'max-width': MAX_WIDTHS[this.size()],
    width: this.size() === 'standard' ? '80%' : '100%'
  }));

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
