import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../../core/auth/role.service';
// Cross-feature import, read-only — see the matching exception note in artikel-dialog.ts.
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
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

async function setup(options: { isAdmin: boolean }) {
  const isAdminSignal = signal(options.isAdmin);

  await TestBed.configureTestingModule({
    imports: [ArtikelDialog],
    providers: [
      provideRouter([]),
      { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
      { provide: CategoriesApi, useValue: { getAll: () => of(CATEGORIES) } },
      { provide: BrandsApi, useValue: { getAll: () => of(BRANDS) } },
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
    expect(component.brand()).toBe('Playmobil');
    expect(component.category()).toBe('Kleidung');
    expect(component.price()).toBe(12.5);
    expect(component.size()).toBe('104');
    expect(component.color()).toBe('Blau');
    expect(component.description()).toBe('Kaum getragen');
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

  it('is invalid whenever locked is not none, even with all required fields valid', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(true);

    fixture.componentRef.setInput('locked', 'sold');
    await fixture.whenStable();
    expect(component.canSave()).toBe(false);

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

  it('does not include the article number in the save payload', async () => {
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
      name: 'Winterjacke',
      brand: 'Playmobil',
      category: 'Kleidung',
      price: 12.5,
      size: '104',
      color: 'Blau',
      description: 'Kaum getragen',
    });
  });
});
