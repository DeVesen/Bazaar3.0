import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

const EXCLUDED_PREFIXES = ['/health', '/api/auth/', '/api/public/'];

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshInFlight: Observable<string> | null = null;

function isExcluded(url: string): boolean {
  const path = new URL(url, 'http://placeholder/').pathname;
  return EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function refreshAccessToken(http: HttpClient, tokenStore: TokenStore): Observable<string> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = http
    .post<RefreshResponse>('/api/auth/refresh', { refreshToken: tokenStore.getRefreshToken() })
    .pipe(
      switchMap((response) => {
        tokenStore.setToken(response.accessToken);
        tokenStore.setRefreshToken(response.refreshToken);
        refreshInFlight = null;
        return [response.accessToken];
      }),
      catchError((error: unknown) => {
        refreshInFlight = null;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  return refreshInFlight;
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isExcluded(req.url)) {
    return next(req);
  }

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return refreshAccessToken(http, tokenStore).pipe(
        switchMap((newToken) => next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))),
        catchError((refreshError: unknown) => {
          authService.logout();
          router.navigateByUrl('/login');
          return throwError(() => refreshError);
        })
      );
    })
  );
};
