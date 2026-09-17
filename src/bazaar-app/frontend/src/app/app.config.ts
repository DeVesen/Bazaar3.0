import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { options: { darkModeSelector: false } } }), // Theme-Preset folgt in Epic_App_Shell
    provideLucideConfig({ strokeWidth: 1.5 }),
    provideRouter(routes),
  ]
};
