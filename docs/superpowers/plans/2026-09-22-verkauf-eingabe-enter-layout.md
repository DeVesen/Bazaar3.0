# Verkauf Enter-Eingabe, Page-Header & Responsives Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Verkauf/checkout page's Artikelnummer-Eingabe onto `app-input` with Enter-only lookup/cart-confirmation, add a documented Page-Header, and make the two-column layout responsive at 768px with a height-capped, sticky-footer cart.

**Architecture:** `checkout-page.ts` takes over the mode/lookup orchestration that `app-input-group` used to do internally — it now owns `articleNumber`, `activeMode` (keyboard/camera/numpad) and a small found/searching state machine, wiring a plain `app-input` (mode-toggle buttons as `addonRight`) to sibling `app-barcode-scanner`/`app-numpad` components, exactly the pattern `payment-panel.ts` and `intake-renumber-lookup-popup.ts` already establish elsewhere in this codebase. Layout and cart-height are pure CSS (existing 768px breakpoint, PrimeNG `p-card` internals via `::ng-deep`, matching the `kpi-tile.scss` convention).

**Tech Stack:** Angular (standalone components, signals), PrimeNG, Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-22-verkauf-eingabe-enter-layout-design.md`](../specs/2026-09-22-verkauf-eingabe-enter-layout-design.md) (technical design) and [`docs/spec/2026-09-22-verkauf-eingabe-enter-layout.md`](../../spec/2026-09-22-verkauf-eingabe-enter-layout.md) (requirements/AC — binding wording for texts and behavior).

## Global Constraints

- No new breakpoint value — reuse `768px` (existing `shell.scss:5`, story BSHELL-S02).
- No changes to `app-input`, `app-input-group`, `app-numpad`, `app-barcode-scanner` themselves — their existing public APIs are sufficient.
- Existing error/InfoArea texts (epic.md §2, cart.md) stay verbatim — only focus/select and trigger timing change.
- `PrimeNG`-only, no native HTML form controls beyond what `app-input`/`app-numpad` already render internally.

---

### Task 1: Enter-Bestätigung Zustandsmaschine + app-input-Verkabelung

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts`

**Interfaces:**
- Produces: `CheckoutPage.articleNumber: WritableSignal<string>`, `CheckoutPage.activeMode: WritableSignal<'keyboard'|'camera'|'numpad'>`, `CheckoutPage.searching: WritableSignal<boolean>`, `CheckoutPage.foundArticle: WritableSignal<ArticleByNumberResult|null>`, `CheckoutPage.inputAddons: Signal<InputAddon[]>`, `CheckoutPage.onTyped(value: string): void`, `CheckoutPage.onEnterPressed(): void`, `CheckoutPage.onAddonClick(key: string): void`, `CheckoutPage.onNumpadKey(init: KeyboardEventInit): void`, `CheckoutPage.onNumpadClear(): void`, `CheckoutPage.onCodeDetected(code: string): void` — Task 2/3 only touch template/CSS, they consume these names unchanged.
- Consumes: `Input` (`app-input`, `shared/components/input/input.ts`) — `value`/`debounceMs`/`addonRight` inputs, `valueChange`/`enter`/`addonClick` outputs. `Numpad` (`shared/components/numpad/numpad.ts`) — `enterDisabled` input, `keyPressed`/`cleared`/`submitted` outputs. `BarcodeScanner` (`shared/components/barcode-scanner/barcode-scanner.ts`) — `active` input, `codeDetected` output. `ArticlesApi.getByNumber(number): Observable<ArticleByNumberResult>` (unchanged, `features/articles/data/articles-api.ts`).

- [ ] **Step 1: Replace `checkout-page.spec.ts` with the new test suite (failing)**

```typescript
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
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { PaymentConfirmedEvent } from '../../../../shared/components/payment-panel/payment-panel';
import { SalesApi } from '../../data/sales-api';
import { CheckoutPage } from './checkout-page';

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
```

- [ ] **Step 2: Run the suite to confirm it fails**

Run: `npx dev-mcp test_angular_project` equivalent — use the `dev-mcp` skill's `test_angular_project` tool scoped to `checkout-page.spec.ts` (per `dev-mcp` skill routing; do not invoke `ng test`/`npm run test` directly).
Expected: FAIL — `CheckoutPage` has no `articleNumber`/`onEnterPressed`/`inputAddons`/etc. yet, and the old spec's `InputGroup`/`applyExternalValue` symbols are gone.

- [ ] **Step 3: Replace `checkout-page.ts`**

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Input, InputAddon } from '../../../../shared/components/input/input';
import { Numpad } from '../../../../shared/components/numpad/numpad';
import { BarcodeScanner } from '../../../../shared/components/barcode-scanner/barcode-scanner';
import { PaymentConfirmedEvent, PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { Cart } from '../../components/cart/cart';
import { SalesApi } from '../../data/sales-api';
// Cross-feature import, read-only: ArticlesApi.getByNumber() backs the
// checkout page's article-number lookup, same sanctioned pattern
// intake-article-entry.ts already uses for the same API.
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';

/**
 * A single article added to the checkout basket, held locally until "BUCHEN"
 * calls `SalesApi.bookSale()`. Deliberately narrower than `ArticleByNumberResult` —
 * only the fields the cart needs to render a row and this page needs to sum the total.
 */
export interface CartItem {
  id: string;
  number: number;
  name: string;
  price: number;
}

type InfoType = 'info' | 'success' | 'warn' | 'error';

interface InfoState {
  type: InfoType;
  text: string;
}

type FieldMode = 'keyboard' | 'camera' | 'numpad';

/** docs/spec/2026-09-22-verkauf-eingabe-enter-layout.md "Info-Text initial/leer": gelb, shown on
 * fresh navigation and again whenever the page returns to an empty-cart baseline. */
const INITIAL_INFO_STATE: InfoState = { type: 'warn', text: 'Bitte Artikelnummer eingeben' };

/**
 * Kasse/Verkauf page (Epic_Verkauf) — left column: article-number `app-input` (keyboard,
 * with camera/numpad as sibling panels below it) driven entirely by Enter (no auto-lookup),
 * an inline InfoArea reporting the lookup result, no Preis-Button anymore — a second Enter on
 * a "found" result adds it to the basket. Right column renders `app-cart`, which owns the
 * remove/clear/checkout intents (this page still owns `cartItems` mutation and refocusing).
 * "BUCHEN" opens `app-payment-panel` in a `p-dialog` overlay; `SalesApi.bookSale()`/`undoSale()`
 * back the booking and Storno flow, mirroring `release-dialog.ts`'s own confirm→book→handle-409
 * shape.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [ButtonModule, DialogModule, Input, Numpad, BarcodeScanner, Cart, PaymentPanel],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly articlesApi = inject(ArticlesApi);
  private readonly salesApi = inject(SalesApi);
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  readonly cartItems = signal<CartItem[]>([]);
  readonly infoState = signal<InfoState>(INITIAL_INFO_STATE);
  readonly lastSaleArticleIds = signal<string[]>([]);
  readonly paymentPanelVisible = signal(false);
  readonly highlightedItemId = signal<string | null>(null);

  readonly articleNumber = signal('');
  readonly activeMode = signal<FieldMode>('keyboard');
  readonly previousMode = signal<FieldMode>('keyboard');
  readonly searching = signal(false);
  /** The currently looked-up, sellable-and-not-in-cart article; non-null exactly while the field
   * is in the "valide gefunden" state. */
  readonly foundArticle = signal<ArticleByNumberResult | null>(null);
  /** Raw field value at the moment `foundArticle` was set — typing away from it invalidates the
   * find (spec.md "Tippen nach Valid": the next Enter becomes a new lookup, not a cart add). */
  readonly resultNumber = signal<string | null>(null);

  readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price, 0));

  readonly infoIcon = computed<string>(() => {
    switch (this.infoState().type) {
      case 'success':
        return 'pi pi-check';
      case 'error':
        return 'pi pi-times';
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'info':
        return 'pi pi-info-circle';
    }
  });

  /** Kamera/Nummernblock-Umschalter + Clear/Enter; im "valide gefunden"-Zustand nur noch
   * Clear/Enter (spec.md "Zustand valide"). Das Enter-Addon bekommt während `searching()` eine
   * `--disabled`-Klasse (spec.md AC "Enter während Suche wirkungslos"; `InputAddon` selbst hat
   * kein natives disabled-Feld). */
  readonly inputAddons = computed<InputAddon[]>(() => {
    const clearAndEnter: InputAddon[] = [
      { type: 'icon', value: 'pi pi-times', key: 'clear' },
      {
        type: 'icon',
        value: 'pi pi-reply',
        key: 'enter',
        class: this.searching() ? 'checkout-page__addon--disabled' : undefined,
      },
    ];
    if (this.foundArticle()) return clearAndEnter;
    return [
      {
        type: 'icon',
        value: 'pi pi-camera',
        key: 'camera',
        class: this.activeMode() === 'camera' ? 'checkout-page__addon--active' : undefined,
      },
      {
        type: 'icon',
        value: 'pi pi-th-large',
        key: 'numpad',
        class: this.activeMode() === 'numpad' ? 'checkout-page__addon--active' : undefined,
      },
      ...clearAndEnter,
    ];
  });

  constructor() {
    // Fokus-Verhalten (spec.md §7, AC-1): focus the article-number field on page entry.
    // `app-input` exposes no public `focus()` — same best-effort host-querySelector pattern as
    // `scan-dialog.ts`'s `onShown()`.
    queueMicrotask(() => this.focusArticleNumberField());
  }

  onTyped(value: string): void {
    this.articleNumber.set(value);
    if (this.foundArticle() && value !== this.resultNumber()) {
      this.foundArticle.set(null);
      this.resultNumber.set(null);
    }
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
        this.activeMode.set(this.activeMode() === 'camera' ? 'keyboard' : 'camera');
        return;
      case 'numpad':
        this.activeMode.set(this.activeMode() === 'numpad' ? 'keyboard' : 'numpad');
        return;
      case 'clear':
        this.onTyped('');
        return;
      case 'enter':
        this.onEnterPressed();
        return;
    }
  }

  /** Artikelnummer ist reine Ganzzahl — nur Ziffern und Backspace werden übernommen, gleiches
   * Muster wie `intake-renumber-lookup-popup.ts`'s eigener `onNumpadKey`. */
  onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
      this.onTyped(this.articleNumber().slice(0, -1));
      return;
    }
    if (/^[0-9]$/.test(key)) {
      this.onTyped(this.articleNumber() + key);
    }
  }

  onNumpadClear(): void {
    this.onTyped('');
  }

  onCodeDetected(code: string): void {
    this.onTyped(code);
    this.activeMode.set('keyboard');
  }

  onEnterPressed(): void {
    if (this.searching()) return;
    if (this.foundArticle() && this.articleNumber() === this.resultNumber()) {
      this.addToCart();
      return;
    }
    this.startLookup();
  }

  private startLookup(): void {
    // Storno-Button "verschwindet, sobald der nächste Artikel gescannt wird" (epic.md §5) — this
    // is the single entry point every keyboard/camera/numpad lookup funnels through, so one reset
    // here covers all input modes.
    this.lastSaleArticleIds.set([]);

    const trimmed = this.articleNumber().trim();
    if (!trimmed) return;
    const number = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(number)) return;

    // Local duplicate check first, no network call (Epic_Verkauf §2 "Bereits im Warenkorb",
    // cart.md AC-2).
    if (this.cartItems().some((item) => item.number === number)) {
      this.infoState.set({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });
      this.foundArticle.set(null);
      this.resultNumber.set(null);
      this.focusArticleNumberField(true);
      return;
    }

    this.searching.set(true);
    this.articlesApi.getByNumber(number).subscribe({
      next: (article) => this.handleArticleFound(article, number, trimmed),
      error: (error: unknown) => this.handleArticleLookupError(error, number),
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, number: number, matchedRaw: string): void {
    this.searching.set(false);
    switch (article.status) {
      case 'selling':
        this.infoState.set({
          type: 'success',
          text: `Artikel gültig – ${article.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} – Enter zum Übernehmen`,
        });
        this.foundArticle.set(article);
        this.resultNumber.set(matchedRaw);
        this.previousMode.set(this.activeMode());
        this.activeMode.set('keyboard');
        this.focusArticleNumberField(true);
        return;
      case 'registered':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} ist noch nicht freigegeben — zuerst annehmen.`,
        });
        this.foundArticle.set(null);
        this.focusArticleNumberField(true);
        return;
      case 'sold':
        this.infoState.set({ type: 'error', text: `Artikel ${number} ist bereits verkauft.` });
        this.foundArticle.set(null);
        this.focusArticleNumberField(true);
        return;
      case 'returned':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} wurde an den Verkäufer zurückgegeben.`,
        });
        this.foundArticle.set(null);
        this.focusArticleNumberField(true);
        return;
      default:
        // There is no `not_sellable`/settlement case reachable here — that only exists
        // server-side at booking time (spec.md: "Einen Fall „Verkäufer ist abgerechnet" gibt es
        // hier nicht"). Any other/unknown status is treated the same as a lookup failure.
        this.infoState.set({
          type: 'error',
          text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
        });
        this.foundArticle.set(null);
        this.focusArticleNumberField(true);
    }
  }

  private handleArticleLookupError(error: unknown, number: number): void {
    this.searching.set(false);
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.infoState.set({ type: 'error', text: `Artikelnummer ${number} ist nicht bekannt.` });
      this.foundArticle.set(null);
      this.focusArticleNumberField(true);
      return;
    }

    // Not part of the epic's six-state table (network/5xx only) — treated conservatively with a
    // generic error message rather than silently doing nothing.
    this.infoState.set({ type: 'error', text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.' });
    this.foundArticle.set(null);
    this.focusArticleNumberField(true);
  }

  private addToCart(): void {
    const article = this.foundArticle();
    if (!article) return;
    this.cartItems.update((items) => [
      ...items,
      { id: article.id, number: article.number, name: article.name, price: article.price },
    ]);
    this.foundArticle.set(null);
    this.resultNumber.set(null);
    this.articleNumber.set('');
    this.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });
    this.activeMode.set(this.previousMode());
    this.focusArticleNumberField();
  }

  onCartRemoveItem(id: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
    this.highlightedItemId.set(null);
    this.resetField();
    this.focusArticleNumberField();
  }

  onCartClear(): void {
    this.cartItems.set([]);
    this.highlightedItemId.set(null);
    this.resetField();
    this.infoState.set(INITIAL_INFO_STATE);
    this.focusArticleNumberField();
  }

  onCartCheckout(): void {
    this.paymentPanelVisible.set(true);
  }

  /** `p-dialog[modal]` already overlays the whole page — unlike `release-dialog.ts`'s own
   * scan-dialog/payment-panel mutual-exclusion dance, `app-cart` does not need to be hidden while
   * this is open. */
  onPaymentCancelled(): void {
    this.paymentPanelVisible.set(false);
  }

  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    // `bookSale()` only needs the article ids, not the payment breakdown (unlike
    // release-dialog.ts/intake-session-list.ts, which forward `event.totalAmount`). `void` keeps
    // the parameter referenced so lint's no-unused-vars rule (no underscore-prefix exemption
    // configured in this project) stays quiet without pretending it is actually used.
    void event;
    const articleIds = this.cartItems().map((item) => item.id);
    this.salesApi.bookSale(articleIds).subscribe({
      next: () => {
        this.paymentPanelVisible.set(false);
        this.lastSaleArticleIds.set(articleIds);
        this.cartItems.set([]);
        this.highlightedItemId.set(null);
        this.resetField();
        this.infoState.set(INITIAL_INFO_STATE);
        this.focusArticleNumberField();
      },
      error: (error: unknown) => this.handleBookingError(error),
    });
  }

  /** 409 `article.not_sellable` (cart.md AC-7 / epic.md AC-8): the cart stays completely
   * unchanged — only the payment-panel closes and the affected row gets marked. Mirrors
   * `release-dialog.ts`'s own `handleBookingError` shape. */
  private handleBookingError(error: unknown): void {
    this.paymentPanelVisible.set(false);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'article.not_sellable'
    ) {
      const numbers = (error.error as { articleNumbers?: number[] } | null)?.articleNumbers ?? [];
      const affectedNumber = numbers[0];
      const affectedItem = this.cartItems().find((item) => item.number === affectedNumber);
      this.highlightedItemId.set(affectedItem?.id ?? null);
      this.infoState.set({
        type: 'error',
        text:
          affectedNumber !== undefined
            ? `Artikel ${affectedNumber} ist nicht mehr im Verkauf.`
            : 'Buchung fehlgeschlagen. Bitte erneut versuchen.',
      });
      return;
    }

    this.infoState.set({ type: 'error', text: 'Buchung fehlgeschlagen. Bitte erneut versuchen.' });
  }

  /** "Letzten Vorgang stornieren" (epic.md §5, AC-11) — articles do NOT return to the cart, this
   * only clears `lastSaleArticleIds` on success. */
  onUndoSale(): void {
    const ids = this.lastSaleArticleIds();
    this.salesApi.undoSale(ids).subscribe({
      next: () => this.lastSaleArticleIds.set([]),
      error: (error: unknown) => this.handleUndoError(error),
    });
  }

  /** 409 `settlement.locked`: spec.md prescribes no exact text for this case (unlike the sales
   * 409 above) — implementer's own judgment call, see task-5-report.md. `lastSaleArticleIds` is
   * kept unchanged so the button stays visible and the user isn't left without an explanation or
   * a way to retry. */
  private handleUndoError(error: unknown): void {
    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'settlement.locked'
    ) {
      this.infoState.set({
        type: 'error',
        text: 'Storno nicht mehr möglich — Verkäufer ist bereits abgerechnet.',
      });
      return;
    }
    this.infoState.set({ type: 'error', text: 'Storno fehlgeschlagen. Bitte erneut versuchen.' });
  }

  private resetField(): void {
    this.articleNumber.set('');
    this.foundArticle.set(null);
    this.resultNumber.set(null);
  }

  /** Extracted since it is called from multiple places (init, after found/error results,
   * after add-to-cart, after remove/clear/booking) — reused instead of duplicating the query.
   * `selectAll` selects the field's content too (spec.md: focus+select on every settled result
   * except the freshly-cleared/init states). */
  private focusArticleNumberField(selectAll = false): void {
    const input = this.hostElement.nativeElement.querySelector<HTMLInputElement>('input');
    input?.focus();
    if (selectAll) input?.select();
  }
}
```

- [ ] **Step 4: Replace `checkout-page.html`**

```html
<div class="checkout-page">
  <div class="checkout-page__column checkout-page__column--left">
    <div class="checkout-page__field">
      <label for="checkout-page-number">Artikelnummer</label>
      <app-input
        inputId="checkout-page-number"
        [value]="articleNumber()"
        [debounceMs]="0"
        [addonRight]="inputAddons()"
        (valueChange)="onTyped($event)"
        (enter)="onEnterPressed()"
        (addonClick)="onAddonClick($event)"
      />
    </div>

    @if (activeMode() === 'camera') {
      <app-barcode-scanner [active]="activeMode() === 'camera'" (codeDetected)="onCodeDetected($event)" />
    }
    @if (activeMode() === 'numpad') {
      <app-numpad
        [enterDisabled]="searching()"
        (keyPressed)="onNumpadKey($event)"
        (cleared)="onNumpadClear()"
        (submitted)="onEnterPressed()"
      />
    }

    <div class="checkout-page__info-area checkout-page__info-area--{{ infoState().type }}">
      <i [class]="infoIcon()"></i>
      <span>{{ infoState().text }}</span>
    </div>

    @if (lastSaleArticleIds().length > 0) {
      <p-button label="Letzten Vorgang stornieren" severity="secondary" [outlined]="true" (onClick)="onUndoSale()" />
    }
  </div>

  <div class="checkout-page__column checkout-page__column--right">
    <app-cart
      [items]="cartItems()"
      [highlightedItemId]="highlightedItemId()"
      (removeItem)="onCartRemoveItem($event)"
      (clear)="onCartClear()"
      (checkout)="onCartCheckout()"
    />
  </div>
</div>

<p-dialog styleClass="payment-dialog" [(visible)]="paymentPanelVisible" [modal]="true" header="Bezahlen">
  <app-payment-panel
    totalLabel="Gesamtbetrag"
    [totalAmount]="cartTotal()"
    confirmLabel="Bezahlt"
    (confirmed)="onPaymentConfirmed($event)"
    (cancelled)="onPaymentCancelled()"
  />
</p-dialog>
```

- [ ] **Step 5: Update `checkout-page.scss`** — remove the now-unused `&__price-button` rule, add the addon state classes (rendered by `app-input`'s own template, outside this component's encapsulation, hence `::ng-deep` — same convention as `kpi-tile.scss`)

```scss
:host {
  display: block;
}

.checkout-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  &__column {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__info-area {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    border-radius: 6px;
    font-weight: 700;

    &--success {
      background: #e8f8f0;
      color: #1a5c38;
    }

    &--error {
      background: #fdecea;
      color: #a61b1b;
    }

    &--warn {
      background: #fff8e1;
      color: #a1600a;
    }

    &--info {
      background: #e3f2fd;
      color: #0d47a1;
    }
  }
}

// Kamera/Nummernblock-Aktiv-Markierung + Enter-Disabled (checkout-page.ts's `inputAddons()`) —
// these classes land on `app-input`'s own internal `p-inputgroup-addon`, outside this
// component's emulated-encapsulation scope, hence `::ng-deep` (same convention as
// shared/components/kpi-tile/kpi-tile.scss).
::ng-deep .checkout-page__addon--active {
  background: var(--p-primary-100, #dbeafe);
}

::ng-deep .checkout-page__addon--disabled {
  opacity: 0.5;
  pointer-events: none;
}

// Responsive Bezahlen-Dialog-Breite (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md):
// `p-dialog`'s rendered root is outside this component's emulated-encapsulation scope, hence
// `::ng-deep` — same convention as `scan-dialog.scss`. Breakpoints match `kpi-grid.scss`.
::ng-deep .payment-dialog {
  width: 25%;
}

@media (max-width: 1023px) {
  ::ng-deep .payment-dialog {
    width: 50%;
  }
}

@media (max-width: 767px) {
  ::ng-deep .payment-dialog {
    width: 95%;
  }
}
```

- [ ] **Step 6: Run the suite, verify it passes**

Run via `dev-mcp`'s `test_angular_project`, scoped to `checkout-page.spec.ts`.
Expected: PASS, all tests green.

- [ ] **Step 7: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.ts src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts
git commit -m "feat(bazaar-app): Verkauf-Artikelnummer auf app-input mit Enter-Bestätigung umstellen"
```

---

### Task 2: Page-Header

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts`

**Interfaces:**
- Consumes: nothing new from Task 1 beyond the existing component class.
- Produces: nothing consumed by Task 3 (Task 3 only touches CSS/grid, not this header block).

- [ ] **Step 1: Add a failing header test to `checkout-page.spec.ts`**

Add this `describe` block right after the "starts with the yellow..." test near the top of the file:

```typescript
  describe('Page-Header', () => {
    it('renders a header with the title "Verkauf" and no actions', async () => {
      const { fixture } = await setup();

      const header = fixture.nativeElement.querySelector('.checkout-page__header');
      const title = fixture.nativeElement.querySelector('.checkout-page__title');

      expect(header).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('Verkauf');
    });
  });
```

- [ ] **Step 2: Run the suite, verify the new test fails**

Run via `dev-mcp`'s `test_angular_project`, scoped to `checkout-page.spec.ts`.
Expected: FAIL — `.checkout-page__header` not found.

- [ ] **Step 3: Add the header markup to `checkout-page.html`**

Insert this block as the very first element in the file, directly above the existing `<div class="checkout-page">`:

```html
<div class="checkout-page__header">
  <h1 class="checkout-page__title">Verkauf</h1>
</div>

```

(The rest of the file — the `.checkout-page` grid and the `p-dialog` — stays exactly as Task 1 left it.)

- [ ] **Step 4: Add the header CSS to `checkout-page.scss`**

Insert this block right after the `:host { display: block; }` rule, before `.checkout-page {`:

```scss
.checkout-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.checkout-page__title {
  font-size: 20px;
  font-weight: 800;
  color: #0f1f30;
}
```

- [ ] **Step 5: Run the suite, verify it passes**

Run via `dev-mcp`'s `test_angular_project`, scoped to `checkout-page.spec.ts`.
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.spec.ts
git commit -m "feat(bazaar-app): Page-Header für die Verkauf-Seite ergänzen"
```

---

### Task 3: Responsives Layout & Warenkorb-Höhenbegrenzung

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/components/cart/cart.html`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/components/cart/cart.scss`

**Interfaces:**
- Consumes: `.checkout-page__header`/`.checkout-page__column--right` class names from Tasks 1–2 (unchanged).
- Produces: nothing further consumed elsewhere — this is the last task.

This task is pure CSS/markup-structure (no new component logic), so there is no meaningful unit test — width/stacking/height-capping is verified visually per the steps below, per the design doc's own "kein sinnvoller Unit-Test" note.

- [ ] **Step 1: Update `.checkout-page`'s grid in `checkout-page.scss`**

Replace:
```scss
.checkout-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  &__column {
```
with:
```scss
.checkout-page {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 769px) {
    max-width: 75vw;
    margin: 0 auto;
    grid-template-columns: 1fr 2fr;
  }

  &__column--right {
    @media (min-width: 769px) {
      // Viewport-Höhe minus Shell-Padding (shell.scss: 26px oben+unten) minus Page-Header-Block
      // (Titel ~28px + margin-bottom 20px) — spec.md "Warenkorb-Höhenbegrenzung". Schätzwert,
      // beim Implementieren gegen den echten gerenderten Header visuell abgleichen (design doc
      // "Offene technische Annahme"); bei Abweichung hier den Pixel-Wert anpassen.
      max-height: calc(100vh - 100px);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      app-cart {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
    }
  }

  &__column {
```

(Everything else in the file — `&__field`, `&__info-area`, the addon `::ng-deep` rules from Task 1, the `payment-dialog` `::ng-deep` rules — stays unchanged.)

- [ ] **Step 2: Wrap the cart's item list in `cart.html`**

Replace:
```html
<p-card header="🛒 Warenkorb">
  @if (items().length === 0) {
    <div class="cart__empty">Warenkorb ist leer</div>
  } @else {
    @for (item of items(); track item.id) {
      <div class="cart__item" [class.cart__item--highlighted]="item.id === highlightedItemId()">
        <span>{{ item.number }} {{ item.name }}</span>
        <span>{{ item.price | currency: 'EUR' }}</span>
        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" (onClick)="onRemove(item.id)" />
      </div>
    }
    <div class="cart__total">Gesamt: {{ total() | currency: 'EUR' }}</div>
    <div class="cart__footer">
      <p-button label="Leeren" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="onClear()" />
      <p-button label="BUCHEN" icon="pi pi-credit-card" severity="primary" styleClass="cart__checkout-button" (onClick)="onCheckout()" />
    </div>
  }
</p-card>
```
with:
```html
<p-card class="cart" header="🛒 Warenkorb">
  @if (items().length === 0) {
    <div class="cart__empty">Warenkorb ist leer</div>
  } @else {
    <div class="cart__items">
      @for (item of items(); track item.id) {
        <div class="cart__item" [class.cart__item--highlighted]="item.id === highlightedItemId()">
          <span>{{ item.number }} {{ item.name }}</span>
          <span>{{ item.price | currency: 'EUR' }}</span>
          <p-button icon="pi pi-trash" [text]="true" [rounded]="true" (onClick)="onRemove(item.id)" />
        </div>
      }
    </div>
    <div class="cart__total">Gesamt: {{ total() | currency: 'EUR' }}</div>
    <div class="cart__footer">
      <p-button label="Leeren" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="onClear()" />
      <p-button label="BUCHEN" icon="pi pi-credit-card" severity="primary" styleClass="cart__checkout-button" (onClick)="onCheckout()" />
    </div>
  }
</p-card>
```

- [ ] **Step 3: Add the flex/scroll CSS to `cart.scss`**

Insert this block right after the `:host { display: block; }` rule, before `.cart {`:

```scss
// `p-card` renders its own root outside this component's emulated-encapsulation scope, so the
// height/flex rules driven by the static `class="cart"` binding on `<p-card>` need `::ng-deep`
// — same pattern as shared/components/kpi-tile/kpi-tile.scss (PrimeNG v22's `p-card` no longer
// exposes a `styleClass` input, so a plain `class` binding is used instead). This only takes
// effect when an ancestor constrains the height (checkout-page.scss's `>`768px
// `&__column--right` rule) — without that constraint these rules are no-ops and the card grows
// with its content exactly as before.
::ng-deep .cart.p-card {
  display: flex;
  flex-direction: column;
  height: 100%;

  .p-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .p-card-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
}
```

Then, inside the existing `.cart { ... }` block, add the new `&__items` rule and add `flex-shrink: 0` to the existing `&__total` and `&__footer` rules:

```scss
.cart {
  &__items {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  &__empty {
    color: var(--muted, #6b7280);
    font-size: 13px;
    text-align: center;
    padding: 20px 0;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f2f4f6;
    font-size: 13.5px;

    &--highlighted {
      background: #fdecea;
      color: #a61b1b;
    }
  }

  &__total {
    font-weight: 700;
    font-size: 18px;
    text-align: right;
    padding-top: 10px;
    flex-shrink: 0;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 12px;
    flex-shrink: 0;
  }

  &__checkout-button {
    font-size: 15px;
  }
}
```

- [ ] **Step 4: Run the existing suites to confirm no regressions**

Run via `dev-mcp`'s `test_angular_project`, scoped to `checkout-page.spec.ts` and `cart.spec.ts`.
Expected: PASS (this task changed no TS logic — a green run here just confirms the markup/CSS edits didn't break any DOM-querying test).

- [ ] **Step 5: Visual check in the browser**

Use the `run` skill (or `dev-mcp`'s dev-server tooling) to open `/checkout` and confirm, resizing the viewport across 768px:
- `>`768px: content is 75vw centered, input column 33% / cart column 67%.
- `≤`768px: both columns 100% width, stacked, input above cart, no height cap (cart grows with the page).
- `>`768px with enough cart items to overflow: cart panel stops growing at `calc(100vh - 100px)`, only the item list scrolls, "Gesamt" + "Leeren"/"BUCHEN" stay visible at the bottom. If the header's actual rendered height makes this cap visibly wrong (too much or too little space above the cart), adjust the `100px` constant in `checkout-page.scss` to match.

- [ ] **Step 6: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss src/bazaar-app/frontend/src/app/features/checkout/components/cart/cart.html src/bazaar-app/frontend/src/app/features/checkout/components/cart/cart.scss
git commit -m "feat(bazaar-app): responsives Checkout-Layout und Warenkorb-Höhenbegrenzung ab 768px"
```
