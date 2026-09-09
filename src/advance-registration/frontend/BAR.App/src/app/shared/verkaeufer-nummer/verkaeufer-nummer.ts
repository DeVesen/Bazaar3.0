import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { QrCode } from '../qr-code/qr-code';

@Component({
  selector: 'app-verkaeufer-nummer',
  imports: [ButtonModule, QrCode],
  template: `
    <div class="verkaeufer-nummer">
      <p class="verkaeufer-nummer__title">Meine Verkäufernummer</p>
      <div class="verkaeufer-nummer__body">
        <div>
          <span class="verkaeufer-nummer__value">{{ sellerId() }}</span>
          <p-button label="Kopieren" icon="pi pi-copy" [text]="true" severity="secondary" size="small" (onClick)="copy()" />
        </div>
        <app-qr-code [value]="sellerId()" [size]="128" />
      </div>
      <p class="verkaeufer-nummer__hint">Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.</p>
    </div>
  `,
  styles: [`
    .verkaeufer-nummer { background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px; }
    .verkaeufer-nummer__title { font: 700 11px sans-serif; text-transform: uppercase; color: #3a7057; }
    .verkaeufer-nummer__body { display: flex; justify-content: space-between; align-items: center; }
    .verkaeufer-nummer__value { font: 800 24px monospace; color: var(--primary); }
    .verkaeufer-nummer__hint { font-size: 12px; color: var(--muted); }
  `]
})
export class VerkaeuferNummer {
  private readonly messageService = inject(MessageService);

  readonly sellerId = input.required<string>();

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.sellerId());
    this.messageService.add({ severity: 'success', summary: '✓ Nummer kopiert' });
  }
}
