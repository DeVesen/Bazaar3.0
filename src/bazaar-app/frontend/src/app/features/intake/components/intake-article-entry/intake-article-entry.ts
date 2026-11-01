import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup, InputGroupStatus } from '../../../../shared/components/input-group/input-group';
import { Input, InputAddon } from '../../../../shared/components/input/input';
import { ResultOverlay } from '../../../../shared/components/result-overlay/result-overlay';
import { ResultEvent, createResultEvent } from '../../../../shared/components/result-overlay/result-event';
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
  /** Gesetzt, wenn dieser Eintrag aus einem vorregistrierten Artikel geladen und die Artikelnummer
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
    ResultOverlay,
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
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

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
  /** Fresh `success` event after a successful transition/takeover (`app-result-overlay`). */
  readonly resultEvent = signal<ResultEvent | null>(null);
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

  /** Fehlertext der Artikelnummer-Prüfung (Enter/Scan/↩): Nummer gehört einem anderen
   * Verkäufer oder dem aktuellen Verkäufer mit Status ungleich „Registriert". Deaktiviert
   * „Übernehmen". */
  readonly numberTakenMessage = signal<string | null>(null);

  /** Animiertes Ergebnis-Icon am Nummernfeld (grünes OK / rotes X), `null` solange ungeprüft. */
  readonly numberStatus = signal<InputGroupStatus | null>(null);

  /** Die Nummer, für die die Prüfung zuletzt „frei" bzw. „Wandlung möglich" ergab (oder die vom
   * Server vorgeschlagen wurde). „Übernehmen" ist nur für genau diese Nummer möglich — so wird
   * eine ungeprüft getippte Nummer nie übernommen. */
  private readonly verifiedNumber = signal<string | null>(null);

  /** Gesetzt, sobald ein vorregistrierter Artikel (Status „Registriert", aktueller Verkäufer) per
   * Nummerneingabe geladen wurde — die Ursprungsnummer, die beim finalen Buchen als
   * `deleteArticleNumber` mitgeschickt wird, falls die Nummer danach geändert wird. */
  readonly originalNumber = signal<number | null>(null);

  /** Hinweistext unter dem Nummernfeld, solange ein vorregistrierter Artikel geladen ist
   * (Artikelwandlung). `null` bei normaler Neuerfassung. */
  readonly numberHint = computed<string | null>(() => {
    const original = this.originalNumber();
    if (original === null) return null;
    const typed = this.articleNumber().trim();
    if (typed.length === 0 || typed === String(original)) {
      return `Aus Voranmeldung geladen (Nr. ${original}). Andere Nummer eingeben und Enter drücken, um den Artikel umzunummerieren.`;
    }
    return `Artikelwandlung: Wird als Nr. ${typed} neu angelegt, Nr. ${original} wird gelöscht.`;
  });

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

  readonly canSave = computed(
    () =>
      this.articleNumber().trim().length > 0 &&
      this.name().trim().length > 0 &&
      this.category().length > 0 &&
      this.brand().length > 0 &&
      this.price() > 0 &&
      this.numberTakenMessage() === null &&
      this.verifiedNumber() === this.articleNumber().trim(),
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
      // Vom Server vorgeschlagene (freie) Nummer — braucht keine eigene Prüfung.
      this.verifiedNumber.set(pending.trim());
    });
  }

  /** Tippen/Scannen/Setzen im Nummernfeld: ein geänderter Wert macht das letzte Prüfergebnis
   * ungültig. Die eigentliche Prüfung läuft erst auf Enter/Scan/↩ (`onArticleNumberSubmit()`). */
  onArticleNumberChange(value: string | number): void {
    const raw = String(value);
    // Das (entprellte) valueChange kann nach Enter noch nachlaufen — ein unveränderter Wert darf
    // das frische Prüfergebnis nicht wieder löschen.
    if (raw.trim() === this.articleNumber().trim()) {
      this.articleNumber.set(raw);
      return;
    }
    this.articleNumber.set(raw);
    this.numberFieldSeq++;
    this.numberTakenMessage.set(null);
    this.numberStatus.set(null);
    if (raw.trim().length === 0 && this.originalNumber() !== null) {
      this.resetForm();
    }
  }

  /** Enter / ↩ / Kamera-Scan (`submitOnEnter`) — liest den aktuellen Rohwert des Felds direkt,
   * da das entprellte `valueChange` beim Tippen noch ausstehen kann. */
  onArticleNumberSubmit(): void {
    const raw = this.numberInputGroup()?.rawValue() ?? this.articleNumber();
    this.articleNumber.set(raw);
    this.checkArticleNumber(raw);
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
   * (Laden eines vorregistrierten Artikels, Tests) that never dispatch a real keyup. */
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
    this.resultEvent.set(createResultEvent('success'));
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

  /** Artikelnummer-Prüfung (Epic_Artikelannahme), vier Fälle:
   * - unbekannt (404): frei → grünes OK, Fokus in die Bezeichnung;
   * - anderer Verkäufer ODER eigener Artikel mit Status ungleich „Registriert": rotes X,
   *   Eingabe voll selektiert, Fehlertext;
   * - eigener Artikel mit Status „Registriert" (Voranmeldung): Felder werden befüllt
   *   (Artikelwandlung), Nummer voll selektiert zum direkten Überschreiben. */
  private checkArticleNumber(raw: string): void {
    // Jede echte Prüfung macht noch laufende Antworten (Nummernvorschlag, ältere Prüfung) ungültig.
    const seq = ++this.numberFieldSeq;

    const trimmed = raw.trim();
    this.numberTakenMessage.set(null);
    this.numberStatus.set(null);
    this.verifiedNumber.set(null);
    if (!trimmed) return;

    const number = Number.parseInt(trimmed, 10);
    if (!/^\d+$/.test(trimmed) || !Number.isSafeInteger(number)) {
      this.markNumberTaken('Bitte eine gültige Artikelnummer eingeben');
      return;
    }

    this.articlesApi.getByNumber(number).subscribe({
      next: (article: ArticleByNumberResult) => {
        if (seq === this.numberFieldSeq) this.handleArticleFound(article, trimmed);
      },
      error: (error: unknown) => {
        if (seq === this.numberFieldSeq) this.handleArticleLookupError(error, trimmed);
      },
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, typed: string): void {
    if (article.sellerId !== this.sellerId()) {
      this.markNumberTaken('Artikelnummer bereits vergeben');
      return;
    }
    // Round-15 status model: `'registered'` ist der einzige noch nicht freigegebene Zustand.
    if (article.status !== 'registered') {
      this.markNumberTaken('Artikelnummer bereits vergeben (Artikel bereits freigegeben)');
      return;
    }

    // Wiederholtes Enter auf der bereits geladenen Nummer: nichts neu laden, Eingaben behalten.
    if (this.originalNumber() !== article.number) {
      this.loadPreRegisteredArticle(article);
    }
    this.verifiedNumber.set(typed);
    this.selectNumberField();
  }

  private handleArticleLookupError(error: unknown, typed: string): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.verifiedNumber.set(typed);
      this.numberStatus.set('ok');
      this.focusName();
    }
  }

  private markNumberTaken(message: string): void {
    this.numberTakenMessage.set(message);
    this.numberStatus.set('error');
    this.selectNumberField();
  }

  /** Befüllt alle Formularfelder (außer der Nummer, die der Anwender gerade selbst eingegeben
   * hat) aus dem vorregistrierten Artikel und merkt dessen Nummer als Löschkandidat. */
  private loadPreRegisteredArticle(article: ArticleByNumberResult): void {
    this.originalNumber.set(article.number);
    this.onNameChange(article.name);
    this.category.set(article.category);
    this.brand.set(article.brand);
    this.onSizeChange(article.size ?? '');
    this.onColorChange(article.color ?? '');
    this.description.set(article.description ?? '');
    this.onPriceChange(article.price);
  }

  /** Fokus + Volltext-Selektion im Nummernfeld. Per Macrotask: bei einem Kamera-Scan wird der Wert
   * erst im nächsten Change-Detection-Lauf ins native `<input>` geschrieben — `select()` davor
   * würde den alten Text markieren (gleiche Begründung wie beim Nummernvorschlag-Effekt). */
  private selectNumberField(): void {
    setTimeout(() => this.numberInputGroup()?.focusAndSelect());
  }

  private focusName(): void {
    this.hostElement.nativeElement.querySelector<HTMLInputElement>('#intake-article-entry-name')?.focus();
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
    this.numberStatus.set(null);
    this.verifiedNumber.set(null);
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
