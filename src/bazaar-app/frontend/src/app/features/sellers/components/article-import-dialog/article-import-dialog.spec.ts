import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, TimeoutError } from 'rxjs';
import {
  ArticleImportDialog,
  MAX_FILE_BYTES,
  SUCCESS_CLOSE_DELAY_MS,
} from './article-import-dialog';
import { ArticleImportApi, ArticleImportResult } from '../../data/article-import-api';

function createFile(name: string, size = 100): File {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('ArticleImportDialog', () => {
  let importArticles: ReturnType<typeof vi.fn>;
  let response: Subject<ArticleImportResult>;

  beforeEach(async () => {
    response = new Subject<ArticleImportResult>();
    importArticles = vi.fn().mockReturnValue(response);
    await TestBed.configureTestingModule({
      imports: [ArticleImportDialog],
      providers: [{ provide: ArticleImportApi, useValue: { importArticles } }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function createDialog() {
    const fixture = TestBed.createComponent(ArticleImportDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('sellerId', 's1');
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const imported = vi.fn();
    const visibleChange = vi.fn();
    component.imported.subscribe(imported);
    component.visibleChange.subscribe(visibleChange);
    return { fixture, component, imported, visibleChange };
  }

  describe('onFilesChosen', () => {
    it.each(['artikel.xlsx', 'artikel.xls', 'artikel.csv', 'ARTIKEL.CSV'])(
      'onFilesChosen_AllowedFile_%s_TakesFileAndEnablesImport',
      async (name) => {
        // Arrange
        const { component } = await createDialog();
        const file = createFile(name);

        // Act
        component.onFilesChosen([file]);

        // Assert
        expect(component.file()).toBe(file);
        expect(component.canImport()).toBe(true);
      },
    );

    it('onFilesChosen_PdfFile_ShowsFormatHintAndKeepsImportDisabled', async () => {
      // Arrange
      const { component } = await createDialog();

      // Act
      component.onFilesChosen([createFile('artikel.pdf')]);

      // Assert
      expect(component.message()).toBe('Erlaubt sind nur Dateien im Format XLSX, XLS oder CSV.');
      expect(component.canImport()).toBe(false);
    });

    it('onFilesChosen_PdfFile_UploadsNothing', async () => {
      // Arrange
      const { component } = await createDialog();

      // Act
      component.onFilesChosen([createFile('artikel.pdf')]);

      // Assert
      expect(importArticles).not.toHaveBeenCalled();
    });

    it('onFilesChosen_TwoFiles_ShowsHintAndTakesNeither', async () => {
      // Arrange
      const { component } = await createDialog();

      // Act
      component.onFilesChosen([createFile('a.csv'), createFile('b.csv')]);

      // Assert
      expect(component.message()).toBe('Bitte genau eine Datei wählen');
      expect(component.file()).toBeNull();
    });

    it('onFilesChosen_OtherValidFile_ReplacesPreviousFile', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('alt.csv')]);
      const replacement = createFile('neu.xlsx');

      // Act
      component.onFilesChosen([replacement]);

      // Assert
      expect(component.file()?.name).toBe('neu.xlsx');
    });

    it('onFilesChosen_ValidFileAfterHint_ClearsHint', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.pdf')]);

      // Act
      component.onFilesChosen([createFile('artikel.csv')]);

      // Assert
      expect(component.message()).toBeNull();
    });

    it('onFilesChosen_WhileImporting_IgnoresSelection', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('alt.csv')]);
      component.startImport();

      // Act
      component.onFilesChosen([createFile('neu.csv')]);

      // Assert
      expect(component.file()?.name).toBe('alt.csv');
    });
  });

  describe('startImport', () => {
    it('startImport_FileOverTwoMegabytes_ShowsSizeMessageAndSendsNothing', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('gross.csv', MAX_FILE_BYTES + 1)]);

      // Act
      component.startImport();

      // Assert
      expect(component.message()).toBe('Die Datei ist größer als 2 MB.');
      expect(importArticles).not.toHaveBeenCalled();
    });

    it('startImport_ValidFile_SendsExactlyOneRequestWithSellerFileAndBrowserLocale', async () => {
      // Arrange
      const { component } = await createDialog();
      const file = createFile('artikel.csv');
      component.onFilesChosen([file]);

      // Act
      component.startImport();
      component.startImport();

      // Assert
      expect(importArticles).toHaveBeenCalledTimes(1);
      expect(importArticles).toHaveBeenCalledWith('s1', file, navigator.language);
    });

    it('startImport_ValidFile_ShowsSpinnerPhaseAndDisablesImport', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);

      // Act
      component.startImport();

      // Assert
      expect(component.phase()).toBe('importing');
      expect(component.canImport()).toBe(false);
    });

    it('onVisibleChange_WhileImporting_DoesNotClose', async () => {
      // Arrange
      const { component, visibleChange } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      component.onVisibleChange(false);

      // Assert
      expect(visibleChange).not.toHaveBeenCalled();
    });

    it('onVisibleChange_Idle_EmitsVisibleChange', async () => {
      // Arrange
      const { component, visibleChange } = await createDialog();

      // Act
      component.onVisibleChange(false);

      // Assert
      expect(visibleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('success', () => {
    it('startImport_ServerAnswersSuccess_SwitchesToSuccessPhase', async () => {
      // Arrange
      const { component } = await createDialog();
      vi.useFakeTimers();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      response.next({ importedCount: 3 });

      // Assert
      expect(component.phase()).toBe('success');
    });

    it('startImport_ServerAnswersSuccess_ClosesAfterDelayAndReportsCount', async () => {
      // Arrange
      const { component, imported, visibleChange } = await createDialog();
      vi.useFakeTimers();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();
      response.next({ importedCount: 3 });

      // Act
      await vi.advanceTimersByTimeAsync(SUCCESS_CLOSE_DELAY_MS);

      // Assert
      expect(imported).toHaveBeenCalledWith(3);
      expect(visibleChange).toHaveBeenCalledWith(false);
    });

    it('startImport_ServerAnswersSuccess_StaysOpenBeforeDelayElapsed', async () => {
      // Arrange
      const { component, visibleChange } = await createDialog();
      vi.useFakeTimers();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();
      response.next({ importedCount: 3 });

      // Act
      await vi.advanceTimersByTimeAsync(SUCCESS_CLOSE_DELAY_MS - 1);

      // Assert
      expect(visibleChange).not.toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('startImport_ServerRejectsWithDetail_ShowsDetailAndKeepsFileAndDialogOpen', async () => {
      // Arrange
      const { component, visibleChange } = await createDialog();
      const file = createFile('artikel.csv');
      component.onFilesChosen([file]);
      component.startImport();

      // Act
      response.error(
        new HttpErrorResponse({
          status: 400,
          error: { detail: 'Zeile 4, Artikelnummer 3003: Pflichtfeld „Bezeichnung“ fehlt' },
        }),
      );

      // Assert
      expect(component.message()).toBe('Zeile 4, Artikelnummer 3003: Pflichtfeld „Bezeichnung“ fehlt');
      expect(component.file()).toBe(file);
      expect(visibleChange).not.toHaveBeenCalled();
    });

    it('startImport_ServerRejects_EndsSpinnerAndEnablesImportAgain', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      response.error(new HttpErrorResponse({ status: 400, error: { detail: 'Datei enthält keine Artikel' } }));

      // Assert
      expect(component.phase()).toBe('idle');
      expect(component.canImport()).toBe(true);
    });

    it('startImport_NoAnswerWithinThreeMinutes_ShowsTimeoutMessage', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      response.error(new TimeoutError());

      // Assert
      expect(component.message()).toBe(
        'Zeitüberschreitung: Der Server hat nicht innerhalb von 3 Minuten geantwortet.',
      );
    });

    it('startImport_ProxyRejectsWithPayloadTooLarge_ShowsSizeMessage', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      response.error(new HttpErrorResponse({ status: 413, error: '<html>' }));

      // Assert
      expect(component.message()).toBe('Die Datei ist größer als 2 MB.');
    });

    it('startImport_UnexpectedError_ShowsGenericMessage', async () => {
      // Arrange
      const { component } = await createDialog();
      component.onFilesChosen([createFile('artikel.csv')]);
      component.startImport();

      // Act
      response.error(new HttpErrorResponse({ status: 500 }));

      // Assert
      expect(component.message()).toBe('Der Import ist fehlgeschlagen.');
    });
  });

  describe('reopen', () => {
    it('visible_ReopenedAfterClose_ResetsFileMessageAndPhase', async () => {
      // Arrange
      const { fixture, component } = await createDialog();
      component.onFilesChosen([createFile('artikel.pdf')]);
      component.onFilesChosen([createFile('artikel.csv')]);
      fixture.componentRef.setInput('visible', false);
      await fixture.whenStable();

      // Act
      fixture.componentRef.setInput('visible', true);
      await fixture.whenStable();

      // Assert
      expect(component.file()).toBeNull();
      expect(component.message()).toBeNull();
      expect(component.phase()).toBe('idle');
    });
  });
});
