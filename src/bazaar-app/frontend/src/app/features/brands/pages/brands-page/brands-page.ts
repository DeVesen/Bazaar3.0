import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brands-page',
  template: `<p>Marken</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandsPage {}
