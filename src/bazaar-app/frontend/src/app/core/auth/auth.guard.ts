import { CanActivateFn } from '@angular/router';

// TODO(Round 9): durch echte AuthService-Prüfung ersetzen (siehe BSHELL-S05).
export const authGuard: CanActivateFn = () => true;
