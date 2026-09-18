import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
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
import { IntakeArticleEntry } from './intake-article-entry';

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
    price: 12.5,
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

async function setup(
  options: {
    articlesApi?: ReturnType<typeof articlesApiStub>;
    categoriesApi?: ReturnType<typeof categoriesApiStub>;
    brandsApi?: ReturnType<typeof brandsApiStub>;
  } = {},
) {
  const articlesApi = options.articlesApi ?? articlesApiStub();
  const categoriesApi = options.categoriesApi ?? categoriesApiStub();
  const brandsApi = options.brandsApi ?? brandsApiStub();
  const sellersApi = { getById: vi.fn().mockReturnValue(of(sellerDetailStub())) };

  await TestBed.configureTestingModule({
    imports: [IntakeArticleEntry],
    providers: [
      { provide: ArticlesApi, useValue: articlesApi },
      { provide: CategoriesApi, useValue: categoriesApi },
      { provide: BrandsApi, useValue: brandsApi },
      { provide: SellersApi, useValue: sellersApi },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeArticleEntry);
  fixture.componentRef.setInput('sellerId', SELLER_ID);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, articlesApi, categoriesApi, brandsApi, sellersApi };
}

function numberInputGroup(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.queryAll(By.directive(InputGroup))[0].componentInstance as InputGroup;
}

function priceInputGroup(fixture: ReturnType<typeof TestBed.createComponent<IntakeArticleEntry>>) {
  return fixture.debugElement.queryAll(By.directive(InputGroup))[1].componentInstance as InputGroup;
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

      component.price.set(12.5);
      expect(component.canSave()).toBe(true);
    });

    it('keeps "Übernehmen" disabled while a price of 0 is set, even with every other field filled', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.articleNumber.set('1043');
      component.name.set('Winterjacke');
      component.category.set('Kleidung');
      component.brand.set('Lego');
      component.price.set(0);

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
      component.price.set(5);

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

    it('200, belongs to this seller and still registered (pre-announced): prefills Bezeichnung/Preis, no message, fields stay editable', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(
        of(articleByNumberStub({ sellerId: SELLER_ID, status: 'registered', name: 'Sommerkleid', price: 8 })),
      );
      const { fixture } = await setup({ articlesApi });
      const component = fixture.componentInstance;

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.numberTakenMessage()).toBeNull();
      expect(component.name()).toBe('Sommerkleid');
      expect(component.price()).toBe(8);
      expect(priceInputGroup(fixture).priceValue()).toBe(8);
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
      component.price.set(12.5);
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
      component.price.set(12.5);

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
});
