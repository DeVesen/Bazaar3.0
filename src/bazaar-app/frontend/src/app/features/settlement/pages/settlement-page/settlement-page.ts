import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settlement-page',
  template: `<p>Abrechnung</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementPage {}
