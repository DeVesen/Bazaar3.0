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
        <div class="seller-number__main">
          <div class="seller-number__field">
            <span class="seller-number__value">{{ sellerId() }}</span>
            <p-button [label]="'sellerNumber.copy' | translate" icon="pi pi-copy" [text]="true" severity="secondary" size="small" (onClick)="copy()" />
          </div>
          <p class="seller-number__hint">{{ 'sellerNumber.hint' | translate }}</p>
        </div>
        <div class="seller-number__qr">
          <app-qr-code [value]="sellerId()" [size]="128" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-number { background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px; }
    .seller-number__title { font: 700 11px sans-serif; text-transform: uppercase; color: #3a7057; }
    .seller-number__body { display: flex; gap: 16px; align-items: stretch; }
    .seller-number__main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; }
    .seller-number__field { display: flex; justify-content: space-between; align-items: center; }
    .seller-number__value { font: 800 24px monospace; color: var(--color-accent); }
    .seller-number__hint { font-size: 12px; color: color-mix(in srgb, #1d1f20 55%, transparent); margin: 0; }
    .seller-number__qr { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    @media (max-width: 1024px) {
      .seller-number__body { flex-direction: column; align-items: stretch; }
      .seller-number__qr { justify-content: center; padding-top: 8px; }
    }
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
