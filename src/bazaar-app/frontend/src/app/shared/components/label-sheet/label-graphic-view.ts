import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideCloud,
  LucideCrown,
  LucideFlower,
  LucideGift,
  LucideHeart,
  LucideLeaf,
  LucideMoon,
  LucideStar,
  LucideSun,
} from '@lucide/angular';
import { LabelGraphic } from './label-graphic';

/**
 * Leaf: zeigt Logo oder Verkäufer-Symbol — ein Icon der Icon-Liste oder ein eigenes Bild
 * (Data-URL im `<img>`, dadurch laufen in SVG-Bildern keine Skripte) — und füllt seinen Host.
 * Sicherheit: Eigene Bilder (auch SVG) nur über `<img [src]>` rendern, nie per `innerHTML`,
 * `bypassSecurityTrust*` oder inline-SVG — das Backend prüft den Bildinhalt nicht.
 */
@Component({
  selector: 'app-label-graphic',
  imports: [LucideStar, LucideHeart, LucideSun, LucideMoon, LucideFlower, LucideLeaf, LucideCrown, LucideGift, LucideCloud],
  templateUrl: './label-graphic-view.html',
  styleUrl: './label-graphic-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelGraphicView {
  readonly graphic = input.required<LabelGraphic>();
}
