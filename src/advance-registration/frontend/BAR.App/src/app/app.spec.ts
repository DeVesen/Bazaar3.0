import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          lang: 'de',
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
        })
      ]
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the German translation file on startup', () => {
    const translate = TestBed.inject(TranslateService);
    const httpMock = TestBed.inject(HttpTestingController);
    translate.use('de');
    // fallbackLang 'en' is eagerly loaded by @ngx-translate/core 18,
    // so both requests are expected and flushed here.
    const deReq = httpMock.expectOne('/i18n/de.json');
    deReq.flush({});
    const enReq = httpMock.expectOne('/i18n/en.json');
    enReq.flush({});
    httpMock.verify();
  });
});
