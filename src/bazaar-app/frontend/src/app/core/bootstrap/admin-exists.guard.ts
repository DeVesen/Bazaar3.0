import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

export const adminExistsGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);
  return bootstrapStatus.getStatus().pipe(
    map((status) => (status.hasAdmin ? router.createUrlTree(['/login']) : true)),
    catchError(() => of(true)),
  );
};
