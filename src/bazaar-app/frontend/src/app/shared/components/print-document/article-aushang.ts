import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { AushangModel, AushangRow, flattenAushangGroups } from './article-aushang.model';
import {
  PRINT_LAYOUT,
  aushangListHeightMm,
  listCapacityRows,
  paginateRows,
} from './print-document.layout';
import { renderPrintMarkdown } from './print-document.markdown';
import { formatCurrency } from './print-document.model';

/**
 * A4-Druckdokument „Artikel-Aushang": nach Kategorie gruppierte Artikelliste mit Bezeichnung,
 * Marke, Farbe, Größe und Preis — reine Darstellung eines fertigen `AushangModel`, kein HTTP,
 * keine Fachlogik. Kopf und Fuß sind in drei gleiche Drittel geteilt: links und Mitte je ein
 * Markdown-Freitext, rechts Datum/Uhrzeit des Drucks bzw. „Seite x von y".
 *
 * Die Seitenaufteilung ist deterministisch (feste Maße aus `PRINT_LAYOUT`), es gibt nichts zu
 * messen. Stile und Klassen stammen aus `print-document.scss` — Kopf, Fuß, Tabelle und
 * Gruppenzeile sehen aus wie im Beleg. `ViewEncapsulation.None` aus demselben Grund wie dort:
 * die Markdown-Ausgabe kommt per `[innerHTML]` und trägt keine Encapsulation-Attribute.
 */
@Component({
  selector: 'app-article-aushang',
  imports: [DatePipe],
  templateUrl: './article-aushang.html',
  styleUrl: './print-document.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleAushang {
  readonly model = input.required<AushangModel>();

  protected readonly layout = PRINT_LAYOUT;
  protected readonly listMm = aushangListHeightMm();
  protected readonly formatCurrency = formatCurrency;

  private readonly rows = computed<AushangRow[]>(() => flattenAushangGroups(this.model().groups));

  /** Eine Kategorie-Überschrift steht nie allein am Seitenende (`paginateRows`). */
  readonly pages = computed<AushangRow[][]>(() => {
    const capacity = listCapacityRows(this.listMm);
    return paginateRows(this.rows(), capacity, capacity, (row) => row.kind === 'group');
  });

  protected readonly headLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text1));
  protected readonly headCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text2));
  protected readonly footLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text3));
  protected readonly footCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text4));
}
