import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-statistics-page',
  template: `<p>Statistik</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPage {}
