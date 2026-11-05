import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { PrintService } from '../../../../core/print/print.service';
import { BlankLabelsStore } from '../../blank-labels-store';
import { LIBRARY_FULL_ERROR_CODE, LabelImageSummary } from '../../data/blank-labels-api';
import { BlankLabelsPage } from './blank-labels-page';
import { DEFAULT_LABEL_ELEMENT_SIZES } from '../../../../shared/components/label-sheet/label-layout';

const PNG_DATA_URL = 'data:image/png;base64,AAAA';

const SUN_IMAGE: LabelImageSummary = {
  id: 'LIM00001',
  name: 'Sonne',
  mediaType: 'image/png',
  sizeBytes: 3,
  createdAt: '2026-11-05T10:00:00Z',
};

/** Bilder-Bibliothek der Seite „Etiketten-Vordruck" (B-1 bis B-7), Store ersetzt. */
describe('BlankLabelsPage library', () => {
  let store: {
    images: ReturnType<typeof signal<LabelImageSummary[]>>;
    imageContents: ReturnType<typeof signal<Record<string, string>>>;
    uploadImage: ReturnType<typeof vi.fn>;
    deleteImage: ReturnType<typeof vi.fn>;
    [member: string]: unknown;
  };
  let confirm: ReturnType<typeof vi.spyOn>;
  let messageAdd: ReturnType<typeof vi.spyOn>;

  async function setup(images: LabelImageSummary[] = []) {
    store = {
      formats: signal([]),
      images: signal(images),
      imageContents: signal(Object.fromEntries(images.map((image) => [image.id, PNG_DATA_URL]))),
      loadFormats: vi.fn(),
      loadImages: vi.fn(),
      uploadImage: vi.fn(),
      deleteImage: vi.fn(),
      loadDefaults: vi.fn().mockReturnValue(of({ logo: null, sellerSymbol: null, currencySymbol: '€', sizes: DEFAULT_LABEL_ELEMENT_SIZES })),
      saveDefaults: vi.fn().mockReturnValue(of(undefined)),
    };
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
        { provide: PrintService, useValue: { printLabelSheets: vi.fn() } },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(BlankLabelsPage);
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance };
  }

  function lastConfirmation(): Confirmation {
    return confirm.mock.calls.at(-1)?.[0] as Confirmation;
  }

  it('onImageChosen_gifFile_showsErrorAndKeepsLogoAndLibrary', async () => {
    // Arrange
    const { page } = await setup();
    const gif = new File(['x'], 'logo.gif', { type: 'image/gif' });

    // Act
    page.onImageChosen({ target: 'logo', file: gif });

    // Assert
    expect(messageAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Nur PNG, JPEG oder SVG' }));
    expect(page.logo()).toBeNull();
    expect(store.uploadImage).not.toHaveBeenCalled();
  });

  it('onImageChosen_pngFile_uploadsToLibraryAndSetsSellerSymbolToItsDataUrl', async () => {
    // Arrange
    const { page } = await setup();
    store.uploadImage.mockReturnValue(of(SUN_IMAGE));
    const png = new File([new Uint8Array(3)], 'symbol.png', { type: 'image/png' });

    // Act
    page.onImageChosen({ target: 'sellerSymbol', file: png });

    // Assert
    await vi.waitFor(() => expect(page.sellerSymbol()).toEqual({ kind: 'image', value: PNG_DATA_URL }));
    expect(store.uploadImage).toHaveBeenCalledWith({ name: 'symbol', dataUrl: PNG_DATA_URL });
  });

  it('onImageChosen_libraryFull_showsLibraryFullAndKeepsLogo', async () => {
    // Arrange
    const { page } = await setup();
    const conflict = new HttpErrorResponse({ status: 409, error: { errorCode: LIBRARY_FULL_ERROR_CODE } });
    store.uploadImage.mockReturnValue(throwError(() => conflict));
    const png = new File([new Uint8Array(3)], 'logo.png', { type: 'image/png' });

    // Act
    page.onImageChosen({ target: 'logo', file: png });

    // Assert
    await vi.waitFor(() => expect(messageAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Bibliothek voll' })));
    expect(page.logo()).toBeNull();
  });

  it('onImageChosen_uploadFails_showsErrorAndKeepsLogo', async () => {
    // Arrange
    const { page } = await setup();
    store.uploadImage.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    const png = new File([new Uint8Array(3)], 'logo.png', { type: 'image/png' });

    // Act
    page.onImageChosen({ target: 'logo', file: png });

    // Assert
    await vi.waitFor(() => expect(messageAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Bild nicht übernommen' })));
    expect(page.logo()).toBeNull();
  });

  it('render_libraryImageClicked_showsImageOnPreviewLabel', async () => {
    // Arrange
    const { fixture } = await setup([SUN_IMAGE]);
    const root = fixture.nativeElement as HTMLElement;
    const libraryButton = root.querySelector('button[data-library-image="LIM00001"]') as HTMLButtonElement;

    // Act
    libraryButton.click();

    // Assert
    await fixture.whenStable();
    const preview = root.querySelector('[data-area="label-content"] .blank-labels__preview');
    expect(preview?.querySelector('img')?.getAttribute('src')).toBe(PNG_DATA_URL);
  });

  it('onImageDeleteRequested_confirmed_deletesImageAndKeepsChosenLogo', async () => {
    // Arrange
    const { page } = await setup([SUN_IMAGE]);
    store.deleteImage.mockReturnValue(of(undefined));
    page.logo.set({ kind: 'image', value: PNG_DATA_URL });
    page.onImageDeleteRequested('LIM00001');

    // Act
    lastConfirmation().accept?.();

    // Assert
    expect(lastConfirmation().message).toBe('Bild „Sonne“ aus der Bibliothek löschen?');
    expect(store.deleteImage).toHaveBeenCalledWith('LIM00001');
    expect(page.logo()).toEqual({ kind: 'image', value: PNG_DATA_URL });
  });

  it('onImageDeleteRequested_notConfirmed_keepsImage', async () => {
    // Arrange
    const { page } = await setup([SUN_IMAGE]);

    // Act
    page.onImageDeleteRequested('LIM00001');

    // Assert
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(store.deleteImage).not.toHaveBeenCalled();
  });

  it('onImageDeleteRequested_deleteFails_showsError', async () => {
    // Arrange
    const { page } = await setup([SUN_IMAGE]);
    store.deleteImage.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    page.onImageDeleteRequested('LIM00001');

    // Act
    lastConfirmation().accept?.();

    // Assert
    expect(messageAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Bild konnte nicht gelöscht werden' }));
  });

  it('libraryImages_contentNotLoadedYet_hasNullDataUrl', async () => {
    // Arrange
    const { page } = await setup([SUN_IMAGE]);

    // Act
    store.imageContents.set({});

    // Assert
    expect(page.libraryImages()).toEqual([{ id: 'LIM00001', name: 'Sonne', dataUrl: null }]);
  });
});
