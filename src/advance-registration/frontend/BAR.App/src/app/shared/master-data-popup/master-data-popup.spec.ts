import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MasterDataPopup } from './master-data-popup';
import { MessageService } from 'primeng/api';
import type { MasterDataItem } from '@shared/models/master-data-item';

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', save: 'Speichern' },
  masterDataPopup: {
    createTitle: 'Neue {{entity}}',
    editTitle: '{{entity}} bearbeiten',
    name: 'Name',
    original: 'Original',
    createLabel: 'Anlegen',
    saved: '✓ {{entity}} gespeichert',
    nameTaken: 'Name existiert bereits',
    saveFailed: 'Speichern fehlgeschlagen'
  }
};

function create(mode: 'create' | 'edit', item: MasterDataItem | null, saveFn = vi.fn(), entityLabel = 'Marke') {
  TestBed.configureTestingModule({ providers: [provideTranslateService(), MessageService] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(MasterDataPopup);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('entityLabel', entityLabel);
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return { fixture, translate };
}

describe('MasterDataPopup', () => {
  it('create mode starts with empty name and original=false', () => {
    const { fixture } = create('create', null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('edit mode pre-fills name and original from item', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };

    const { fixture } = create('edit', item);

    expect(fixture.componentInstance.name()).toBe('Nike');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('canSubmit() is false for blank name', () => {
    const { fixture } = create('create', null);
    fixture.componentInstance.name.set('   ');

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() in create mode calls saveFn with name, undefined original and no id, emits saved, closes', () => {
    const created: MasterDataItem = { id: 'b2', name: 'Puma', original: false };
    const saveFn = vi.fn(() => of(created));
    const { fixture } = create('create', null, saveFn);
    fixture.componentInstance.name.set('Puma');
    const emitted: MasterDataItem[] = [];
    fixture.componentInstance.saved.subscribe((i) => emitted.push(i));

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith('Puma', undefined, undefined);
    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() in edit mode calls saveFn with id and original flag', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };
    const updated: MasterDataItem = { ...item, name: 'Nike Neu', original: true };
    const saveFn = vi.fn(() => of(updated));
    const { fixture } = create('edit', item, saveFn);
    fixture.componentInstance.name.set('Nike Neu');
    fixture.componentInstance.original.set(true);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith('Nike Neu', true, 'b1');
  });

  it('submit() on 409 sets a field error and keeps the dialog open', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Nike existiert bereits' } })));
    const { fixture } = create('create', null, saveFn);
    fixture.componentInstance.name.set('Nike');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Nike existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('shows the translated create-mode title with the interpolated entity label', () => {
    const { fixture } = create('create', null, vi.fn(), 'Marke');

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Neue Marke');
  });

  it('shows the translated edit-mode title with the interpolated entity label', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };

    const { fixture } = create('edit', item, vi.fn(), 'Marke');

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Marke bearbeiten');
  });

  it('dialogTitle re-evaluates when the active language changes after render', () => {
    const { fixture, translate } = create('create', null, vi.fn(), 'Marke');

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Neue Marke');

    translate.setTranslation('en', { masterDataPopup: { createTitle: 'New {{entity}}' }, common: { cancel: 'Cancel', save: 'Save' } });
    translate.use('en');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('New Marke');
  });

  it('shows the translated success toast after a successful save', () => {
    const saveFn = vi.fn(() => of({ id: 'b1', name: 'Nike', original: false }));
    const { fixture, translate } = create('create', null, saveFn, 'Marke');
    fixture.componentInstance.name.set('Nike');
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.submit();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: translate.instant('masterDataPopup.saved', { entity: 'Marke' }) }));
  });

  it('shows the translated name-taken fallback when the 409 response has no detail', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409 })));
    const { fixture } = create('create', null, saveFn);
    fixture.componentInstance.name.set('Nike');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Name existiert bereits');
  });

  it('shows the translated generic save-failed message on a non-409 error', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 500 })));
    const { fixture } = create('create', null, saveFn);
    fixture.componentInstance.name.set('Nike');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Speichern fehlgeschlagen');
  });
});
