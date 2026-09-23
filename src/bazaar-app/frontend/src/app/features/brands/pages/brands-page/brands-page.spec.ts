import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { BrandsPage } from './brands-page';
import { BrandsStore } from '../../brands-store';
import { RoleService } from '../../../../core/auth/role.service';
import { Brand } from '../../data/brands-api';

function brand(overrides: Partial<Brand> = {}): Brand {
  return { id: 'b1', name: 'Nike', original: false, articleCount: 3, ...overrides };
}

describe('BrandsPage', () => {
  let brandsSignal: ReturnType<typeof signal<Brand[]>>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;
  let load: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    brandsSignal = signal<Brand[]>([brand()]);
    loadingSignal = signal(false);
    isAdminSignal = signal(true);
    load = vi.fn();
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [BrandsPage],
      providers: [
        {
          provide: BrandsStore,
          useValue: {
            brands: brandsSignal,
            loading: loadingSignal,
            load,
            create,
            update,
            remove,
          },
        },
        { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
      ],
    }).compileComponents();
  });

  function createPage() {
    const fixture = TestBed.createComponent(BrandsPage);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('calls brandsStore.load() on construction', () => {
    createPage();
    expect(load).toHaveBeenCalled();
  });

  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    expect(component.emptyText).toBe(
      'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
    );
  });

  it('marks every column as not filterable (no column filtering in Round-11)', () => {
    const { component } = createPage();

    expect(component.columns.length).toBeGreaterThan(0);
    for (const column of component.columns) {
      expect(column.filterable).toBe(false);
    }
  });

  describe('role-based visibility', () => {
    it('admin sees actionColumn and canAdd', () => {
      isAdminSignal.set(true);
      const { component } = createPage();

      expect(component.actionColumn()).toEqual({
        buttons: [
          { actionId: 'edit', icon: 'pi pi-pencil', tooltip: 'Bearbeiten' },
          { actionId: 'delete', icon: 'pi pi-trash', tooltip: 'Löschen' },
        ],
      });
      expect(component.canAdd()).toBe(true);
    });

    it('cashier sees neither actionColumn nor canAdd', () => {
      isAdminSignal.set(false);
      const { component } = createPage();

      expect(component.actionColumn()).toBeNull();
      expect(component.canAdd()).toBe(false);
    });
  });

  it('rowAdd opens the popup in create mode with no initial value', () => {
    const { component } = createPage();

    component.onRowAdd();

    expect(component.popupVisible()).toBe(true);
    expect(component.popupMode()).toBe('create');
    expect(component.popupInitialValue()).toBeNull();
  });

  it('actionClick with edit opens the popup in edit mode pre-filled', () => {
    const { component } = createPage();
    const row = { ...brand({ name: 'Adidas', original: true }), originalLabel: '✓ Original' };

    component.onActionClick({ actionId: 'edit', row });

    expect(component.popupVisible()).toBe(true);
    expect(component.popupMode()).toBe('edit');
    expect(component.popupInitialValue()).toEqual({ name: 'Adidas', original: true });
  });

  describe('save', () => {
    it('in create mode calls brandsStore.create and shows a success toast', () => {
      create.mockReturnValue(of(brand()));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Adidas', original: false });

      expect(create).toHaveBeenCalledWith('Adidas');
      expect(update).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Marke gespeichert' }),
      );
    });

    it('in edit mode calls brandsStore.update with the editing brand id', () => {
      update.mockReturnValue(of(undefined));
      const { component } = createPage();
      const row = { ...brand(), originalLabel: 'Neu' };
      component.onActionClick({ actionId: 'edit', row });

      component.onPopupSave({ name: 'Nike Neu', original: true });

      expect(update).toHaveBeenCalledWith('b1', 'Nike Neu', true);
      expect(create).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
    });

    it('on brand.name_taken keeps the popup open and shows an error toast', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { errorCode: 'brand.name_taken' },
      });
      create.mockReturnValue(throwError(() => error));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Nike', original: false });

      expect(component.popupVisible()).toBe(true);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('delete', () => {
    it('on brand.in_use shows an error toast', () => {
      const error = new HttpErrorResponse({ status: 409, error: { errorCode: 'brand.in_use' } });
      remove.mockReturnValue(throwError(() => error));
      const { component } = createPage();

      component.onActionClick({
        actionId: 'delete',
        row: { ...brand(), originalLabel: 'Neu' },
      });

      expect(remove).toHaveBeenCalledWith('b1');
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Marke wird noch verwendet' }),
      );
    });

    it('on success does not show a toast', () => {
      remove.mockReturnValue(of(undefined));
      const { component } = createPage();

      component.onActionClick({
        actionId: 'delete',
        row: { ...brand(), originalLabel: 'Neu' },
      });

      expect(remove).toHaveBeenCalledWith('b1');
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('closes the popup and clears the editing brand', () => {
      const { component } = createPage();
      component.onActionClick({ actionId: 'edit', row: { ...brand(), originalLabel: 'Neu' } });

      component.onPopupCancel();

      expect(component.popupVisible()).toBe(false);
      expect(component.popupInitialValue()).toBeNull();
    });
  });

  describe('page header', () => {
    it('shows "Marken" as page title and "+ Neu" in the header, with no table title', () => {
      isAdminSignal.set(true);
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Marken');
      expect(el.querySelector('.page__actions p-button[label="+ Neu"]')).not.toBeNull();
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
    });

    it('hides "+ Neu" for non-admins', () => {
      isAdminSignal.set(false);
      const { fixture } = createPage();
      expect(fixture.nativeElement.querySelector('.page__actions p-button')).toBeNull();
    });

    it('opens the create popup from the header "+ Neu" button', () => {
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      (fixture.nativeElement.querySelector('.page__actions p-button button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.popupVisible()).toBe(true);
    });
  });
});
