import { Component, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import type { AdminArticleResponse } from '../admin-articles-api.service';

@Component({
  selector: 'app-article-readonly-modal',
  imports: [DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule, FluidModule, ButtonModule],
  templateUrl: './article-readonly-modal.html'
})
export class ArticleReadonlyModal {
  readonly visible = model<boolean>(false);
  readonly article = input<AdminArticleResponse | null>(null);

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }
}
