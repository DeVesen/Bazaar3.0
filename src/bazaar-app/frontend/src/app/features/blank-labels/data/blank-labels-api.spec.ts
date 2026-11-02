import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AVERY_16_GEOMETRY } from '../../../shared/components/label-sheet/label-geometry';
import { BlankLabelsApi, PRINT_DEFAULTS_URL, SHEET_FORMATS_URL } from './blank-labels-api';

describe('BlankLabelsApi', () => {
  let api: BlankLabelsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(BlankLabelsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getFormats_always_hitsGetSheetFormats', () => {
    // Arrange & Act
    api.getFormats().subscribe();

    // Assert
    const req = httpMock.expectOne(SHEET_FORMATS_URL);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('saveFormat_request_postsNameGeometryAndOverwriteFlag', () => {
    // Arrange
    const request = { ...AVERY_16_GEOMETRY, name: 'Avery 16er', overwrite: false };

    // Act
    api.saveFormat(request).subscribe();

    // Assert
    const req = httpMock.expectOne(SHEET_FORMATS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...AVERY_16_GEOMETRY, id: 'LSF00001', name: 'Avery 16er' });
  });

  it('deleteFormat_id_hitsDeleteWithId', () => {
    // Arrange & Act
    api.deleteFormat('LSF00001').subscribe();

    // Assert
    const req = httpMock.expectOne(`${SHEET_FORMATS_URL}/LSF00001`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getDefaults_always_hitsGetPrintDefaults', () => {
    // Arrange & Act
    api.getDefaults().subscribe();

    // Assert
    const req = httpMock.expectOne(PRINT_DEFAULTS_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ logo: null, sellerSymbol: null, currencySymbol: '€' });
  });

  it('saveDefaults_defaults_putsThem', () => {
    // Arrange
    const defaults = { logo: null, sellerSymbol: { kind: 'icon' as const, value: 'star' as const }, currencySymbol: '$' };

    // Act
    api.saveDefaults(defaults).subscribe();

    // Assert
    const req = httpMock.expectOne(PRINT_DEFAULTS_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(defaults);
    req.flush(null);
  });
});
