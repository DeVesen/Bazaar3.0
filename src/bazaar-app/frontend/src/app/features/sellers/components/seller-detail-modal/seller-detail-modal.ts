import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ArticleSummary, Seller, SellerCard } from '../../data/sellers-api';
import { SellersStore } from '../../sellers-store';
import { QrCode } from '../../../../shared/components/qr-code/qr-code';

/** Status values as they arrive from the backend (`SellerCard.status`/`Seller.status`). */
type SellerStatus = 'open' | 'selling' | 'settled';

/**
 * Reuses `seller-card`'s exact status-label wording (Task 7) for consistency — "Offen"/
 * "Im Verkauf"/"Abgerechnet" — rather than reinventing slightly different copy here.
 */
const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  selling: 'Im Verkauf',
  settled: 'Abgerechnet',
};

/** Severity mapping, identical to `seller-card` (docs/components/badge/component.md §3.1). */
const STATUS_SEVERITIES: Record<string, 'secondary' | 'info' | 'success'> = {
  open: 'secondary',
  selling: 'info',
  settled: 'success',
};

/** Article status labels for the read-only article table (documented backend values). */
const ARTICLE_STATUS_LABELS: Record<string, string> = {
  released: 'Freigegeben',
  sold: 'Verkauft',
  returned: 'Retour',
};

/**
 * Read-only detail view for a seller (Round-14 Task 9, Part B): header with name/type/
 * status, the seller's id as plain text plus a QR code of it (Part A), and the seller's
 * article list (`GET /api/sellers/{id}/articles` via `SellersStore.getArticles`, Task 6).
 * No edit/delete/scan actions — this modal never mutates anything.
 */
@Component({
  selector: 'app-seller-detail-modal',
  imports: [CurrencyPipe, DialogModule, TableModule, TagModule, QrCode],
  templateUrl: './seller-detail-modal.html',
  styleUrl: './seller-detail-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerDetailModal {
  private readonly sellersStore = inject(SellersStore);

  readonly visible = input.required<boolean>();
  readonly seller = input<SellerCard | Seller | null>(null);

  readonly visibleChange = output<boolean>();

  readonly articles = signal<ArticleSummary[]>([]);
  readonly loadingArticles = signal(false);

  readonly fullName = computed(() => {
    const seller = this.seller();
    return seller ? `${seller.firstName} ${seller.lastName}` : '';
  });

  readonly statusLabel = computed(() => this.labelFor(this.seller()?.status ?? ''));
  readonly statusSeverity = computed(() => this.severityFor(this.seller()?.status ?? ''));

  /**
   * `SellerCard` (the shape the grid actually passes in, per Task 10's `cardClick`) carries
   * a display-ready `sellerType` name; the detail `Seller` DTO only has `sellerTypeId` (a
   * guid), which is not fit for display — falls back to it only if that's genuinely all
   * that's on hand, so the badge never silently renders empty.
   */
  readonly typeLabel = computed(() => {
    const seller = this.seller();
    if (!seller) return '';
    return 'sellerType' in seller ? seller.sellerType : seller.sellerTypeId;
  });

  constructor() {
    // Re-fetch every time the modal opens for a (new) seller id — "Rein lesend", no
    // caching requirement (matches `getArticles` being a thin, uncached pass-through).
    let lastFetchedFor: string | null = null;

    effect(() => {
      const isVisible = this.visible();
      const sellerId = this.seller()?.id ?? null;

      if (!isVisible || !sellerId) {
        lastFetchedFor = null;
        return;
      }

      if (sellerId === lastFetchedFor) {
        return;
      }
      lastFetchedFor = sellerId;

      this.loadingArticles.set(true);
      this.sellersStore.getArticles(sellerId).subscribe({
        next: (articles) => {
          this.articles.set(articles);
          this.loadingArticles.set(false);
        },
        error: () => {
          this.articles.set([]);
          this.loadingArticles.set(false);
        },
      });
    });
  }

  articleStatusLabel(status: string): string {
    return ARTICLE_STATUS_LABELS[status] ?? status;
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  private labelFor(status: string): string {
    return STATUS_LABELS[status as SellerStatus] ?? status;
  }

  private severityFor(status: string): 'secondary' | 'info' | 'success' {
    return STATUS_SEVERITIES[status as SellerStatus] ?? 'secondary';
  }
}
