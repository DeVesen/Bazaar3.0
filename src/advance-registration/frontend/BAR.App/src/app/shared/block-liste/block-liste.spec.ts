import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { BlockListe } from './block-liste';

const DE_TRANSLATIONS = {
  blockListe: {
    empty: 'Noch keine Nummernblöcke zugewiesen',
    usage: '{{count}} Nummern · {{used}} vergeben'
  }
};

const EN_TRANSLATIONS = {
  blockListe: {
    empty: 'No number blocks assigned yet',
    usage: '{{count}} numbers · {{used}} assigned'
  }
};

describe('BlockListe', () => {
  let fixture: ComponentFixture<BlockListe>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockListe],
      providers: [provideTranslateService()]
    }).compileComponents();
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', DE_TRANSLATIONS);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('de');
    fixture = TestBed.createComponent(BlockListe);
  });

  it('shows the empty state text when there are no blocks', () => {
    fixture.componentRef.setInput('blocks', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Noch keine Nummernblöcke zugewiesen');
  });

  it('renders one item per block with range and counter', () => {
    fixture.componentRef.setInput('blocks', [
      { id: 'b1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3 }
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('101');
    expect(fixture.nativeElement.textContent).toContain('110');
    expect(fixture.nativeElement.textContent).toContain('10 Nummern · 3 vergeben');
  });

  it('shows English text when the active language is English', () => {
    translate.use('en');
    fixture.componentRef.setInput('blocks', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No number blocks assigned yet');
  });

  it('renders the parameterized usage text translated to English', () => {
    translate.use('en');
    fixture.componentRef.setInput('blocks', [
      { id: 'b1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3 }
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('10 numbers · 3 assigned');
  });
});
