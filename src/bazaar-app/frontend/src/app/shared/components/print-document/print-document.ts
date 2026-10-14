import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { QrCode } from '../qr-code/qr-code';
import {
  PRINT_LAYOUT,
  PX_PER_MM,
  firstPageListHeightMm,
  listCapacityRows,
  paginateRows,
  restPageListHeightMm,
} from './print-document.layout';
import { renderPrintMarkdown } from './print-document.markdown';
import { PrintDocumentModel, PrintRow, flattenGroups, formatCurrency } from './print-document.model';

/**
 * Gemeinsames A4-Druckdokument für Abgabe-Beleg und Verkäufer-Übersicht — reine Darstellung
 * eines fertigen `PrintDocumentModel`, kein HTTP, keine Fachlogik. Die Seitenaufteilung ist
 * deterministisch (feste Maße aus `PRINT_LAYOUT`); nur die Höhe von Freitext 3 wird einmal
 * gemessen (`applyMeasurement()`), bevor gedruckt wird.
 *
 * `ViewEncapsulation.None`: Die Markdown-Ausgabe kommt per `[innerHTML]` und trägt keine
 * Encapsulation-Attribute, gekapselte Stile würden sie nicht erreichen.
 */
@Component({
  selector: 'app-print-document',
  imports: [DatePipe, QrCode],
  templateUrl: './print-document.html',
  styleUrl: './print-document.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintDocument {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly model = input.required<PrintDocumentModel>();

  protected readonly layout = PRINT_LAYOUT;
  protected readonly formatCurrency = formatCurrency;

  private readonly freitext3Mm = signal(0);

  /**
   * Höhe des Listenbereichs je Seite (mm). Die Liste reicht damit unabhängig von der Zeilenzahl
   * bis direkt über die Fußzeile; `flex: 1 1 auto` gleicht Rundungsreste aus.
   */
  protected readonly firstListMm = computed<number>(() => firstPageListHeightMm(this.freitext3Mm()));
  protected readonly restListMm = restPageListHeightMm();

  private readonly rows = computed<PrintRow[]>(() => flattenGroups(this.model().groups));

  readonly pages = computed<PrintRow[][]>(() =>
    paginateRows(
      this.rows(),
      listCapacityRows(this.firstListMm()),
      listCapacityRows(this.restListMm),
      (row) => row.kind === 'group',
    ),
  );

  protected readonly headLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text1));
  protected readonly headCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text2));
  protected readonly freitext3Html = computed(() => renderPrintMarkdown(this.model().freitexts.text3));
  protected readonly footLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text4));
  protected readonly footCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text5));

  /** „PLZ Ort" — entfällt komplett, wenn beides fehlt, statt ein einzelnes Leerzeichen zu drucken. */
  protected readonly cityLine = computed<string>(() => {
    const { postalCode, city } = this.model().seller;
    return [postalCode, city].filter((part): part is string => !!part).join(' ');
  });

  /** Anschrift in einer Zeile für die Fortsetzungsseiten (ab Seite 2). */
  protected readonly addressLine = computed<string>(() => {
    const { firstName, lastName, address } = this.model().seller;
    return [`${firstName} ${lastName}`, address, this.cityLine()].filter((part) => !!part).join(', ');
  });

  /**
   * Misst die Höhe des Freitext-3-Blocks von Seite 1 (in mm) und verteilt die Tabellenzeilen
   * neu. Ohne Layout-Engine (z. B. jsdom) ist die Höhe 0 und die Aufteilung bleibt unverändert.
   * Die Höhe ist auf `PRINT_LAYOUT.maxFreitext3Mm` begrenzt (der Block selbst trägt dieselbe
   * `max-height`), damit ein langer Freitext 3 Liste und Fußzeile nicht von Seite 1 verdrängt.
   */
  applyMeasurement(): void {
    const block = this.host.nativeElement.querySelector<HTMLElement>('.print-doc__freitext3');
    const heightPx = block?.getBoundingClientRect().height ?? 0;
    this.freitext3Mm.set(Math.min(heightPx / PX_PER_MM, PRINT_LAYOUT.maxFreitext3Mm));
  }
}
