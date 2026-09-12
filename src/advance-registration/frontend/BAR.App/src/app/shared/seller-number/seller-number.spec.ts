import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SellerNumber } from './seller-number';

const DE_TRANSLATIONS = {
  sellerNumber: {
    title: 'Meine Verkäufernummer',
    copy: 'Kopieren',
    hint: 'Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.',
    copied: '✓ Nummer kopiert'
  }
};

const EN_TRANSLATIONS = {
  sellerNumber: {
    title: 'My seller number',
    copy: 'Copy',
    hint: 'Show this at the bazaar — staff will scan the code.',
    copied: '✓ Number copied'
  }
};

describe('SellerNumber', () => {
  let fixture: ComponentFixture<SellerNumber>;
  let translate: TranslateService;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    await TestBed.configureTestingModule({
      imports: [SellerNumber],
      providers: [MessageService, provideTranslateService()]
    }).compileComponents();
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', DE_TRANSLATIONS);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('de');
    fixture = TestBed.createComponent(SellerNumber);
    fixture.componentRef.setInput('sellerId', 'a3f9c2d1');
    fixture.detectChanges();
  });

  it('shows the sellerId in plain text', () => {
    expect(fixture.nativeElement.textContent).toContain('a3f9c2d1');
  });

  it('shows the German title, copy button and hint by default', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Meine Verkäufernummer');
    expect(text).toContain('Kopieren');
    expect(text).toContain('Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.');
  });

  it('copies the sellerId and shows a translated toast on click', async () => {
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    await fixture.componentInstance.copy();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('a3f9c2d1');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: '✓ Nummer kopiert' }));
  });

  it('shows English text when the active language is English', () => {
    translate.use('en');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('My seller number');
    expect(text).toContain('Copy');
    expect(text).toContain('Show this at the bazaar — staff will scan the code.');
  });

  it('copy toast is translated when the active language is English', async () => {
    translate.use('en');
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    await fixture.componentInstance.copy();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: '✓ Number copied' }));
  });
});
