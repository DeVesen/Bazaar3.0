import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmationService, MessageService, ToastMessageOptions } from 'primeng/api';
import { PrintService } from '../../../../core/print/print.service';
import { LabelSheetsPrintModel } from '../../../../shared/components/label-sheet/label-sheets-document';
import { DEFAULT_LABEL_ELEMENT_SIZES } from '../../../../shared/components/label-sheet/label-layout';
import { LABEL_IMAGES_URL, LabelPrintDefaults, PRINT_DEFAULTS_URL, SHEET_FORMATS_URL } from '../../data/blank-labels-api';
import { BlankLabelsPage } from './blank-labels-page';

const INITIAL_DEFAULTS: LabelPrintDefaults = { logo: null, sellerSymbol: null, currencySymbol: '€', sizes: DEFAULT_LABEL_ELEMENT_SIZES };

/** Fake statt Spy: merkt sich jeden Druckauftrag, öffnet keinen Druckdialog. */
class FakePrintService {
  readonly printed: LabelSheetsPrintModel[] = [];

  printLabelSheets(model: LabelSheetsPrintModel): void {
    this.printed.push(model);
  }
}

/** Merken der Werte des letzten Drucks der Seite „Etiketten-Vordruck": echter Store, HTTP über HttpTestingController. */
describe('BlankLabelsPage remember defaults', () => {
  let httpMock: HttpTestingController;
  let printService: FakePrintService;
  let messages: ToastMessageOptions[];

  async function setup(defaults: LabelPrintDefaults = INITIAL_DEFAULTS): Promise<{ fixture: ComponentFixture<BlankLabelsPage>; page: BlankLabelsPage }> {
    printService = new FakePrintService();
    const messageService = new MessageService();
    messages = [];
    messageService.messageObserver.subscribe((message) => messages.push(...[message].flat()));

    await TestBed.configureTestingModule({
      imports: [BlankLabelsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PrintService, useValue: printService },
        { provide: ConfirmationService, useValue: new ConfirmationService() },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(BlankLabelsPage);
    httpMock.expectOne(SHEET_FORMATS_URL).flush([]);
    httpMock.expectOne(LABEL_IMAGES_URL).flush([]);
    httpMock.expectOne(PRINT_DEFAULTS_URL).flush(defaults);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('render_rememberedDefaults_showsSizesInFormFields', async () => {
    // Arrange
    const defaults: LabelPrintDefaults = { ...INITIAL_DEFAULTS, sizes: { ...DEFAULT_LABEL_ELEMENT_SIZES, qrCode: 18, sellerSymbol: 6.5 } };

    // Act
    const { fixture } = await setup(defaults);

    // Assert
    const root = fixture.nativeElement as HTMLElement;
    expect((root.querySelector('input[data-field="qrCodeSize"]') as HTMLInputElement).value).toBe('18');
    expect((root.querySelector('input[data-field="sellerSymbolSize"]') as HTMLInputElement).value).toBe('6,5');
  });

  it('onPrint_changedSizes_printsWithSizesAndPutsThemAsSizesObject', async () => {
    // Arrange
    const { page } = await setup();
    page.onContentFieldChange({ field: 'startNumber', text: '1000' });
    page.onContentFieldChange({ field: 'count', text: '4' });
    page.onContentFieldChange({ field: 'qrCodeSize', text: '18' });
    page.onContentFieldChange({ field: 'sellerSymbolSize', text: '6.5' });
    page.onContentFieldChange({ field: 'numberHeight', text: '8,5' });
    page.onContentFieldChange({ field: 'currencyHeight', text: '9' });
    const expectedSizes = { qrCode: 18, sellerSymbol: 6.5, numberHeight: 8.5, currencyHeight: 9 };

    // Act
    page.onPrint();

    // Assert
    expect(printService.printed.map((model) => model.content.sizes)).toEqual([expectedSizes]);
    const put = httpMock.expectOne({ method: 'PUT', url: PRINT_DEFAULTS_URL });
    expect(put.request.body).toEqual({ logo: null, sellerSymbol: null, currencySymbol: '€', sizes: expectedSizes });
    put.flush(null);
  });

  it('onPrint_rememberDefaultsFails_printsAndWarnsNamingSizes', async () => {
    // Arrange
    const { page } = await setup();
    page.onContentFieldChange({ field: 'startNumber', text: '1000' });
    page.onContentFieldChange({ field: 'count', text: '4' });

    // Act
    page.onPrint();
    httpMock.expectOne({ method: 'PUT', url: PRINT_DEFAULTS_URL }).flush(null, { status: 500, statusText: 'Server Error' });

    // Assert
    expect(printService.printed).toHaveLength(1);
    expect(messages).toEqual([{ severity: 'warn', summary: 'Logo, Symbol, Währung und Größen konnten nicht gemerkt werden' }]);
  });
});
