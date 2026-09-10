import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the German title by default', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideTranslateService()]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', { notFound: { title: 'Seite nicht gefunden' } });
    translate.use('de');
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Seite nicht gefunden');
  });

  it('renders the translated title when the active language is English', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideTranslateService()]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { notFound: { title: 'Page not found' } });
    translate.use('en');
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Page not found');
  });
});
