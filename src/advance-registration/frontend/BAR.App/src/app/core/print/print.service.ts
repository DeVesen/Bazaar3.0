import { ApplicationRef, ComponentRef, Injectable, Type, createComponent, inject } from '@angular/core';

const PRINT_HOST_ATTRIBUTE = 'data-print-host';
const PRINT_STYLE_ATTRIBUTE = 'data-print-style';

/**
 * Gilt nur, solange das Druckdokument im DOM hängt: A4 hochkant, und im Druck bleibt von der Seite
 * nur das Dokument übrig — alles andere im `body` (App, Overlays, Toasts) entfällt, der Host rückt
 * in den normalen Fluss. Die Shell ist auf Viewport-Höhe begrenzt (`overflow: hidden`); läge das
 * Dokument darin, würde nur die erste Seite gedruckt.
 */
const PRINT_STYLE = `
@page { size: A4 portrait; margin: 12mm; }
@media print {
  html, body { margin: 0 !important; background: #fff !important; height: auto !important; overflow: visible !important; }
  body > *:not([data-print-host]) { display: none !important; }
  body > [data-print-host] { position: static !important; left: auto !important; top: auto !important; visibility: visible !important; }
}
`;

/** iPadOS meldet sich als „Macintosh", erkennbar nur an den Touchpoints. */
export function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Hängt ein Druckdokument (beliebige Komponente) an `body`, öffnet den Druckdialog des Geräts und
 * baut es danach wieder ab. Übernommen aus der Haupt-App (`PrintService.mountAndPrint`), inklusive
 * der iOS-Eigenheiten:
 * - iOS feuert `afterprint`, bevor die Vorschau gerendert ist — ein Abbau dort ließe die Vorschau die
 *   normale App-Seite zeigen. Auf iOS baut deshalb erst der nächste Druck das Dokument ab.
 * - Der Host liegt unsichtbar bei `left: 0` statt weit außerhalb des Viewports — iOS rendert
 *   off-screen positionierte Inhalte leer in der Vorschau.
 * - Auf Android/iOS kehrt `window.print()` sofort zurück — kein Abbau im `finally`.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly appRef = inject(ApplicationRef);

  /** Abbau des aktuell eingehängten Dokuments; `null`, solange keins hängt. */
  private activeCleanup: (() => void) | null = null;

  print<T>(type: Type<T>, configure: (componentRef: ComponentRef<T>) => void): void {
    // Ein Dokument aus einem früheren Druck, dessen `afterprint` ausblieb (iOS) oder das nach
    // einem Doppelklick noch hängt, wird zuerst abgebaut — es hängt immer höchstens eins.
    this.activeCleanup?.();

    const componentRef = createComponent(type, { environmentInjector: this.appRef.injector });
    configure(componentRef);

    const hostElement = componentRef.location.nativeElement as HTMLElement;
    hostElement.setAttribute(PRINT_HOST_ATTRIBUTE, '');
    // Nicht `display: none` — ein verborgener Host bliebe auch für `window.print()` ungerendert.
    hostElement.style.position = 'fixed';
    hostElement.style.top = '0';
    hostElement.style.left = '0';
    hostElement.style.visibility = 'hidden';
    hostElement.style.pointerEvents = 'none';
    hostElement.style.zIndex = '-1';
    document.body.appendChild(hostElement);

    const styleElement = document.createElement('style');
    styleElement.setAttribute(PRINT_STYLE_ATTRIBUTE, '');
    styleElement.textContent = PRINT_STYLE;
    document.head.appendChild(styleElement);

    this.appRef.attachView(componentRef.hostView);

    const cleanup = (): void => {
      window.removeEventListener('afterprint', cleanup);
      this.activeCleanup = null;
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      hostElement.remove();
      styleElement.remove();
    };
    this.activeCleanup = cleanup;
    if (!isIos()) {
      window.addEventListener('afterprint', cleanup);
    }

    this.appRef.tick();
    try {
      window.print();
    } catch (error: unknown) {
      cleanup();
      console.error('[PrintService] window.print failed', error);
    }
  }
}
