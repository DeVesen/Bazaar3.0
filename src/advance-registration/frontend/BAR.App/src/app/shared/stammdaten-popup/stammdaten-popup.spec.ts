import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { StammdatenPopup } from './stammdaten-popup';
import { MessageService } from 'primeng/api';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

function create(mode: 'create' | 'edit', item: MasterDataItem | null, saveFn = vi.fn()) {
  TestBed.configureTestingModule({ providers: [MessageService] });
  const fixture = TestBed.createComponent(StammdatenPopup);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('entityLabel', 'Marke');
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return fixture;
}

describe('StammdatenPopup', () => {
  it('create mode starts with empty name and original=false', () => {
    const fixture = create('create', null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('edit mode pre-fills name and original from item', () => {
    const item: MasterDataItem = { id: 'b1', name: 'Nike', original: false };

    const fixture = create('edit', item);

    expect(fixture.componentInstance.name()).toBe('Nike');
    expect(fixture.componentInstance.original()).toBe(false);
  });

  it('canSubmit() is false for blank name', () => {
    const fixture = create('create', null);
    fixture.componentInstance.name.set('   ');

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() in create mode calls saveFn with name, undefined original and no id, emits saved, closes', () => {
    const created: MasterDataItem = { id: 'b2', name: 'Puma', original: false };
    const saveFn = vi.fn(() => of(created));
    const fixture = create('create', null, saveFn);
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
    const fixture = create('edit', item, saveFn);
    fixture.componentInstance.name.set('Nike Neu');
    fixture.componentInstance.original.set(true);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith('Nike Neu', true, 'b1');
  });

  it('submit() on 409 sets a field error and keeps the dialog open', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Nike existiert bereits' } })));
    const fixture = create('create', null, saveFn);
    fixture.componentInstance.name.set('Nike');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Nike existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
