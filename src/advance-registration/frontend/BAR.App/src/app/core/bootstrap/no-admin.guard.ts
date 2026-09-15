import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

/**
 * Guards login/register: as long as no admin exists yet, every visitor is
 * sent to /bootstrap-admin instead (V3/V4 - the "naked system" screen).
 */
export const noAdminGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);

  return bootstrapStatus.hasAdmin().pipe(
    map((hasAdmin) => (hasAdmin ? true : router.createUrlTree(['/bootstrap-admin'])))
  );
};
