import { TestBed } from '@angular/core/testing';
import { AutocompleteCreate } from './autocomplete-create';

describe('AutocompleteCreate', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteCreate],
    }).compileComponents();
  });

  function createFixture(options: string[] = ['Jacken', 'Hosen', 'Pullover', 'Schuhe']) {
    const fixture = TestBed.createComponent(AutocompleteCreate);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('entityLabel', 'Kategorie');
    fixture.componentRef.setInput('placeholder', 'Kategorie eingeben');
    return fixture;
  }

  // AC-1
  it('filters the dropdown to options containing the typed text (case-insensitive)', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onFilter({ originalEvent: new Event('input'), query: 'ho' });

    expect(component.filteredOptions()).toEqual(['Hosen']);
  });

  it('shows all options for an empty query', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onFilter({ originalEvent: new Event('input'), query: '' });

    expect(component.filteredOptions()).toEqual(['Jacken', 'Hosen', 'Pullover', 'Schuhe']);
  });

  // AC-2
  it('switches to +-mode when the typed text matches no option exactly', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('Skateboard');
    await fixture.whenStable();

    expect(component.isCreateMode()).toBe(true);
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.autocomplete-create__create-button',
    );
    expect(button).not.toBeNull();
  });

  it('stays in ▾-mode when the typed text matches an option exactly (case-insensitive)', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('jacken');
    await fixture.whenStable();

    expect(component.isCreateMode()).toBe(false);
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.autocomplete-create__create-button',
    );
    expect(button).toBeNull();
  });

  it('stays in ▾-mode when the field is empty', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('');
    await fixture.whenStable();

    expect(component.isCreateMode()).toBe(false);
  });

  // AC-3
  it('opens the create modal with the correct title and pre-filled value on + click', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    await fixture.whenStable();

    expect(component.modalVisible()).toBe(true);
    expect(component.modalName()).toBe('Skateboard');
    expect(component.modalTitle()).toBe('Neue Kategorie anlegen');
  });

  it('opens the create modal on Enter while in +-mode', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.onEnter();
    await fixture.whenStable();

    expect(component.modalVisible()).toBe(true);
    expect(component.modalName()).toBe('Skateboard');
  });

  it('does not open the create modal on Enter while in ▾-mode', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('Jacken');
    component.onEnter();
    await fixture.whenStable();

    expect(component.modalVisible()).toBe(false);
  });

  // AC-4
  it('emits entryCreated with the typed name, closes the modal and fills the field on confirm', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const entryCreatedSpy = vi.fn();
    component.entryCreated.subscribe(entryCreatedSpy);
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    component.onModalConfirm();

    expect(entryCreatedSpy).toHaveBeenCalledWith('Skateboard');
    expect(component.modalVisible()).toBe(false);
    expect(component.typedValue()).toBe('Skateboard');
  });

  it('trims the name before emitting entryCreated', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const entryCreatedSpy = vi.fn();
    component.entryCreated.subscribe(entryCreatedSpy);
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    component.modalName.set('  Skateboard  ');
    component.onModalConfirm();

    expect(entryCreatedSpy).toHaveBeenCalledWith('Skateboard');
  });

  it('leaves the field unchanged when the modal is cancelled', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const entryCreatedSpy = vi.fn();
    component.entryCreated.subscribe(entryCreatedSpy);
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    component.onModalCancel();

    expect(entryCreatedSpy).not.toHaveBeenCalled();
    expect(component.modalVisible()).toBe(false);
    expect(component.typedValue()).toBe('Skateboard');
  });

  // AC-5
  it('disables [Anlegen] when the modal name field is empty', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    component.modalName.set('   ');
    await fixture.whenStable();

    const anlegenButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Anlegen');
    expect(anlegenButton?.disabled).toBe(true);

    component.modalName.set('Skateboard');
    await fixture.whenStable();

    const anlegenButtonEnabled = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Anlegen');
    expect(anlegenButtonEnabled?.disabled).toBe(false);
  });

  it('does not emit entryCreated when confirm is called with an empty name', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const entryCreatedSpy = vi.fn();
    component.entryCreated.subscribe(entryCreatedSpy);
    await fixture.whenStable();

    component.onInput('Skateboard');
    component.openCreateModal();
    component.modalName.set('   ');
    component.onModalConfirm();

    expect(entryCreatedSpy).not.toHaveBeenCalled();
    expect(component.modalVisible()).toBe(true);
  });

  // AC-6
  it('emits valueChange, fills the field and closes the dropdown when an existing entry is selected', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const valueChangeSpy = vi.fn();
    component.valueChange.subscribe(valueChangeSpy);
    await fixture.whenStable();

    component.onSelectOption({ originalEvent: new Event('click'), value: 'Hosen' } as never);

    expect(valueChangeSpy).toHaveBeenCalledWith('Hosen');
    expect(component.typedValue()).toBe('Hosen');
  });

  it('syncs the field from an externally set value', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('value', 'Pullover');
    await fixture.whenStable();

    expect(fixture.componentInstance.typedValue()).toBe('Pullover');
  });
});
