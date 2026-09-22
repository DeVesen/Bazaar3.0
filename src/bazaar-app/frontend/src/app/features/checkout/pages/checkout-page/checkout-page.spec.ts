import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';
import { Input as AppInput } from '../../../../shared/components/input/input';
import { Numpad } from '../../../../shared/components/numpad/numpad';
import { BarcodeScanner } from '../../../../shared/components/barcode-scanner/barcode-scanner';
// `BarcodeScanner` is now a direct dependency (Task 1) — importing the ONE shared mock (see that
// file's own comment for why it must be centralized) so this test never touches real device
// camera APIs (unavailable in jsdom).
import { decodeFromVideoDeviceMock } from '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { PaymentConfirmedEvent } from '../../../../shared/components/payment-panel/payment-panel';
import { SalesApi } from '../../data/sales-api';
import { CheckoutPage } from './checkout-page';

// Redundant, but safe, local re-registration of the SAME shared `@zxing/browser` mock (reusing
// the imported `decodeFromVideoDeviceMock` above, not a second/competing mock): this is the only
// spec file directly exercising `BarcodeScanner` that can run as the sole spec file in its own
// Vitest worker (this task's own scoped test run — `test_angular_project` scoped to just this
// file). In that case there is no earlier spec file's import graph to "warm up" the global
// Vitest `setupFiles` registration (see zxing-browser.mock.ts's own extensive comment on this
// module-resolution race) before `BarcodeScanner`'s own static `@zxing/browser` import resolves.
// `vi.mock()` calls are hoisted by Vitest above every import in THIS file (including the
// `decodeFromVideoDeviceMock` import above and the `BarcodeScanner` import below), which
// guarantees this file's own module graph always sees the mocked module, regardless of
// setupFiles timing.
vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));

function articleByNumberStub(overrides: Partial<ArticleByNumberResult> = {}): ArticleByNumberResult {
  return {
    id: 'ART00001',
    number: 1042,
    name: 'Winterjacke',
    brand: 'Jack Wolfskin',
    category: 'Jacken',
    price: 12.5,
    size: null,
    color: null,
    description: null,
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

function articleField(fixture: ReturnType<typeof TestBed.createComponent<CheckoutPage>>) {
  return fixture.debugElement.query(By.directive(AppInput)).componentInstance as AppInput;
}

function nativeInput(fixture: ReturnType<typeof TestBed.createComponent<CheckoutPage>>) {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    // Camera-mode tests activate the real `BarcodeScanner` component, which starts scanning via
    // the shared `@zxing/browser` mock — without a resolved value here `decodeFromVideoDevice()`
    // returns `undefined` and the component's own `.then()` throws (same setup as
    // scan-dialog.spec.ts/seller-search.spec.ts).
    decodeFromVideoDeviceMock.mockReset();
    decodeFromVideoDeviceMock.mockResolvedValue({ stop: vi.fn() });

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });
  });

  it('starts with the yellow "Bitte Artikelnummer eingeben" info state', async () => {
    const { component } = await setup();
    expect(component.infoState()).toEqual({ type: 'warn', text: 'Bitte Artikelnummer eingeben' });
  });

  it('typing without Enter never triggers a lookup', async () => {
    const articlesApi = articlesApiStub();
    const { component } = await setup(articlesApi);

    component.onTyped('1042');

    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
  });

  it('Enter with an empty field does nothing', async () => {
    const articlesApi = articlesApiStub();
    const { component } = await setup(articlesApi);

    component.onEnterPressed();

    expect(articlesApi.getByNumber).not.toHaveBeenCalled();
  });

  it('Enter triggers the lookup, a second Enter while it is still pending is a no-op', async () => {
    const articlesApi = articlesApiStub();
    const subject = new Subject<ArticleByNumberResult>();
    articlesApi.getByNumber.mockReturnValue(subject);
    const { component } = await setup(articlesApi);
    component.onTyped('1042');

    component.onEnterPressed();
    expect(articlesApi.getByNumber).toHaveBeenCalledTimes(1);
    expect(component.searching()).toBe(true);

    component.onEnterPressed();
    expect(articlesApi.getByNumber).toHaveBeenCalledTimes(1);

    subject.next(articleByNumberStub());
    subject.complete();
    expect(component.searching()).toBe(false);
  });

  describe('article-number lookup (six outcomes)', () => {
    it('local duplicate in cart: warn state, no network call, field refocused+selected', async () => {
      const articlesApi = articlesApiStub();
      const { fixture, component } = await setup(articlesApi);
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      const selectSpy = vi.spyOn(nativeInput(fixture), 'select');
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });
      expect(component.foundArticle()).toBeNull();
      expect(articlesApi.getByNumber).not.toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('status "selling": success state with "Artikel gültig – <Preis> – Enter zum Übernehmen", foundArticle set', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling', price: 24 })));
      const { fixture, component } = await setup(articlesApi);
      const selectSpy = vi.spyOn(nativeInput(fixture), 'select');
      component.onTyped('1042');

      component.onEnterPressed();

      const price = (24).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
      expect(component.infoState()).toEqual({ type: 'success', text: `Artikel gültig – ${price} – Enter zum Übernehmen` });
      expect(component.foundArticle()).toEqual(articleByNumberStub({ status: 'selling', price: 24 }));
      expect(component.inputAddons()).toEqual([
        { type: 'icon', value: 'pi pi-times', key: 'clear' },
        { type: 'icon', value: 'pi pi-reply', key: 'enter', class: undefined },
      ]);
      expect(selectSpy).toHaveBeenCalled();
    });

    it('status "selling" while camera mode was active: panel closes (mode forced to keyboard), previous mode remembered', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling' })));
      const { component } = await setup(articlesApi);
      component.activeMode.set('camera');
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.activeMode()).toBe('keyboard');
      expect(component.previousMode()).toBe('camera');
    });

    it('status "registered": error state, "noch nicht freigegeben", field refocused+selected', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'registered' })));
      const { fixture, component } = await setup(articlesApi);
      const selectSpy = vi.spyOn(nativeInput(fixture), 'select');
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel 1042 ist noch nicht freigegeben — zuerst annehmen.',
      });
      expect(component.foundArticle()).toBeNull();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('status "sold": error state, "bereits verkauft"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'sold' })));
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikel 1042 ist bereits verkauft.' });
      expect(component.foundArticle()).toBeNull();
    });

    it('status "returned": error state, "zurückgegeben"', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'returned' })));
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel 1042 wurde an den Verkäufer zurückgegeben.',
      });
      expect(component.foundArticle()).toBeNull();
    });

    it('404 (unknown number): error state, "nicht bekannt", field refocused+selected', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const { fixture, component } = await setup(articlesApi);
      const selectSpy = vi.spyOn(nativeInput(fixture), 'select');
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({ type: 'error', text: 'Artikelnummer 1042 ist nicht bekannt.' });
      expect(component.foundArticle()).toBeNull();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('non-404 failure (e.g. 500): generic error state, foundArticle cleared', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.infoState()).toEqual({
        type: 'error',
        text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
      });
      expect(component.foundArticle()).toBeNull();
    });
  });

  describe('second Enter = cart add (found state)', () => {
    it('unchanged value, second Enter adds to cart, clears field, green info state, restores previous mode', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling' })));
      const { component } = await setup(articlesApi);
      component.activeMode.set('numpad');
      component.onTyped('1042');
      component.onEnterPressed();
      expect(component.foundArticle()).not.toBeNull();

      component.onEnterPressed();

      expect(component.cartItems()).toEqual([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      expect(component.foundArticle()).toBeNull();
      expect(component.articleNumber()).toBe('');
      expect(component.infoState()).toEqual({ type: 'success', text: 'Nächsten Artikel eingeben …' });
      expect(component.activeMode()).toBe('numpad');
      expect(articlesApi.getByNumber).toHaveBeenCalledTimes(1);
    });

    it('changing the field content after a find invalidates it — next Enter is a new lookup, not a cart add', async () => {
      const articlesApi = articlesApiStub();
      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling', number: 1042 })));
      const { component } = await setup(articlesApi);
      component.onTyped('1042');
      component.onEnterPressed();
      expect(component.foundArticle()).not.toBeNull();

      component.onTyped('1043');
      expect(component.foundArticle()).toBeNull();

      articlesApi.getByNumber.mockReturnValue(of(articleByNumberStub({ status: 'selling', number: 1043 })));
      component.onEnterPressed();

      expect(articlesApi.getByNumber).toHaveBeenCalledTimes(2);
      expect(articlesApi.getByNumber).toHaveBeenLastCalledWith(1043);
      expect(component.cartItems()).toEqual([]);
    });
  });

  describe('mode toggling & addon clicks', () => {
    it('inputAddons shows camera/numpad/clear/enter, active mode marked, when nothing found yet', async () => {
      const { component } = await setup();
      component.activeMode.set('camera');

      expect(component.inputAddons()).toEqual([
        { type: 'icon', value: 'pi pi-camera', key: 'camera', class: 'checkout-page__addon--active' },
        { type: 'icon', value: 'pi pi-th-large', key: 'numpad', class: undefined },
        { type: 'icon', value: 'pi pi-times', key: 'clear' },
        { type: 'icon', value: 'pi pi-reply', key: 'enter', class: undefined },
      ]);
    });

    it('enter addon carries the disabled class while searching', async () => {
      const articlesApi = articlesApiStub();
      const subject = new Subject<ArticleByNumberResult>();
      articlesApi.getByNumber.mockReturnValue(subject);
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      component.onEnterPressed();

      expect(component.inputAddons().find((a) => a.key === 'enter')?.class).toBe('checkout-page__addon--disabled');
    });

    it('addonClick("camera") toggles camera mode on/off', async () => {
      const { component } = await setup();
      component.onAddonClick('camera');
      expect(component.activeMode()).toBe('camera');
      component.onAddonClick('camera');
      expect(component.activeMode()).toBe('keyboard');
    });

    it('addonClick("numpad") toggles numpad mode on/off', async () => {
      const { component } = await setup();
      component.onAddonClick('numpad');
      expect(component.activeMode()).toBe('numpad');
      component.onAddonClick('numpad');
      expect(component.activeMode()).toBe('keyboard');
    });

    it('addonClick("clear") empties the field and drops any found article', async () => {
      const { component } = await setup();
      component.onTyped('1042');
      component.onAddonClick('clear');
      expect(component.articleNumber()).toBe('');
    });

    it('addonClick("enter") triggers the same lookup as pressing Enter', async () => {
      const articlesApi = articlesApiStub();
      const { component } = await setup(articlesApi);
      component.onTyped('1042');

      component.onAddonClick('enter');

      expect(articlesApi.getByNumber).toHaveBeenCalledWith(1042);
    });
  });

  describe('numpad wiring', () => {
    it('digits and Backspace apply onto articleNumber, comma/other keys are ignored', async () => {
      const { fixture, component } = await setup();
      component.activeMode.set('numpad');
      fixture.detectChanges();
      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;

      numpad.keyPressed.emit({ key: '1' });
      numpad.keyPressed.emit({ key: '0' });
      numpad.keyPressed.emit({ key: ',' });
      numpad.keyPressed.emit({ key: '4' });
      numpad.keyPressed.emit({ key: 'Backspace' });
      numpad.keyPressed.emit({ key: '2' });

      expect(component.articleNumber()).toBe('102');
    });

    it('numpad cleared() empties the field', async () => {
      const { fixture, component } = await setup();
      component.activeMode.set('numpad');
      component.onTyped('1042');
      fixture.detectChanges();
      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;

      numpad.cleared.emit();

      expect(component.articleNumber()).toBe('');
    });

    it('numpad submitted() triggers the same lookup as Enter, and is disabled while searching', async () => {
      const articlesApi = articlesApiStub();
      const subject = new Subject<ArticleByNumberResult>();
      articlesApi.getByNumber.mockReturnValue(subject);
      const { fixture, component } = await setup(articlesApi);
      component.activeMode.set('numpad');
      component.onTyped('1042');
      fixture.detectChanges();
      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;

      numpad.submitted.emit();
      fixture.detectChanges();

      expect(articlesApi.getByNumber).toHaveBeenCalledTimes(1);
      expect(numpad.enterDisabled()).toBe(true);
    });
  });

  describe('camera wiring', () => {
    it('a detected code fills the field and switches back to keyboard mode, without triggering a lookup', async () => {
      const articlesApi = articlesApiStub();
      const { fixture, component } = await setup(articlesApi);
      component.activeMode.set('camera');
      fixture.detectChanges();
      const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;

      scanner.codeDetected.emit('1042');

      expect(component.articleNumber()).toBe('1042');
      expect(component.activeMode()).toBe('keyboard');
      expect(articlesApi.getByNumber).not.toHaveBeenCalled();
    });
  });

  describe('cart wiring', () => {
    it('onCartRemoveItem removes only the matching item, clears the field and refocuses it', async () => {
      const { fixture, component } = await setup();
      component.cartItems.set([
        { id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 },
        { id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 },
      ]);
      component.onTyped('1042');
      const focusSpy = vi.spyOn(nativeInput(fixture), 'focus');

      component.onCartRemoveItem('ART00001');

      expect(component.cartItems()).toEqual([{ id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 }]);
      expect(component.articleNumber()).toBe('');
      expect(focusSpy).toHaveBeenCalled();
    });

    it('onCartClear empties the cart, resets the field and the initial info state, refocuses', async () => {
      const { fixture, component } = await setup();
      component.cartItems.set([{ id: 'ART00001', number: 1042, name: 'Winterjacke', price: 12.5 }]);
      component.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });
      const focusSpy = vi.spyOn(nativeInput(fixture), 'focus');

      component.onCartClear();

      expect(component.cartItems()).toEqual([]);
      expect(component.infoState()).toEqual({ type: 'warn', text: 'Bitte Artikelnummer eingeben' });
      expect(component.articleNumber()).toBe('');
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('BUCHEN / payment-panel / Storno', () => {
    function paymentConfirmedEvent(totalAmount: number): PaymentConfirmedEvent {
      return { totalAmount, receivedAmount: totalAmount, change: 0 };
    }

    it('onCartCheckout opens the payment panel', async () => {
      const { component } = await setup();
      component.onCartCheckout();
      expect(component.paymentPanelVisible()).toBe(true);
    });

    it('onPaymentConfirmed success: books the cart, empties it, resets field/info state, closes the panel', async () => {
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
      expect(component.infoState()).toEqual({ type: 'warn', text: 'Bitte Artikelnummer eingeben' });
      expect(component.articleNumber()).toBe('');
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

    it('a lookup (any trigger) clears a non-empty lastSaleArticleIds', async () => {
      const { component } = await setup();
      component.lastSaleArticleIds.set(['ART00001']);
      component.onTyped('1042');

      component.onEnterPressed();

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

  it('wires Enter on the app-input field itself through to the lookup', async () => {
    const articlesApi = articlesApiStub();
    const { fixture, component } = await setup(articlesApi);
    component.onTyped('1042');

    articleField(fixture).enter.emit();

    expect(articlesApi.getByNumber).toHaveBeenCalledWith(1042);
  });
});
