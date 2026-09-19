import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
// `InputGroup` depends on `BarcodeScanner`/`@zxing/browser` — importing the ONE shared mock
// (see that file's own comment for why it must be centralized, and why every spec that
// transitively loads `BarcodeScanner` must import it, not just the ones asserting on it) so
// this test never touches real device camera APIs (unavailable in jsdom).
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { SessionItemFormValue, SessionItemPopup } from './session-item-popup';

const CATEGORY_OPTIONS = ['Kleidung', 'Spielzeug'];
const BRAND_OPTIONS = ['Playmobil', 'Lego'];

const EXISTING_ITEM: SessionItemFormValue = {
  name: 'Winterjacke',
  category: 'Kleidung',
  brand: 'Playmobil',
  price: 12.5,
};

async function setup() {
  await TestBed.configureTestingModule({
    imports: [SessionItemPopup],
  }).compileComponents();

  const fixture = TestBed.createComponent(SessionItemPopup);
  fixture.componentRef.setInput('categoryOptions', CATEGORY_OPTIONS);
  fixture.componentRef.setInput('brandOptions', BRAND_OPTIONS);
  return { fixture };
}

describe('SessionItemPopup', () => {
  it('seeds all form fields from initialValue once visible() becomes true', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('initialValue', EXISTING_ITEM);
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.name()).toBe('Winterjacke');
    expect(component.category()).toBe('Kleidung');
    expect(component.brand()).toBe('Playmobil');
    expect(component.price()).toBe(12.5);

    // Proves the price-seeding effect reaches the rendered InputGroup, not just this
    // component's own `price()` signal — mirrors ArtikelDialog's equivalent test.
    const inputGroup = fixture.debugElement.query(By.directive(InputGroup))
      .componentInstance as InputGroup;
    expect(inputGroup.priceValue()).toBe(12.5);
  });

  it('seeds an empty form when opened without an initialValue', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.name()).toBe('');
    expect(component.category()).toBe('');
    expect(component.brand()).toBe('');
    expect(component.price()).toBe(0);
  });

  it('is invalid while required fields are empty and valid once they are filled', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(false);

    component.name.set('Winterjacke');
    expect(component.canSave()).toBe(false);

    component.category.set('Kleidung');
    expect(component.canSave()).toBe(false);

    component.brand.set('Playmobil');
    expect(component.canSave()).toBe(false);

    component.price.set(12.5);
    expect(component.canSave()).toBe(true);
  });

  it('is invalid while price is 0 or unset, even with all other required fields filled', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.name.set('Winterjacke');
    component.category.set('Kleidung');
    component.brand.set('Playmobil');

    expect(component.price()).toBe(0);
    expect(component.canSave()).toBe(false);

    component.price.set(0);
    expect(component.canSave()).toBe(false);

    component.price.set(12.5);
    expect(component.canSave()).toBe(true);
  });

  it('editing fields via autocomplete-create and input-group updates internal state', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const [category, brand] = fixture.debugElement
      .queryAll(By.directive(AutocompleteCreate))
      .map((debugElement) => debugElement.componentInstance as AutocompleteCreate);
    const inputGroup = fixture.debugElement.query(By.directive(InputGroup))
      .componentInstance as InputGroup;

    category.valueChange.emit('Spielzeug');
    brand.valueChange.emit('Lego');
    inputGroup.valueChange.emit(19.9);
    await fixture.whenStable();

    expect(component.category()).toBe('Spielzeug');
    expect(component.brand()).toBe('Lego');
    expect(component.price()).toBe(19.9);
  });

  it('clicking Speichern emits save with the current form value', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('initialValue', EXISTING_ITEM);
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.name.set('Sommerjacke');
    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({
      name: 'Sommerjacke',
      category: 'Kleidung',
      brand: 'Playmobil',
      price: 12.5,
    });
  });

  it('does not emit save while canSave() is false', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('clicking Abbrechen emits cancel and visibleChange(false)', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
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

  it('emits categoryCreated when the category autocomplete-create emits entryCreated', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const categoryCreatedSpy = vi.fn();
    component.categoryCreated.subscribe(categoryCreatedSpy);

    const category = fixture.debugElement.query(By.directive(AutocompleteCreate))
      .componentInstance as AutocompleteCreate;
    category.entryCreated.emit('Schuhe');

    expect(categoryCreatedSpy).toHaveBeenCalledWith('Schuhe');
  });

  it('emits brandCreated when the brand autocomplete-create emits entryCreated', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const brandCreatedSpy = vi.fn();
    component.brandCreated.subscribe(brandCreatedSpy);

    const brand = fixture.debugElement.queryAll(By.directive(AutocompleteCreate))[1]
      .componentInstance as AutocompleteCreate;
    brand.entryCreated.emit('Nike');

    expect(brandCreatedSpy).toHaveBeenCalledWith('Nike');
  });
});
