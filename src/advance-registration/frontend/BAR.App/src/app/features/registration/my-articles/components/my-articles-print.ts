import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { ArticleResponse } from '../articles-api.service';

export interface MyArticlesPrintModel {
  articles: ArticleResponse[];
  /** Angemeldeter Benutzer (E-Mail aus dem Token). */
  owner: string;
  /** Aktive Filter als Klartext, z. B. „Marke: Zara · Suche: Hose"; leer = ohne Filter. */
  filterText: string;
  printedAt: Date;
}

const CURRENCY = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

/**
 * A4-Druckdokument der Liste „Meine Artikel": dieselben Spalten wie die Tabelle (Nr., Bezeichnung,
 * Kategorie, Marke, Preis) in derselben Reihenfolge und mit denselben Filtern — aber alle Seiten
 * der Tabelle, nicht nur die angezeigte. Reine Darstellung, kein HTTP. Der Tabellenkopf wiederholt
 * sich auf jeder Druckseite (`table-header-group`), Zeilen brechen nicht über Seiten.
 */
@Component({
  selector: 'app-my-articles-print',
  imports: [DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="print-head">
      <h1>{{ 'myArticles.title' | translate }}</h1>
      <div class="print-meta">
        <span data-testid="print-owner">{{ model().owner }}</span>
        <span>{{ model().printedAt | date: 'dd.MM.yyyy, HH:mm' }}</span>
      </div>
      @if (model().filterText) {
        <p class="print-filter" data-testid="print-filter">{{ 'myArticles.print.filter' | translate }}: {{ model().filterText }}</p>
      }
    </header>

    <table class="print-table">
      <thead>
        <tr>
          <th class="num">{{ 'myArticles.columnNumber' | translate }}</th>
          <th>{{ 'myArticles.columnName' | translate }}</th>
          <th>{{ 'myArticles.columnCategory' | translate }}</th>
          <th>{{ 'myArticles.columnBrand' | translate }}</th>
          <th class="num">{{ 'myArticles.columnPrice' | translate }}</th>
        </tr>
      </thead>
      <tbody>
        @for (article of model().articles; track article.id) {
          <tr data-testid="print-row">
            <td class="num">{{ article.number }}</td>
            <td>{{ article.name }}</td>
            <td>{{ article.category }}</td>
            <td>{{ article.brand }}</td>
            <td class="num">{{ formatCurrency(article.price) }}</td>
          </tr>
        }
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" data-testid="print-count">{{ 'myArticles.print.count' | translate: { count: model().articles.length } }}</td>
          <td class="num" data-testid="print-total">{{ formatCurrency(total()) }}</td>
        </tr>
      </tfoot>
    </table>
  `,
  styles: `
    :host {
      display: block;
      background: #fff;
      color: #000;
      font-family: var(--font-body, sans-serif);
      font-size: 10pt;
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1 {
      margin: 0 0 2mm;
      font-family: var(--font-heading, sans-serif);
      font-size: 16pt;
    }

    .print-meta {
      display: flex;
      justify-content: space-between;
      gap: 4mm;
    }

    .print-filter {
      margin: 1mm 0 0;
    }

    .print-head {
      margin-bottom: 4mm;
    }

    .print-table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-row-group;
    }

    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    th,
    td {
      padding: 1.5mm 2mm;
      text-align: left;
      border-bottom: 1px solid #ccc;
      vertical-align: top;
    }

    th {
      background: #e6e6e6;
      font-weight: 700;
    }

    tfoot td {
      font-weight: 700;
      border-top: 2px solid #000;
      border-bottom: none;
    }

    .num {
      text-align: right;
      white-space: nowrap;
    }
  `
})
export class MyArticlesPrint {
  readonly model = input.required<MyArticlesPrintModel>();

  readonly total = computed(() => this.model().articles.reduce((sum, article) => sum + article.price, 0));

  formatCurrency(value: number): string {
    return CURRENCY.format(value);
  }
}
