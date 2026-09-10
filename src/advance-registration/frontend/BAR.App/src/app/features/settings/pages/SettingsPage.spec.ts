import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { SettingsPage } from './SettingsPage';
import { SettingsApiService, SettingsDto } from '../settings-api.service';
import { SellerTypeApiService } from '../../seller-types/seller-type-api.service';

const EMPTY_SETTINGS: SettingsDto = {
  registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
  bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
  startNumber: null, blockSize: null, defaultBlockCount: null
};

const SETTINGS_TRANSLATIONS_DE = {
  common: { save: 'Speichern' },
  settings: {
    bazaarConfigTitle: 'Basar-Konfiguration',
    registrationDeadlineLabel: 'Voranmeldeschluss',
    dropOffFromLabel: 'Abgabe von',
    dropOffUntilLabel: 'Abgabe bis',
    bazaarFromLabel: 'Basar von',
    bazaarUntilLabel: 'Basar bis',
    defaultSellerTypeLabel: 'Standard-Verkäufer-Typ',
    numberBlockParamsTitle: 'Nummernblock-Parameter',
    startNumberLabel: 'Startnummer',
    blockSizeLabel: 'Blockgröße',
    blockSizeHint: 'Bestehende Blöcke behalten ihre Größe — nur künftig angelegte Blöcke bekommen die neue.',
    defaultBlockCountLabel: 'Standard-Blockanzahl',
    infoTextTitle: 'Info-Text',
    syntaxHelpAriaLabel: 'Unterstützte Formatierung',
    syntaxHeaderElement: 'Element',
    syntaxHeaderSyntax: 'Syntax',
    syntaxHeaderRendering: 'Rendering',
    syntaxParagraphName: 'Absatz',
    syntaxParagraphSyntax: 'Leerzeile zwischen Textblöcken',
    syntaxLineBreakName: 'Zeilenumbruch',
    syntaxLineBreakSyntax: 'einfacher Umbruch',
    syntaxHeadingName: 'Überschrift',
    syntaxHeadingSyntax: '# bis ###',
    syntaxBoldName: 'Fettdruck',
    syntaxItalicName: 'Kursiv',
    syntaxListName: 'Aufzählung',
    syntaxNumberedListName: 'Nummerierte Liste',
    syntaxDividerName: 'Trennlinie',
    syntaxInlineCodeName: 'Inline-Code',
    syntaxCodeBlockName: 'Code-Block',
    syntaxCodeBlockSyntax: 'Fence aus drei Backticks',
    syntaxLinkName: 'Link',
    syntaxLinkRendering: '<a> — nur http/https/mailto',
    syntaxNote: 'Nicht aufgeführte Syntax bleibt als Klartext stehen.',
    previewEmpty: 'Keine Vorschau — Info-Text ist leer',
    saveSuccess: '✓ Einstellungen gespeichert',
    saveConflictDefault: 'Startnummer liegt über bereits vergebenen Artikelnummern',
    saveFailed: 'Einstellungen konnten nicht gespeichert werden'
  }
};

const SETTINGS_TRANSLATIONS_EN = {
  common: { save: 'Save' },
  settings: {
    bazaarConfigTitle: 'Bazaar configuration',
    registrationDeadlineLabel: 'Registration deadline',
    dropOffFromLabel: 'Drop-off from',
    dropOffUntilLabel: 'Drop-off until',
    bazaarFromLabel: 'Bazaar from',
    bazaarUntilLabel: 'Bazaar until',
    defaultSellerTypeLabel: 'Default seller type',
    numberBlockParamsTitle: 'Number block parameters',
    startNumberLabel: 'Start number',
    blockSizeLabel: 'Block size',
    blockSizeHint: 'Existing blocks keep their size — only newly created blocks get the new one.',
    defaultBlockCountLabel: 'Default block count',
    infoTextTitle: 'Info text',
    syntaxHelpAriaLabel: 'Supported formatting',
    syntaxHeaderElement: 'Element',
    syntaxHeaderSyntax: 'Syntax',
    syntaxHeaderRendering: 'Rendering',
    syntaxParagraphName: 'Paragraph',
    syntaxParagraphSyntax: 'Blank line between text blocks',
    syntaxLineBreakName: 'Line break',
    syntaxLineBreakSyntax: 'single line break',
    syntaxHeadingName: 'Heading',
    syntaxHeadingSyntax: '# to ###',
    syntaxBoldName: 'Bold',
    syntaxItalicName: 'Italic',
    syntaxListName: 'Bulleted list',
    syntaxNumberedListName: 'Numbered list',
    syntaxDividerName: 'Divider',
    syntaxInlineCodeName: 'Inline code',
    syntaxCodeBlockName: 'Code block',
    syntaxCodeBlockSyntax: 'Three-backtick fence',
    syntaxLinkName: 'Link',
    syntaxLinkRendering: '<a> — http/https/mailto only',
    syntaxNote: 'Any syntax not listed here stays as plain text.',
    previewEmpty: 'No preview — info text is empty',
    saveSuccess: '✓ Settings saved',
    saveConflictDefault: 'Start number is above already-assigned article numbers',
    saveFailed: 'Settings could not be saved'
  }
};

function create(initial: SettingsDto = EMPTY_SETTINGS, locale: 'de' | 'en' = 'de') {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, provideTranslateService()]
  });
  const api = TestBed.inject(SettingsApiService);
  const sellerTypeApi = TestBed.inject(SellerTypeApiService);
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', SETTINGS_TRANSLATIONS_DE);
  translate.setTranslation('en', SETTINGS_TRANSLATIONS_EN);
  translate.use(locale);
  vi.spyOn(api, 'get').mockReturnValue(of(initial));
  vi.spyOn(sellerTypeApi, 'getAll').mockReturnValue(of([{ id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5, sellerCount: 0 }]));
  const fixture = TestBed.createComponent(SettingsPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SettingsPage', () => {
  it('loads settings on init', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });

    expect(fixture.componentInstance.startNumber()).toBe(1);
    expect(fixture.componentInstance.blockSize()).toBe(10);
  });

  it('infoTextLength reflects the current infoText', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('Hallo');

    expect(fixture.componentInstance.infoTextLength()).toBe(5);
  });

  it('infoTextNearLimit is true from 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3800));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(true);
  });

  it('infoTextNearLimit is false below 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3799));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(false);
  });

  it('save() calls SettingsApiService.update with the current field values and shows a success toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    const updateSpy = vi.spyOn(api, 'update').mockReturnValue(of({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const registrationDeadline = new Date('2026-09-30T21:59:00.000Z');
    fixture.componentInstance.infoText.set('Hallo');
    fixture.componentInstance.registrationDeadline.set(registrationDeadline);

    fixture.componentInstance.save();

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      infoText: 'Hallo', startNumber: 1, blockSize: 10, defaultBlockCount: 1,
      registrationDeadline: registrationDeadline.toISOString()
    }));
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('save() on 400 sets fieldErrors instead of a toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 400, error: { errors: { defaultTypeId: ['Unbekannter Verkäufer-Typ'] } } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.fieldErrors()['defaultTypeId']).toEqual(['Unbekannter Verkäufer-Typ']);
  });

  it('save() on 409 sets saveError to the server detail', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Startnummer liegt über bereits vergebenen Artikelnummern' } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saveError()).toBe('Startnummer liegt über bereits vergebenen Artikelnummern');
  });

  it('canSave is false when startNumber is missing', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: null, blockSize: 10, defaultBlockCount: 1 });

    expect(fixture.componentInstance.canSave()).toBe(false);
  });

  it('canSave is true once startNumber, blockSize and defaultBlockCount are all positive', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: 0, blockSize: 10, defaultBlockCount: 1 });

    expect(fixture.componentInstance.canSave()).toBe(false);

    fixture.componentInstance.startNumber.set(1);

    expect(fixture.componentInstance.canSave()).toBe(true);
  });

  it('save() does not call the API when canSave is false', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: null, blockSize: 10, defaultBlockCount: 1 });
    const updateSpy = vi.spyOn(api, 'update');

    fixture.componentInstance.save();

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('save() shows the translated success toast in English', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }, 'en');
    vi.spyOn(api, 'update').mockReturnValue(of({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.save();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: '✓ Settings saved' }));
  });

  it('save() on 409 without a server detail falls back to the translated default message', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }, 'en');
    vi.spyOn(api, 'update').mockReturnValue(throwError(() => ({ status: 409, error: {} })));

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saveError()).toBe('Start number is above already-assigned article numbers');
  });

  it('save() on a generic error sets the translated saveFailed message', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }, 'en');
    vi.spyOn(api, 'update').mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saveError()).toBe('Settings could not be saved');
  });

  it('renders all form labels, the syntax help table and the save button in English with no German residue', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }, 'en');

    const syntaxHelpButton = fixture.nativeElement.querySelector('button[aria-label="Supported formatting"]');
    expect(syntaxHelpButton).not.toBeNull();
    syntaxHelpButton.click();
    fixture.detectChanges();

    // p-popover renders its panel into an overlay appended to document.body, not inside
    // fixture.nativeElement, so the popover assertions below read from the full document.
    const text = (fixture.nativeElement.textContent + document.body.textContent) as string;
    expect(text).toContain('Bazaar configuration');
    expect(text).toContain('Registration deadline');
    expect(text).toContain('Drop-off from');
    expect(text).toContain('Drop-off until');
    expect(text).toContain('Bazaar from');
    expect(text).toContain('Bazaar until');
    expect(text).toContain('Default seller type');
    expect(text).toContain('Number block parameters');
    expect(text).toContain('Start number');
    expect(text).toContain('Block size');
    expect(text).toContain('Existing blocks keep their size');
    expect(text).toContain('Default block count');
    expect(text).toContain('Info text');
    expect(text).toContain('No preview — info text is empty');
    expect(text).toContain('Save');
    expect(text).toContain('Element');
    expect(text).toContain('Paragraph');
    expect(text).toContain('Line break');
    expect(text).toContain('Heading');
    expect(text).toContain('# to ###');
    expect(text).toContain('Numbered list');
    expect(text).toContain('Divider');
    expect(text).toContain('Inline code');
    expect(text).toContain('Code block');
    expect(text).toContain('Three-backtick fence');
    expect(text).toContain('Any syntax not listed here stays as plain text.');
    expect(text).not.toMatch(/Voranmeldeschluss|Abgabe von|Abgabe bis|Basar von|Basar bis|Standard-Verkäufer-Typ|Nummernblock-Parameter|Startnummer|Blockgröße|Standard-Blockanzahl|Info-Text|Speichern|Überschrift|Aufzählung|Trennlinie|Klartext/);
  });
});
