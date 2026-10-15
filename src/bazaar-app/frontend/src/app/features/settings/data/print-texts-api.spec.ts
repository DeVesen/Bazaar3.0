import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PrintTexts, PrintTextsApi, emptyPrintTexts } from './print-texts-api';

const PRINT_TEXTS_URL = '/api/settings/print-texts';

describe('PrintTextsApi', () => {
  let printTextsApi: PrintTextsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    printTextsApi = TestBed.inject(PrintTextsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('get_always_hitsGetPrintTextsEndpoint', () => {
    // Arrange
    let received: PrintTexts | undefined;

    // Act
    printTextsApi.get().subscribe((texts) => (received = texts));
    const req = httpMock.expectOne(PRINT_TEXTS_URL);
    req.flush(emptyPrintTexts());

    // Assert
    expect(req.request.method).toBe('GET');
    expect(received).toEqual(emptyPrintTexts());
  });

  it('update_texts_sendsThemAsPutBody', () => {
    // Arrange
    const texts = emptyPrintTexts();
    texts.abgabeBeleg.text3 = '**Hinweis**';

    // Act
    printTextsApi.update(texts).subscribe();
    const req = httpMock.expectOne(PRINT_TEXTS_URL);
    req.flush(null);

    // Assert
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(texts);
  });

  it('emptyPrintTexts_always_returnsTenEmptyTextsInIndependentObjects', () => {
    // Arrange & Act
    const first = emptyPrintTexts();
    const second = emptyPrintTexts();
    first.abgabeBeleg.text1 = 'x';

    // Assert
    expect(Object.keys(first.abgabeBeleg)).toEqual(['text1', 'text2', 'text3', 'text4', 'text5']);
    expect(Object.keys(first.verkaeuferUebersicht)).toEqual(['text1', 'text2', 'text3', 'text4', 'text5']);
    expect(second.abgabeBeleg.text1).toBe('');
  });
});
