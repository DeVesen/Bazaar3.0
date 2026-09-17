import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-articles-page',
  template: `<p>Artikel</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesPage {}
