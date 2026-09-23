import { DestroyRef, Directive, ElementRef, effect, inject, input, output } from '@angular/core';

/**
 * Meldet `reached`, sobald das Element (Ende der Verkäufer-Kachelliste) sichtbar wird — auch
 * innerhalb eines eigenen Scrollbereichs, weil `IntersectionObserver` das Clipping durch
 * scrollende Vorfahren berücksichtigt. Jede Änderung des Trigger-Inputs (z. B. Anzahl geladener
 * Karten) beobachtet neu; so meldet sich der Sentinel erneut, wenn die Liste nach dem Nachladen
 * noch nicht scrollt. Ohne `IntersectionObserver` (jsdom) ist die Direktive wirkungslos.
 */
@Directive({ selector: '[appLoadMoreSentinel]' })
export class LoadMoreSentinel {
  readonly trigger = input<unknown>(undefined, { alias: 'appLoadMoreSentinel' });
  readonly reached = output<void>();

  constructor() {
    if (typeof IntersectionObserver === 'undefined') return;

    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.reached.emit();
      }
    });

    effect(() => {
      this.trigger();
      observer.unobserve(element);
      observer.observe(element);
    });

    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
