import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `<p>Seite nicht gefunden</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
