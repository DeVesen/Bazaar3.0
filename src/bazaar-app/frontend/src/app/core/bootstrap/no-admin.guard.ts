import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

// Fails open (returns true) when the status check errors — the guard is a
// convenience redirect only, the real gate is the backend's admin-protected
// endpoints, which fail correctly on their own if the app is misconfigured.
export const noAdminGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);
  return bootstrapStatus.getStatus().pipe(
    map((status) => (status.hasAdmin ? true : router.createUrlTree(['/setup']))),
    catchError(() => of(true)),
  );
};
