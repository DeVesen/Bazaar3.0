import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Pure CSS-grid layout wrapper for `app-kpi-tile` children
 * (docs/components/kpi-tile/component.md). Content is projected as-is —
 * this component owns no data, only the grid column count and its
 * responsive collapse (implemented via media queries in kpi-grid.scss).
 */
@Component({
  selector: 'app-kpi-grid',
  templateUrl: './kpi-grid.html',
  styleUrl: './kpi-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiGrid {
  readonly columns = input<3 | 4 | 5 | 6>(3);

  readonly gridClass = computed<string>(() => `kpi-grid--c${this.columns()}`);
}
