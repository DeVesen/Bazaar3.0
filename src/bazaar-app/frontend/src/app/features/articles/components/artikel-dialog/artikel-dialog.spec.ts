import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../../core/auth/role.service';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
// `InputGroup` depends on `BarcodeScanner`/`@zxing/browser` — importing the ONE shared mock
// (see that file's own comment for why it must be centralized, and why every spec that
// transitively loads `BarcodeScanner` must import it, not just the ones asserting on it) so
// this test never touches real device camera APIs (unavailable in jsdom).
// (Round-25 review fix: this registration now also happens unconditionally via the global
// Vitest `setupFiles` entry in `angular.json` — this import is kept for documentation/clarity,
// not because it is still load-bearing for the mock to win the race.)
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
// Cross-feature import, read-only — see the matching exception note in artikel-dialog.ts.
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
import { ArticlesApi } from '../../data/articles-api';
import { ArtikelDialog, ArtikelFormValue } from './artikel-dialog';

const CATEGORIES: Category[] = [
  { id: 'cat-kleidung', name: 'Kleidung', original: true, articleCount: 5 },
  { id: 'cat-spielzeug', name: 'Spielzeug', original: true, articleCount: 3 },
];

const BRANDS: Brand[] = [
  { id: 'brand-playmobil', name: 'Playmobil', original: true, articleCount: 3 },
  { id: 'brand-lego', name: 'Lego', original: true, articleCount: 2 },
];

const EDIT_ARTICLE: ArtikelFormValue = {
  number: 1043,
  name: 'Winterjacke',
  brand: 'Playmobil',
  category: 'Kleidung',
  price: 12.5,
  size: '104',
  color: 'Blau',
  description: 'Kaum getragen',
};

interface ConfirmConfig {
  message?: string;
  header?: string;
  key?: string;
  accept?: () => void;
  reject?: () => void;
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

function articlesApiStub() {
  return {
    getByNumber: vi
      .fn()
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))),
  };
}

async function setup(options: {
  isAdmin: boolean;
  categoriesApi?: ReturnType<typeof categoriesApiStub>;
  brandsApi?: ReturnType<typeof brandsApiStub>;
  articlesApi?: ReturnType<typeof articlesApiStub>;
}) {
  const isAdminSignal = signal(options.isAdmin);
  const categoriesApi = options.categoriesApi ?? categoriesApiStub();
  const brandsApi = options.brandsApi ?? brandsApiStub();
  const articlesApi = options.articlesApi ?? articlesApiStub();

  await TestBed.configureTestingModule({
    imports: [ArtikelDialog],
    providers: [
      provideRouter([]),
      { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
      { provide: CategoriesApi, useValue: categoriesApi },
      { provide: BrandsApi, useValue: brandsApi },
      { provide: ArticlesApi, useValue: articlesApi },
      ConfirmationService,
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ArtikelDialog);
  const confirmationService = TestBed.inject(ConfirmationService);
  const confirmSpy = vi
    .spyOn(confirmationService, 'confirm')
    .mockImplementation(() => confirmationService);
  return {
    fixture,
    isAdminSignal,
    categoriesApi,
    brandsApi,
    articlesApi,
    confirmSpy: confirmSpy as unknown as ReturnType<typeof vi.fn<(config: ConfirmConfig) => void>>,
  };
}

describe('ArtikelDialog', () => {
  it('seeds all form fields from initialValue once visible() becomes true', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.name()).toBe('Winterjacke');
    expect(component.numberText()).toBe('1043');
    expect(component.brand()).toBe('Playmobil');
    expect(component.category()).toBe('Kleidung');
    expect(component.price()).toBe(12.5);
    expect(component.size()).toBe('104');
    expect(component.color()).toBe('Blau');
    expect(component.description()).toBe('Kaum getragen');

    // Proves the price-seeding gap fix actually reaches the rendered InputGroup, not just the
    // dialog's own `price()` signal (which the seeding effect above sets regardless of whether
    // the viewChild()+applyExternalValue() wiring in artikel-dialog.ts's second effect exists
    // at all) — read the InputGroup instance's own internal display signal directly.
    const inputGroup = fixture.debugElement.query(By.directive(InputGroup))
      .componentInstance as InputGroup;
    expect(inputGroup.priceValue()).toBe(12.5);
  });

  it('is invalid while required fields are empty and valid once they are filled', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(false);

    component.name.set('Winterjacke');
    component.category.set('Kleidung');
    component.brand.set('Playmobil');
    component.price.set(12.5);
    expect(component.canSave()).toBe(true);
  });

  it('is invalid when the seller is settled, and stays valid when only the article is sold', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(true);

    fixture.componentRef.setInput('locked', 'sold');
    await fixture.whenStable();
    expect(component.canSave()).toBe(true);

    fixture.componentRef.setInput('locked', 'settled');
    await fixture.whenStable();
    expect(component.canSave()).toBe(false);
  });

  it('disables only the price field when locked is sold, and shows the cancel-sale hint', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    fixture.componentRef.setInput('locked', 'sold');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.priceDisabled()).toBe(true);
    expect(component.fieldsDisabled()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Verkauf zuerst stornieren',
    );
    const priceFieldset = (fixture.nativeElement as HTMLElement).querySelector(
      'fieldset.artikel-dialog__price-fieldset',
    ) as HTMLFieldSetElement;
    expect(priceFieldset.disabled).toBe(true);
    const category = fixture.debugElement.query(By.directive(AutocompleteCreate));
    expect((category.componentInstance as AutocompleteCreate).disabled()).toBe(false);
  });

  it('disables every field when locked is settled, and shows the settlement banner', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    fixture.componentRef.setInput('locked', 'settled');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.fieldsDisabled()).toBe(true);
    expect(component.priceDisabled()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Abrechnung zuerst stornieren',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Verkäufer-Seite');
    const priceFieldset = (fixture.nativeElement as HTMLElement).querySelector(
      'fieldset.artikel-dialog__price-fieldset',
    ) as HTMLFieldSetElement;
    expect(priceFieldset.disabled).toBe(true);
    const category = fixture.debugElement.query(By.directive(AutocompleteCreate));
    expect((category.componentInstance as AutocompleteCreate).disabled()).toBe(true);
  });

  describe('delete button visibility (admin x locked)', () => {
    const cases: { isAdmin: boolean; locked: 'none' | 'sold' | 'settled'; visible: boolean }[] = [
      { isAdmin: true, locked: 'none', visible: true },
      { isAdmin: true, locked: 'sold', visible: false },
      { isAdmin: true, locked: 'settled', visible: false },
      { isAdmin: false, locked: 'none', visible: false },
      { isAdmin: false, locked: 'sold', visible: false },
      { isAdmin: false, locked: 'settled', visible: false },
    ];

    for (const testCase of cases) {
      it(`isAdmin=${testCase.isAdmin}, locked=${testCase.locked} -> visible=${testCase.visible}`, async () => {
        const { fixture } = await setup({ isAdmin: testCase.isAdmin });
        fixture.componentRef.setInput('visible', true);
        fixture.componentRef.setInput('articleNumber', 1043);
        fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
        fixture.componentRef.setInput('locked', testCase.locked);
        await fixture.whenStable();

        expect(fixture.componentInstance.canDelete()).toBe(testCase.visible);
        if (testCase.visible) {
          expect((fixture.nativeElement as HTMLElement).textContent).toContain('Löschen');
        } else {
          expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Löschen');
        }
      });
    }
  });

  it('shows a delete confirm dialog with the article number/name, and emits deleteRequested only on accept', async () => {
    const { fixture, confirmSpy } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const deleteSpy = vi.fn();
    component.deleteRequested.subscribe(deleteSpy);

    component.onDeleteClick();
    expect(deleteSpy).not.toHaveBeenCalled();

    const config = confirmSpy.mock.calls[0][0];
    expect(config.key).toBe('deleteArticle');
    expect(config.message).toContain('#1043');
    expect(config.message).toContain('Winterjacke');
    config.accept?.();

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('emits cancel and visibleChange(false) on cancel', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const cancelSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);
    component.visibleChange.subscribe(visibleChangeSpy);

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('displays a server-side field error for price when provided', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('serverErrors', { price: 'Preis muss größer als 0 sein.' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Preis muss größer als 0 sein.',
    );
  });

  it('renders a delete-error message when deleteError is set', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    fixture.componentRef.setInput('deleteError', 'Artikel kann nicht gelöscht werden.');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Artikel kann nicht gelöscht werden.',
    );
  });

  it('includes the unchanged article number in the save payload', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({
      number: 1043,
      name: 'Winterjacke',
      brand: 'Playmobil',
      category: 'Kleidung',
      price: 12.5,
      size: '104',
      color: 'Blau',
      description: 'Kaum getragen',
    });
  });

  it('selecting a category/brand via autocomplete-create updates the signals and canSave()', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.name.set('Winterjacke');
    component.price.set(12.5);
    expect(component.canSave()).toBe(false);

    const [category, brand] = fixture.debugElement
      .queryAll(By.directive(AutocompleteCreate))
      .map((debugElement) => debugElement.componentInstance as AutocompleteCreate);

    category.valueChange.emit('Kleidung');
    brand.valueChange.emit('Playmobil');
    await fixture.whenStable();

    expect(component.category()).toBe('Kleidung');
    expect(component.brand()).toBe('Playmobil');
    expect(component.canSave()).toBe(true);
  });

  it('creating a new category via entryCreated calls CategoriesApi.create, appends it to the options list, and sets category()', async () => {
    const categoriesApi = categoriesApiStub();
    categoriesApi.create.mockReturnValue(
      of({ id: 'cat-schuhe', name: 'Schuhe', original: false, articleCount: 0 }),
    );
    const { fixture } = await setup({ isAdmin: true, categoriesApi });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

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
    const { fixture } = await setup({ isAdmin: true, brandsApi });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

    const brand = fixture.debugElement.queryAll(By.directive(AutocompleteCreate))[1]
      .componentInstance as AutocompleteCreate;

    brand.entryCreated.emit('Nike');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.brandsList().map((b) => b.name)).toContain('Nike');
    expect(component.brand()).toBe('Nike');
  });

  it('entering a price via input-group updates price()', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    await fixture.whenStable();

    const inputGroup = fixture.debugElement.query(By.directive(InputGroup))
      .componentInstance as InputGroup;

    inputGroup.valueChange.emit(19.9);
    await fixture.whenStable();

    expect(fixture.componentInstance.price()).toBe(19.9);
  });

  describe('article number field', () => {
    async function openDialog(
      options: {
        isAdmin?: boolean;
        articlesApi?: ReturnType<typeof articlesApiStub>;
        locked?: 'none' | 'sold' | 'settled';
      } = {},
    ) {
      const { fixture, articlesApi } = await setup({
        isAdmin: options.isAdmin ?? true,
        articlesApi: options.articlesApi,
      });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('articleNumber', 1043);
      fixture.componentRef.setInput('articleId', 'a1');
      fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
      fixture.componentRef.setInput('locked', options.locked ?? 'none');
      await fixture.whenStable();
      return {
        fixture,
        component: fixture.componentInstance,
        articlesApi,
        element: fixture.nativeElement as HTMLElement,
      };
    }

    it('shows the number input prefilled with the current number and enabled', async () => {
      const { element } = await openDialog();

      const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
      expect(input.value).toBe('1043');
      expect(input.disabled).toBe(false);
    });

    it('shows the taken-number error and blocks saving when another article owns the number', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of({ id: 'b2', number: 1044 }));
      const { fixture, component, element } = await openDialog({ articlesApi });

      component.numberText.set('1044');
      component.onNumberBlur();
      await fixture.whenStable();

      expect(articlesApi.getByNumber).toHaveBeenCalledWith(1044);
      expect(element.textContent).toContain('Artikelnummer 1044 ist bereits vergeben.');
      expect(component.canSave()).toBe(false);
    });

    it('does not query the backend and can save when the number stays unchanged', async () => {
      const { fixture, component, articlesApi } = await openDialog();

      component.onNumberBlur();
      await fixture.whenStable();

      expect(articlesApi.getByNumber).not.toHaveBeenCalled();
      expect(component.canSave()).toBe(true);
    });

    it('treats a lookup hit on the article itself as free', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of({ id: 'a1', number: 1050 }));
      const { fixture, component } = await openDialog({ articlesApi });

      component.numberText.set('1050');
      component.onNumberBlur();
      await fixture.whenStable();

      expect(component.numberError()).toBeNull();
      expect(component.canSave()).toBe(true);
    });

    it('emits the new number in the save payload when the number is free', async () => {
      const { fixture, component } = await openDialog();
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      component.numberText.set('2000');
      component.onNumberBlur();
      await fixture.whenStable();
      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ number: 2000 }));
    });

    it('shows a server-side number error only while the rejected number is still entered', async () => {
      const { fixture, component, element } = await openDialog();

      component.numberText.set('1050');
      fixture.componentRef.setInput('serverErrors', {
        number: 'Artikelnummer 1050 ist bereits vergeben.',
      });
      await fixture.whenStable();
      expect(element.textContent).toContain('Artikelnummer 1050 ist bereits vergeben.');

      component.numberText.set('1060');
      await fixture.whenStable();
      expect(element.textContent).not.toContain('Artikelnummer 1050 ist bereits vergeben.');
    });

    it('shows the label hint for a changed valid number and hides it again on return', async () => {
      const { fixture, component, element } = await openDialog();

      component.numberText.set('2000');
      await fixture.whenStable();
      expect(element.textContent).toContain('Etikett neu drucken und anbringen.');

      component.numberText.set('1043');
      await fixture.whenStable();
      expect(element.textContent).not.toContain('Etikett neu drucken und anbringen.');
    });

    for (const invalidText of ['', '0', '-5', 'abc']) {
      it(`rejects "${invalidText}" with a field error and blocks saving`, async () => {
        const { fixture, component, element } = await openDialog();

        component.numberText.set(invalidText);
        await fixture.whenStable();

        expect(element.textContent).toContain('Artikelnummer muss eine ganze Zahl ab 1 sein.');
        expect(component.canSave()).toBe(false);
      });
    }

    it('disables the number input when the seller is settled', async () => {
      const { element } = await openDialog({ locked: 'settled' });

      const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('keeps the number input enabled and saveable when only the article is sold', async () => {
      const { fixture, component, element } = await openDialog({ locked: 'sold' });

      component.numberText.set('2000');
      component.onNumberBlur();
      await fixture.whenStable();

      const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
      expect(input.disabled).toBe(false);
      expect(component.canSave()).toBe(true);
    });

    it('lets a non-admin change the number the same way as an admin', async () => {
      const { fixture, component } = await openDialog({ isAdmin: false });
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      component.numberText.set('2000');
      component.onNumberBlur();
      await fixture.whenStable();
      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ number: 2000 }));
    });
  });
});
