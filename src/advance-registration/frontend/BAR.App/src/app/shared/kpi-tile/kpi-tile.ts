import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type KpiSeverity = 'success' | 'warning' | 'danger' | 'info' | null;

@Component({
  selector: 'app-kpi-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-tile" [class.kpi-tile--success]="severity() === 'success'"
         [class.kpi-tile--warning]="severity() === 'warning'"
         [class.kpi-tile--danger]="severity() === 'danger'"
         [class.kpi-tile--info]="severity() === 'info'">
      <p class="kpi-tile__label">{{ label() }}</p>
      <p class="kpi-tile__value">{{ value() ?? '—' }}</p>
      @if (subLabel()) {
        <p class="kpi-tile__sub-label">{{ subLabel() }}</p>
      }
    </div>
  `,
  styles: [`
    .kpi-tile {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .kpi-tile--success { border-top: 3px solid var(--p-green-500); }
    .kpi-tile--warning { border-top: 3px solid var(--p-orange-400); }
    .kpi-tile--danger { border-top: 3px solid var(--p-red-500); }
    .kpi-tile--info { border-top: 3px solid var(--p-blue-500); }
    .kpi-tile__label { font: 600 11px sans-serif; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin: 0; }
    .kpi-tile__value { font: 800 28px sans-serif; color: #0f1f30; margin: 4px 0 0; }
    .kpi-tile__sub-label { font-size: 12px; color: var(--muted); margin: 2px 0 0; }
  `]
})
export class KpiTile {
  readonly label = input.required<string>();
  readonly value = input<string | number | null>(null);
  readonly subLabel = input<string | null>(null);
  readonly severity = input<KpiSeverity>(null);
}
