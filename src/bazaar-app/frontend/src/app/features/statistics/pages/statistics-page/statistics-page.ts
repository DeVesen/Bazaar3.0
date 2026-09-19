import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MeterGroupModule, MeterItem } from 'primeng/metergroup';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { KpiGrid } from '../../../../shared/components/kpi-tile/kpi-grid';
import { KpiTile } from '../../../../shared/components/kpi-tile/kpi-tile';
import { Leaderboard } from '../../components/leaderboard/leaderboard';
// Cross-feature import, read-only: `SellerTypesApi.getAll()` loads the type list for the
// leaderboard's type-filter dropdown — same sanctioned pattern `settlement-page.ts` already
// uses for `SellersApi` (task-B-brief.md, "the SAME kind of sanctioned cross-feature read-only
// import"). `SellerTypesStore` is deliberately NOT used here — its `create`/`update`/`remove`
// mutate, and this page only ever reads the list.
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { Statistics, StatisticsApi } from '../../data/statistics-api';

interface TypeFilterOption {
  label: string;
  value: string | null;
}

/**
 * Round-22 Task B — replaces the Round-7 placeholder. Read-only statistics page: one
 * `GET /api/statistics` call per page load, a second one only when the type-filter dropdown
 * changes (spec.md/epic.md, Epic_Statistik). No client-side aggregation — every KPI number
 * comes straight from `StatisticsApi`'s response.
 */
@Component({
  selector: 'app-statistics-page',
  imports: [CurrencyPipe, FormsModule, CardModule, MeterGroupModule, SelectModule, KpiGrid, KpiTile, Leaderboard],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPage {
  private readonly statisticsApi = inject(StatisticsApi);
  private readonly sellerTypesApi = inject(SellerTypesApi);
  private readonly messageService = inject(MessageService);

  readonly statistics = signal<Statistics | null>(null);
  readonly sellerTypes = signal<SellerType[]>([]);
  readonly selectedTypeId = signal<string | null>(null);
  readonly loading = signal(false);

  readonly typeFilterOptions = computed<TypeFilterOption[]>(() => [
    { label: 'Alle Verkäufer-Typen', value: null },
    ...this.sellerTypes().map((t) => ({ label: t.name, value: t.id })),
  ]);

  /** `sellRate` renders as e.g. "82,05 %" when present; `null` is passed straight through to
   * `KpiTile` (never pre-formatted into a string) so its own `displayValue` computed renders
   * the `—` fallback (AC: never a fake `0`). */
  readonly sellRateDisplay = computed<string | null>(() => {
    const rate = this.statistics()?.articles.sellRate ?? null;
    return rate === null ? null : `${this.formatPercent(rate)} %`;
  });

  /** AC-6: sub-label only shown when the manual share is actually greater than zero. */
  readonly grossIncomeManualSubLabel = computed<string>(() => {
    const manual = this.statistics()?.finance.grossIncomeManual ?? 0;
    return manual > 0 ? `davon manuell: ${this.formatCurrency(manual)}` : '';
  });

  /** Segments of the meter group, in percent of `articles.accepted` (not of total) —
   * epic.md: "bezogen auf alle angenommenen Artikel". Guarded against `accepted === 0`. */
  readonly meterItems = computed<MeterItem[]>(() => {
    const s = this.statistics();
    if (!s || s.articles.accepted === 0) return [];
    const pct = (n: number) => Math.round((n / s.articles.accepted) * 1000) / 10;
    return [
      { label: `${pct(s.articles.selling)}% Im Verkauf`, value: pct(s.articles.selling), color: 'var(--p-primary-color)' },
      { label: `${pct(s.articles.sold)}% Verkauft`, value: pct(s.articles.sold), color: 'var(--p-green-500)' },
      { label: `${pct(s.articles.returned)}% Retour`, value: pct(s.articles.returned), color: 'var(--p-orange-400)' },
    ];
  });

  constructor() {
    this.loadSellerTypes();
    this.loadStatistics();
  }

  /** Only this interaction triggers a second `GET /api/statistics` request (spec.md). */
  onTypeFilterChange(sellerTypeId: string | null): void {
    this.selectedTypeId.set(sellerTypeId);
    this.loadStatistics();
  }

  private loadSellerTypes(): void {
    this.sellerTypesApi.getAll().subscribe((types) => this.sellerTypes.set(types));
  }

  private loadStatistics(): void {
    this.loading.set(true);
    this.statisticsApi.getStatistics(this.selectedTypeId()).subscribe({
      next: (statistics) => {
        this.statistics.set(statistics);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Statistik konnte nicht geladen werden' });
      },
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }

  private formatPercent(value: number): string {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}
