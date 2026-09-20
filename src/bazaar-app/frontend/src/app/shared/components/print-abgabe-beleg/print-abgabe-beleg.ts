import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { QrCode } from '../qr-code/qr-code';

/**
 * Seller data this receipt needs (docs/requirements/bazaar-app/components/print-abgabe-beleg.md
 * Abschnitt 2 "Verkäuferdaten"). Deliberately its own shape, not `SellerSummary` from
 * `seller-search.ts` — that shape has no `address`/`phone`, which this receipt must print.
 */
export interface PrintAbgabeBelegSeller {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
}

/** One line of the article table (doc Abschnitt 1 "Nr./Bezeichnung/Marke/Preis"). */
export interface PrintAbgabeBelegArticle {
  number: number;
  name: string;
  brand: string | null;
  price: number;
}

/**
 * Cross-app dumb/leaf print view (docs/requirements/bazaar-app/components/print-abgabe-beleg.md)
 * — a receipt for articles handed in plus the paid Annahmegebühr (AC-1..AC-3, AC-6). Pure
 * presentation: no HTTP, no service injection beyond Angular's own `DatePipe`, all data comes in
 * as `input()` signals. Task 2 (a later, separate task) is responsible for instantiating this
 * component dynamically and feeding it real data right after a successful booking (AC-4); this
 * component itself never fetches or decides when it is shown.
 *
 * Currency formatting deliberately does NOT use `CurrencyPipe:'EUR'` (that pipe falls back to
 * `en-US` formatting, e.g. "€12.00", because this project registers no `LOCALE_ID`/locale data —
 * see the Round-22 fix in statistics-page.ts, commit 7f00c5c). Instead this component follows
 * that same fix's pattern: a private `formatCurrency` helper on `Intl.NumberFormat('de-DE', ...)`.
 * Date formatting stays on Angular's own `DatePipe` without an explicit locale id, matching
 * `article-status-popup.ts`'s documented reasoning: the format string used here (`dd.MM.yyyy,
 * HH:mm`) is digits-only and locale-independent, so the default `LOCALE_ID` (`en-US`, needs no
 * registration) already produces the correct output — passing `'de-DE'` explicitly would throw
 * `NG0701` since no locale data for it is registered anywhere in this project.
 */
@Component({
  selector: 'app-print-abgabe-beleg',
  imports: [DatePipe, QrCode],
  template: `
    <div class="print-abgabe-beleg">
      <header class="print-abgabe-beleg__header">
        <div class="print-abgabe-beleg__title-block">
          <h1 class="print-abgabe-beleg__title">Basar — Abgabe-Beleg</h1>
          <p class="print-abgabe-beleg__occurred-at">
            Abgegeben am {{ occurredAt() | date: 'dd.MM.yyyy, HH:mm' }}
          </p>
        </div>
        <app-qr-code [value]="seller().id" [caption]="seller().id" />
      </header>

      <section class="print-abgabe-beleg__seller">
        <p class="print-abgabe-beleg__seller-name">{{ seller().firstName }} {{ seller().lastName }}</p>
        @if (seller().address) {
          <p>{{ seller().address }}</p>
        }
        @if (cityLine()) {
          <p>{{ cityLine() }}</p>
        }
        @if (seller().phone) {
          <p>{{ seller().phone }}</p>
        }
      </section>

      <table class="print-abgabe-beleg__articles">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Bezeichnung</th>
            <th>Marke</th>
            <th>Preis</th>
          </tr>
        </thead>
        <tbody>
          @for (article of articles(); track article.number) {
            <tr>
              <td>{{ article.number }}</td>
              <td>{{ article.name }}</td>
              <td>{{ article.brand ?? '' }}</td>
              <td>{{ formatCurrency(article.price) }}</td>
            </tr>
          }
        </tbody>
      </table>

      <footer class="print-abgabe-beleg__footer">
        <p>{{ articles().length }} Artikel</p>
        <p>
          Annahmegebühr {{ articles().length }} &times; {{ formatCurrency(feePerItem()) }} =
          {{ formatCurrency(feePerItem() * articles().length) }}
        </p>
        <p class="print-abgabe-beleg__fee-paid">{{ formatCurrency(feeAmount()) }} bezahlt</p>
      </footer>
    </div>
  `,
  styleUrl: './print-abgabe-beleg.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintAbgabeBeleg {
  readonly seller = input.required<PrintAbgabeBelegSeller>();
  readonly articles = input.required<PrintAbgabeBelegArticle[]>();
  readonly feePerItem = input.required<number>();
  readonly feeAmount = input.required<number>();
  readonly occurredAt = input.required<Date>();

  /** "PLZ Ort" line — hidden entirely when both are `null` rather than printing a lone space. */
  readonly cityLine = computed<string | null>(() => {
    const postalCode = this.seller().postalCode;
    const city = this.seller().city;
    if (!postalCode && !city) {
      return null;
    }
    return [postalCode, city].filter((part): part is string => !!part).join(' ');
  });

  /**
   * de-DE currency formatting without relying on Angular's `CurrencyPipe`/`LOCALE_ID` (see class
   * doc comment) — same `Intl.NumberFormat` pattern as `statistics-page.ts`'s `formatCurrency`.
   */
  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
