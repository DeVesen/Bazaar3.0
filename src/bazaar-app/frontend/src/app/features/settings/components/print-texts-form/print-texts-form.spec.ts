import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { PrintTextsForm } from './print-texts-form';
import { PrintTexts, PrintTextsApi, emptyPrintTexts } from '../../data/print-texts-api';

describe('PrintTextsForm', () => {
  let get: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  function storedTexts(): PrintTexts {
    const texts = emptyPrintTexts();
    texts.abgabeBeleg.text1 = 'Kopf links';
    texts.verkaeuferUebersicht.text5 = 'Fuß Mitte';
    return texts;
  }

  beforeEach(async () => {
    get = vi.fn().mockReturnValue(of(storedTexts()));
    update = vi.fn();
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [PrintTextsForm],
      providers: [
        { provide: PrintTextsApi, useValue: { get, update } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
      ],
    }).compileComponents();
  });

  async function createForm() {
    const fixture = TestBed.createComponent(PrintTextsForm);
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('template_adminOpensSettings_showsFiveTextareasPerTemplate', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    expect(el.querySelectorAll('fieldset').length).toBe(2);
    expect(el.querySelectorAll('fieldset:nth-of-type(1) textarea').length).toBe(5);
    expect(el.querySelectorAll('fieldset:nth-of-type(2) textarea').length).toBe(5);
    expect(el.querySelectorAll('textarea').length).toBe(10);
  });

  it('template_eachTemplate_showsLimitedSpaceHintBelowTheFields', async () => {
    // Arrange & Act
    const { el } = await createForm();
    const fieldsets = Array.from(el.querySelectorAll('fieldset'));

    // Assert
    fieldsets.forEach((fieldset) => {
      const hint = fieldset.querySelector('.print-texts-form__hint');
      expect(hint?.textContent).toContain('abgeschnitten');
      expect(fieldset.lastElementChild).toBe(hint);
    });
  });

  it('constructor_always_loadsStoredTextsIntoTheFields', async () => {
    // Arrange & Act
    const { component, el } = await createForm();
    const first = el.querySelector<HTMLTextAreaElement>('#abgabeBeleg-text1');

    // Assert
    expect(get).toHaveBeenCalled();
    expect(component.valueOf('abgabeBeleg', 'text1')).toBe('Kopf links');
    expect(first?.value).toBe('Kopf links');
  });

  it('onChange_editedField_changesOnlyThatField', async () => {
    // Arrange
    const { component } = await createForm();

    // Act
    component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

    // Assert
    expect(component.valueOf('abgabeBeleg', 'text3')).toBe('**Hinweis**');
    expect(component.valueOf('verkaeuferUebersicht', 'text3')).toBe('');
  });

  it('onSave_validTexts_sendsAllTenTextsAndShowsSuccessToast', async () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = await createForm();
    component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

    // Act
    component.onSave();

    // Assert
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        abgabeBeleg: expect.objectContaining({ text1: 'Kopf links', text3: '**Hinweis**' }),
        verkaeuferUebersicht: expect.objectContaining({ text5: 'Fuß Mitte' }),
      }),
    );
    expect(component.saving()).toBe(false);
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: '✓ Freitexte gespeichert' }),
    );
  });

  it('onSave_serverError_showsErrorToast', async () => {
    // Arrange
    update.mockReturnValue(throwError(() => new Error('boom')));
    const { component } = await createForm();

    // Act
    component.onSave();

    // Assert
    expect(component.saving()).toBe(false);
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Freitexte konnten nicht gespeichert werden' }),
    );
  });

  it('onSave_loadFailed_doesNotSendUpdate', async () => {
    // Arrange
    get.mockReturnValue(throwError(() => new Error('boom')));
    const { fixture, component, el } = await createForm();
    fixture.detectChanges();
    const button = el.querySelector<HTMLButtonElement>('p-button button');

    // Act
    component.onSave();

    // Assert
    expect(button?.disabled).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });

  it('template_textsLoaded_saveButtonIsEnabled', async () => {
    // Arrange & Act
    const { fixture, el } = await createForm();
    fixture.detectChanges();
    const button = el.querySelector<HTMLButtonElement>('p-button button');

    // Assert
    expect(button?.disabled).toBe(false);
  });

  it('constructor_loadFails_showsErrorToast', async () => {
    // Arrange
    get.mockReturnValue(throwError(() => new Error('boom')));

    // Act
    await createForm();

    // Assert
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Freitexte konnten nicht geladen werden' }),
    );
  });
});
