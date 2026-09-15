import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

/**
 * Guards /bootstrap-admin itself: once an admin exists, the route is locked
 * permanently (F2 decision) rather than merely left unlinked.
 */
export const adminExistsGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);

  return bootstrapStatus.hasAdmin().pipe(
    map((hasAdmin) => (hasAdmin ? router.createUrlTree(['/login']) : true))
  );
};
