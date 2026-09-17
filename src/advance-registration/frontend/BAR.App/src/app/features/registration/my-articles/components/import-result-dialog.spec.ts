import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ImportResultDialog } from './import-result-dialog';

const DE_TRANSLATIONS = {
  common: { ok: 'OK' },
  myArticles: {
    import: {
      dialogHeader: 'Import-Ergebnis',
      success: '{{created}} angelegt, {{updated}} aktualisiert, {{deleted}} gelöscht.',
      rowColumn: 'Zeile',
      errorColumn: 'Fehler',
      generalError: 'Import fehlgeschlagen — Datei konnte nicht verarbeitet werden.'
    }
  }
};

function create() {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(ImportResultDialog);
  fixture.componentRef.setInput('visible', true);
  return fixture;
}

describe('ImportResultDialog', () => {
  it('shows the success summary with created/updated/deleted counts', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'success', summary: { created: 2, updated: 1, deleted: 0 } });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-success"]')).nativeElement.textContent;
    expect(text).toContain('2 angelegt, 1 aktualisiert, 0 gelöscht.');
  });

  it('shows a row/error table for row errors', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', {
      kind: 'rowErrors',
      errors: [{ row: 3, errorCode: 'import.invalid_price', detail: 'Zeile 3: Preis fehlt oder ist ungültig.' }]
    });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-error-table"]')).nativeElement.textContent;
    expect(text).toContain('3');
    expect(text).toContain('Zeile 3: Preis fehlt oder ist ungültig.');
  });

  it('shows a general error message', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'generalError', message: 'Kaputt' });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="import-general-error"]')).nativeElement.textContent).toContain('Kaputt');
  });

  it('emits visibleChange(false) when OK is clicked', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'success', summary: { created: 0, updated: 0, deleted: 0 } });
    fixture.detectChanges();
    const emitted: boolean[] = [];
    fixture.componentInstance.visibleChange.subscribe((v: boolean) => emitted.push(v));

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(emitted).toEqual([false]);
  });
});
