import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CardModule } from 'primeng/card';

export type KpiTileSeverity = 'success' | 'warning' | 'danger' | 'info' | null;

/**
 * Single KPI tile — dumb display component (docs/components/kpi-tile/component.md).
 * Always rendered inside an `app-kpi-grid` wrapper. No outputs, no interaction.
 */
@Component({
  selector: 'app-kpi-tile',
  imports: [CardModule],
  templateUrl: './kpi-tile.html',
  styleUrl: './kpi-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiTile {
  readonly label = input.required<string>();
  readonly value = input<string | number | null>(null);
  readonly subLabel = input<string>('');
  readonly severity = input<KpiTileSeverity>(null);

  /** AC-4: render an em dash when no value is provided. */
  readonly displayValue = computed<string | number>(() => this.value() ?? '—');

  /** `kpi-tile--<severity>` modifier class, or '' when severity is null (no accent). */
  readonly severityClass = computed<string>(() => {
    const severity = this.severity();
    return severity ? `kpi-tile--${severity}` : '';
  });
}
