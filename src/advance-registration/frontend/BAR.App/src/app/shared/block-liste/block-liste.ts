import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface BlockListItem {
  id: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
}

@Component({
  selector: 'app-block-liste',
  imports: [TranslatePipe],
  template: `
    @if (blocks().length === 0) {
      <p class="block-liste__empty">{{ 'blockListe.empty' | translate }}</p>
    } @else {
      @for (block of blocks(); track block.id) {
        <div class="block-liste__item">
          <span class="block-liste__range">{{ block.fromNumber }} – {{ block.toNumber }}</span>
          <span class="block-liste__count">{{ 'blockListe.usage' | translate: { count: block.numberCount, used: block.usedCount } }}</span>
        </div>
      }
    }
  `,
  styles: [`
    .block-liste__item {
      display: flex; justify-content: space-between; align-items: center;
      background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 6px;
      padding: 10px 14px; margin-bottom: 8px;
    }
    .block-liste__range { font: 700 14px sans-serif; color: var(--color-accent); }
    .block-liste__count { font-size: 12px; color: color-mix(in srgb, #1d1f20 55%, transparent); }
    .block-liste__empty { text-align: center; }
  `]
})
export class BlockListe {
  readonly blocks = input.required<BlockListItem[]>();
}
