import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-grid"
         [class.kpi-grid--c3]="columns() === 3"
         [class.kpi-grid--c4]="columns() === 4"
         [class.kpi-grid--c5]="columns() === 5"
         [class.kpi-grid--c6]="columns() === 6">
      <ng-content />
    </div>
  `,
  styles: [`
    .kpi-grid { display: grid; gap: 12px; }
    .kpi-grid--c3 { grid-template-columns: repeat(3, 1fr); }
    .kpi-grid--c4 { grid-template-columns: repeat(4, 1fr); }
    .kpi-grid--c5 { grid-template-columns: repeat(5, 1fr); }
    .kpi-grid--c6 { grid-template-columns: repeat(6, 1fr); }
    @media (max-width: 1023px) {
      .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 767px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `]
})
export class KpiGrid {
  readonly columns = input.required<3 | 4 | 5 | 6>();
}
