import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QrCode } from '../qr-code/qr-code';

@Component({
  selector: 'app-seller-number',
  imports: [ButtonModule, QrCode, TranslatePipe],
  template: `
    <div class="seller-number">
      <p class="seller-number__title">{{ 'sellerNumber.title' | translate }}</p>
      <div class="seller-number__body">
        <div>
          <span class="seller-number__value">{{ sellerId() }}</span>
          <p-button [label]="'sellerNumber.copy' | translate" icon="pi pi-copy" [text]="true" severity="secondary" size="small" (onClick)="copy()" />
        </div>
        <app-qr-code [value]="sellerId()" [size]="128" />
      </div>
      <p class="seller-number__hint">{{ 'sellerNumber.hint' | translate }}</p>
    </div>
  `,
  styles: [`
    .seller-number { background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px; }
    .seller-number__title { font: 700 11px sans-serif; text-transform: uppercase; color: #3a7057; }
    .seller-number__body { display: flex; justify-content: space-between; align-items: center; }
    .seller-number__value { font: 800 24px monospace; color: var(--color-accent); }
    .seller-number__hint { font-size: 12px; color: color-mix(in srgb, #1d1f20 55%, transparent); }
  `]
})
export class SellerNumber {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly sellerId = input.required<string>();

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.sellerId());
    this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerNumber.copied') });
  }
}
