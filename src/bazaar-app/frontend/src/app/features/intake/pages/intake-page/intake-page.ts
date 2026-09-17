import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-intake-page',
  template: `<p>Artikelannahme</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakePage {}
