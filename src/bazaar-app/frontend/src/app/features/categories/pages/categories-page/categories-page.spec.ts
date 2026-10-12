import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CategoriesPage } from './categories-page';
import { CategoriesStore } from '../../categories-store';
import { RoleService } from '../../../../core/auth/role.service';
import { Category } from '../../data/categories-api';

function category(overrides: Partial<Category> = {}): Category {
  return { id: 'c1', name: 'Spielzeug', original: false, articleCount: 3, ...overrides };
}

describe('CategoriesPage', () => {
  let categoriesSignal: ReturnType<typeof signal<Category[]>>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;
  let load: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    categoriesSignal = signal<Category[]>([category()]);
    loadingSignal = signal(false);
    isAdminSignal = signal(true);
    load = vi.fn();
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [
        {
          provide: CategoriesStore,
          useValue: {
            categories: categoriesSignal,
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
    const fixture = TestBed.createComponent(CategoriesPage);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('calls categoriesStore.load() on construction', () => {
    createPage();
    expect(load).toHaveBeenCalled();
  });

  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    expect(component.emptyText()).toBe(
      'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
    );
  });

  describe('Filter', () => {
    function namesOf(component: CategoriesPage): string[] {
      return component.rows().map((row) => row.name);
    }

    it('rows_noFilterSet_showsAllCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();

      // Act
      const names = namesOf(component);

      // Assert
      expect(names).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_searchTermHoUppercase_showsOnlyHosen', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('HO');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen']);
    });

    it('rows_searchTermClearedToNull_showsAllCategoriesAgain', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();
      component.onSearchChange('HO');

      // Act
      component.onSearchChange(null);

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_originalFilterNew_showsOnlyNewCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Jacken']);
    });

    it('rows_originalFilterOriginal_showsOnlyOriginalCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('original');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen']);
    });

    it('rows_originalFilterClearedToNull_showsBothKinds', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();
      component.onOriginalFilterChange('new');

      // Act
      component.onOriginalFilterChange(null);

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_searchTermAndOriginalFilterSet_showsOnlyCategoriesMatchingBoth', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Hosentaschen', original: false }),
        category({ id: 'c3', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('hose');
      component.onOriginalFilterChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Hosentaschen']);
    });

    it('rows_filterChangedWhileSortActive_keepsChosenSortOrder', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hemden' }),
        category({ id: 'c2', name: 'Hosen' }),
        category({ id: 'c3', name: 'Jacken' }),
      ]);
      const { component } = createPage();
      component.onSortChange([{ field: 'name', order: 'desc' }]);

      // Act
      component.onSearchChange('h');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Hemden']);
    });

    it('emptyText_filterMatchesNothingButCategoriesExist_isNoResultsText', () => {
      // Arrange
      categoriesSignal.set([category({ id: 'c1', name: 'Hosen' })]);
      const { component } = createPage();

      // Act
      component.onSearchChange('xyz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Kategorien gefunden.');
    });

    it('emptyText_originalFilterMatchesNothingButCategoriesExist_isNoResultsText', () => {
      // Arrange
      categoriesSignal.set([category({ id: 'c1', name: 'Hosen', original: false })]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('original');

      // Assert
      expect(component.emptyText()).toBe('Keine Kategorien gefunden.');
    });

    it('emptyText_noCategoriesAndNoFilter_isEmptyListText', () => {
      // Arrange
      categoriesSignal.set([]);
      const { component } = createPage();

      // Act
      const text = component.emptyText();

      // Assert
      expect(text).toBe(
        'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
      );
    });
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
    const row = { ...category({ name: 'Bücher', original: true }), originalLabel: '✓ Original' };

    component.onActionClick({ actionId: 'edit', row });

    expect(component.popupVisible()).toBe(true);
    expect(component.popupMode()).toBe('edit');
    expect(component.popupInitialValue()).toEqual({ name: 'Bücher', original: true });
  });

  describe('save', () => {
    it('in create mode calls categoriesStore.create and shows a success toast', () => {
      create.mockReturnValue(of(category()));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Bücher', original: false });

      expect(create).toHaveBeenCalledWith('Bücher');
      expect(update).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Kategorie gespeichert' }),
      );
    });

    it('in edit mode calls categoriesStore.update with the editing category id', () => {
      update.mockReturnValue(of(undefined));
      const { component } = createPage();
      const row = { ...category(), originalLabel: 'Neu' };
      component.onActionClick({ actionId: 'edit', row });

      component.onPopupSave({ name: 'Spielzeug Neu', original: true });

      expect(update).toHaveBeenCalledWith('c1', 'Spielzeug Neu', true);
      expect(create).not.toHaveBeenCalled();
      expect(component.popupVisible()).toBe(false);
    });

    it('on category.name_taken keeps the popup open and shows an error toast', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { errorCode: 'category.name_taken' },
      });
      create.mockReturnValue(throwError(() => error));
      const { component } = createPage();
      component.onRowAdd();

      component.onPopupSave({ name: 'Spielzeug', original: false });

      expect(component.popupVisible()).toBe(true);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('delete', () => {
    it('on category.in_use shows an error toast', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { errorCode: 'category.in_use' },
      });
      remove.mockReturnValue(throwError(() => error));
      const { component } = createPage();

      component.onActionClick({
        actionId: 'delete',
        row: { ...category(), originalLabel: 'Neu' },
      });

      expect(remove).toHaveBeenCalledWith('c1');
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Kategorie wird noch verwendet' }),
      );
    });

    it('on success does not show a toast', () => {
      remove.mockReturnValue(of(undefined));
      const { component } = createPage();

      component.onActionClick({
        actionId: 'delete',
        row: { ...category(), originalLabel: 'Neu' },
      });

      expect(remove).toHaveBeenCalledWith('c1');
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('closes the popup and clears the editing category', () => {
      const { component } = createPage();
      component.onActionClick({ actionId: 'edit', row: { ...category(), originalLabel: 'Neu' } });

      component.onPopupCancel();

      expect(component.popupVisible()).toBe(false);
      expect(component.popupInitialValue()).toBeNull();
    });
  });

  describe('page header', () => {
    it('shows "Kategorien" as page title and "+ Neu" in the header, with no table title', () => {
      isAdminSignal.set(true);
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Kategorien');
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
