import { TestBed } from '@angular/core/testing';
import { CartItem } from '../../pages/checkout-page/checkout-page';
import { Cart } from './cart';

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return { id: 'ART00001', number: 1043, name: 'Winterjacke', price: 12, ...overrides };
}

async function setup(items: CartItem[] = []) {
  await TestBed.configureTestingModule({
    imports: [Cart],
  }).compileComponents();

  const fixture = TestBed.createComponent(Cart);
  fixture.componentRef.setInput('items', items);
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('Cart', () => {
  it('renders the empty state text with no footer (AC-4)', async () => {
    const { fixture } = await setup([]);

    expect(fixture.nativeElement.textContent).toContain('Warenkorb ist leer');
    expect(fixture.nativeElement.querySelector('.cart__footer')).toBeNull();
  });

  it('renders items, the total and the footer when non-empty', async () => {
    const items = [cartItem({ id: 'ART00001', number: 1043, name: 'Winterjacke', price: 12 }), cartItem({ id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 })];
    const { fixture, component } = await setup(items);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('1043 Winterjacke');
    expect(text).toContain('1044 Gummistiefel');
    expect(component.total()).toBe(20);
    expect(fixture.nativeElement.querySelector('.cart__footer')).not.toBeNull();
  });

  it('emits removeItem with the correct id when a row remove-button is clicked', async () => {
    const items = [cartItem({ id: 'ART00001' }), cartItem({ id: 'ART00002', number: 1044, name: 'Gummistiefel', price: 8 })];
    const { fixture, component } = await setup(items);
    const removeSpy = vi.fn();
    component.removeItem.subscribe(removeSpy);

    const removeButtons = Array.from(fixture.nativeElement.querySelectorAll('.cart__item button')) as HTMLButtonElement[];
    removeButtons[1].click();

    expect(removeSpy).toHaveBeenCalledWith('ART00002');
  });

  it('emits clear when "Leeren" is clicked', async () => {
    const { fixture, component } = await setup([cartItem()]);
    const clearSpy = vi.fn();
    component.clear.subscribe(clearSpy);

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.cart__footer button')) as HTMLButtonElement[];
    const leerenButton = buttons.find((button) => button.textContent?.includes('Leeren'));
    leerenButton?.click();

    expect(clearSpy).toHaveBeenCalled();
  });

  it('emits checkout when "BUCHEN" is clicked', async () => {
    const { fixture, component } = await setup([cartItem()]);
    const checkoutSpy = vi.fn();
    component.checkout.subscribe(checkoutSpy);

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.cart__footer button')) as HTMLButtonElement[];
    const buchenButton = buttons.find((button) => button.textContent?.includes('BUCHEN'));
    buchenButton?.click();

    expect(checkoutSpy).toHaveBeenCalled();
  });
});
