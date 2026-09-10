import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';
import { MessageService, ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { IndustryPreset } from './core/theme/industry-preset';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({
      lang: 'de',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
    }),
    providePrimeNG({
      theme: {
        preset: IndustryPreset,
        options: { darkModeSelector: false }
      },
      translation: { accept: 'Ja', reject: 'Nein' }
    }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    MessageService,
    ConfirmationService
  ]
};
