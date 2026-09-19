import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatisticsApi } from './statistics-api';

describe('StatisticsApi', () => {
  let statisticsApi: StatisticsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    statisticsApi = TestBed.inject(StatisticsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('omits the sellerTypeId param entirely when null', () => {
    statisticsApi.getStatistics(null).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/statistics');
    expect(req.request.params.has('sellerTypeId')).toBe(false);
    req.flush({});
  });

  it('sends the sellerTypeId param when set', () => {
    statisticsApi.getStatistics('type-1').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/statistics');
    expect(req.request.params.get('sellerTypeId')).toBe('type-1');
    req.flush({});
  });
});
