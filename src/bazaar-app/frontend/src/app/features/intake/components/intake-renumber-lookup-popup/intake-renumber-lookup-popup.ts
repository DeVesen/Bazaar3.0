import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Input, InputAddon } from '../../../../shared/components/input/input';
import { Numpad } from '../../../../shared/components/numpad/numpad';
// Cross-feature import, read-only: `ArticlesApi.getByNumber()` — same sanctioned pattern
// `intake-article-entry.ts` already uses for the same API.
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';

/**
 * Popup für die Artikelannahme-Umnummerierung (Epic_Artikelannahme): sucht gezielt einen
 * vorregistrierten, noch nicht freigegebenen Artikel eines importierten Verkäufers per
 * Nummer. Reine Prüf-Funktion, keine sonstige Logik — ein Treffer wird per `articleFound`
 * nach oben gereicht, `intake-article-entry` übernimmt das Befüllen der Formularfelder
 * selbst (siehe dessen eigenen Doc-Kommentar zur Umnummerierung).
 */
@Component({
  selector: 'app-intake-renumber-lookup-popup',
  imports: [DialogModule, ButtonModule, Input, Numpad],
  templateUrl: './intake-renumber-lookup-popup.html',
  styleUrl: './intake-renumber-lookup-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeRenumberLookupPopup {
  private readonly articlesApi = inject(ArticlesApi);

  readonly visible = input.required<boolean>();
  readonly sellerId = input.required<string>();

  readonly visibleChange = output<boolean>();
  readonly articleFound = output<ArticleByNumberResult>();

  readonly rawNumber = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(false);
  readonly numpadVisible = signal(false);

  /** Submit (↩, matches `app-input-group`'s old `submitted`/Enter behaviour) + Nummernblock-Toggle
   * — `app-input` embeds no other `app-...` component itself, so the numpad panel is rendered
   * here in the parent and its keys applied directly onto `rawNumber()` (same pattern as
   * `intake-article-entry.ts`'s Preis-Nummernblock). */
  readonly numberAddonRight = computed<InputAddon[]>(() => [
    { type: 'icon', value: 'pi pi-reply', key: 'submit' },
    { type: 'icon', value: 'pi pi-th-large', key: 'numpad' },
  ]);

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.rawNumber.set('');
      this.errorMessage.set(null);
      this.loading.set(false);
      this.numpadVisible.set(false);
    });
  }

  onNumberChange(value: string): void {
    this.rawNumber.set(value);
  }

  onNumberAddonClick(key: string): void {
    if (key === 'submit') {
      this.onLoad();
    } else if (key === 'numpad') {
      this.numpadVisible.update((visible) => !visible);
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    const current = this.rawNumber();
    this.rawNumber.set(key === 'Backspace' ? current.slice(0, -1) : current + key);
  }

  onNumpadClear(): void {
    this.rawNumber.set('');
  }

  onLoad(): void {
    const trimmed = this.rawNumber().trim();
    const number = Number.parseInt(trimmed, 10);
    if (!trimmed || !Number.isFinite(number)) {
      this.errorMessage.set('Bitte eine Artikelnummer eingeben');
      return;
    }

    this.loading.set(true);
    this.articlesApi.getByNumber(number).subscribe({
      next: (article) => this.handleResult(article),
      error: (error: unknown) => this.handleError(error),
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  private handleResult(article: ArticleByNumberResult): void {
    this.loading.set(false);
    const belongsToThisSeller = article.sellerId === this.sellerId();
    const stillRegistered = article.status === 'registered';

    if (!belongsToThisSeller || !stillRegistered) {
      this.errorMessage.set('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
      return;
    }

    this.articleFound.emit(article);
    this.visibleChange.emit(false);
  }

  private handleError(error: unknown): void {
    this.loading.set(false);
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.errorMessage.set('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
      return;
    }
    this.errorMessage.set('Suche fehlgeschlagen. Bitte erneut versuchen.');
  }
}
