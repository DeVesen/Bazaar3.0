import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeType = 'success' | 'danger' | 'warn' | 'info' | 'sec' | 'original' | 'neu';

const PALETTE: Record<BadgeType, { background: string; color: string }> = {
  success: { background: '#d5f5e3', color: '#1a5c38' },
  danger: { background: '#fadbd8', color: '#7b241c' },
  warn: { background: '#fef9e7', color: '#7e5109' },
  info: { background: '#d6eaf8', color: '#1a5276' },
  sec: { background: '#eaecee', color: '#566573' },
  original: { background: '#d5f5e3', color: '#1a5c38' },
  neu: { background: '#fdebd0', color: '#784212' }
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="app-badge" [style.background]="palette().background" [style.color]="palette().color">{{ label() }}</span>
  `,
  styles: [
    `
      .app-badge {
        display: inline-block;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
      }
    `
  ]
})
export class Badge {
  readonly type = input.required<BadgeType>();
  readonly label = input.required<string>();

  readonly palette = computed(() => PALETTE[this.type()]);
}
