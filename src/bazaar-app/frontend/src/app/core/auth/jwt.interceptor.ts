import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

const EXCLUDED_PREFIXES = ['/health', '/api/auth/login'];
const API_PREFIX = '/api/';

// A 401 here means "wrong credentials for THIS specific action", not "your
// session/token is invalid" — the interceptor must still attach the Bearer
// token (unlike EXCLUDED_PREFIXES, which skips token-attach entirely), but
// must NOT force-logout/redirect on a 401, so the page's own error handling
// (e.g. "Aktuelles Passwort ist falsch") gets a chance to run.
const NO_AUTO_LOGOUT_ON_401 = ['/api/auth/login', '/api/auth/password'];

function resolvePath(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return parsed.pathname;
  } catch {
    return null;
  }
}

// Allowlist instead of blocklist: the header only goes to our own API calls.
// Everything else — third-party hosts and static assets — never gets to see
// a bearer token.
function shouldAttachToken(path: string | null): boolean {
  return path !== null && path.startsWith(API_PREFIX) && !EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  const path = resolvePath(req.url);

  if (!shouldAttachToken(path)) return next(req);

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      const shouldAutoLogout = !NO_AUTO_LOGOUT_ON_401.some((p) => path?.startsWith(p));
      if (error instanceof HttpErrorResponse && error.status === 401 && shouldAutoLogout) {
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
