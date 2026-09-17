import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { options: { darkModeSelector: false } } }), // Theme-Preset folgt in Epic_App_Shell
    provideLucideConfig({ strokeWidth: 1.5 }),
  ]
};
