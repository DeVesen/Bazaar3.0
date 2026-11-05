import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { PrintService } from '../../../../core/print/print.service';
import { BlankLabelsStore } from '../../blank-labels-store';
import { LabelPrintDefaults } from '../../data/blank-labels-api';
import { BlankLabelsPage } from './blank-labels-page';

const INITIAL_DEFAULTS: LabelPrintDefaults = {
  logo: null,
  sellerSymbol: null,
  currencySymbol: '€',
  qrCodeSize: 21.5,
  sellerSymbolSize: 5,
  numberHeight: 10.5,
  currencyHeight: 12,
};

/** Merken der Werte des letzten Drucks der Seite „Etiketten-Vordruck", Store ersetzt. */
describe('BlankLabelsPage remember defaults', () => {
  let saveDefaults: ReturnType<typeof vi.fn>;
  let printLabelSheets: ReturnType<typeof vi.fn>;
  let messageAdd: ReturnType<typeof vi.spyOn>;

  async function setup() {
    saveDefaults = vi.fn().mockReturnValue(of(undefined));
    printLabelSheets = vi.fn();
    const store = {
      formats: signal([]),
      images: signal([]),
      imageContents: signal({}),
      loadFormats: vi.fn(),
      loadImages: vi.fn(),
      loadDefaults: vi.fn().mockReturnValue(of(INITIAL_DEFAULTS)),
      saveDefaults,
    };
    const messageService = new MessageService();
    messageAdd = vi.spyOn(messageService, 'add').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [BlankLabelsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BlankLabelsStore, useValue: store },
        { provide: PrintService, useValue: { printLabelSheets } },
        { provide: ConfirmationService, useValue: new ConfirmationService() },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(BlankLabelsPage);
    await fixture.whenStable();
    return { page: fixture.componentInstance };
  }

  it('onPrint_rememberDefaultsFails_printsAndWarnsNamingSizes', async () => {
    // Arrange
    const { page } = await setup();
    saveDefaults.mockReturnValue(throwError(() => new Error('offline')));
    page.onContentFieldChange({ field: 'startNumber', text: '1000' });
    page.onContentFieldChange({ field: 'count', text: '4' });

    // Act
    page.onPrint();

    // Assert
    expect(printLabelSheets).toHaveBeenCalledTimes(1);
    expect(messageAdd).toHaveBeenCalledWith({ severity: 'warn', summary: 'Logo, Symbol, Währung und Größen konnten nicht gemerkt werden' });
  });
});
