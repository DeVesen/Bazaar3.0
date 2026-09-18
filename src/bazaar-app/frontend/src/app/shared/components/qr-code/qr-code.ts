import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BrowserQRCodeSvgWriter, EncodeHintType, QRCodeDecoderErrorCorrectionLevel } from '@zxing/library';

/**
 * Cross-app dumb/leaf component rendering a value as an inline SVG QR code
 * (docs/components/qr-code/component.md). No service, no HTTP, no business logic — it
 * encodes whatever raw string it is given (the caller decides that the string is a
 * seller id). Generation is fully synchronous and client-side (`@zxing/library`'s
 * `BrowserQRCodeSvgWriter`), so it works offline (Epic_Druckfunktionen AC-5).
 */
@Component({
  selector: 'app-qr-code',
  template: `
    @if (svgMarkup(); as markup) {
      <div class="qr-code">
        <div class="qr-code__image" [innerHTML]="markup"></div>
        @if (caption()) {
          <div class="qr-code__caption">{{ caption() }}</div>
        }
      </div>
    }
  `,
  styleUrl: './qr-code.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCode {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly writer = new BrowserQRCodeSvgWriter();

  readonly value = input.required<string>();
  readonly size = input<number>(128);
  readonly caption = input<string | null>(null);
  readonly errorCorrection = input<'L' | 'M' | 'Q' | 'H'>('M');

  /**
   * `computed` on the input signals per the doc ("SVG wird neu erzeugt (`computed` auf
   * dem Input-Signal, kein `effect`)") — no loading state, no network access, purely
   * synchronous. Returns `null` for an empty/whitespace-only value so the template
   * renders nothing at all (no placeholder, no empty square).
   */
  readonly svgMarkup = computed<SafeHtml | null>(() => {
    const value = this.value();
    if (!value || !value.trim()) {
      return null;
    }

    const size = this.size();
    const hints = new Map<EncodeHintType, unknown>([
      [EncodeHintType.ERROR_CORRECTION, QRCodeDecoderErrorCorrectionLevel.fromString(this.errorCorrection())],
    ]);
    const svgElement = this.writer.write(value, size, size, hints);
    this.addBackground(svgElement);

    const serialized = this.serialize(svgElement);
    return this.sanitizer.bypassSecurityTrustHtml(serialized);
  });

  /**
   * `BrowserQRCodeSvgWriter.renderResult()` only draws black `<rect>` elements for "on"
   * modules — it never draws a background, so the SVG is transparent by default. The doc
   * requires a fixed `#fff` background (not theme-dependent, AC-5: scannable in dark mode
   * and black-and-white print). ZXing's quiet zone (4 modules, `QUIET_ZONE_SIZE`) is
   * already baked into the matrix it renders — `renderResult()` sizes the returned SVG's
   * `width`/`height` attributes to cover that quiet zone, so a background rect matching
   * those attributes covers the whole quiet zone too, no extra margin needed here.
   * Inserted as the first child so the black module rects painted afterwards stay on top.
   */
  private addBackground(svgElement: SVGElement): void {
    const width = svgElement.getAttribute('width') ?? '0';
    const height = svgElement.getAttribute('height') ?? '0';

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', width);
    background.setAttribute('height', height);
    background.setAttribute('fill', '#fff');

    svgElement.insertBefore(background, svgElement.firstChild);
  }

  /**
   * Serializes the generated `SVGElement` into a markup string safe to pass to
   * `[innerHTML]` — `XMLSerializer`, never string concatenation. The QR payload is
   * self-generated (not user-controlled markup), so `bypassSecurityTrustHtml` on the
   * serialized result is safe: the string IS the SVG we just built, not external input.
   */
  private serialize(svgElement: SVGElement): string {
    return new XMLSerializer().serializeToString(svgElement);
  }
}
