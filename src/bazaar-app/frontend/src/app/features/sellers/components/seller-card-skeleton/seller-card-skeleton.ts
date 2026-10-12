import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * Platzhalter für eine Verkäuferkarte (`app-seller-card`) während die Liste lädt. Gleiche
 * Bereiche in gleicher Anordnung: Namenszeile, Adresse, Status, vier Kennzahlen, Fußzeile
 * mit drei Werten. Rein dekorativ — der Screenreader-Hinweis steht einmal an der Seite.
 */
@Component({
  selector: 'app-seller-card-skeleton',
  imports: [SkeletonModule],
  templateUrl: './seller-card-skeleton.html',
  styleUrl: './seller-card-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class SellerCardSkeleton {
  readonly statSlots = [0, 1, 2, 3];
  readonly footerSlots = [0, 1, 2];
}
