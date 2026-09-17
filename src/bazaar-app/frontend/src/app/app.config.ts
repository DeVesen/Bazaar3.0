import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { routes } from './app.routes';
import { IndustryPreset } from './core/theme/industry-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: IndustryPreset, options: { darkModeSelector: false } } }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    provideRouter(routes),
  ]
};
