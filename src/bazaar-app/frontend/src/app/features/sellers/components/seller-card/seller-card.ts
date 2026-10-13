import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SellerCard as SellerCardModel } from '../../data/sellers-api';

/** Status values as they arrive from `GET /api/sellers` (`SellerCard.status`). */
type SellerStatus = 'open' | 'selling' | 'settled';

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  selling: 'Im Verkauf',
  settled: 'Abgerechnet',
};

/**
 * Severity mapping per docs/components/badge/component.md §3.1: `sec` (PrimeNG
 * `secondary`) for "Offen, neutral", `info` for "Im Verkauf", `success` for
 * "Abgerechnet, Verkauft".
 */
const STATUS_SEVERITIES: Record<string, 'secondary' | 'info' | 'success'> = {
  open: 'secondary',
  selling: 'info',
  settled: 'success',
};

/**
 * Dumb/leaf component rendering a single seller card (Round-14 Task 7). Receives a
 * ready-made `SellerCard` record and performs no business logic beyond display mapping —
 * all figures come 1:1 from the `GET /api/sellers` response (Task 6).
 */
@Component({
  selector: 'app-seller-card',
  imports: [CurrencyPipe, ButtonModule, TagModule],
  templateUrl: './seller-card.html',
  styleUrl: './seller-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerCard {
  readonly card = input.required<SellerCardModel>();
  /** Nur Admins sehen den Artikel-Import (Entscheidung trifft die Seite, die Kachel rendert nur). */
  readonly importVisible = input<boolean>(false);

  readonly edit = output<SellerCardModel>();
  readonly scan = output<SellerCardModel>();
  readonly importArticles = output<SellerCardModel>();
  readonly statusClick = output<SellerCardModel>();
  readonly cardClick = output<SellerCardModel>();

  readonly statusLabel = computed(() => this.labelFor(this.card().status));
  readonly statusSeverity = computed(() => this.severityFor(this.card().status));

  readonly addressLine = computed(() => {
    const c = this.card();
    const location = [c.postalCode, c.city].filter(Boolean).join(' ');
    const shortId = c.id.slice(0, 8);
    return location ? `${location} · #${shortId}` : `#${shortId}`;
  });

  private labelFor(status: string): string {
    return STATUS_LABELS[status as SellerStatus] ?? status;
  }

  private severityFor(status: string): 'secondary' | 'info' | 'success' {
    return STATUS_SEVERITIES[status as SellerStatus] ?? 'secondary';
  }

  onCardClick(): void {
    this.cardClick.emit(this.card());
  }

  onEdit(): void {
    this.edit.emit(this.card());
  }

  onScan(): void {
    this.scan.emit(this.card());
  }

  onImportArticles(): void {
    this.importArticles.emit(this.card());
  }

  onStatusClick(): void {
    this.statusClick.emit(this.card());
  }
}
