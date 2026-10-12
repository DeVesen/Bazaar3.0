import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
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
    sellerTypesSignal.set([]);

    expect(component.emptyText()).toBe(
      'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
    );
  });

  describe('search', () => {
    function threeTypes(): SellerType[] {
      return [
        sellerType({ id: '1', name: 'Anna' }),
        sellerType({ id: '2', name: 'Berta' }),
        sellerType({ id: '3', name: 'Carla' }),
      ];
    }

    it('onSearchChange_partialTermInOtherCase_showsOnlyMatchingNames', () => {
      // Arrange
      sellerTypesSignal.set([
        sellerType({ id: '1', name: 'Privat' }),
        sellerType({ id: '2', name: 'Händler' }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('HÄ');

      // Assert
      expect(component.rows().map((row) => row.name)).toEqual(['Händler']);
    });

    it('onSearchChange_termCleared_showsAllSellerTypesAgain', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();
      component.onSearchChange('berta');

      // Act
      component.onSearchChange('');

      // Assert
      expect(component.rows().map((row) => row.name)).toEqual(['Anna', 'Berta', 'Carla']);
    });

    it('onSearchChange_activeSort_keepsChosenSortOrder', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();
      component.onSortChange([{ field: 'name', order: 'desc' }]);

      // Act
      component.onSearchChange('r');
      const afterFirstTerm = component.rows().map((row) => row.name);
      component.onSearchChange('a');
      const afterSecondTerm = component.rows().map((row) => row.name);

      // Assert
      expect(afterFirstTerm).toEqual(['Carla', 'Berta']);
      expect(afterSecondTerm).toEqual(['Carla', 'Berta', 'Anna']);
    });

    it('onSearchChange_anyTerm_doesNotReloadFromStore', () => {
      // Arrange
      const { component } = createPage();

      // Act
      component.onSearchChange('xyz');

      // Assert
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('emptyText_termWithoutMatchWhileTypesExist_returnsNoResultsText', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();

      // Act
      component.onSearchChange('zzz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Verkäufer-Typen gefunden.');
    });

    it('emptyText_noSellerTypesAndNoTerm_returnsEmptyListText', () => {
      // Arrange
      sellerTypesSignal.set([]);
      isAdminSignal.set(false);

      // Act
      const { component } = createPage();

      // Assert
      expect(component.emptyText()).toBe(
        'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
      );
    });
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
    it('shows "Verkäufer-Typen" as page title, no "+ Neu" in the header and no table title', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe(
        'Verkäufer-Typen',
      );
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(el.textContent).not.toContain('+ Neu');
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
    });
  });

  describe('toolbar', () => {
    function toolbarOf(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('.seller-types-page__toolbar') as HTMLElement;
    }

    it('toolbar_pageShown_rendersOneToolbarWithSearchAboveTheTable', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);
      const table = el.querySelector('app-table') as HTMLElement;

      // Assert
      expect(el.querySelectorAll('.seller-types-page__toolbar').length).toBe(1);
      expect(toolbar.querySelector('input')).not.toBeNull();
      expect(toolbar.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('toolbar_asAdmin_showsOneIconOnlyPlusButtonWithHint', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const buttons = toolbar.querySelectorAll('p-button');
      const plusButton = fixture.debugElement.query(By.css('.seller-types-page__toolbar p-button'));

      // Assert
      expect(buttons.length).toBe(1);
      expect(buttons[0].querySelector('.pi-plus')).not.toBeNull();
      expect(buttons[0].querySelector('button')?.textContent?.trim()).toBe('');
      expect(buttons[0].querySelector('button')?.getAttribute('aria-label')).toBe(
        'Neuer Verkäufer-Typ',
      );
      expect(plusButton.injector.get(Tooltip).content()).toBe('Neuer Verkäufer-Typ');
      expect(toolbar.firstElementChild).toBe(buttons[0]);
    });

    it('toolbar_asAdminPlusClicked_opensCreatePopup', () => {
      // Arrange
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      // Act
      (toolbarOf(fixture).querySelector('p-button button') as HTMLButtonElement).click();
      fixture.detectChanges();

      // Assert
      expect(component.popupVisible()).toBe(true);
      expect(component.popupMode()).toBe('create');
    });

    it('toolbar_asNonAdmin_hasNoAddButtonAndSearchStartsAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);

      // Assert
      expect(toolbar.querySelector('p-button')).toBeNull();
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(toolbar.firstElementChild?.classList).toContain('seller-types-page__search');
    });

    it('toolbar_search_hasPlaceholderNoVisibleLabelAndNoSelect', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const input = toolbar.querySelector('input') as HTMLInputElement;

      // Assert
      expect(input.getAttribute('placeholder')).toBe('Suche nach Name …');
      expect(toolbar.querySelector('label')).toBeNull();
      expect(toolbar.querySelector('p-select')).toBeNull();
      expect(toolbar.querySelector('p-chip')).toBeNull();
    });

    it('toolbar_styles_wrapsFramedAndLetsSearchGrow', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const search = toolbar.querySelector('.seller-types-page__search') as HTMLElement;
      const toolbarStyle = getComputedStyle(toolbar);

      // Assert
      expect(toolbarStyle.display).toBe('flex');
      expect(toolbarStyle.flexWrap).toBe('wrap');
      expect(toolbarStyle.borderTopStyle).toBe('solid');
      expect(toolbarStyle.borderTopWidth).toBe('1px');
      expect(getComputedStyle(search).flexGrow).toBe('1');
      expect(getComputedStyle(search.querySelector('input') as HTMLElement).width).toBe('100%');
    });

    it('search_termTyped_showsOnlyMatchingRowsAndNoChips', async () => {
      // Arrange
      sellerTypesSignal.set([
        sellerType({ id: '1', name: 'Privat' }),
        sellerType({ id: '2', name: 'Händler' }),
      ]);
      const { fixture } = createPage();
      const input = toolbarOf(fixture).querySelector('input') as HTMLInputElement;

      // Act
      input.value = 'HÄ';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      const rowTexts = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'),
      ).map((row) => row.textContent ?? '');
      expect(rowTexts.length).toBe(1);
      expect(rowTexts[0]).toContain('Händler');
      expect(rowTexts[0]).not.toContain('Privat');
      expect((fixture.nativeElement as HTMLElement).querySelector('p-chip')).toBeNull();
    });

    it('search_termWithoutMatch_showsNoResultsHintInTable', async () => {
      // Arrange
      sellerTypesSignal.set([sellerType({ id: '1', name: 'Privat' })]);
      const { fixture } = createPage();
      const input = toolbarOf(fixture).querySelector('input') as HTMLInputElement;

      // Act
      input.value = 'zzz';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.app-table__empty')?.textContent?.trim(),
      ).toBe('Keine Verkäufer-Typen gefunden.');
    });

    it('table_noSellerTypesForNonAdmin_showsEmptyListHintMentioningPlus', () => {
      // Arrange
      sellerTypesSignal.set([]);
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();

      // Assert
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.app-table__empty')?.textContent?.trim(),
      ).toBe(
        'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
      );
    });
  });
});
