import { Route, Routes } from '@angular/router';
import { routes } from './app.routes';
import { adminGuard } from './core/auth/admin.guard';

function findRoute(candidates: Routes, path: string): Route | undefined {
  for (const candidate of candidates) {
    if (candidate.path === path) return candidate;
    const nested = candidate.children ? findRoute(candidate.children, path) : undefined;
    if (nested) return nested;
  }
  return undefined;
}

describe('routes', () => {
  it('settingsRoute_always_isGuardedByAdminGuard', () => {
    // Arrange & Act
    const settingsRoute = findRoute(routes, 'settings');

    // Assert
    expect(settingsRoute?.canActivate).toContain(adminGuard);
  });
});
