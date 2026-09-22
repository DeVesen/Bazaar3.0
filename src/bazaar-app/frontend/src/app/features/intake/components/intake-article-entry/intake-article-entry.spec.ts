import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
// eslint-disable-next-line boundaries/dependencies
import { SellerDetail, SellersApi } from '../../../sellers/data/sellers-api';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { Input } from '../../../../shared/components/input/input';
import { Numpad } from '../../../../shared/components/numpad/numpad';
// `InputGroup` depends on `BarcodeScanner`/`@zxing/browser` — importing the ONE shared mock
// (see that file's own comment for why it must be centralized, and why every spec that
// transitively loads `BarcodeScanner` must import it, not just the ones asserting on it) so
// this test never touches real device camera APIs (unavailable in jsdom).
// (Round-25 review fix: this registration now also happens unconditionally via the global
// Vitest `setupFiles` entry in `angular.json` — this import is kept for documentation/clarity,
// not because it is still load-bearing for the mock to win the race.)
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { PrintService } from '../../../../core/print/print.service';
import { IntakeApi } from '../../data/intake-api';
import { IntakeSessionList } from '../intake-session-list/intake-session-list';
import { IntakeRenumberLookupPopup } from '../intake-renumber-lookup-popup/intake-renumber-lookup-popup';
import { IntakeArticleEntry, SessionArticle } from './intake-article-entry';

const SELLER_ID = 'SEL00001';

const CATEGORIES: Category[] = [{ id: 'cat-kleidung', name: 'Kleidung', original: true, articleCount: 5 }];
const BRANDS: Brand[] = [{ id: 'brand-lego', name: 'Lego', original: true, articleCount: 2 }];

function sellerDetailStub(overrides: Partial<SellerDetail> = {}): SellerDetail {
  return {
    id: SELLER_ID,
    firstName: 'Max',
    lastName: 'Mustermann',
    address: null,
    postalCode: null,
    city: null,
    phone: null,
    email: 'max@example.com',
    sellerTypeId: 'type-privat',
    salesCommission: 10,
    feePerItem: 0.5,
    intakeFeePaid: 0,
    settledAt: null,
    payoutAmount: null,
    ...overrides,
  };
}

function articleByNumberStub(overrides: Partial<ArticleByNumberResult> = {}): ArticleByNumberResult {
  return {
    id: 'ART00001',
    number: 1042,
    name: 'Winterjacke',
    brand: 'Jack Wolfskin',
    category: 'Jacken',
    price: 12.5,
    size: '128',
    color: 'Blau',
    description: null,
    status: 'registered',
    sellerId: SELLER_ID,
    sellerName: 'Max Mustermann',
    ...overrides,
  };
}

function articlesApiStub() {
  return {
    getNextNumber: vi.fn().mockReturnValue(of({ nextNumber: 1043 })),
    getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))),
  };
}

function categoriesApiStub() {
  return {
    getAll: vi.fn().mockReturnValue(of(CATEGORIES)),
    create: vi.fn().mockReturnValue(of({ id: 'cat-new', name: 'Neu', original: false, articleCount: 0 })),
  };
}

function brandsApiStub() {
  return {
    getAll: vi.fn().mockReturnValue(of(BRANDS)),
    create: vi.fn().mockReturnValue(of({ id: 'brand-new', name: 'Neu', original: false, articleCount: 0 })),
  };
}

function intakeApiStub() {
  return { bookIntake: vi.fn().mockReturnValue(of({ articleIds: ['ART00099'], intakeFeePaid: 1 })) };
}

function printServiceStub() {
  return { printIntakeReceipt: vi.fn() };
}

function sessionArticleStub(overrides: Partial<SessionArticle> = {}): SessionArticle {
  return {
    localId: 'local-1',
    number: 1043,
    name: 'Winterjacke',
    brand: 'Lego',
    category: 'Kleidung',
    price: 12.5,
    size: null,
    color: null,
    description: null,
    ...overrides,
  };
}

async function setup(
  options: {
    articlesApi?: ReturnType<typeof articlesApiStub>;
    categoriesApi?: ReturnType<typeof categoriesApiStub>;
    brandsApi?: ReturnType<typeof brandsApiStub>;
    intakeApi?: ReturnType<typeof intakeApiStub>;
    printService?: ReturnType<typeof printServiceStub>;
  } = {},
) {
  const articlesApi = options.articlesApi ?? articlesApiStub();
  const categoriesApi = options.categoriesApi ?? categoriesApiStub();
  const brandsApi = options.brandsApi ?? brandsApiStub();
  const sellersApi = { getById: vi.fn().mockReturnValue(of(sellerDetailStub())) };
  const intakeApi = options.intakeApi ?? intakeApiStub();
  const printService = options.printService ?? printServiceStub();

  await TestBed.configureTestingModule({
    imports: [IntakeArticleEntry],
    providers: [
      { provide: ArticlesApi, useValue: articlesApi },
      { provide: CategoriesApi, useValue: categoriesApi },
      { provide: BrandsApi, useValue: brandsApi },
      { provide: SellersApi, useValue: sellersApi },
      { provide: IntakeApi, useValue: intakeApi },
      { provide: PrintService, useValue: printService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeArticleEntry);
  fixture.componentRef.setInput('sellerId', SELLER_ID);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, articlesApi, categoriesApi, brandsApi, sellersApi, intakeApi, printService };
}

function sessionList(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.query(By.directive(IntakeSessionList)).componentInstance as IntakeSessionList;
}

function numberInputGroup(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.queryAll(By.directive(InputGroup))[0].componentInstance as InputGroup;
}

function renumberPopup(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.query(By.directive(IntakeRenumberLookupPopup)).componentInstance as IntakeRenumberLookupPopup;
}

function appInputById(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>, inputId: string) {
  const match = fixture.debugElement
    .queryAll(By.directive(Input))
    .find((de) => (de.componentInstance as Input).inputId() === inputId);
  if (!match) throw new Error(`app-input with inputId="${inputId}" not found`);
  return match.componentInstance as Input;
}

describe('IntakeArticleEntry', () => {
  it('fetches the next suggested article number on init and applies it to the number field', async () => {
    const articlesApi = articlesApiStub();
    const { fixture } = await setup({ articlesApi });

    expect(articlesApi.getNextNumber).toHaveBeenCalled();
    expect(numberInputGroup(fixture).rawValue()).toBe('1043');
  });

  it('loads the seller fee once via SellersApi.getById()', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance.feePerItem()).toBe(0.5);
  });

  describe('required-field gating', () => {
    it('keeps "Übernehmen" disabled until Artikelnummer/Bezeichnung/Kategorie/Marke/Preis are all filled', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      expect(component.canSave()).toBe(false);

      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      expect(component.canSave()).toBe(false);

      component.category.set('Kleidung');
      component.brand.set('Lego');
      expect(component.canSave()).toBe(false);

      component.onPriceChange(12.5);
      expect(component.canSave()).toBe(true);
    });

    it('keeps "Übernehmen" disabled while a price of 0 is set, even with every other field filled', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.onPriceChange(0);

      expect(component.canSave()).toBe(false);
    });
  });

  describe('Artikelnummer-Prüfung (getByNumber branching)', () => {
    it('404 (number free): clears any "vergeben" message and leaves the new-entry flow open', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      numberInputGroup(fixture).valueChange.emit('1099');
      await fixture.whenStable();

      expect(articlesApi.getByNumber).toHaveBeenCalledWith(1099);
      expect(component.numberTakenMessage()).toBeNull();
    });

    it('200, belongs to a different seller: shows "Artikelnummer bereits vergeben" and disables Übernehmen', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(
        of(articleByNumberStub({ sellerId: 'SEL00099', status: 'registered' })),
      );
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;
      component.name.set('X');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.onPriceChange(5);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.numberTakenMessage()).toBe('Artikelnummer bereits vergeben');
      expect(component.canSave()).toBe(false);
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Artikelnummer bereits vergeben',
      );
    });

    it('200, belongs to this seller but already released (status !== registered): also shows "vergeben"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(
        of(articleByNumberStub({ sellerId: SELLER_ID, status: 'selling' })),
      );
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.numberTakenMessage()).toBe('Artikelnummer bereits vergeben');
    });

    it('200, belongs to this seller and still registered (pre-announced): no message, but no auto-prefill either (only the renumber popup prefills)', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(
        of(articleByNumberStub({ sellerId: SELLER_ID, status: 'registered', name: 'Sommerkleid' })),
      );
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.numberTakenMessage()).toBeNull();
      expect(component.name()).toBe('');
    });

    it('also triggers the check on submitted (Enter/↩), reading the field\'s current raw value', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture } = await setup({ articlesApi });

      const group = numberInputGroup(fixture);
      group.onTyped('1099');
      group.submitted.emit();
      await fixture.whenStable();

      expect(articlesApi.getByNumber).toHaveBeenCalledWith(1099);
    });

    // Fix round 1 (reviewer Important 2): the flip side — a 404 must never wipe a genuinely
    // hand-typed Bezeichnung/Preis that never came from a found-article prefill in the first place.
    it('does not clear a hand-typed Bezeichnung/Preis on a 404 when no prior prefill happened', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      component.onNameChange('Handgetippt');
      component.onPriceChange(19.9);

      numberInputGroup(fixture).valueChange.emit('1099');
      await fixture.whenStable();

      expect(component.name()).toBe('Handgetippt');
      expect(component.price()).toBe(19.9);
    });

    // Fix round 1 (reviewer Important 1).
    it('ignores a stale next-number prefill response that resolves after a subsequent real scan', async () => {
      const nextNumberSubject = new Subject<{ nextNumber: number }>();
      const articlesApi = articlesApiStub();
      articlesApi.getNextNumber.mockReturnValue(nextNumberSubject);
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture } = await setup({ articlesApi });

      // A real scan/typed entry arrives BEFORE the (still in-flight) next-number response does.
      // `applyExternalValue()` (not a bare `valueChange.emit()`) mirrors how a real camera hit
      // reaches this component: it both updates the group's own `rawValue()` AND emits
      // `valueChange`, exactly like `onCodeDetected()`/typing would.
      numberInputGroup(fixture).applyExternalValue('2050');
      await fixture.whenStable();
      expect(articlesApi.getByNumber).toHaveBeenCalledWith(2050);

      // The stale next-number response now resolves late.
      nextNumberSubject.next({ nextNumber: 1043 });
      await fixture.whenStable();

      // Must NOT clobber the real scanned number, and must NOT trigger a second lookup for it.
      expect(numberInputGroup(fixture).rawValue()).toBe('2050');
      expect(fixture.componentInstance.articleNumber()).toBe('2050');
      expect(articlesApi.getByNumber).not.toHaveBeenCalledWith(1043);
    });
  });

  describe('"Übernehmen"', () => {
    it('appends the current form values to items() and resets the form (with next-number prefill)', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getNextNumber
        .mockReturnValueOnce(of({ nextNumber: 1043 }))
        .mockReturnValueOnce(of({ nextNumber: 1044 }));
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.onPriceChange(12.5);
      component.size.set('104');
      component.color.set('Blau');
      component.description.set('Kaum getragen');

      component.onSubmitEntry();
      await fixture.whenStable();

      expect(component.items()).toEqual([
        {
          localId: expect.any(String),
          number: 1043,
          name: 'Winterjacke',
          brand: 'Lego',
          category: 'Kleidung',
          price: 12.5,
          size: '104',
          color: 'Blau',
          description: 'Kaum getragen',
        },
      ]);

      expect(component.name()).toBe('');
      expect(component.category()).toBe('');
      expect(component.brand()).toBe('');
      expect(component.price()).toBe(0);
      expect(component.size()).toBe('');
      expect(component.color()).toBe('');
      expect(component.description()).toBe('');
      expect(numberInputGroup(fixture).rawValue()).toBe('1044');
    });

    it('does nothing while canSave() is false', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component.onSubmitEntry();

      expect(component.items()).toEqual([]);
    });

    it('renders the minimal session list with number and name', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.onPriceChange(12.5);

      component.onSubmitEntry();
      await fixture.whenStable();
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain('1043 — Winterjacke');
    });
  });

  describe('category/brand entryCreated', () => {
    it('creating a new category calls CategoriesApi.create, appends it to the options list, and sets category()', async () => {
      const categoriesApi = categoriesApiStub();
      categoriesApi.create.mockReturnValue(
        of({ id: 'cat-schuhe', name: 'Schuhe', original: false, articleCount: 0 }),
      );
      const { fixture } = await setup({ categoriesApi });

      const category = fixture.debugElement.query(By.directive(AutocompleteCreate))
        .componentInstance as AutocompleteCreate;
      category.entryCreated.emit('Schuhe');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      expect(categoriesApi.create).toHaveBeenCalledWith('Schuhe');
      expect(component.categoriesList().map((c) => c.name)).toContain('Schuhe');
      expect(component.category()).toBe('Schuhe');
    });

    it('creating a new brand that already exists (409, concurrent race) refreshes the list and sets brand() to the typed name', async () => {
      const brandsApi = brandsApiStub();
      brandsApi.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
      brandsApi.getAll.mockReturnValue(
        of([...BRANDS, { id: 'brand-nike', name: 'Nike', original: false, articleCount: 0 }]),
      );
      const { fixture } = await setup({ brandsApi });

      const brand = fixture.debugElement.queryAll(By.directive(AutocompleteCreate))[1]
        .componentInstance as AutocompleteCreate;
      brand.entryCreated.emit('Nike');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      expect(component.brandsList().map((b) => b.name)).toContain('Nike');
      expect(component.brand()).toBe('Nike');
    });
  });

  describe('intake-session-list wiring (Round-17 Task 7)', () => {
    it('itemDeleted removes exactly the matching item from items()', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.items.set([sessionArticleStub({ localId: 'a' }), sessionArticleStub({ localId: 'b', number: 1099 })]);
      fixture.detectChanges();

      sessionList(fixture).itemDeleted.emit('a');

      expect(component.items().map((i) => i.localId)).toEqual(['b']);
    });

    it('itemUpdated applies the new form values to the matching item and clears its conflict flag', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.items.set([sessionArticleStub({ localId: 'a', conflict: true })]);
      fixture.detectChanges();

      sessionList(fixture).itemUpdated.emit({
        localId: 'a',
        value: { name: 'Sommerjacke', category: 'Kleidung', brand: 'Lego', price: 19.9 },
      });

      expect(component.items()).toEqual([
        sessionArticleStub({ localId: 'a', name: 'Sommerjacke', price: 19.9, conflict: false }),
      ]);
    });

    it('bookingConflict marks the affected rows by number and prefills the Artikelnummer field with nextNumber', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.items.set([
        sessionArticleStub({ localId: 'a', number: 1043 }),
        sessionArticleStub({ localId: 'b', number: 1099 }),
      ]);
      fixture.detectChanges();

      sessionList(fixture).bookingConflict.emit({ takenNumbers: [1043], nextNumber: 1050 });
      await fixture.whenStable();

      expect(component.items().find((i) => i.localId === 'a')?.conflict).toBe(true);
      expect(component.items().find((i) => i.localId === 'b')?.conflict).toBeFalsy();
      expect(numberInputGroup(fixture).rawValue()).toBe('1050');
    });

    it('booked from the child clears items() and re-emits booked upward', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.items.set([sessionArticleStub()]);
      fixture.detectChanges();

      const bookedSpy = vi.fn();
      component.booked.subscribe(bookedSpy);

      sessionList(fixture).booked.emit();

      expect(component.items()).toEqual([]);
      expect(bookedSpy).toHaveBeenCalled();
    });
  });

  describe('Umnummerierung über das Renumber-Popup', () => {
    it('prefills all Stammfelder, the number field, and sets the badge when the popup reports a found article', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      renumberPopup(fixture).articleFound.emit(
        articleByNumberStub({ number: 1, name: 'Sommerkleid', brand: 'Vertbaudet', category: 'Kleider', price: 8 }),
      );
      await fixture.whenStable();

      expect(component.name()).toBe('Sommerkleid');
      expect(component.brand()).toBe('Vertbaudet');
      expect(component.category()).toBe('Kleider');
      expect(component.price()).toBe(8);
      expect(numberInputGroup(fixture).rawValue()).toBe('1');
      expect(component.originalNumber()).toBe(1);
      expect(component.extraModeButtonConfig().badge).toBe('1');
    });

    it('focuses the Artikelnummer field and selects its full text after a renumber popup hit, so the user can immediately overwrite it', async () => {
      const { fixture } = await setup();

      renumberPopup(fixture).articleFound.emit(articleByNumberStub({ number: 1 }));
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('#intake-article-entry-number') as HTMLInputElement;
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('1');
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });

    it('opening the popup is triggered by the number field\'s extraModeClicked', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      expect(component.renumberPopupVisible()).toBe(false);

      numberInputGroup(fixture).extraModeClicked.emit();

      expect(component.renumberPopupVisible()).toBe(true);
    });

    it('clearing the Artikelnummer field while a renumber badge is active resets every field and the badge', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      renumberPopup(fixture).articleFound.emit(articleByNumberStub({ number: 1, name: 'Sommerkleid' }));
      await fixture.whenStable();

      numberInputGroup(fixture).valueChange.emit('');
      await fixture.whenStable();

      expect(component.name()).toBe('');
      expect(component.category()).toBe('');
      expect(component.brand()).toBe('');
      expect(component.price()).toBe(0);
      expect(component.originalNumber()).toBeNull();
      expect(component.extraModeButtonConfig().badge).toBeNull();
    });

    it('clearing the Artikelnummer field WITHOUT an active renumber badge does not wipe hand-typed fields', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onNameChange('Handgetippt');
      component.onPriceChange(19.9);

      numberInputGroup(fixture).valueChange.emit('');
      await fixture.whenStable();

      expect(component.name()).toBe('Handgetippt');
      expect(component.price()).toBe(19.9);
    });

    it('"Übernehmen" carries originalNumberToDelete into the session item and resets the badge', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      renumberPopup(fixture).articleFound.emit(articleByNumberStub({ number: 1, name: 'Sommerkleid', price: 8 }));
      await fixture.whenStable();
      numberInputGroup(fixture).valueChange.emit('6');
      component.category.set('Kleider');
      component.brand.set('Vertbaudet');
      await fixture.whenStable();

      component.onSubmitEntry();
      await fixture.whenStable();

      expect(component.items()).toEqual([
        expect.objectContaining({ number: 6, name: 'Sommerkleid', originalNumberToDelete: 1 }),
      ]);
      expect(component.originalNumber()).toBeNull();
      expect(component.extraModeButtonConfig().badge).toBeNull();
    });

    it('"Übernehmen" without ever using the popup does not add originalNumberToDelete', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.onPriceChange(12.5);

      component.onSubmitEntry();
      await fixture.whenStable();

      expect(component.items()[0].originalNumberToDelete).toBeUndefined();
    });
  });

  describe('Bezeichnung/Preis/Größe/Farbe as app-input (clear button, Nummernblock, no debounce)', () => {
    it('wires debounceMs=0 on all four fields (no server call behind any of them)', async () => {
      const { fixture } = await setup();
      const ids = [
        'intake-article-entry-name',
        'intake-article-entry-price',
        'intake-article-entry-size',
        'intake-article-entry-color',
      ];
      for (const id of ids) {
        expect(appInputById(fixture, id).debounceMs()).toBe(0);
      }
    });

    it('shows no clear button while Bezeichnung is empty, and one once a keyup reports a value', async () => {
      const { fixture } = await setup();
      const nameInput = appInputById(fixture, 'intake-article-entry-name');
      expect(nameInput.addonRight()).toEqual([]);

      fixture.componentInstance.onNameKeyUp({ target: { value: 'Jacke' } } as unknown as KeyboardEvent);
      fixture.detectChanges();

      expect(nameInput.addonRight()).toEqual([{ type: 'icon', value: 'pi pi-times', key: 'clear' }]);
    });

    it('clicking the Bezeichnung clear addon empties the field and hides the button again', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const nameInput = appInputById(fixture, 'intake-article-entry-name');
      component.onNameChange('Jacke');
      fixture.detectChanges();
      expect(nameInput.addonRight().length).toBe(1);

      component.onNameAddonClick('clear');
      fixture.detectChanges();

      expect(component.name()).toBe('');
      expect(nameInput.addonRight()).toEqual([]);
    });

    it('Größe and Farbe clear buttons behave the same way', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onSizeChange('104');
      component.onColorChange('Blau');
      fixture.detectChanges();

      expect(appInputById(fixture, 'intake-article-entry-size').addonRight().length).toBe(1);
      expect(appInputById(fixture, 'intake-article-entry-color').addonRight().length).toBe(1);

      component.onSizeAddonClick('clear');
      component.onColorAddonClick('clear');
      fixture.detectChanges();

      expect(component.size()).toBe('');
      expect(component.color()).toBe('');
      expect(appInputById(fixture, 'intake-article-entry-size').addonRight()).toEqual([]);
      expect(appInputById(fixture, 'intake-article-entry-color').addonRight()).toEqual([]);
    });

    it('Preis always shows the €-label and Nummernblock addons, plus a clear addon once a value is entered', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const priceInput = appInputById(fixture, 'intake-article-entry-price');

      expect(priceInput.addonRight()).toEqual([
        { type: 'label', value: '€', key: 'currency' },
        { type: 'icon', value: 'pi pi-th-large', key: 'numpad' },
      ]);

      component.onPriceChange(12.5);
      fixture.detectChanges();

      expect(priceInput.addonRight()).toEqual([
        { type: 'icon', value: 'pi pi-times', key: 'clear' },
        { type: 'label', value: '€', key: 'currency' },
        { type: 'icon', value: 'pi pi-th-large', key: 'numpad' },
      ]);
    });

    it('clicking the Preis clear addon empties price and hides the clear addon', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onPriceChange(12.5);
      fixture.detectChanges();

      component.onPriceAddonClick('clear');
      fixture.detectChanges();

      expect(component.price()).toBe(0);
      expect(component.priceText()).toBe('');
      expect(appInputById(fixture, 'intake-article-entry-price').addonRight()).toEqual([
        { type: 'label', value: '€', key: 'currency' },
        { type: 'icon', value: 'pi pi-th-large', key: 'numpad' },
      ]);
    });

    it('clicking the Nummernblock addon toggles a numpad panel, hidden by default', async () => {
      const { fixture } = await setup();
      expect(fixture.debugElement.query(By.directive(Numpad))).toBeFalsy();

      fixture.componentInstance.onPriceAddonClick('numpad');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(Numpad))).toBeTruthy();

      fixture.componentInstance.onPriceAddonClick('numpad');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(Numpad))).toBeFalsy();
    });

    it('numpad digits/comma/backspace/clear apply directly onto priceText', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onPriceAddonClick('numpad');
      fixture.detectChanges();

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;

      numpad.keyPressed.emit({ key: '1' });
      numpad.keyPressed.emit({ key: '2' });
      numpad.keyPressed.emit({ key: ',' });
      numpad.keyPressed.emit({ key: '5' });
      fixture.detectChanges();

      expect(component.priceText()).toBe('12,5');
      expect(component.price()).toBe(12.5);

      numpad.keyPressed.emit({ key: 'Backspace' });
      fixture.detectChanges();
      expect(component.priceText()).toBe('12,');

      numpad.cleared.emit();
      fixture.detectChanges();
      expect(component.priceText()).toBe('');
    });

    it('⏎ on the price numpad triggers onSubmitEntry() when canSave() is true, and is disabled otherwise', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onArticleNumberChange('123');
      component.onNameChange('Pullover');
      component.category.set('Kleidung');
      component.brand.set('H&M');
      component.onPriceChange('19,90');
      component.onPriceAddonClick('numpad');
      fixture.detectChanges();

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(component.canSave()).toBe(true);
      expect(numpad.enterDisabled()).toBe(false);

      const submitSpy = vi.spyOn(component, 'onSubmitEntry');
      numpad.submitted.emit();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('⏎ on the price numpad is disabled while canSave() is false', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onPriceAddonClick('numpad');
      fixture.detectChanges();

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(component.canSave()).toBe(false);
      expect(numpad.enterDisabled()).toBe(true);
    });
  });
});
