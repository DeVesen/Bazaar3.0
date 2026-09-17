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
      generalError: 'Import fehlgeschlagen — Datei konnte nicht verarbeitet werden.',
      errors: {
        invalidNumber: 'Zeile {{row}}: Nummer fehlt oder ist keine Ganzzahl.',
        numberNotInOwnRange: 'Zeile {{row}}: Nummer gehört nicht zum eigenen Nummernkreis.',
        duplicateNumber: 'Zeile {{row}}: Nummer ist in der Datei mehrfach vergeben.',
        missingField: 'Zeile {{row}}: Bezeichnung, Kategorie und Marke sind Pflichtfelder.',
        invalidPrice: 'Zeile {{row}}: Preis fehlt oder ist ungültig.'
      }
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

  it('shows a row/error table for row errors, translating the known errorCode with the row number interpolated', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', {
      kind: 'rowErrors',
      errors: [{ row: 3, errorCode: 'import.invalid_price', detail: 'RAW DETAIL SHOULD NOT SHOW' }]
    });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-error-table"]')).nativeElement.textContent;
    expect(text).toContain('3');
    expect(text).toContain('Zeile 3: Preis fehlt oder ist ungültig.');
    expect(text).not.toContain('RAW DETAIL SHOULD NOT SHOW');
  });

  it('falls back to the raw detail for an unknown errorCode', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', {
      kind: 'rowErrors',
      errors: [{ row: 5, errorCode: 'import.some_future_code', detail: 'Unbekannter Fehlertext' }]
    });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-error-table"]')).nativeElement.textContent;
    expect(text).toContain('Unbekannter Fehlertext');
  });

  it('maps every known backend errorCode to its i18n key', () => {
    const fixture = create();
    const codes = [
      'import.invalid_number', 'import.number_not_in_own_range', 'import.duplicate_number',
      'import.missing_field', 'import.invalid_price'
    ];

    for (const code of codes) {
      expect(fixture.componentInstance.errorMessageKey(code)).not.toBeNull();
    }
    expect(fixture.componentInstance.errorMessageKey('import.unknown')).toBeNull();
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
