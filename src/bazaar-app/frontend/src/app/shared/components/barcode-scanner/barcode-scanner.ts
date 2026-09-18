import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

/**
 * Cross-app dumb/leaf component wrapping the device camera for barcode/QR-code scanning
 * (docs/components/barcode-scanner/component.md). No domain knowledge, no own feedback UI —
 * it only starts/stops the camera per `active` and emits every decoded raw value via
 * `codeDetected`. Feedback (colors, sound, overlay, evaluation) is the embedding parent's
 * job (component doc, Überblick).
 */
@Component({
  selector: 'app-barcode-scanner',
  template: `<video #videoElement autoplay playsinline></video>`,
  styleUrl: './barcode-scanner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScanner implements OnDestroy {
  private readonly videoElementRef = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');

  readonly active = input<boolean>(false);
  readonly formats = input<BarcodeFormat[] | undefined>(undefined);

  /**
   * Emits the raw decoded value (`Result.getText()`) on every detected code, even repeats —
   * no internal debouncing/deduplication (component doc, Abschnitt 4 "Kein internes
   * Debouncing, kein Deduplication-Timeout"). The parent decides how to react to duplicates.
   */
  readonly codeDetected = output<string>();

  private controls: IScannerControls | undefined;

  /**
   * `effect()` rather than `computed()` — unlike the read-only `qr-code` component, this
   * component has a real side effect (starting/stopping the physical camera), which
   * `computed()` must never do. Only `active` drives the lifecycle (component doc, Abschnitt
   * 3): `formats` is read `untracked` so that changing it while already scanning does not
   * tear down and restart an in-progress scan — it only takes effect on the next start.
   */
  constructor() {
    effect(() => {
      if (this.active()) {
        this.startScanning(untracked(this.formats));
      } else {
        this.stopScanning();
      }
    });
  }

  ngOnDestroy(): void {
    // AC-4: releases any still-running MediaStream tracks even if destroyed while active.
    this.stopScanning();
  }

  private startScanning(formats: BarcodeFormat[] | undefined): void {
    const hints = formats?.length
      ? new Map<DecodeHintType, unknown>([[DecodeHintType.POSSIBLE_FORMATS, formats]])
      : undefined;
    // `decodeFromVideoDevice(undefined, ...)` decodes from an available camera, preferring
    // the environment-facing (rear) camera when present, falling back otherwise — the exact
    // `facingMode: 'environment'`-with-fallback preference the component doc requires
    // (Abschnitt 3 "Kamera-Präferenz"), without this component having to build the
    // constraints/getUserMedia call itself.
    const reader = new BrowserMultiFormatReader(hints);

    reader
      .decodeFromVideoDevice(undefined, this.videoElementRef().nativeElement, (result) => {
        if (result) {
          this.codeDetected.emit(result.getText());
        }
      })
      .then((controls) => {
        // `active` may have flipped back to `false` (or the component may have been
        // destroyed) while the camera permission prompt/start was still pending — in that
        // case release the just-opened stream immediately instead of leaving it running.
        if (untracked(this.active)) {
          this.controls = controls;
        } else {
          controls.stop();
        }
      })
      .catch(() => {
        // AC-5: camera denied/unavailable — no stream starts, no `codeDetected` emitted,
        // and no unhandled rejection. Surfacing the error is the parent's job (component
        // doc doesn't call for an own `@Output` for it).
      });
  }

  private stopScanning(): void {
    // AC-3: releases all MediaStream tracks via `IScannerControls.stop()`, which internally
    // calls `track.stop()` on every track of the active stream.
    this.controls?.stop();
    this.controls = undefined;
  }
}
