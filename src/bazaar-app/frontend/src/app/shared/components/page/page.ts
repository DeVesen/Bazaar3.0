import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Einheitlicher Seitenrahmen der Haupt-App (docs/components/page/component.md): Page-Header
 * (Titel links, optionale `[pageActions]` rechts) über dem Seiteninhalt. Ab 769px sind Header
 * und Inhalt auf 75vw begrenzt und horizontal zentriert
 * (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 1).
 */
@Component({
  selector: 'app-page',
  templateUrl: './page.html',
  styleUrl: './page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.page--fill]': 'fill()' },
})
export class Page {
  readonly title = input.required<string>();
  /** Ab 769px genau fensterhoch; der Inhalt bekommt die Resthöhe (Verkäufer-Kachelliste). */
  readonly fill = input<boolean>(false);
}
