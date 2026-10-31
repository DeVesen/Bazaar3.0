import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Subject, of, throwError } from 'rxjs';
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
    texts.articleAushang.text1 = 'Aushang Kopf';
    texts.articleAushang.text4 = 'Aushang Fuß';
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

  it('template_adminOpensSettings_showsFiveFiveAndFourTextareas', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    expect(el.querySelectorAll('fieldset').length).toBe(3);
    expect(el.querySelectorAll('fieldset:nth-of-type(1) textarea').length).toBe(5);
    expect(el.querySelectorAll('fieldset:nth-of-type(2) textarea').length).toBe(5);
    expect(el.querySelectorAll('fieldset:nth-of-type(3) textarea').length).toBe(4);
    expect(el.querySelectorAll('textarea').length).toBe(14);
  });

  it('template_articleAushang_hasNoFifthTextarea', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    expect(el.querySelector('#articleAushang-text4')).not.toBeNull();
    expect(el.querySelector('#articleAushang-text5')).toBeNull();
  });

  it('template_articleAushang_hintExplainsFixedDateAndPageNumberAndTruncation', async () => {
    // Arrange & Act
    const { el } = await createForm();
    const hint = el.querySelector('fieldset:nth-of-type(3) .print-texts-form__hint');

    // Assert
    expect(hint?.textContent).toContain('Datum');
    expect(hint?.textContent).toContain('Seite');
    expect(hint?.textContent).toContain('abgeschnitten');
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

  it('constructor_always_loadsStoredArticleAushangTextsIntoTheFields', async () => {
    // Arrange & Act
    const { component, el } = await createForm();

    // Assert
    expect(component.valueOf('articleAushang', 'text1')).toBe('Aushang Kopf');
    expect(el.querySelector<HTMLTextAreaElement>('#articleAushang-text1')?.value).toBe('Aushang Kopf');
    expect(el.querySelector<HTMLTextAreaElement>('#articleAushang-text4')?.value).toBe('Aushang Fuß');
  });

  it('onChange_aushangFieldEdited_changesOnlyThatFieldAndKeepsTheOtherSets', async () => {
    // Arrange
    const { component } = await createForm();

    // Act
    component.onChange('articleAushang', 'text2', 'Mitte neu');

    // Assert
    expect(component.valueOf('articleAushang', 'text2')).toBe('Mitte neu');
    expect(component.valueOf('articleAushang', 'text1')).toBe('Aushang Kopf');
    expect(component.valueOf('abgabeBeleg', 'text2')).toBe('');
    expect(component.valueOf('verkaeuferUebersicht', 'text5')).toBe('Fuß Mitte');
  });

  it('onSave_aushangTextEdited_sendsItInArticleAushang', async () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = await createForm();
    component.onChange('articleAushang', 'text3', '**Fuß**');

    // Act
    component.onSave();

    // Assert
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        articleAushang: { text1: 'Aushang Kopf', text2: '', text3: '**Fuß**', text4: 'Aushang Fuß' },
      }),
    );
  });

  it('hasUnsavedChanges_aushangTextEditedButNotSaved_isTrue', async () => {
    // Arrange
    const { component } = await createForm();

    // Act
    component.onChange('articleAushang', 'text4', 'Neu');

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('onSave_aushangTextSaved_leavesNoUnsavedChanges', async () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = await createForm();
    component.onChange('articleAushang', 'text4', 'Neu');

    // Act
    component.onSave();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('discardChanges_aushangTextEdited_showsLastSavedTextAgain', async () => {
    // Arrange
    const { fixture, component, el } = await createForm();
    component.onChange('articleAushang', 'text1', 'Verworfen');

    // Act
    component.discardChanges();

    // Assert
    await fixture.whenStable();
    expect(component.valueOf('articleAushang', 'text1')).toBe('Aushang Kopf');
    expect(el.querySelector<HTMLTextAreaElement>('#articleAushang-text1')?.value).toBe('Aushang Kopf');
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

  it('onSave_validTexts_sendsAllFourteenTextsAndShowsSuccessToast', async () => {
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
        articleAushang: { text1: 'Aushang Kopf', text2: '', text3: '', text4: 'Aushang Fuß' },
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

  it('template_adminOpensPrintTab_showsAbgabeBelegAboveVerkaeuferUebersicht', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    const legends = Array.from(el.querySelectorAll('fieldset > legend')).map((legend) => legend.textContent?.trim());
    expect(legends).toEqual(['Abgabe-Beleg', 'Verkäufer-Übersicht', 'Artikel-Aushang']);
  });

  it('template_eachTemplate_placesFreitext3FullWidthBetweenTwoHalfWidthPairs', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    const layouts = Array.from(el.querySelectorAll('fieldset')).map((fieldset) =>
      Array.from(fieldset.querySelectorAll('.print-texts-form__grid > .print-texts-form__field')).map((field) =>
        field.classList.contains('print-texts-form__field--full') ? 'full' : 'half',
      ),
    );
    // Der Aushang hat keinen Text über der Liste: zwei Paare, Kopf und Fuß.
    expect(layouts).toEqual([
      ['half', 'half', 'full', 'half', 'half'],
      ['half', 'half', 'full', 'half', 'half'],
      ['half', 'half', 'half', 'half'],
    ]);
  });

  it('template_eachTemplate_keepsTheFieldLabelsInReceiptOrder', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    const labelsPerSection = Array.from(el.querySelectorAll('fieldset')).map((fieldset) =>
      Array.from(fieldset.querySelectorAll('.print-texts-form__grid label')).map((label) => label.textContent?.trim()),
    );
    const expectedLabels = [
      'Freitext 1 (Kopfzeile links)',
      'Freitext 2 (Kopfzeile Mitte)',
      'Freitext 3 (über der Artikelliste)',
      'Freitext 4 (Fußzeile links)',
      'Freitext 5 (Fußzeile Mitte)',
    ];
    const aushangLabels = [
      'Freitext 1 (Kopfzeile links)',
      'Freitext 2 (Kopfzeile Mitte)',
      'Freitext 3 (Fußzeile links)',
      'Freitext 4 (Fußzeile Mitte)',
    ];
    expect(labelsPerSection).toEqual([expectedLabels, expectedLabels, aushangLabels]);
  });

  it('template_textsLoaded_showsExactlyOneSaveButtonForBothTemplates', async () => {
    // Arrange & Act
    const { el } = await createForm();

    // Assert
    const saveButtons = Array.from(el.querySelectorAll('button')).filter(
      (button) => button.textContent?.trim() === 'Freitexte speichern',
    );
    expect(saveButtons.length).toBe(1);
  });

  it('hasUnsavedChanges_textEditedButNotSaved_isTrue', async () => {
    // Arrange
    const { component } = await createForm();

    // Act
    component.onChange('verkaeuferUebersicht', 'text2', 'Neu');

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('hasUnsavedChanges_freshlyLoaded_isFalse', async () => {
    // Arrange & Act
    const { component } = await createForm();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('onSave_editedTextsSaved_leavesNoUnsavedChanges', async () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = await createForm();
    component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

    // Act
    component.onSave();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('discardChanges_editedTexts_showsLastSavedTextsAgain', async () => {
    // Arrange
    const { fixture, component, el } = await createForm();
    component.onChange('abgabeBeleg', 'text1', 'Verworfen');

    // Act
    component.discardChanges();

    // Assert
    await fixture.whenStable();
    expect(component.valueOf('abgabeBeleg', 'text1')).toBe('Kopf links');
    expect(component.hasUnsavedChanges()).toBe(false);
    expect(el.querySelector<HTMLTextAreaElement>('#abgabeBeleg-text1')?.value).toBe('Kopf links');
  });

  it('discardChanges_saveInFlight_keepsInputAndStaysConsistentAfterResponse', async () => {
    // Arrange
    const response = new Subject<void>();
    update.mockReturnValue(response);
    const { component } = await createForm();
    component.onChange('abgabeBeleg', 'text3', '**Hinweis**');
    component.onSave();
    component.discardChanges();

    // Act
    response.next();

    // Assert
    expect(component.valueOf('abgabeBeleg', 'text3')).toBe('**Hinweis**');
    expect(component.hasUnsavedChanges()).toBe(false);
  });
});
