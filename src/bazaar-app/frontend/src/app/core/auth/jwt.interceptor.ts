import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

const EXCLUDED_PREFIXES = ['/health', '/api/auth/login'];
const API_PREFIX = '/api/';

// Allowlist instead of blocklist: the header only goes to our own API calls.
// Everything else — third-party hosts and static assets — never gets to see
// a bearer token.
function shouldAttachToken(url: string): boolean {
  let path: string;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return false;
    path = parsed.pathname;
  } catch {
    return false;
  }
  return path.startsWith(API_PREFIX) && !EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!shouldAttachToken(req.url)) return next(req);

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
