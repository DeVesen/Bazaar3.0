import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { ScanFeedback } from '../../../../shared/components/scan-feedback/scan-feedback';
// Cross-feature import, read-only: `ArticlesApi.getByNumber()`/`.getNextNumber()` back the
// Artikelnummer-Prüfung/Nummernvorschlag — same sanctioned pattern as the other cross-feature
// imports below (`CategoriesApi`/`BrandsApi`/`SellersApi`).
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
// Cross-feature import, read-only: `CategoriesApi.getAll()`/`.create()` populates the category
// field, same sanctioned pattern `artikel-dialog.ts` already uses.
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
// Cross-feature import, read-only: `SellersApi.getById()` loads the seller's `feePerItem`, same
// sanctioned pattern `intake-wizard.ts` already uses for `SellersApi`/`SellerTypesApi`.
// eslint-disable-next-line boundaries/dependencies
import { SellersApi } from '../../../sellers/data/sellers-api';

/**
 * A single article entered into THIS intake session, held locally until the whole session is
 * booked (`POST /api/intake`, Round-17 Task 7). `localId` is a stable client-side key distinct
 * from `number` — the article number is not guaranteed unique across pending entries before
 * booking (e.g. a user correcting a typo by re-entering the same number twice), so the list
 * needs something else to track/delete/edit entries by.
 */
export interface SessionArticle {
  localId: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
}

/**
 * Wizard Schritt-2 container (Epic_Artikelannahme Abschnitt 2) — replaces the Round-16
 * `intake-step-two-placeholder`. Left column (70%): the article entry form (Artikelnummer with
 * camera/scan-feedback, Bezeichnung, Kategorie/Marke, Preis, Größe/Farbe, Beschreibung,
 * "Übernehmen"). Right column (30%): a minimal, non-interactive session article list — Round-17
 * Task 7 replaces this with a real `intake-session-list` child component (click-to-edit via
 * `session-item-popup`, delete, payment panel); `items`/`feePerItem` are already shaped as plain
 * signals so that swap is template-only, no data rework (see this class's own doc comments below
 * on `items`/`feePerItem`).
 */
@Component({
  selector: 'app-intake-article-entry',
  imports: [FormsModule, ButtonModule, InputTextModule, TextareaModule, AutocompleteCreate, InputGroup, ScanFeedback],
  templateUrl: './intake-article-entry.html',
  styleUrl: './intake-article-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeArticleEntry {
  private readonly articlesApi = inject(ArticlesApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly brandsApi = inject(BrandsApi);
  private readonly sellersApi = inject(SellersApi);

  readonly sellerId = input.required<string>();

  /**
   * Round-17 Task 7's wiring contract (not driven by anything in this task — no payment-panel,
   * no `POST /api/intake` call yet). Task 7 emits this after a successful booking; see the TODO
   * near `onSubmitEntry()` below for exactly where that call would live.
   */
  readonly booked = output<void>();

  /**
   * `input-group`'s search/price variants have no reactive `value` input as of Round-16/17
   * (established gap, see `artikel-dialog.ts`'s identical `priceInputGroup` viewChild) — these
   * two viewChilds let the seeding/reset effects below push a value into the rendered
   * component imperatively via `applyExternalValue()`.
   */
  private readonly numberInputGroup = viewChild<InputGroup>('numberGroup');
  private readonly priceInputGroup = viewChild<InputGroup>('priceGroup');

  readonly categoriesList = signal<Category[]>([]);
  readonly brandsList = signal<Brand[]>([]);
  readonly categoryNames = computed(() => this.categoriesList().map((category) => category.name));
  readonly brandNames = computed(() => this.brandsList().map((brand) => brand.name));

  readonly articleNumber = signal('');
  readonly name = signal('');
  readonly category = signal('');
  readonly brand = signal('');
  readonly price = signal(0);
  readonly size = signal('');
  readonly color = signal('');
  readonly description = signal('');

  /** Set once a `getByNumber()` lookup finds the number already taken (belongs to a different
   * seller, or belongs to this seller but is already released) — disables "Übernehmen" and shows
   * the inline "Artikelnummer bereits vergeben" message (spec.md, keyboard/numpad case). */
  readonly numberTakenMessage = signal<string | null>(null);
  /** Camera-originated lookups additionally drive `scan-feedback`'s countdown/tone/vibration
   * (spec.md); keyboard/numpad lookups never touch this — see `checkArticleNumber()`. */
  readonly scanFeedbackResult = signal<'success' | 'already-set' | 'unknown' | null>(null);

  /**
   * Owned here since this component is the container/orchestrator mounted at the wizard's
   * step-2 slot — Task 7's `intake-session-list` reads it as a plain `[items]` input
   * (`items()` called from the template), see this class's own doc comment.
   */
  readonly items = signal<SessionArticle[]>([]);
  /**
   * Loaded once here via `SellersApi.getById()` so Task 7's `intake-session-list` (or its own
   * fee computation) doesn't duplicate this same API call — read it from here rather than
   * re-fetching.
   */
  readonly feePerItem = signal(0);

  private readonly pendingNumberValue = signal<string | null>(null);
  private readonly pendingPriceValue = signal<string | null>(null);

  readonly canSave = computed(
    () =>
      this.articleNumber().trim().length > 0 &&
      this.name().trim().length > 0 &&
      this.category().length > 0 &&
      this.brand().length > 0 &&
      this.price() > 0 &&
      this.numberTakenMessage() === null,
  );

  constructor() {
    this.categoriesApi.getAll().subscribe((categories) => this.categoriesList.set(categories));
    this.brandsApi.getAll().subscribe((brands) => this.brandsList.set(brands));

    effect(() => {
      const id = this.sellerId();
      if (!id) return;
      this.sellersApi.getById(id).subscribe((seller) => this.feePerItem.set(seller.feePerItem));
    });

    // Nummernvorschlag (spec.md): pre-fill Artikelnummer once on init.
    this.prefillNextNumber();

    // Seeding/reset effects for the two `input-group` instances that have no reactive `value`
    // input (see the viewChilds' own doc comment above) — mirrors `artikel-dialog.ts`'s
    // established `viewChild()` + `applyExternalValue()` pattern.
    effect(() => {
      const inputGroup = this.numberInputGroup();
      const pending = this.pendingNumberValue();
      if (!inputGroup || pending === null) return;
      inputGroup.applyExternalValue(pending);
      this.pendingNumberValue.set(null);
    });

    effect(() => {
      const inputGroup = this.priceInputGroup();
      const pending = this.pendingPriceValue();
      if (!inputGroup || pending === null) return;
      inputGroup.applyExternalValue(pending);
      this.pendingPriceValue.set(null);
    });
  }

  onArticleNumberChange(value: string | number): void {
    const raw = String(value);
    this.articleNumber.set(raw);
    this.checkArticleNumber(raw);
  }

  /** Fallback trigger for "ENTER oder Feld-Verlassen" (spec.md) — `input-group`'s `submitted`
   * output fires on Enter/the ↩ button without necessarily re-emitting `valueChange` first (the
   * keyboard-typed debounce may still be pending), so this re-reads the field's current raw
   * value directly rather than relying on a payload `submitted` doesn't carry. */
  onArticleNumberSubmit(): void {
    const raw = this.numberInputGroup()?.rawValue() ?? this.articleNumber();
    this.checkArticleNumber(raw);
  }

  onPriceChange(value: string | number): void {
    this.price.set(typeof value === 'number' ? value : Number(value));
  }

  onCategoryCreated(name: string): void {
    this.categoriesApi.create(name).subscribe({
      next: (created) => {
        this.categoriesList.update((list) => [...list, created]);
        this.category.set(created.name);
      },
      error: (error: unknown) => {
        // 409: someone else created the same name a moment ago (race, not a failure) — same
        // reasoning as `artikel-dialog.ts`'s identical handling.
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.categoriesApi.getAll().subscribe((categories) => {
            this.categoriesList.set(categories);
            this.category.set(name);
          });
        }
      },
    });
  }

  onBrandCreated(name: string): void {
    this.brandsApi.create(name).subscribe({
      next: (created) => {
        this.brandsList.update((list) => [...list, created]);
        this.brand.set(created.name);
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.brandsApi.getAll().subscribe((brands) => {
            this.brandsList.set(brands);
            this.brand.set(name);
          });
        }
      },
    });
  }

  onSubmitEntry(): void {
    if (!this.canSave()) return;

    const number = Number.parseInt(this.articleNumber().trim(), 10);
    this.items.update((items) => [
      ...items,
      {
        localId: crypto.randomUUID(),
        number,
        name: this.name().trim(),
        brand: this.brand(),
        category: this.category(),
        price: this.price(),
        size: this.size().trim() || null,
        color: this.color().trim() || null,
        description: this.description().trim() || null,
      },
    ]);

    // TODO(Round-17 Task 7): this is currently a purely local, in-memory session list — Task 7
    // adds the payment panel + `POST /api/intake` call and calls `this.booked.emit()` here (or
    // wherever the booking API call ends up living) once the whole session is booked, not on
    // every single "Übernehmen" click.
    this.resetForm();
  }

  private checkArticleNumber(raw: string): void {
    const trimmed = raw.trim();
    if (!trimmed) {
      this.numberTakenMessage.set(null);
      this.scanFeedbackResult.set(null);
      return;
    }

    const number = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(number)) {
      this.numberTakenMessage.set(null);
      return;
    }

    // Captured before the async call resolves — `input-group`'s `onCodeDetected` emits
    // `valueChange` (synchronously handled here) BEFORE it switches back to keyboard mode, so
    // `activeMode()` still reads `'camera'` at this point for a camera-originated hit.
    const isCameraOrigin = this.numberInputGroup()?.activeMode() === 'camera';

    this.articlesApi.getByNumber(number).subscribe({
      next: (article: ArticleByNumberResult) => this.handleArticleFound(article, isCameraOrigin),
      error: (error: unknown) => this.handleArticleLookupError(error, isCameraOrigin),
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, isCameraOrigin: boolean): void {
    const belongsToThisSeller = article.sellerId === this.sellerId();
    // Round-15 status model: `'registered'` is the only not-yet-released state — anything else
    // (selling/sold/returned) means the number is already in active use.
    const alreadyReleased = article.status !== 'registered';

    if (!belongsToThisSeller || alreadyReleased) {
      this.numberTakenMessage.set('Artikelnummer bereits vergeben');
      if (isCameraOrigin) this.scanFeedbackResult.set('already-set');
      return;
    }

    // Own seller, pre-announced, not yet released — "faktisch nie erreichbar" this round per
    // spec.md, but implemented correctly: prefill and keep every field editable. The by-number
    // DTO (`ArticleByNumberResult`) carries only `name`/`price` beyond the identifying fields —
    // no `brand`/`category`/`size`/`color`/`description` — so only those two are prefilled here.
    this.numberTakenMessage.set(null);
    this.name.set(article.name);
    this.price.set(article.price);
    this.pendingPriceValue.set(String(article.price));
    if (isCameraOrigin) this.scanFeedbackResult.set('success');
  }

  private handleArticleLookupError(error: unknown, isCameraOrigin: boolean): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      // Number is free — normal new-entry flow, clear any stale "vergeben" message.
      this.numberTakenMessage.set(null);
      if (isCameraOrigin) this.scanFeedbackResult.set('success');
      return;
    }

    // Any other failure (network error, 5xx, …) — do not claim the number is taken, but also
    // don't silently treat it as free; surface it via `scan-feedback`'s neutral variant for the
    // camera flow only, per spec.md tying that feedback to the camera path.
    if (isCameraOrigin) this.scanFeedbackResult.set('unknown');
  }

  private prefillNextNumber(): void {
    this.articlesApi.getNextNumber().subscribe((result) => {
      this.pendingNumberValue.set(String(result.nextNumber));
    });
  }

  private resetForm(): void {
    this.articleNumber.set('');
    this.name.set('');
    this.category.set('');
    this.brand.set('');
    this.price.set(0);
    this.size.set('');
    this.color.set('');
    this.description.set('');
    this.numberTakenMessage.set(null);
    this.scanFeedbackResult.set(null);
    this.pendingPriceValue.set('');
    this.prefillNextNumber();
  }
}
