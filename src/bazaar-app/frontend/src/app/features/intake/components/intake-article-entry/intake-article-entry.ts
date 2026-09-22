import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { Input, InputAddon } from '../../../../shared/components/input/input';
import { Numpad } from '../../../../shared/components/numpad/numpad';
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
import { IntakeRenumberLookupPopup } from '../intake-renumber-lookup-popup/intake-renumber-lookup-popup';

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
  /** Gesetzt, wenn dieser Eintrag über das Renumber-Popup geladen und die Artikelnummer
   * anschließend geändert wurde — die Ursprungsnummer, deren Alt-Artikel beim finalen Buchen
   * gelöscht werden soll (`IntakeArticleLine.deleteArticleNumber`, siehe `intake-session-list`). */
  originalNumberToDelete?: number;
}

/**
 * Wizard Schritt-2 container (Epic_Artikelannahme Abschnitt 2) — replaces the Round-16
 * `intake-step-two-placeholder`. Left column (70%): the article entry form (Artikelnummer with
 * camera, Bezeichnung, Kategorie/Marke, Preis, Größe/Farbe, Beschreibung,
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
    TextareaModule,
    AutocompleteCreate,
    InputGroup,
    Input,
    Numpad,
    IntakeSessionList,
    IntakeRenumberLookupPopup,
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
   * `input-group`'s search variant has no reactive `value` input as of Round-16/17 (established
   * gap, see `artikel-dialog.ts`'s identical viewChild) — lets the seeding/reset effect below
   * push a value into the rendered component imperatively via `applyExternalValue()`. Preis now
   * uses `app-input` instead (reactive `[value]` binding), so it needs no such viewChild anymore.
   */
  private readonly numberInputGroup = viewChild<InputGroup>('numberGroup');

  readonly categoriesList = signal<Category[]>([]);
  readonly brandsList = signal<Brand[]>([]);
  readonly categoryNames = computed(() => this.categoriesList().map((category) => category.name));
  readonly brandNames = computed(() => this.brandsList().map((brand) => brand.name));

  readonly articleNumber = signal('');
  readonly name = signal('');
  readonly category = signal('');
  readonly brand = signal('');
  /** Raw text of the Preis `app-input` field — source of truth for what's on screen; `price()`
   * below is derived from it. Kept separate from `price` so a re-formatted value never gets fed
   * back into the field the user is actively typing in (would fight the cursor mid-entry). */
  readonly priceText = signal('');
  readonly price = computed(() => this.parseGermanDecimal(this.priceText()) ?? 0);
  readonly size = signal('');
  readonly color = signal('');
  readonly description = signal('');

  /** Drive the clear-button (✕) `addonRight` on the Bezeichnung/Preis/Größe/Farbe `app-input`
   * fields — see their `onXKeyUp()`/`onXChange()` handlers below for what updates them. */
  readonly nameIsEmpty = signal(true);
  readonly priceIsEmpty = signal(true);
  readonly sizeIsEmpty = signal(true);
  readonly colorIsEmpty = signal(true);

  /** Toggled by the Preis field's Nummernblock addon button. */
  readonly priceNumpadVisible = signal(false);

  readonly nameClearAddon = computed<InputAddon[]>(() =>
    this.nameIsEmpty() ? [] : [{ type: 'icon', value: 'pi pi-times', key: 'clear' }],
  );
  readonly sizeClearAddon = computed<InputAddon[]>(() =>
    this.sizeIsEmpty() ? [] : [{ type: 'icon', value: 'pi pi-times', key: 'clear' }],
  );
  readonly colorClearAddon = computed<InputAddon[]>(() =>
    this.colorIsEmpty() ? [] : [{ type: 'icon', value: 'pi pi-times', key: 'clear' }],
  );
  /** Order: clear (if not empty), €-label, Nummernblock-Toggle — `app-input` has no built-in
   * numpad integration (unlike `app-input-group`), so its keys are applied onto `priceText`
   * by `onPriceNumpadKey()`/`onPriceNumpadClear()` below, the same way `input-group.ts`'s own
   * internal numpad wiring works, just owned here in the parent instead. */
  readonly priceAddonRight = computed<InputAddon[]>(() => [
    ...(this.priceIsEmpty() ? [] : [{ type: 'icon', value: 'pi pi-times', key: 'clear' } as InputAddon]),
    { type: 'label', value: '€', key: 'currency' },
    { type: 'icon', value: 'pi pi-th-large', key: 'numpad' },
  ]);

  /** Set once a `getByNumber()` lookup finds the number already taken (belongs to a different
   * seller, or belongs to this seller but is already released) — disables "Übernehmen" and shows
   * the inline "Artikelnummer bereits vergeben" message (spec.md, keyboard/numpad case). */
  readonly numberTakenMessage = signal<string | null>(null);

  /** Gesetzt, sobald ein Artikel über das Renumber-Popup geladen wurde — die Ursprungsnummer,
   * die als Badge am dritten Mode-Button angezeigt wird und beim finalen Buchen als
   * `deleteArticleNumber` mitgeschickt wird, falls die Nummer danach geändert wird. */
  readonly originalNumber = signal<number | null>(null);
  readonly renumberPopupVisible = signal(false);

  readonly extraModeButtonConfig = computed(() => ({
    icon: 'pi pi-sync',
    badge: this.originalNumber() !== null ? String(this.originalNumber()) : null,
  }));

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

  /**
   * Fix round 1 (reviewer Important 1): bumped on every REAL Artikelnummer-field interaction
   * (`checkArticleNumber()` — typed/scanned/submitted) and captured by `prefillNextNumber()` at
   * call time. `prefillNextNumber()`'s async `GetNextNumber` response only gets applied if this
   * counter still matches its captured value when the response lands — otherwise a real scan/typed
   * entry happened in the meantime and the (now stale) suggested number must NOT silently
   * overwrite it (which would also wrongly re-trigger a number-check for the wrong number).
   */
  private numberFieldSeq = 0;

  /** Steuert, ob der nächste `pendingNumberValue`-Apply-Effekt (siehe Konstruktor) zusätzlich
   * Fokus + Volltext-Selektion ins Nummernfeld setzt — nur nach einem Renumber-Popup-Treffer,
   * damit der Anwender die geladene Nummer sofort überschreiben kann, ohne erst zu markieren. */
  private focusNumberFieldAfterApply = false;

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
      if (this.focusNumberFieldAfterApply) {
        this.focusNumberFieldAfterApply = false;
        // Fix round 2 (reviewer Important 1): `applyExternalValue()` only writes the `_rawValue`
        // SIGNAL — `input-group`'s own native `<input>` is bound via `[ngModel]="rawValue()"` and
        // is only actually updated in the DOM on Angular's NEXT change-detection pass (OnPush).
        // Calling `focusAndSelect()` synchronously here would run `input.select()` while the DOM
        // still shows the OLD value, collapsing the selection instead of highlighting the new
        // one. `afterNextRender()` was tried first but never fires in this per-component
        // `TestBed` fixture (it hooks `ApplicationRef`'s render hooks, which a bare
        // `fixture.detectChanges()` does not drive) — a macrotask via `setTimeout` reliably runs
        // after Angular's signal-triggered CD has flushed the DOM write, both in the browser and
        // under `TestBed` (verified by the regression test below).
        setTimeout(() => inputGroup.focusAndSelect());
      }
    });
  }

  onArticleNumberChange(value: string | number): void {
    const raw = String(value);
    this.articleNumber.set(raw);
    if (raw.trim().length === 0 && this.originalNumber() !== null) {
      this.resetForm();
      return;
    }
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

  onOpenRenumberPopup(): void {
    this.renumberPopupVisible.set(true);
  }

  onRenumberPopupVisibleChange(visible: boolean): void {
    this.renumberPopupVisible.set(visible);
  }

  /** `app-intake-renumber-lookup-popup`'s `articleFound` — befüllt alle Formularfelder inkl.
   * der Artikelnummer selbst, setzt die Badge-Markierung (`originalNumber`) und rückt Fokus +
   * Volltext-Selektion ins Nummernfeld, sobald der Wert dort angewendet wurde (siehe
   * `focusNumberFieldAfterApply`-Effekt im Konstruktor) — direktes Überschreiben durch
   * Tippen/Scannen ist damit ohne manuelles Markieren möglich. */
  onArticleFoundViaRenumberPopup(article: ArticleByNumberResult): void {
    this.originalNumber.set(article.number);
    this.onNameChange(article.name);
    this.category.set(article.category);
    this.brand.set(article.brand);
    this.onSizeChange(article.size ?? '');
    this.onColorChange(article.color ?? '');
    this.description.set(article.description ?? '');
    this.onPriceChange(article.price);
    this.numberTakenMessage.set(null);
    this.focusNumberFieldAfterApply = true;
    this.pendingNumberValue.set(String(article.number));
  }

  onNameChange(value: string): void {
    this.name.set(value);
    this.nameIsEmpty.set(value.trim().length === 0);
  }

  onPriceChange(value: string | number): void {
    const text = typeof value === 'number' ? String(value).replace('.', ',') : value;
    this.priceText.set(text);
    this.priceIsEmpty.set(text.trim().length === 0);
  }

  onCategoryChange(value: string): void {
    this.category.set(value);
  }

  onBrandChange(value: string): void {
    this.brand.set(value);
  }

  onSizeChange(value: string): void {
    this.size.set(value);
    this.sizeIsEmpty.set(value.trim().length === 0);
  }

  onColorChange(value: string): void {
    this.color.set(value);
    this.colorIsEmpty.set(value.trim().length === 0);
  }

  /** Reactive fast-path for the clear-button (✕) visibility — reads the native input's raw
   * value directly off the keyup event, independent of the (already near-instant, `debounceMs=0`)
   * `valueChange` pipeline. `onXChange()` above also keeps these in sync for programmatic sets
   * (renumber popup, tests) that never dispatch a real keyup. */
  onNameKeyUp(event: KeyboardEvent): void {
    this.nameIsEmpty.set(((event.target as HTMLInputElement).value ?? '').trim().length === 0);
  }

  onPriceKeyUp(event: KeyboardEvent): void {
    this.priceIsEmpty.set(((event.target as HTMLInputElement).value ?? '').trim().length === 0);
  }

  onSizeKeyUp(event: KeyboardEvent): void {
    this.sizeIsEmpty.set(((event.target as HTMLInputElement).value ?? '').trim().length === 0);
  }

  onColorKeyUp(event: KeyboardEvent): void {
    this.colorIsEmpty.set(((event.target as HTMLInputElement).value ?? '').trim().length === 0);
  }

  onNameAddonClick(key: string): void {
    if (key === 'clear') this.onNameChange('');
  }

  onSizeAddonClick(key: string): void {
    if (key === 'clear') this.onSizeChange('');
  }

  onColorAddonClick(key: string): void {
    if (key === 'clear') this.onColorChange('');
  }

  onPriceAddonClick(key: string): void {
    if (key === 'clear') {
      this.onPriceChange('');
    } else if (key === 'numpad') {
      this.priceNumpadVisible.update((visible) => !visible);
    }
  }

  /** Preis-Nummernblock (Recommended aus dem Umbau-Brainstorming): `app-input` bettet selbst
   * keine andere `app-...`-Komponente ein, daher wird `app-numpad` hier im Parent gerendert und
   * seine Tasten direkt auf `priceText` angewendet — dieselbe Append/Backspace-Logik wie
   * `input-group.ts`s eigene interne Numpad-Verdrahtung (`applyNumpadKeyToSearchValue`), nur
   * hier im Feature-Component statt in der Shared-Komponente selbst. */
  onPriceNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    const current = this.priceText();
    this.onPriceChange(key === 'Backspace' ? current.slice(0, -1) : current + key);
  }

  onPriceNumpadClear(): void {
    this.onPriceChange('');
  }

  onDescriptionChange(value: string): void {
    this.description.set(value);
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
    const originalNumberToDelete = this.originalNumber();
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
        ...(originalNumberToDelete !== null ? { originalNumberToDelete } : {}),
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
      return;
    }

    const number = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(number)) {
      this.numberTakenMessage.set(null);
      return;
    }

    this.articlesApi.getByNumber(number).subscribe({
      next: (article: ArticleByNumberResult) => this.handleArticleFound(article),
      error: (error: unknown) => this.handleArticleLookupError(error),
    });
  }

  /** Reine Vergeben-Prüfung (Epic_Artikelannahme): die Nummer gehört einem anderen Verkäufer
   * ODER ist bereits freigegeben. Kein Auto-Prefill mehr am Hauptfeld — das Laden eines
   * vorregistrierten, noch nicht freigegebenen Artikels läuft ausschließlich über das
   * `app-intake-renumber-lookup-popup` (`onArticleFoundViaRenumberPopup()`). */
  private handleArticleFound(article: ArticleByNumberResult): void {
    const belongsToThisSeller = article.sellerId === this.sellerId();
    // Round-15 status model: `'registered'` is the only not-yet-released state — anything else
    // (selling/sold/returned) means the number is already in active use.
    const alreadyReleased = article.status !== 'registered';
    this.numberTakenMessage.set(!belongsToThisSeller || alreadyReleased ? 'Artikelnummer bereits vergeben' : null);
  }

  private handleArticleLookupError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.numberTakenMessage.set(null);
    }
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
    this.onNameChange('');
    this.category.set('');
    this.brand.set('');
    this.onPriceChange('');
    this.onSizeChange('');
    this.onColorChange('');
    this.description.set('');
    this.priceNumpadVisible.set(false);
    this.numberTakenMessage.set(null);
    this.originalNumber.set(null);
    this.numberFieldSeq++;
    this.prefillNextNumber();
  }

  /** Same parsing as `input-group.ts`'s identically named private method — kept as its own copy
   * here rather than extracted to a shared util, since `app-input` is deliberately text-only and
   * this is the only other place in the codebase that needs German-decimal parsing. */
  private parseGermanDecimal(raw: string): number | null {
    const normalized = raw.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && normalized.length > 0 ? parsed : null;
  }
}
