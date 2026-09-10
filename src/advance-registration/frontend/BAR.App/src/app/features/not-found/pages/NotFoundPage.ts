import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-page',
  imports: [TranslatePipe],
  template: `<h1>{{ 'notFound.title' | translate }}</h1>`
})
export class NotFoundPage {}
