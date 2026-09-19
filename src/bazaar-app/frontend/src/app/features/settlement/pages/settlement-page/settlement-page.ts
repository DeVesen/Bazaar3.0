import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { SellerSearch, SellerSummary } from '../../../../shared/components/seller-search/seller-search';
import { ScanDialog } from '../../../../shared/components/scan-dialog/scan-dialog';
import { KpiGrid } from '../../../../shared/components/kpi-tile/kpi-grid';
import { KpiTile } from '../../../../shared/components/kpi-tile/kpi-tile';
import { SettlementPanel } from '../../components/settlement-panel/settlement-panel';
// Cross-feature import, read-only: `SellersApi.search('')` loads the full seller list for
// seller-search to filter in-memory, and `SellersApi.getArticles(id)` loads the read-only
// article table — same sanctioned pattern `intake-page.ts` already uses for the first call
// (task-6b-brief.md, "Cross-feature import of SellersApi into features/settlement/ is
// SANCTIONED — mirror intake-page.ts's exact precedent").
// eslint-disable-next-line boundaries/dependencies
import { ArticleSummary, SellersApi } from '../../../sellers/data/sellers-api';
import { PrintService } from '../../../../core/print/print.service';
import { SellerSettlement, SettlementApi } from '../../data/settlement-api';

type SettlementState = 'selection' | 'view';

/** Article status labels for the read-only settlement article table — the four real backend
 * status strings (verified: `ArticleStatus` enum `Registered/Selling/Sold/Returned` serializes
 * lowercase, see `ArticlesBySellerQuery.cs`/`ArticleEndpoints.cs`). Deliberately NOT copied from
 * `seller-detail-modal.ts`'s own `ARTICLE_STATUS_LABELS` — that map has a pre-existing bug (key
 * `'released'`, which is not a real status string, and missing `'registered'`/`'selling'`
 * entirely); not this task's bug to fix there, just not propagated here. */
const ARTICLE_STATUS_LABELS: Record<string, string> = {
  registered: 'Angenommen',
  selling: 'Im Verkauf',
  sold: 'Verkauft',
  returned: 'Zurückgegeben',
};

/**
 * Round-20 Task 6b — replaces the Round-7 placeholder. Wizard-style page (AC-1): always starts
 * at the seller-selection step, then switches to the Abrechnungs-Ansicht for the selected
 * seller. "Abrechnen" itself is out of scope this round (plan.md/spec.md, Round-21) — its click
 * only shows an info toast. "Zurückgeben" opens `scan-dialog` in `writeMode="immediate"`, which
 * writes each returned article straight away (no batch/optimistic update) and every confirmed
 * scan reloads both the settlement read-model and the article list.
 */
@Component({
  selector: 'app-settlement-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    TableModule,
    TagModule,
    SellerSearch,
    ScanDialog,
    KpiGrid,
    KpiTile,
    SettlementPanel,
  ],
  templateUrl: './settlement-page.html',
  styleUrl: './settlement-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementPage {
  private readonly sellersApi = inject(SellersApi);
  private readonly settlementApi = inject(SettlementApi);
  private readonly printService = inject(PrintService);
  private readonly messageService = inject(MessageService);

  /** AC-1: always starts at `'selection'` — no persistence, nothing to restore. */
  readonly state = signal<SettlementState>('selection');

  readonly sellers = signal<SellerSummary[]>([]);
  readonly selectedSellerId = signal<string | null>(null);
  readonly settlement = signal<SellerSettlement | null>(null);
  readonly articles = signal<ArticleSummary[]>([]);
  readonly scanDialogVisible = signal(false);
  readonly settlePanelVisible = signal(false);
  readonly settleError = signal<string | null>(null);

  readonly hint = 'ENTER bei 1 Treffer oder direkt klicken';

  /** "Zurückgeben" enabled-state. Override rule (spec.md): a settled seller is always `false`
   * here, regardless of what `openCount` would otherwise say. */
  readonly canReturn = computed(
    () => this.settlement()?.settledAt == null && (this.settlement()?.openCount ?? 0) > 0,
  );

  /** "Abrechnen" enabled-state — `canSettle` is delivered by the backend, never recomputed here.
   * Same settled-override rule as `canReturn`. */
  readonly canSettleClick = computed(
    () => this.settlement()?.settledAt == null && this.settlement()?.canSettle === true,
  );

  readonly isSettled = computed(() => this.settlement()?.settledAt != null);

  constructor() {
    this.loadSellers();
  }

  onSellerSelected(seller: SellerSummary): void {
    this.selectedSellerId.set(seller.id);
    this.state.set('view');
    this.loadSettlement();
    this.loadArticles();
  }

  onBack(): void {
    this.state.set('selection');
    this.selectedSellerId.set(null);
    this.settlement.set(null);
    this.articles.set([]);
  }

  onPrint(): void {
    const sellerId = this.selectedSellerId();
    if (!sellerId) return;
    this.printService.printSellerSummary({
      sellerId,
      phase: this.isSettled() ? 'final' : 'preliminary',
    });
  }

  onReturnClick(): void {
    this.scanDialogVisible.set(true);
  }

  onSettleClick(): void {
    this.settleError.set(null);
    this.settlePanelVisible.set(true);
  }

  onSettlePanelVisibleChange(visible: boolean): void {
    this.settlePanelVisible.set(visible);
    if (!visible) {
      this.settleError.set(null);
    }
  }

  onSettleConfirmed(): void {
    const sellerId = this.selectedSellerId();
    const payoutAmount = this.settlement()?.payout;
    if (!sellerId || payoutAmount === undefined) return;

    this.settlementApi.settle(sellerId, payoutAmount).subscribe({
      next: () => {
        this.settlePanelVisible.set(false);
        this.settleError.set(null);
        // Der Server hat gerade alle ReleasedAt == null-Artikel hart gelöscht (settlement.md
        // §4) — ohne loadArticles() würde die Tabelle sie fälschlich weiter als "Angenommen"
        // zeigen. Gleiches Muster wie onArticleConfirmed().
        this.loadSettlement();
        this.loadArticles();
        this.printService.printSellerSummary({ sellerId, phase: 'final' });
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.errorCode === 'settlement.already_settled') {
          // Zustand hat sich bereits geändert (spec.md) — Popup schließen, Ansicht neu laden.
          this.settlePanelVisible.set(false);
          this.settleError.set(null);
          this.loadSettlement();
          this.loadArticles();
          this.messageService.add({ severity: 'info', summary: 'Verkäufer ist bereits abgerechnet' });
          return;
        }
        // 409 settlement.articles_open / 400 settlement.payout_mismatch: keep the popup open,
        // show the server's own message.
        this.settleError.set(err.error?.detail ?? 'Abrechnung fehlgeschlagen');
      },
    });
  }

  onScanDialogVisibleChange(visible: boolean): void {
    this.scanDialogVisible.set(visible);
  }

  /** No optimistic local update (plan.md, explicit "einfacher und bei diesem Datenvolumen
   * unkritisch") — both the settlement read-model and the article list are reloaded from the
   * server after every confirmed return. */
  onArticleConfirmed(articleId: string): void {
    this.settlementApi.returnArticle(articleId).subscribe({
      next: () => {
        this.loadSettlement();
        this.loadArticles();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Rückgabe fehlgeschlagen' });
      },
    });
  }

  articleStatusLabel(status: string): string {
    return ARTICLE_STATUS_LABELS[status] ?? status;
  }

  private loadSellers(): void {
    this.sellersApi.search('').subscribe((results) => {
      this.sellers.set(
        results.map((r) => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          zip: '',
          city: r.city ?? '',
          settledAt: r.settledAt,
        })),
      );
    });
  }

  private loadSettlement(): void {
    const sellerId = this.selectedSellerId();
    if (!sellerId) return;
    this.settlementApi.getSettlement(sellerId).subscribe((settlement) => this.settlement.set(settlement));
  }

  /** "sortiert nach Artikelnummer aufsteigend" (spec.md) is a fixed default order, not a
   * user-toggleable column sort — sorted here once, `p-table` renders as-is. */
  private loadArticles(): void {
    const sellerId = this.selectedSellerId();
    if (!sellerId) return;
    this.sellersApi.getArticles(sellerId).subscribe((articles) => {
      this.articles.set([...articles].sort((a, b) => a.number - b.number));
    });
  }
}
