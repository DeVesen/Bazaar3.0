import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { ConfirmationService, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { IndustryPreset } from './core/theme/industry-preset';
import { AuthService } from './core/auth/auth.service';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: IndustryPreset, options: { darkModeSelector: false } } }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    MessageService,
    ConfirmationService,
    // Guarantees AuthService (and its stored-token check) runs before the
    // first navigation, regardless of whether a guard fires (AC-3).
    provideAppInitializer(() => {
      inject(AuthService);
    }),
  ]
};
