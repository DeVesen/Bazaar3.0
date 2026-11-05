import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { PrintService } from '../../../../core/print/print.service';
import { BlankLabelsStore } from '../../blank-labels-store';
import { LabelImageSummary, LabelPrintDefaults, NAME_TAKEN_ERROR_CODE, SheetFormat } from '../../data/blank-labels-api';
import { BlankLabelsPage } from './blank-labels-page';

const AVERY_12: SheetFormat = {
  id: 'LSF00001',
  name: 'Avery 12er',
  sheetWidth: 210,
  sheetHeight: 297,
  labelWidth: 105,
  labelHeight: 48,
  marginTop: 4.5,
  marginRight: 0,
  marginBottom: 4.5,
  marginLeft: 0,
  gapHorizontal: 0,
  gapVertical: 0,
  columns: 2,
  rows: 6,
  offsetX: -2.5,
  offsetY: 3,
};

const INITIAL_DEFAULTS: LabelPrintDefaults = { logo: null, sellerSymbol: null, currencySymbol: '€' };

interface StoreStub {
  formats: ReturnType<typeof signal<SheetFormat[]>>;
  images: ReturnType<typeof signal<LabelImageSummary[]>>;
  imageContents: ReturnType<typeof signal<Record<string, string>>>;
  loadImages: ReturnType<typeof vi.fn>;
  loadFormats: ReturnType<typeof vi.fn>;
  saveFormat: ReturnType<typeof vi.fn>;
  deleteFormat: ReturnType<typeof vi.fn>;
  loadDefaults: ReturnType<typeof vi.fn>;
  saveDefaults: ReturnType<typeof vi.fn>;
}

describe('BlankLabelsPage', () => {
  let store: StoreStub;
  let printLabelSheets: ReturnType<typeof vi.fn>;
  let confirm: ReturnType<typeof vi.spyOn>;
  let messageAdd: ReturnType<typeof vi.spyOn>;
  let httpMock: HttpTestingController;

  async function setup(
    options: { defaults?: Observable<LabelPrintDefaults>; formats?: SheetFormat[] } = {},
  ): Promise<{ fixture: ComponentFixture<BlankLabelsPage>; page: BlankLabelsPage }> {
    store = {
      formats: signal(options.formats ?? []),
      images: signal<LabelImageSummary[]>([]),
      imageContents: signal<Record<string, string>>({}),
      loadImages: vi.fn(),
      loadFormats: vi.fn(),
      saveFormat: vi.fn(),
      deleteFormat: vi.fn(),
      loadDefaults: vi.fn().mockReturnValue(options.defaults ?? of(INITIAL_DEFAULTS)),
      saveDefaults: vi.fn().mockReturnValue(of(undefined)),
    };
    printLabelSheets = vi.fn();
    const confirmationService = new ConfirmationService();
    confirm = vi.spyOn(confirmationService, 'confirm').mockImplementation(() => confirmationService);
    const messageService = new MessageService();
    messageAdd = vi.spyOn(messageService, 'add').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [BlankLabelsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BlankLabelsStore, useValue: store },
        { provide: PrintService, useValue: { printLabelSheets } },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(BlankLabelsPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  function lastConfirmation(): Confirmation {
    return confirm.mock.calls.at(-1)?.[0] as Confirmation;
  }

  function enterValidRun(page: BlankLabelsPage, startNumber: string, count: string, startPosition: string): void {
    page.onContentFieldChange({ field: 'startNumber', text: startNumber });
    page.onContentFieldChange({ field: 'count', text: count });
    page.onContentFieldChange({ field: 'startPosition', text: startPosition });
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('constructor_always_loadsFormatsDefaultsAndLibraryImages', async () => {
    // Arrange & Act
    await setup();

    // Assert
    expect(store.loadFormats).toHaveBeenCalledTimes(1);
    expect(store.loadDefaults).toHaveBeenCalledTimes(1);
    expect(store.loadImages).toHaveBeenCalledTimes(1);
  });

  it('constructor_libraryLoadFails_showsErrorToast', async () => {
    // Arrange
    await setup();
    const onError = store.loadImages.mock.calls[0][0] as () => void;

    // Act
    onError();

    // Assert
    expect(messageAdd).toHaveBeenCalledWith({ severity: 'error', summary: 'Bibliothek konnte nicht geladen werden' });
  });

  it('constructor_rememberedDefaults_prefillsGraphicsAndCurrencyButNoNumbers', async () => {
    // Arrange
    const defaults: LabelPrintDefaults = {
      logo: { kind: 'image', value: 'data:image/png;base64,AAAA' },
      sellerSymbol: { kind: 'icon', value: 'star' },
      currencySymbol: '$',
    };

    // Act
    const { page } = await setup({ defaults: of(defaults) });

    // Assert
    expect(page.logo()).toEqual(defaults.logo);
    expect(page.sellerSymbol()).toEqual(defaults.sellerSymbol);
    expect(page.contentTexts()).toEqual({ startNumber: '', count: '', currencySymbol: '$', startPosition: '' });
  });

  it('render_firstOpen_showsAvery16EuroAndDisabledPrintWithErrorsAtNumbers', async () => {
    // Arrange & Act
    const { fixture, page } = await setup();

    // Assert
    expect(page.perSheet()).toBe(16);
    expect(page.formatTexts().marginTop).toBe('8,5');
    expect(page.contentTexts().currencySymbol).toBe('€');
    expect(page.logo()).toBeNull();
    expect(page.contentValidation().errors).toEqual({ startNumber: 'Pflichtfeld', count: 'Pflichtfeld' });
    const printButton = (fixture.nativeElement as HTMLElement).querySelector('p-button[pageActions] button') as HTMLButtonElement;
    expect(printButton.disabled).toBe(true);
  });

  it('render_always_showsThreeAreasWithInputsAndPreviewAndPrintHint', async () => {
    // Arrange & Act
    const { fixture } = await setup();

    // Assert
    const root = fixture.nativeElement as HTMLElement;
    const areas = Array.from(root.querySelectorAll('.blank-labels__area'));
    expect(areas.map((area) => area.getAttribute('data-area'))).toEqual(['sheet-format', 'label-content', 'start-position']);
    for (const area of areas) {
      expect(area.children[0].classList.contains('blank-labels__inputs')).toBe(true);
      expect(area.children[1].classList.contains('blank-labels__preview')).toBe(true);
    }
    expect(root.querySelector('.blank-labels__print-hint')?.textContent).toContain('Skalierung 100 %, keine Seitenränder');
  });

  it('onFormatFieldChange_oneColumn_updatesPreviewGridImmediately', async () => {
    // Arrange
    const { fixture, page } = await setup();

    // Act
    page.onFormatFieldChange({ field: 'columns', text: '1' });

    // Assert
    await fixture.whenStable();
    const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="sheet-format"] .blank-labels__preview');
    expect(preview?.querySelectorAll('.label-sheet__slot')).toHaveLength(8);
  });

  it('onFormatFieldChange_threeColumns_errorAtColumnsAndSaveAndPrintBlocked', async () => {
    // Arrange
    const { page } = await setup();
    page.formatName.set('Avery 12er');
    enterValidRun(page, '1000', '4', '');

    // Act
    page.onFormatFieldChange({ field: 'columns', text: '3' });

    // Assert
    expect(page.formatValidation().errors.columns).toBe('Etiketten passen nicht in die Bogenbreite');
    expect(page.canSave()).toBe(false);
    expect(page.canPrint()).toBe(false);
  });

  it('onFormatSelected_savedFormat_fillsAllFieldsAndPreview', async () => {
    // Arrange
    const { page } = await setup({ formats: [AVERY_12] });

    // Act
    page.onFormatSelected('LSF00001');

    // Assert
    expect(page.formatTexts().labelHeight).toBe('48');
    expect(page.formatTexts().marginTop).toBe('4,5');
    expect(page.formatName()).toBe('Avery 12er');
    expect(page.perSheet()).toBe(12);
  });

  it('onFormatSelected_savedFormatWithOffset_fillsOffsetTexts', async () => {
    // Arrange
    const { page } = await setup({ formats: [AVERY_12] });

    // Act
    page.onFormatSelected('LSF00001');

    // Assert
    expect(page.formatTexts().offsetX).toBe('-2,5');
    expect(page.formatTexts().offsetY).toBe('3');
    expect(page.geometry()).toEqual(expect.objectContaining({ offsetX: -2.5, offsetY: 3 }));
  });

  it('onSaveFormat_offsetEntered_sendsOffsetInRequest', async () => {
    // Arrange
    const { page } = await setup();
    store.saveFormat.mockReturnValue(of(AVERY_12));
    page.formatName.set('Mein Drucker');
    page.onFormatFieldChange({ field: 'offsetX', text: '2' });
    page.onFormatFieldChange({ field: 'offsetY', text: '-1,5' });

    // Act
    page.onSaveFormat();

    // Assert
    expect(store.saveFormat).toHaveBeenCalledWith(expect.objectContaining({ offsetX: 2, offsetY: -1.5 }));
  });

  it('onFormatFieldChange_offsetOutOfRange_errorAtOffsetAndSaveAndPrintBlocked', async () => {
    // Arrange
    const { page } = await setup();
    page.formatName.set('Mein Drucker');
    enterValidRun(page, '1000', '4', '');

    // Act
    page.onFormatFieldChange({ field: 'offsetX', text: '21' });

    // Assert
    expect(page.formatValidation().errors.offsetX).toBe('Zwischen −20 und 20 mm');
    expect(page.canSave()).toBe(false);
    expect(page.canPrint()).toBe(false);
  });

  it('canSave_emptyName_isFalse', async () => {
    // Arrange
    const { page } = await setup();

    // Act
    page.formatName.set('   ');

    // Assert
    expect(page.canSave()).toBe(false);
  });

  it('onSaveFormat_paddedName_savesTrimmedNameWithoutOverwrite', async () => {
    // Arrange
    const { page } = await setup();
    store.saveFormat.mockReturnValue(of({ ...AVERY_12, labelHeight: 35, rows: 8, marginTop: 8.5, marginBottom: 8.5 }));
    page.formatName.set(' Avery 12er ');

    // Act
    page.onSaveFormat();

    // Assert
    expect(store.saveFormat).toHaveBeenCalledWith(expect.objectContaining({ name: 'Avery 12er', overwrite: false, columns: 2, rows: 8 }));
    expect(page.selectedFormatId()).toBe('LSF00001');
    expect(page.formatName()).toBe('Avery 12er');
  });

  it('onSaveFormat_nameTaken_asksOverwriteAndOverwritesOnAccept', async () => {
    // Arrange
    const { page } = await setup();
    const conflict = new HttpErrorResponse({ status: 409, error: { errorCode: NAME_TAKEN_ERROR_CODE } });
    store.saveFormat.mockReturnValueOnce(throwError(() => conflict)).mockReturnValueOnce(of(AVERY_12));
    page.formatName.set('Avery 12er');
    page.onSaveFormat();

    // Act
    lastConfirmation().accept?.();

    // Assert
    expect(lastConfirmation().message).toBe('Überschreiben?');
    expect(store.saveFormat).toHaveBeenCalledTimes(2);
    expect(store.saveFormat).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Avery 12er', overwrite: true }));
  });

  it('onSaveFormat_nameTakenAndNotConfirmed_doesNotSaveAgain', async () => {
    // Arrange
    const { page } = await setup();
    const conflict = new HttpErrorResponse({ status: 409, error: { errorCode: NAME_TAKEN_ERROR_CODE } });
    store.saveFormat.mockReturnValue(throwError(() => conflict));
    page.formatName.set('Avery 12er');

    // Act
    page.onSaveFormat();

    // Assert
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(store.saveFormat).toHaveBeenCalledTimes(1);
  });

  it('onDeleteFormat_confirmed_deletesSelectedFormat', async () => {
    // Arrange
    const { page } = await setup({ formats: [AVERY_12] });
    store.deleteFormat.mockReturnValue(of(undefined));
    page.onFormatSelected('LSF00001');
    page.onDeleteFormat();

    // Act
    lastConfirmation().accept?.();

    // Assert
    expect(store.deleteFormat).toHaveBeenCalledWith('LSF00001');
    expect(page.selectedFormatId()).toBeNull();
  });

  it('onDeleteFormat_notConfirmed_keepsFormat', async () => {
    // Arrange
    const { page } = await setup({ formats: [AVERY_12] });
    page.onFormatSelected('LSF00001');

    // Act
    page.onDeleteFormat();

    // Assert
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(store.deleteFormat).not.toHaveBeenCalled();
  });

  it('previewNumber_startNumber1000_isShownOnPreviewLabel', async () => {
    // Arrange
    const { fixture, page } = await setup();

    // Act
    page.onContentFieldChange({ field: 'startNumber', text: '1000' });

    // Assert
    await fixture.whenStable();
    const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="label-content"] .blank-labels__preview');
    expect(preview?.querySelector('.label-card__number')?.textContent?.trim()).toBe('1000');
    expect(preview?.querySelector('.label-card__fold')).not.toBeNull();
  });

  it('startPositionSlots_position7_greysSixSlotsInPreview', async () => {
    // Arrange
    const { fixture, page } = await setup();

    // Act
    page.onContentFieldChange({ field: 'startPosition', text: '7' });

    // Assert
    await fixture.whenStable();
    const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="start-position"] .blank-labels__preview');
    expect(preview?.querySelectorAll('.label-sheet__slot--skipped')).toHaveLength(6);
  });

  it('onPrint_validInput_printsAllSheetsAndRemembersGraphicsAndCurrency', async () => {
    // Arrange
    const { page } = await setup();
    enterValidRun(page, '1000', '12', '7');
    page.logo.set({ kind: 'icon', value: 'star' });

    // Act
    page.onPrint();

    // Assert
    const model = printLabelSheets.mock.calls[0][0];
    expect(model.sheets).toHaveLength(2);
    expect(model.sheets[0][6]).toEqual({ kind: 'label', number: 1000 });
    expect(model.sheets[1][1]).toEqual({ kind: 'label', number: 1011 });
    expect(model.content).toEqual({ logo: { kind: 'icon', value: 'star' }, sellerSymbol: null, currencySymbol: '€' });
    expect(store.saveDefaults).toHaveBeenCalledWith({ logo: { kind: 'icon', value: 'star' }, sellerSymbol: null, currencySymbol: '€' });
  });

  it('onPrint_withoutLogoAndSymbol_printsLabelsWithoutGraphics', async () => {
    // Arrange
    const { page } = await setup();
    enterValidRun(page, '1000', '4', '');

    // Act
    page.onPrint();

    // Assert
    expect(printLabelSheets.mock.calls[0][0].content).toEqual({ logo: null, sellerSymbol: null, currencySymbol: '€' });
  });

  // AC-30: Die Seite kennt keine Artikel. Ob ein Artikel 1000 existiert, kann den Druck nicht beeinflussen,
  // weil weder ein Artikel-Request noch ein anderer Store-Aufruf als das Merken der Druckwerte erfolgt.
  it('onPrint_number1000_printsWithoutArticleRequestOrError', async () => {
    // Arrange
    const { page } = await setup();
    enterValidRun(page, '1000', '1', '');

    // Act
    page.onPrint();

    // Assert
    expect(printLabelSheets).toHaveBeenCalledTimes(1);
    expect(printLabelSheets.mock.calls[0][0].sheets[0][0]).toEqual({ kind: 'label', number: 1000 });
    httpMock.expectNone((req) => req.url.includes('/api/articles'));
    expect(messageAdd).not.toHaveBeenCalled();
    expect(store.saveDefaults).toHaveBeenCalledTimes(1);
    expect(store.saveFormat).not.toHaveBeenCalled();
    expect(store.deleteFormat).not.toHaveBeenCalled();
  });

  it('onPrint_defaultsLoadFailed_printsButDoesNotOverwriteRememberedDefaults', async () => {
    // Arrange
    const { page } = await setup({ defaults: throwError(() => new Error('offline')) });
    enterValidRun(page, '1000', '4', '');

    // Act
    page.onPrint();

    // Assert
    expect(printLabelSheets).toHaveBeenCalledTimes(1);
    expect(store.saveDefaults).not.toHaveBeenCalled();
  });

  it('onPrint_invalidInput_doesNotPrint', async () => {
    // Arrange
    const { page } = await setup();
    enterValidRun(page, '0', '4', '');

    // Act
    page.onPrint();

    // Assert
    expect(printLabelSheets).not.toHaveBeenCalled();
    expect(store.saveDefaults).not.toHaveBeenCalled();
  });
});
