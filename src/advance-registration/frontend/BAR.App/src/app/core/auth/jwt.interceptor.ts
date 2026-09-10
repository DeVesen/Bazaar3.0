import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

const EXCLUDED_PREFIXES = ['/health', '/api/auth/', '/api/public/'];
const API_PREFIX = '/api/';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshInFlight: Observable<string> | null = null;

// Allowlist statt Blocklist: der Header geht nur an eigene API-Aufrufe.
// Alles andere — Fremd-Hosts und statische Assets wie /i18n/de.json —
// bekommt niemals ein Bearer-Token zu sehen.
function shouldAttachToken(url: string): boolean {
  let path: string;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return false;
    }
    path = parsed.pathname;
  } catch {
    return false;
  }

  if (!path.startsWith(API_PREFIX)) {
    return false;
  }
  return !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

// Manche 401 sind kein abgelaufenes Access-Token, sondern ein fachlicher Fehler
// (z. B. "aktuelles Passwort falsch" auf PUT /api/profile/email|password). Ein
// Refresh+Retry aendert daran nichts (die Session ist ja gueltig) und der zweite
// 401 wuerde ueber den catchError unten zum stillen Logout fuehren. Der Backend-
// Handler (DomainExceptionHandler) liefert den fachlichen ErrorCode im Body mit,
// darueber lassen sich beide Faelle unterscheiden.
function isBusinessLogicUnauthorized(error: HttpErrorResponse): boolean {
  const body = error.error as { errorCode?: string } | null;
  return body?.errorCode === 'auth.invalid_credentials';
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

  if (!shouldAttachToken(req.url)) {
    return next(req);
  }

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (isBusinessLogicUnauthorized(error)) {
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
