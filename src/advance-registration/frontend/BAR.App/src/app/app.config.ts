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
import { environment } from '../environments/environment';

// public/i18n/*.json ships as an unhashed static asset (Angular's outputHashing
// only covers bundled JS/CSS, not the public/ passthrough) - a stale browser/CDN
// cache from before a deploy otherwise keeps serving old translations after new
// keys ship, rendering the raw key instead. Busting per app load (module
// evaluates once at bootstrap) trades the file's tiny caching benefit for
// always-correct translations.
const I18N_CACHE_BUST = Date.now();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({
      lang: 'de',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: `.json?v=${I18N_CACHE_BUST}` })
    }),
    providePrimeNG({
      theme: {
        preset: IndustryPreset,
        options: { darkModeSelector: false }
      },
      translation: { accept: 'Ja', reject: 'Nein' },
      license: environment.primeUiLicenseKey
    }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    MessageService,
    ConfirmationService
  ]
};
