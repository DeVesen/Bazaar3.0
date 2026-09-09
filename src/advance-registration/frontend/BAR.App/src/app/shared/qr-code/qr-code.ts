import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BrowserQRCodeSvgWriter, EncodeHintType } from '@zxing/library';

const QUIET_ZONE_MODULES = 4;
const writer = new BrowserQRCodeSvgWriter();

@Component({
  selector: 'app-qr-code',
  template: `
    @if (svgMarkup(); as svg) {
      <div [style.width.px]="size()" [style.height.px]="size()" [innerHTML]="svg"></div>
      @if (caption()) {
        <p class="qr-code__caption">{{ caption() }}</p>
      }
    }
  `,
  styles: [`
    .qr-code__caption { font: 11px monospace; text-align: center; margin-top: 4px; }
  `]
})
export class QrCode {
  private sanitizer = inject(DomSanitizer);

  readonly value = input.required<string>();
  readonly size = input(128);
  readonly caption = input<string | null>(null);
  readonly errorCorrection = input<'L' | 'M' | 'Q' | 'H'>('M');

  readonly svgMarkup = computed<SafeHtml | null>(() => {
    const value = this.value().trim();
    if (!value) return null;

    const hints = new Map<EncodeHintType, unknown>([
      [EncodeHintType.ERROR_CORRECTION, this.errorCorrection()],
      [EncodeHintType.MARGIN, QUIET_ZONE_MODULES]
    ]);
    const svg = writer.write(value, this.size(), this.size(), hints);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    return this.sanitizer.bypassSecurityTrustHtml(svg.outerHTML);
  });
}
