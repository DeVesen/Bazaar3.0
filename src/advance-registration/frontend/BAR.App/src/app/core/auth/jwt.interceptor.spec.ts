import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

describe('jwtInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });
  });

  it('adds the Authorization header for a non-excluded request', () => {
    TestBed.inject(TokenStore).setToken('token-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/profile').subscribe();
    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({});
    httpMock.verify();
  });

  it('does not add the header for /api/auth/* requests', () => {
    TestBed.inject(TokenStore).setToken('token-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.post('/api/auth/refresh', {}).subscribe();
    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    httpMock.verify();
  });

  it('refreshes the token once on 401 and retries the original request', () => {
    TestBed.inject(TokenStore).setToken('expired-token');
    TestBed.inject(TokenStore).setRefreshToken('refresh-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    let result: unknown;
    http.get('/api/profile').subscribe((r) => (result = r));

    const firstReq = httpMock.expectOne('/api/profile');
    firstReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush({ accessToken: 'new-token', refreshToken: 'new-refresh' });

    const retriedReq = httpMock.expectOne('/api/profile');
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedReq.flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(TestBed.inject(TokenStore).getToken()).toBe('new-token');
    expect(TestBed.inject(TokenStore).getRefreshToken()).toBe('new-refresh');
    httpMock.verify();
  });

  it('shares a single refresh call across two concurrent 401s', () => {
    TestBed.inject(TokenStore).setToken('expired-token');
    TestBed.inject(TokenStore).setRefreshToken('refresh-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    let resultA: unknown;
    let resultB: unknown;
    http.get('/api/profile').subscribe((r) => (resultA = r));
    http.get('/api/accounts').subscribe((r) => (resultB = r));

    const firstReq = httpMock.expectOne('/api/profile');
    const secondReq = httpMock.expectOne('/api/accounts');
    firstReq.flush(null, { status: 401, statusText: 'Unauthorized' });
    secondReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReqs = httpMock.match('/api/auth/refresh');
    expect(refreshReqs.length).toBe(1);
    refreshReqs[0].flush({ accessToken: 'new-token', refreshToken: 'new-refresh' });

    const retriedFirst = httpMock.expectOne('/api/profile');
    const retriedSecond = httpMock.expectOne('/api/accounts');
    expect(retriedFirst.request.headers.get('Authorization')).toBe('Bearer new-token');
    expect(retriedSecond.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedFirst.flush({ ok: 'a' });
    retriedSecond.flush({ ok: 'b' });

    expect(resultA).toEqual({ ok: 'a' });
    expect(resultB).toEqual({ ok: 'b' });
    httpMock.verify();
  });

  it('logs out and navigates to /login when the refresh call itself fails', () => {
    TestBed.inject(TokenStore).setToken('expired-token');
    TestBed.inject(TokenStore).setRefreshToken('bad-refresh');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/profile').subscribe({ error: () => {} });
    httpMock.expectOne('/api/profile').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/api/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(TestBed.inject(TokenStore).getToken()).toBeNull();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login');
    httpMock.verify();
  });
});
