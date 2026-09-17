import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-categories-page',
  template: `<p>Kategorien</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {}
