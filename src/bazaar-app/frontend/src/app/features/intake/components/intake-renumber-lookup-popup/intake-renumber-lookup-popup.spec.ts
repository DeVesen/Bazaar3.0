import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { IntakeRenumberLookupPopup } from './intake-renumber-lookup-popup';

const SELLER_ID = 'SEL00001';

function articleStub(overrides: Partial<ArticleByNumberResult> = {}): ArticleByNumberResult {
  return {
    id: 'ART00001',
    number: 1,
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

async function setup(articlesApi = { getByNumber: vi.fn() }) {
  await TestBed.configureTestingModule({
    imports: [IntakeRenumberLookupPopup],
    providers: [{ provide: ArticlesApi, useValue: articlesApi }],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeRenumberLookupPopup);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('sellerId', SELLER_ID);
  fixture.detectChanges();

  return { fixture, articlesApi };
}

describe('IntakeRenumberLookupPopup', () => {
  it('emits articleFound and closes when the number belongs to this seller and is still registered', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub())) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    const found = vi.fn();
    const visibleChange = vi.fn();
    component.articleFound.subscribe(found);
    component.visibleChange.subscribe(visibleChange);

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(articlesApi.getByNumber).toHaveBeenCalledWith(1);
    expect(found).toHaveBeenCalledWith(articleStub());
    expect(visibleChange).toHaveBeenCalledWith(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows an error and stays open when the number belongs to a different seller', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub({ sellerId: 'SEL00099' }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    const found = vi.fn();
    const visibleChange = vi.fn();
    component.articleFound.subscribe(found);
    component.visibleChange.subscribe(visibleChange);

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(found).not.toHaveBeenCalled();
    expect(visibleChange).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows an error and stays open when the article is already released', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(of(articleStub({ status: 'selling' }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows an error and stays open on 404 (number unknown)', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('999');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden');
  });

  it('shows a generic error message for anything other than 404', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onNumberChange('1');
    component.onLoad();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('Suche fehlgeschlagen. Bitte erneut versuchen.');
  });

  it('shows an error without calling the API when the field is empty', async () => {
    const articlesApi = { getByNumber: vi.fn() };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;

    component.onLoad();

    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Bitte eine Artikelnummer eingeben');
  });

  it('resets number and error each time the popup becomes visible', async () => {
    const articlesApi = { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) };
    const { fixture } = await setup(articlesApi);
    const component = fixture.componentInstance;
    component.onNumberChange('999');
    component.onLoad();
    await fixture.whenStable();
    expect(component.errorMessage()).not.toBeNull();

    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.errorMessage()).toBeNull();
    expect(component.rawNumber()).toBe('');
  });

  it('onCancel emits visibleChange(false) without calling the API', () => {
    const articlesApi = { getByNumber: vi.fn() };
    TestBed.configureTestingModule({
      imports: [IntakeRenumberLookupPopup],
      providers: [{ provide: ArticlesApi, useValue: articlesApi }],
    });
    const fixture = TestBed.createComponent(IntakeRenumberLookupPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('sellerId', SELLER_ID);
    fixture.detectChanges();
    const visibleChange = vi.fn();
    fixture.componentInstance.visibleChange.subscribe(visibleChange);

    fixture.componentInstance.onCancel();

    expect(visibleChange).toHaveBeenCalledWith(false);
    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
  });
});
