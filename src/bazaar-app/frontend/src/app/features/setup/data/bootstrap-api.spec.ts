import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BootstrapApi } from './bootstrap-api';

describe('BootstrapApi', () => {
  let api: BootstrapApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BootstrapApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts username/password and returns the access token', () => {
    let result: { accessToken: string } | undefined;
    api.bootstrapAdmin('admin', 'changeme1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/public/bootstrap-admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'changeme1' });
    req.flush({ accessToken: 'token-123' });

    expect(result).toEqual({ accessToken: 'token-123' });
  });

  it('posts the whole wizard payload to setup-complete', () => {
    let completed = false;
    api
      .completeSetup({
        username: 'admin',
        password: 'changeme1',
        sellerTypes: [{ name: 'Kleidung', commissionRate: 10, itemFee: 0.5 }],
        brandNames: ['Nike'],
        categoryNames: ['Schuhe'],
      })
      .subscribe(() => (completed = true));

    const req = httpMock.expectOne('/api/public/setup-complete');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'admin',
      password: 'changeme1',
      sellerTypes: [{ name: 'Kleidung', commissionRate: 10, itemFee: 0.5 }],
      brandNames: ['Nike'],
      categoryNames: ['Schuhe'],
    });
    req.flush(null);

    expect(completed).toBe(true);
  });
});
