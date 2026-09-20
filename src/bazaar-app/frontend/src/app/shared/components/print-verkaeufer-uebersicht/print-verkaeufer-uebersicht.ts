import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QrCode } from '../qr-code/qr-code';

/**
 * Seller data this sheet needs
 * (docs/requirements/bazaar-app/components/print-verkaeufer-uebersicht.md Abschnitt 1
 * "ASCII-Darstellung"). Deliberately its own shape, derived from `SellerSettlementSeller` but
 * without `address` — this sheet only ever prints name and PLZ/Ort, never the street address.
 */
export interface PrintVerkaeuferUebersichtSeller {
  id: string;
  firstName: string;
  lastName: string;
  postalCode: string | null;
  city: string | null;
}

/**
 * One article line (doc Abschnitt 2 "Artikelgruppen"). Deliberately its own shape, derived from
 * `ArticleSummary` — this component groups by `status` itself (AC-1/AC-2/AC-7), so it only needs
 * the raw status string, not the timestamps `ArticleSummary` carries.
 */
export interface PrintVerkaeuferUebersichtArticle {
  number: number;
  name: string;
  price: number;
  status: string;
}

/**
 * The three settlement amounts (doc Abschnitt 3 "Abrechnungsposten", AC-3/AC-4) — same rounded
 * values as `settlement-panel`'s `SellerSettlement`, so this sheet never recomputes anything.
 */
export interface PrintVerkaeuferUebersichtSettlement {
  revenue: number;
  commission: number;
  payout: number;
  commissionRate: number;
  intakeFeePaid: number;
}

/**
 * Cross-app dumb/leaf print view
 * (docs/requirements/bazaar-app/components/print-verkaeufer-uebersicht.md) — one sheet used at
 * two points in time: as a collection list before the return scan ("Noch im Verkauf" still
 * populated, `phase() === 'preliminary'`) and as the final payout receipt afterwards
 * (`phase() === 'final'`). Pure presentation, same pattern as `print-abgabe-beleg.ts`: no HTTP,
 * no service injection, all data comes in as `input()` signals, no own rounding or arithmetic on
 * the settlement amounts (AC-3).
 */
@Component({
  selector: 'app-print-verkaeufer-uebersicht',
  imports: [QrCode],
  template: `
    <div class="print-verkaeufer-uebersicht">
      <header class="print-verkaeufer-uebersicht__header">
        <div class="print-verkaeufer-uebersicht__title-block">
          <h1 class="print-verkaeufer-uebersicht__title">Basar — Verkäufer-Übersicht</h1>
          <p class="print-verkaeufer-uebersicht__seller-name">
            {{ seller().firstName }} {{ seller().lastName }}
          </p>
          @if (cityLine()) {
            <p>{{ cityLine() }}</p>
          }
        </div>
        <app-qr-code [value]="seller().id" [caption]="seller().id" />
      </header>

      @for (group of articleGroups(); track group.label) {
        <section class="print-verkaeufer-uebersicht__group">
          <h2>{{ group.label }} ({{ group.articles.length }})</h2>
          @if (group.articles.length > 0) {
            <ul>
              @for (article of group.articles; track article.number) {
                <li>
                  <span>{{ article.number }}</span>
                  <span>{{ article.name }}</span>
                  <span>{{ formatCurrency(article.price) }}</span>
                </li>
              }
            </ul>
          } @else {
            <p>—</p>
          }
        </section>
      }

      <section class="print-verkaeufer-uebersicht__settlement">
        <div class="print-verkaeufer-uebersicht__row">
          <span>Umsatz</span>
          <span>{{ formatCurrency(settlement().revenue) }}</span>
        </div>
        <div class="print-verkaeufer-uebersicht__row">
          <span>Provision ({{ formatPercent(settlement().commissionRate) }})</span>
          <span>− {{ formatCurrency(settlement().commission) }}</span>
        </div>
        <div class="print-verkaeufer-uebersicht__row print-verkaeufer-uebersicht__row--total">
          <span>Auszahlung</span>
          <span>{{ formatCurrency(settlement().payout) }}</span>
        </div>
      </section>

      <p class="print-verkaeufer-uebersicht__fee-hint">
        Annahmegebühr {{ formatCurrency(settlement().intakeFeePaid) }} bereits bezahlt.
      </p>

      @if (phase() === 'preliminary') {
        <p class="print-verkaeufer-uebersicht__preliminary-hint">
          VORLÄUFIG — es sind noch Artikel im Verkauf.
        </p>
      }
    </div>
  `,
  styleUrl: './print-verkaeufer-uebersicht.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintVerkaeuferUebersicht {
  readonly seller = input.required<PrintVerkaeuferUebersichtSeller>();
  readonly articles = input.required<PrintVerkaeuferUebersichtArticle[]>();
  readonly settlement = input.required<PrintVerkaeuferUebersichtSettlement>();
  readonly phase = input.required<'preliminary' | 'final'>();

  readonly sellingArticles = computed(() =>
    this.articles().filter((article) => article.status === 'selling'),
  );
  readonly soldArticles = computed(() => this.articles().filter((article) => article.status === 'sold'));
  readonly returnedArticles = computed(() =>
    this.articles().filter((article) => article.status === 'returned'),
  );

  /**
   * Combines the three status-filtered computeds above into one array so the template renders
   * all three groups through a single `@for` block instead of three structurally identical
   * `@if`/`@for`/`@else` sections (AC-1/AC-2: fixed order "Noch im Verkauf" → "Verkauft" →
   * "Zurückgegeben"). The three separate computeds stay in place — they are what the spec
   * asserts against directly — this just recombines their results for rendering.
   */
  readonly articleGroups = computed<
    { label: string; articles: PrintVerkaeuferUebersichtArticle[] }[]
  >(() => [
    { label: 'Noch im Verkauf', articles: this.sellingArticles() },
    { label: 'Verkauft', articles: this.soldArticles() },
    { label: 'Zurückgegeben', articles: this.returnedArticles() },
  ]);

  /** "PLZ Ort" line — hidden entirely when both are `null` rather than printing a lone space
   * (same pattern as `print-abgabe-beleg.ts`'s `cityLine`). */
  readonly cityLine = computed<string | null>(() => {
    const postalCode = this.seller().postalCode;
    const city = this.seller().city;
    if (!postalCode && !city) {
      return null;
    }
    return [postalCode, city].filter((part): part is string => !!part).join(' ');
  });

  /**
   * de-DE currency formatting without relying on Angular's `CurrencyPipe`/`LOCALE_ID` (see
   * `print-abgabe-beleg.ts`'s class doc comment) — same `Intl.NumberFormat` pattern.
   */
  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }

  /**
   * `commissionRate` arrives as a plain number already in percent form (e.g. `12.5` means
   * "12.5 %", not the fraction `0.125` — same convention as `seller-types`' `commissionRate`),
   * so this formats the raw number de-DE and appends the `%` sign itself rather than using
   * `Intl.NumberFormat`'s `style: 'percent'` (which expects a 0..1 fraction).
   */
  protected formatPercent(value: number): string {
    return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value)} %`;
  }
}
