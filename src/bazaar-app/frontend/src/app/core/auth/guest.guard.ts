import { CanActivateFn } from '@angular/router';

// TODO(Round 9): durch echte AuthService-Prüfung ersetzen — bereits eingeloggte
// Nutzer sollen von /login auf /intake umgeleitet werden (BSHELL-S03 AC-4).
export const guestGuard: CanActivateFn = () => true;
