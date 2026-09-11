import { Component, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BlockListe } from '@shared/block-liste/block-liste';
import { InfoArea } from '@shared/info-area/info-area';
import { BlockDto, BlocksApiService } from '../blocks-api.service';

@Component({
  selector: 'app-number-blocks-page',
  imports: [BlockListe, InfoArea, TranslatePipe],
  template: `
    <h1>{{ 'numberBlocks.title' | translate }}</h1>
    @if (loadError()) {
      <app-info-area type="error" [message]="loadError()!" />
    } @else {
      <app-block-liste [blocks]="blocks()" />
    }
  `
})
export class NumberBlocksPage {
  private readonly api = inject(BlocksApiService);
  private readonly translate = inject(TranslateService);

  readonly blocks = signal<BlockDto[]>([]);
  readonly loadError = signal<string | null>(null);

  constructor() {
    this.api.getMine().subscribe({
      next: (blocks) => this.blocks.set(blocks),
      error: () => this.loadError.set(this.translate.instant('numberBlocks.loadError'))
    });
  }
}
