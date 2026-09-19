import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { PaymentConfirmedEvent } from '../../../../shared/components/payment-panel/payment-panel';
import { SalesApi } from '../../data/sales-api';
import { CheckoutPage } from './checkout-page';

function articleByNumberStub(overrides: Partial<ArticleByNumberResult> = {}): ArticleByNumberResult {
  return {
    id: 'ART00001',
    number: 1042,
    name: 'Winterjacke',
    price: 12.5,
    status: 'selling',
    sellerId: 'SEL00001',
    sellerName: 'Max Mustermann',
    ...overrides,
  };
}

function articlesApiStub() {
  return { getByNumber: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))) };
}

function salesApiStub() {
  return {
    bookSale: vi.fn().mockReturnValue(of({ soldCount: 0, total: 0, soldAt: '' })),
    undoSale: vi.fn().mockReturnValue(of(undefined)),
  };
}

async function setup(articlesApi = articlesApiStub(), salesApi = salesApiStub()) {
  await TestBed.configureTestingModule({
    imports: [CheckoutPage],
    providers: [
      { provide: ArticlesApi, useValue: articlesApi },
      { provide: SalesApi, useValue: salesApi },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CheckoutPage);
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, articlesApi, salesApi };
}

function numberInputGroup(fixture: ReturnType<typeof TestBed.createComponent<CheckoutPage>>) {
  return fixture.debugElement.query(By.directive(InputGroup)).componentInstance as InputGroup;
}

describe('CheckoutPage', () => {
  it('starts with the "Ersten Artikel eingeben …" info state', async () => {
    const { component } = await setup();
    expect(component.infoState()).toEqual({ type: 'info', text: 'Ersten Artikel eingeben …' });
  });

  describe('article-number lookup (six outcomes)', () => {
    it('local duplicate in cart: warn state, no network call', async () => {
      const articlesApi = articlesApiStub();
      const { fixture, component } = await setup(articlesApi);
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });
      expect(component.foundArticle()).toBeNull();
      expect(articlesApi.getByNumber).not.toHaveBeenCalled();
    });

    it('status "selling": success state with the formatted price, foundArticle set', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling', price: 24 })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({ type: 'success', text: (24).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) });
      expect(component.foundArticle()).toEqual(articleByNumberStub({ status: 'selling', price: 24 }));
    });

    it('status "registered": error state, "noch nicht freigegeben"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'registered' })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel 1042 ist noch nicht freigegeben — zuerst annehmen.',
      });
      expect(component.foundArticle()).toBeNull();
    });

    it('status "sold": error state, "bereits verkauft"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'sold' })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikel 1042 ist bereits verkauft.' });
      expect(component.foundArticle()).toBeNull();
    });

    it('status "returned": error state, "zurückgegeben"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'returned' })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel 1042 wurde an den Verkäufer zurückgegeben.',
      });
      expect(component.foundArticle()).toBeNull();
    });

    it('404 (unknown number): error state, "nicht bekannt"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikelnummer 1042 ist nicht bekannt.' });
      expect(component.foundArticle()).toBeNull();
    });

    it('non-404 failure (e.g. 500): generic error state, foundArticle cleared', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
      });
      expect(component.foundArticle()).toBeNull();
    });
  });

  describe('Preis-Button / onAddToCart', () => {
    it('adds the found article to cartItems, clears foundArticle, resets infoState', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling' })));
      const { fixture, component } = await setup(articlesApi);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();
      expect(component.foundArticle()).not.toBeNull();

      component.onAddToCart();

      expect(component.cartItems()).toEqual([
        { id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 },
      ]);
      expect(component.foundArticle()).toBeNull();
      expect(component.infoState()).toEqual({ type: 'success', text: 'Nächsten Artikel eingeben …' });
    });

    it('does nothing when foundArticle is null', async () => {
      const { component } = await setup();
      component.onAddToCart();
      expect(component.cartItems()).toEqual([]);
    });
  });

  describe('cart wiring (Task 4)', () => {
    it('onCartRemoveItem removes only the matching item, clears the input field and refocuses it', async () => {
      const { fixture, component } = await setup();
      component.cartItems.set([
        { id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 },
        { id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 },
      ]);
      const applyExternalValueSpy = vi.spyOn(numberInputGroup(fixture), 'applyExternalValue');
      const focusSpy = vi.spyOn(fixture.nativeElement.querySelector('input') as HTMLInputElement, 'focus');

      component.onCartRemoveItem('ART00001');

      expect(component.cartItems()).toEqual([{ id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 }]);
      expect(applyExternalValueSpy).toHaveBeenCalledWith('');
      expect(focusSpy).toHaveBeenCalled();
    });

    it('onCartClear empties the cart, resets infoState to the info state and refocuses the input field', async () => {
      const { fixture, component } = await setup();
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      component.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });
      const applyExternalValueSpy = vi.spyOn(numberInputGroup(fixture), 'applyExternalValue');
      const focusSpy = vi.spyOn(fixture.nativeElement.querySelector('input') as HTMLInputElement, 'focus');

      component.onCartClear();

      expect(component.cartItems()).toEqual([]);
      expect(component.infoState()).toEqual({ type: 'info', text: 'Ersten Artikel eingeben …' });
      expect(applyExternalValueSpy).toHaveBeenCalledWith('');
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('BUCHEN / payment-panel / Storno (Task 5)', () => {
    function paymentConfirmedEvent(totalAmount: number): PaymentConfirmedEvent {
      return { totalAmount, receivedAmount: totalAmount, change: 0 };
    }

    it('onCartCheckout opens the payment panel', async () => {
      const { component } = await setup();
      component.onCartCheckout();
      expect(component.paymentPanelVisible()).toBe(true);
    });

    it('onPaymentConfirmed success: books the cart, empties it, sets lastSaleArticleIds, resets infoState, closes the panel', async () => {
      const salesApi = salesApiStub();
      const { component } = await setup(articlesApiStub(), salesApi);
      component.cartItems.set([
        { id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 },
        { id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 },
      ]);
      component.paymentPanelVisible.set(true);

      component.onPaymentConfirmed(paymentConfirmedEvent(20.5));

      expect(salesApi.bookSale).toHaveBeenCalledWith(['ART00001', 'ART00002']);
      expect(component.cartItems()).toEqual([]);
      expect(component.lastSaleArticleIds()).toEqual(['ART00001', 'ART00002']);
      expect(component.infoState()).toEqual({ type: 'info', text: 'Ersten Artikel eingeben …' });
      expect(component.paymentPanelVisible()).toBe(false);
    });

    it('onPaymentConfirmed 409 article.not_sellable: cart unchanged, panel closed, affected item highlighted, error infoState', async () => {
      const salesApi = salesApiStub();
      salesApi.bookSale.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: { errorCode: 'article.not_sellable', articleNumbers: [1042] },
            }),
        ),
      );
      const { component } = await setup(articlesApiStub(), salesApi);
      const cartItems = [
        { id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 },
        { id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 },
      ];
      component.cartItems.set(cartItems);
      component.paymentPanelVisible.set(true);

      component.onPaymentConfirmed(paymentConfirmedEvent(20.5));

      expect(component.cartItems()).toEqual(cartItems);
      expect(component.paymentPanelVisible()).toBe(false);
      expect(component.highlightedItemId()).toBe('ART00001');
      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikel 1042 ist nicht mehr im Verkauf.' });
    });

    it('checkArticleNumber (any lookup) clears a non-empty lastSaleArticleIds', async () => {
      const { fixture, component } = await setup();
      component.lastSaleArticleIds.set(['ART00001']);

      numberInputGroup(fixture).valueChange.emit('1042');
      await fixture.whenStable();

      expect(component.lastSaleArticleIds()).toEqual([]);
    });

    it('onUndoSale success clears lastSaleArticleIds and does not touch cartItems', async () => {
      const salesApi = salesApiStub();
      const { component } = await setup(articlesApiStub(), salesApi);
      component.cartItems.set([{ id: 'ART00003', number: 1050, name: 'Mütze', price: 5 }]);
      component.lastSaleArticleIds.set(['ART00001', 'ART00002']);

      component.onUndoSale();

      expect(salesApi.undoSale).toHaveBeenCalledWith(['ART00001', 'ART00002']);
      expect(component.lastSaleArticleIds()).toEqual([]);
      expect(component.cartItems()).toEqual([{ id: 'ART00003', number: 1050, name: 'Mütze', price: 5 }]);
    });

    it('onUndoSale 409 settlement.locked keeps lastSaleArticleIds unchanged and sets an error infoState', async () => {
      const salesApi = salesApiStub();
      salesApi.undoSale.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { errorCode: 'settlement.locked' } })),
      );
      const { component } = await setup(articlesApiStub(), salesApi);
      component.lastSaleArticleIds.set(['ART00001']);

      component.onUndoSale();

      expect(component.lastSaleArticleIds()).toEqual(['ART00001']);
      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Storno nicht mehr möglich — Verkäufer ist bereits abgerechnet.',
      });
    });
  });
});
