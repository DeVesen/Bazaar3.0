import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
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
    brandsSignal.set([]);
    const { component } = createPage();
    expect(component.emptyText()).toBe(
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

  describe('filter', () => {
    const nike = brand({ id: 'b1', name: 'Nike', original: true, articleCount: 5 });
    const adidas = brand({ id: 'b2', name: 'Adidas', original: false, articleCount: 2 });
    const nikita = brand({ id: 'b3', name: 'Nikita', original: false, articleCount: 9 });

    function namesOf(component: BrandsPage): string[] {
      return component.rows().map((row) => row.name);
    }

    it('rows_noFilterSet_showsAllBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      const names = namesOf(component);

      // Assert
      expect(names).toEqual(['Nike', 'Adidas']);
    });

    it('rows_searchTermInUpperCase_showsOnlyBrandsContainingItIgnoringCase', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('NI');

      // Assert
      expect(namesOf(component)).toEqual(['Nike']);
    });

    it('rows_searchTermIsPartOfName_matchesInTheMiddleOfTheName', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('did');

      // Assert
      expect(namesOf(component)).toEqual(['Adidas']);
    });

    it('rows_originalFilterNew_showsOnlyNewBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onOriginalChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Adidas']);
    });

    it('rows_originalFilterOriginal_showsOnlyOriginalBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onOriginalChange('original');

      // Assert
      expect(namesOf(component)).toEqual(['Nike']);
    });

    it('onOriginalChange_valueCleared_showsBrandsOfBothKindsAgain', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();
      component.onOriginalChange('new');

      // Act
      component.onOriginalChange(null);

      // Assert
      expect(component.originalFilter()).toBeNull();
      expect(namesOf(component)).toEqual(['Nike', 'Adidas']);
    });

    it('rows_searchTermAndOriginalFilterSet_showsOnlyBrandsMatchingBoth', () => {
      // Arrange
      brandsSignal.set([nike, adidas, nikita]);
      const { component } = createPage();

      // Act
      component.onSearchChange('ni');
      component.onOriginalChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Nikita']);
    });

    it('rows_filterChangedAfterSortChosen_keepsChosenSort', () => {
      // Arrange
      brandsSignal.set([nike, adidas, nikita]);
      const { component } = createPage();
      component.onSortChange([{ field: 'articleCount', order: 'desc' }]);

      // Act
      component.onSearchChange('ni');

      // Assert
      expect(namesOf(component)).toEqual(['Nikita', 'Nike']);
    });

    it('emptyText_brandsExistButFilterMatchesNone_isNotFoundHint', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('zzz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Marken gefunden.');
    });

    it('emptyText_noBrandsAndNoFilter_isEmptyListHint', () => {
      // Arrange
      brandsSignal.set([]);
      const { component } = createPage();

      // Act
      const text = component.emptyText();

      // Assert
      expect(text).toBe(
        'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
      );
    });
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

  describe('filter toolbar', () => {
    function toolbarOf(fixture: ComponentFixture<BrandsPage>): HTMLElement {
      return fixture.nativeElement.querySelector('.brands-page__toolbar') as HTMLElement;
    }

    function selectOf(fixture: ComponentFixture<BrandsPage>): Select {
      return fixture.debugElement.query(By.directive(Select)).componentInstance as Select;
    }

    it('render_pageOpened_showsSingleToolbarAboveTableAndNoHeaderButton', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('.brands-page__toolbar').length).toBe(1);
      expect(toolbarOf(fixture).nextElementSibling?.tagName).toBe('APP-TABLE');
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Marken');
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
      expect(el.querySelector('p-chip')).toBeNull();
    });

    it('render_admin_showsPlusIconButtonWithoutTextAsFirstToolbarElement', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const addButton = toolbar.firstElementChild as HTMLElement;

      // Assert
      expect(toolbar.querySelectorAll('p-button').length).toBe(1);
      expect(addButton.matches('p-button.brands-page__add')).toBe(true);
      expect(addButton.querySelector('button')?.textContent?.trim()).toBe('');
      expect(addButton.querySelector('.pi-plus')).not.toBeNull();
    });

    it('render_admin_plusButtonHasHintNeueMarke', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const addButton = toolbarOf(fixture).querySelector('p-button.brands-page__add') as HTMLElement;

      // Assert
      expect(addButton.querySelector('button')?.getAttribute('aria-label')).toBe('Neue Marke');
      expect(addButton.getAttribute('pTooltip')).toBe('Neue Marke');
    });

    it('plusButtonClick_admin_opensCreatePopup', () => {
      // Arrange
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      // Act
      (
        toolbarOf(fixture).querySelector('p-button.brands-page__add button') as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      // Assert
      expect(component.popupVisible()).toBe(true);
      expect(component.popupMode()).toBe('create');
    });

    it('render_nonAdmin_hasNoCreateButtonAndSearchStartsAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(toolbarOf(fixture).querySelector('p-button')).toBeNull();
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(toolbarOf(fixture).firstElementChild?.tagName).toBe('P-ICONFIELD');
    });

    it('render_always_searchFieldFillsRemainingSpaceWithPlaceholder', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const search = toolbarOf(fixture).querySelector('.brands-page__search') as HTMLElement;
      const input = search.querySelector('input') as HTMLInputElement;

      // Assert
      expect(input.getAttribute('placeholder')).toBe('Suche nach Name …');
      expect(getComputedStyle(search).flexGrow).toBe('1');
      expect(getComputedStyle(search).minWidth).toBe('0px');
    });

    it('render_always_selectIsLastToolbarElementWithMinWidth150AndNoShrink', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const select = toolbar.lastElementChild as HTMLElement;

      // Assert
      expect(toolbar.querySelectorAll('p-select').length).toBe(1);
      expect(select.matches('p-select.brands-page__original')).toBe(true);
      expect(getComputedStyle(select).minWidth).toBe('150px');
      expect(getComputedStyle(select).flexShrink).toBe('0');
    });

    it('render_always_hasNoVisibleLabelAndSelectHasScreenReaderName', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();

      // Assert
      expect(toolbarOf(fixture).querySelectorAll('label').length).toBe(0);
      expect(selectOf(fixture).ariaLabel()).toBe('Original');
    });

    it('render_noValueChosen_selectShowsAllPlaceholderAndOffersBothValues', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const select = selectOf(fixture);

      // Assert
      expect(select.placeholder()).toBe('Alle');
      expect(select.showClear()).toBe(true);
      expect(select.options()).toEqual([
        { label: '✓ Original', value: 'original' },
        { label: 'Neu', value: 'new' },
      ]);
    });

    it('optionSelect_neuChosen_tableShowsOnlyNewBrands', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike', original: true }),
        brand({ id: 'b2', name: 'Adidas', original: false }),
      ]);
      const { fixture, component } = createPage();

      // Act
      selectOf(fixture).onOptionSelect(new Event('click'), { label: 'Neu', value: 'new' });

      // Assert
      expect(component.originalFilter()).toBe('new');
      expect(component.rows().map((row) => row.name)).toEqual(['Adidas']);
    });

    it('clear_valueChosen_resetsFilterAndShowsBrandsOfBothKinds', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike', original: true }),
        brand({ id: 'b2', name: 'Adidas', original: false }),
      ]);
      const { fixture, component } = createPage();
      selectOf(fixture).onOptionSelect(new Event('click'), { label: 'Neu', value: 'new' });

      // Act
      selectOf(fixture).clear(new Event('click'));

      // Assert
      expect(component.originalFilter()).toBeNull();
      expect(component.rows().map((row) => row.name)).toEqual(['Nike', 'Adidas']);
    });

    it('typing_niInSearchField_tableShowsOnlyNikeImmediately', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike' }),
        brand({ id: 'b2', name: 'Adidas' }),
      ]);
      const { fixture, component } = createPage();
      const input = toolbarOf(fixture).querySelector('.brands-page__search input') as HTMLInputElement;

      // Act
      input.value = 'NI';
      input.dispatchEvent(new Event('input'));

      // Assert
      expect(component.searchTerm()).toBe('NI');
      expect(component.rows().map((row) => row.name)).toEqual(['Nike']);
    });

    it('render_always_toolbarWrapsOntoFurtherLinesInNarrowWindows', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);

      // Assert
      expect(getComputedStyle(toolbar).display).toBe('flex');
      expect(getComputedStyle(toolbar).flexWrap).toBe('wrap');
    });
  });
});
