import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { ResultCue, playResultCue } from './result-cue';
import { ResultEvent, ResultKind } from './result-event';

/** 500 ms fade in + 500 ms fully visible + 500 ms fade out (docs/components/result-overlay/component.md). */
export const RESULT_OVERLAY_DURATION_MS = 1500;

const ICON_CLASS_BY_KIND: Record<ResultKind, string> = {
  failed: 'pi pi-times',
  success: 'pi pi-check',
  already: 'pi pi-check',
  cart: 'pi pi-shopping-cart',
};

const ANNOUNCEMENT_BY_KIND: Record<ResultKind, string> = {
  failed: 'Fehlgeschlagen',
  success: 'Erfolgreich',
  already: 'Bereits erledigt',
  cart: 'Im Warenkorb',
};

/**
 * Dumb/leaf component showing a large result icon over its positioned parent, with tone and vibration
 * (docs/components/result-overlay/component.md). It decides nothing: the parent passes a fresh
 * `ResultEvent` (see `createResultEvent`) per result. A new event aborts the running one including its
 * tone and vibration; the overlay never blocks input (`pointer-events: none`). "Bewegung reduzieren"
 * deliberately changes nothing — there is no `prefers-reduced-motion` handling here.
 */
@Component({
  selector: 'app-result-overlay',
  template: `
    @for (shown of shownList(); track shown.id) {
      <div #layer class="result-overlay__layer" popover="manual" aria-hidden="true">
        <i
          class="result-overlay__icon result-overlay__icon--{{ shown.kind }} {{ iconClassOf(shown.kind) }}"
          [style.animation-duration]="durationCss"
        ></i>
      </div>
      <span class="result-overlay__announcement">{{ announcementOf(shown.kind) }}</span>
    }
  `,
  styleUrl: './result-overlay.scss',
  host: { role: 'status', 'aria-live': 'polite' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultOverlay {
  readonly event = input<ResultEvent | null>(null);

  protected readonly durationCss = `${RESULT_OVERLAY_DURATION_MS}ms`;
  private readonly shown = signal<ResultEvent | null>(null);
  protected readonly shownList = computed<ResultEvent[]>(() => {
    const current = this.shown();
    return current ? [current] : [];
  });

  private readonly layer = viewChild<ElementRef<HTMLElement>>('layer');
  private cue: ResultCue | undefined;
  private hideHandle: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const event = this.event();
      untracked(() => (event ? this.start(event) : this.stop()));
    });
    // Promote the layer to the browser top layer as soon as it is rendered (guarded: no popover support in jsdom).
    effect(() => this.layer()?.nativeElement.showPopover?.());
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected iconClassOf(kind: ResultKind): string {
    return ICON_CLASS_BY_KIND[kind];
  }

  protected announcementOf(kind: ResultKind): string {
    return ANNOUNCEMENT_BY_KIND[kind];
  }

  private start(event: ResultEvent): void {
    this.stop();
    this.shown.set(event);
    // Timer first: whatever happens in the cue, the icon is always removed after 1500 ms.
    this.hideHandle = setTimeout(() => this.stop(), RESULT_OVERLAY_DURATION_MS);
    this.cue = playResultCue(event.kind);
  }

  private stop(): void {
    clearTimeout(this.hideHandle);
    this.hideHandle = undefined;
    this.cue?.cancel();
    this.cue = undefined;
    this.shown.set(null);
  }
}
