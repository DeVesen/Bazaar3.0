import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule, TableRowSelectEvent } from 'primeng/table';

/** Eine Zeile des Voranmeldungs-Dialogs — ein Artikel des Verkäufers mit Status „Registriert". */
export interface PreRegisteredArticle {
  id: string;
  number: number;
  name: string;
  category: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  price: number;
}

/**
 * Dialog „Aus Voranmeldung übernehmen" der Artikelerfassung (Epic_Artikelannahme Abschnitt 2):
 * listet die noch nicht freigegebenen Artikel des Verkäufers (80 % Breite/Höhe); ein Klick (oder
 * Enter/Leertaste) auf eine Zeile wählt den Artikel und schließt den Dialog. Dumb Component — die
 * Liste kommt vom Parent; `articleSelected` feuert erst NACH dem Schließen (`onHide`), damit der
 * Parent den Fokus ins Nummernfeld setzen kann, ohne dass der Dialog ihn danach noch verschiebt.
 */
@Component({
  selector: 'app-pre-registered-articles-dialog',
  imports: [CurrencyPipe, DialogModule, TableModule],
  templateUrl: './pre-registered-articles-dialog.html',
  styleUrl: './pre-registered-articles-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreRegisteredArticlesDialog {
  readonly visible = input(false);
  readonly articles = input<PreRegisteredArticle[]>([]);
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
  readonly articleSelected = output<PreRegisteredArticle>();

  private picked: PreRegisteredArticle | null = null;

  onRowSelect(event: TableRowSelectEvent<PreRegisteredArticle>): void {
    const article = event.data;
    if (!article || Array.isArray(article)) return;
    this.picked = article;
    this.visibleChange.emit(false);
  }

  onHide(): void {
    const picked = this.picked;
    this.picked = null;
    if (picked) this.articleSelected.emit(picked);
  }
}
