import { Component, inject, signal } from '@angular/core';
import { BlockListe } from '../../../shared/block-liste/block-liste';
import { BlockDto, BlocksApiService } from '../blocks-api.service';

@Component({
  selector: 'app-number-blocks-page',
  imports: [BlockListe],
  template: `
    <h1>Nummernblöcke</h1>
    <app-block-liste [blocks]="blocks()" />
  `
})
export class NumberBlocksPage {
  private readonly api = inject(BlocksApiService);

  readonly blocks = signal<BlockDto[]>([]);

  constructor() {
    this.api.getMine().subscribe((blocks) => this.blocks.set(blocks));
  }
}
