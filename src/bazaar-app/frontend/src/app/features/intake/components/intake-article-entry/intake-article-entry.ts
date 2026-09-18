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
import { BookingConflict, IntakeSessionList } from '../intake-session-list/intake-session-list';
import { SessionItemFormValue } from '../session-item-popup/session-item-popup';

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
  /** Round-17 Task 7: set true when a booking attempt's 409 `article.number_taken` reported this
   * row's number as taken (`onBookingConflict()`) — cleared once the row is edited
   * (`onItemUpdated()`). Drives `intake-session-list`'s row highlight (AC-8). */
  conflict?: boolean;
}

/**
 * Wizard Schritt-2 container (Epic_Artikelannahme Abschnitt 2) — replaces the Round-16
 * `intake-step-two-placeholder`. Left column (70%): the article entry form (Artikelnummer with
 * camera/scan-feedback, Bezeichnung, Kategorie/Marke, Preis, Größe/Farbe, Beschreibung,
 * "Übernehmen"). Right column (30%): `app-intake-session-list` (Round-17 Task 7) — click-to-edit
 * via `session-item-popup`, delete, and the payment panel that actually books the session
 * (`POST /api/intake`). This component owns `items()`/`feePerItem()` and applies the mutations
 * `intake-session-list` requests via its intent events (`itemDeleted`/`itemUpdated`/`booked`/
 * `bookingConflict`) — see those events' own handler doc comments below.
 */
@Component({
  selector: 'app-intake-article-entry',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    AutocompleteCreate,
    InputGroup,
    ScanFeedback,
    IntakeSessionList,
  ],
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

  /**
   * Fix round 1 (reviewer Important 1): bumped on every REAL Artikelnummer-field interaction
   * (`checkArticleNumber()` — typed/scanned/submitted) and captured by `prefillNextNumber()` at
   * call time. `prefillNextNumber()`'s async `GetNextNumber` response only gets applied if this
   * counter still matches its captured value when the response lands — otherwise a real scan/typed
   * entry happened in the meantime and the (now stale) suggested number must NOT silently
   * overwrite it (which would also wrongly re-trigger a number-check for the wrong number).
   */
  private numberFieldSeq = 0;
  /**
   * Fix round 1 (reviewer Important 2): true only while `name`/`price` hold values that came
   * from `handleArticleFound()`'s own-seller-unreleased prefill branch, not from the user's own
   * typing — cleared on any manual edit to those two fields (`onNameChange()`/`onPriceChange()`)
   * and consumed (cleared + fields reset) once the Artikelnummer field moves on to a DIFFERENT
   * number whose lookup no longer confirms that same prefill (`clearPrefilledFields()`). Prevents
   * article A's prefilled Bezeichnung/Preis from silently leaking into a "fresh" entry for a
   * different number B.
   */
  private prefillActive = false;

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

  /** Manual edit to Bezeichnung — no longer counts as a lookup-prefilled value (fix round 1,
   * reviewer Important 2). */
  onNameChange(value: string): void {
    this.name.set(value);
    this.prefillActive = false;
  }

  onPriceChange(value: string | number): void {
    this.price.set(typeof value === 'number' ? value : Number(value));
    this.prefillActive = false;
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

    this.resetForm();
  }

  /** `intake-session-list`'s `itemDeleted` — pure in-memory session state, no confirm dialog
   * needed (unlike the Round-15 artikel-dialog's DB-backed delete). */
  onItemDeleted(localId: string): void {
    this.items.update((items) => items.filter((item) => item.localId !== localId));
  }

  /** `intake-session-list`'s `itemUpdated` (via `session-item-popup`'s `save`) — clears any
   * stale `conflict` flag, since the row was just hand-corrected. */
  onItemUpdated(event: { localId: string; value: SessionItemFormValue }): void {
    this.items.update((items) =>
      items.map((item) =>
        item.localId === event.localId
          ? {
              ...item,
              name: event.value.name,
              category: event.value.category,
              brand: event.value.brand,
              price: event.value.price,
              conflict: false,
            }
          : item,
      ),
    );
  }

  /** `intake-session-list`'s `booked` — the whole session was just booked server-side; clear the
   * now-stale local list and re-emit upward (wizard hand-off, Task 6). */
  onBooked(): void {
    this.items.set([]);
    this.booked.emit();
  }

  /** `intake-session-list`'s `bookingConflict` (409 `article.number_taken`) — mark the affected
   * rows and prefill the Artikelnummer field with the server's `nextNumber` suggestion (AC-8).
   * Deliberately does NOT clear `items()` — the session must stay intact for the user to fix the
   * marked rows and retry. */
  onBookingConflict(event: BookingConflict): void {
    this.items.update((items) =>
      items.map((item) => (event.takenNumbers.includes(item.number) ? { ...item, conflict: true } : item)),
    );
    this.pendingNumberValue.set(String(event.nextNumber));
  }

  private checkArticleNumber(raw: string): void {
    // Fix round 1 (reviewer Important 1): every REAL trigger of a number-check invalidates any
    // still-in-flight `prefillNextNumber()` response — see that method's own guard and
    // `numberFieldSeq`'s doc comment.
    this.numberFieldSeq++;

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
      // Fix round 1 (reviewer Important 2): this number is a DIFFERENT article than whatever
      // the previous lookup may have prefilled — never leave that stale data sitting in
      // Bezeichnung/Preis behind a "vergeben" message the user can't get past without first
      // changing the number again.
      this.clearPrefilledFields();
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
    // Direct call rather than the generic `pendingPriceValue` signal/effect indirection: by the
    // time a lookup can fire at all, the view (and `priceInputGroup`'s viewChild) is guaranteed
    // already resolved, and going through `pendingPriceValue` here would let its own
    // `applyExternalValue()` round-trip (which re-emits `valueChange` -> `onPriceChange()`, which
    // clears `prefillActive`) race against setting `prefillActive = true` below in the wrong
    // order.
    this.priceInputGroup()?.applyExternalValue(String(article.price));
    this.prefillActive = true;
    if (isCameraOrigin) this.scanFeedbackResult.set('success');
  }

  private handleArticleLookupError(error: unknown, isCameraOrigin: boolean): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      // Number is free — normal new-entry flow, clear any stale "vergeben" message AND any
      // stale Bezeichnung/Preis a PREVIOUS number's found-article prefill left behind (fix round
      // 1, reviewer Important 2) — this number was never confirmed to be that same article.
      this.numberTakenMessage.set(null);
      this.clearPrefilledFields();
      if (isCameraOrigin) this.scanFeedbackResult.set('success');
      return;
    }

    // Any other failure (network error, 5xx, …) — do not claim the number is taken, but also
    // don't silently treat it as free; surface it via `scan-feedback`'s neutral variant for the
    // camera flow only, per spec.md tying that feedback to the camera path.
    if (isCameraOrigin) this.scanFeedbackResult.set('unknown');
  }

  /** Fix round 1 (reviewer Important 2): resets Bezeichnung/Preis back to empty/default, but
   * ONLY when they currently hold a previous lookup's prefilled values (`prefillActive`) — never
   * clobbers values the user is genuinely hand-typing for a fresh entry that never went through a
   * found-article prefill in the first place. */
  private clearPrefilledFields(): void {
    if (!this.prefillActive) return;
    this.name.set('');
    this.price.set(0);
    this.priceInputGroup()?.applyExternalValue('');
    this.prefillActive = false;
  }

  private prefillNextNumber(): void {
    // Fix round 1 (reviewer Important 1): capture the sequence counter's value at request time.
    // If a real scan/typed/submitted number-check happens before this resolves, `numberFieldSeq`
    // will have moved on — this stale response must then be dropped, not silently applied on top
    // of (and re-triggering a lookup for) whatever the user already entered.
    const requestSeq = this.numberFieldSeq;
    this.articlesApi.getNextNumber().subscribe((result) => {
      if (this.numberFieldSeq !== requestSeq) return;
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
    this.prefillActive = false;
    this.numberFieldSeq++;
    this.prefillNextNumber();
  }
}
