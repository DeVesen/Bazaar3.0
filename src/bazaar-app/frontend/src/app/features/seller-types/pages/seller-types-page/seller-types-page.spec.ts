import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { SellerTypesPage } from './seller-types-page';
import { SellerTypesStore } from '../../seller-types-store';
import { RoleService } from '../../../../core/auth/role.service';
import { SellerType } from '../../data/seller-types-api';

function sellerType(overrides: Partial<SellerType> = {}): SellerType {
  return {
    id: 's1',
    name: 'Standard',
    commissionRate: 10,
    itemFee: 0.5,
    sellerCount: 3,
    ...overrides,
  };
}

describe('SellerTypesPage', () => {
  let sellerTypesSignal: ReturnType<typeof signal<SellerType[]>>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;
  let load: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    sellerTypesSignal = signal<SellerType[]>([sellerType()]);
    loadingSignal = signal(false);
    isAdminSignal = signal(true);
    load = vi.fn();
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [SellerTypesPage],
      providers: [
        {
          provide: SellerTypesStore,
          useValue: {
            sellerTypes: sellerTypesSignal,
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
    const fixture = TestBed.createComponent(SellerTypesPage);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('calls sellerTypesStore.load() on construction', () => {
    createPage();
    expect(load).toHaveBeenCalled();
  });

  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    expect(component.emptyText).toBe(
      'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit + Neu beginnen.',
    );
  });

  it('marks every column as not filterable', () => {
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

  it('rowAdd opens the popup in create mode with no initial value and clears serverErrors', () => {
    const { component } = createPage();

    component.onRowAdd();

    expect(component.popupVisible()).toBe(true);
    expect(component.popupMode()).toBe('create');
    expect(component.popupInitialValue()).toBeNull();
    expect(component.serverErrors()).toBeNull();
  });

  it('actionClick with edit opens the popup in edit mode pre-filled', () => {
    const { component } = createPage();
    const row = sellerType({ name: 'Premium', commissionRate: 15, itemFee: 1 });

    component.onActionClick({ actionId: 'edit', row });

    expect(component.popupVisible()).toBe(true);
    expect(component.popupMode()).toBe('edit');
    expect(component.popupInitialValue()).toEqual({
      name: 'Premium',
      commissionRate: 15,
      itemFee: 1,
    });
  });

  describe('save', () => {
    it('in create mode calls sellerTypesStore.create and shows a success toast', () => {
      create.mockReturnValue(of(sellerType()));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Premium', commissionRate: 15, itemFee: 1 });

      expect(create).toHaveBeenCalledWith('Premium', 15, 1);
      expect(update).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
      expect(component.saving()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Verkäufer-Typ gespeichert' }),
      );
    });

    it('in edit mode calls sellerTypesStore.update with the editing seller type id', () => {
      update.mockReturnValue(of(undefined));
      const { component } = createPage();
      const row = sellerType();
      component.onActionClick({ actionId: 'edit', row });

      component.onPopupSave({ name: 'Standard Neu', commissionRate: 12, itemFee: 0.75 });

      expect(update).toHaveBeenCalledWith('s1', 'Standard Neu', 12, 0.75);
      expect(create).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
      expect(component.saving()).toBe(false);
    });

    it('on 400 validation error keeps the popup open, sets serverErrors and shows no toast', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { errors: { commissionRate: ['Muss zwischen 0 und 100 liegen.'] } },
      });
      create.mockReturnValue(throwError(() => error));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Premium', commissionRate: 150, itemFee: 1 });

      expect(component.popupVisible()).toBe(true);
      expect(component.saving()).toBe(false);
      expect(component.serverErrors()).toEqual({
        name: undefined,
        commissionRate: 'Muss zwischen 0 und 100 liegen.',
        itemFee: undefined,
      });
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });

    it('on seller_type.name_taken keeps the popup open, shows an error toast and does not set serverErrors', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { errorCode: 'seller_type.name_taken' },
      });
      create.mockReturnValue(throwError(() => error));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Standard', commissionRate: 10, itemFee: 0.5 });

      expect(component.popupVisible()).toBe(true);
      expect(component.saving()).toBe(false);
      expect(component.serverErrors()).toBeNull();
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Name bereits vergeben',
        }),
      );
    });
  });

  describe('delete', () => {
    it('on seller_type.in_use shows an error toast', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { errorCode: 'seller_type.in_use' },
      });
      remove.mockReturnValue(throwError(() => error));
      const { component } = createPage();

      component.onActionClick({ actionId: 'delete', row: sellerType() });

      expect(remove).toHaveBeenCalledWith('s1');
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Verkäufer-Typ wird noch verwendet',
        }),
      );
    });

    it('on success does not show a toast', () => {
      remove.mockReturnValue(of(undefined));
      const { component } = createPage();

      component.onActionClick({ actionId: 'delete', row: sellerType() });

      expect(remove).toHaveBeenCalledWith('s1');
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('closes the popup and clears the editing state and serverErrors', () => {
      const { component } = createPage();
      component.onActionClick({ actionId: 'edit', row: sellerType() });

      component.onPopupCancel();

      expect(component.popupVisible()).toBe(false);
      expect(component.popupInitialValue()).toBeNull();
      expect(component.serverErrors()).toBeNull();
    });
  });

  describe('page header', () => {
    it('shows "Verkäufer-Typen" as page title and "+ Neu" in the header, with no table title', () => {
      isAdminSignal.set(true);
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe(
        'Verkäufer-Typen',
      );
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
