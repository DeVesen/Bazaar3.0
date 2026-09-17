import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sellers-page',
  template: `<p>Verkäufer</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellersPage {}
