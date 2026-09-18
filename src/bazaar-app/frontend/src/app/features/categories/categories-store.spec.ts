import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CategoriesStore } from './categories-store';
import { Category, CategoriesApi } from './data/categories-api';

function category(overrides: Partial<Category> = {}): Category {
  return { id: 'c1', name: 'Spielzeug', original: false, articleCount: 0, ...overrides };
}

describe('CategoriesStore', () => {
  let getAll: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getAll = vi.fn();
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();

    TestBed.configureTestingModule({
      providers: [{ provide: CategoriesApi, useValue: { getAll, create, update, remove } }],
    });
  });

  function createStore() {
    return TestBed.inject(CategoriesStore);
  }

  describe('load', () => {
    it('populates categories sorted by name ascending', () => {
      getAll.mockReturnValue(
        of([category({ id: 'c2', name: 'Zubehör' }), category({ id: 'c1', name: 'Bücher' })]),
      );
      const store = createStore();

      store.load();

      expect(store.categories().map((c) => c.name)).toEqual(['Bücher', 'Zubehör']);
      expect(store.loading()).toBe(false);
    });

    it('sets loading to false on error', () => {
      getAll.mockReturnValue(throwError(() => new Error('boom')));
      const store = createStore();

      store.load();

      expect(store.loading()).toBe(false);
      expect(store.categories()).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls the API and inserts the new category, re-sorted', () => {
      getAll.mockReturnValue(of([category({ id: 'c1', name: 'Spielzeug' })]));
      create.mockReturnValue(of(category({ id: 'c2', name: 'Bücher' })));
      const store = createStore();
      store.load();

      const next = vi.fn();
      store.create('Bücher').subscribe(next);

      expect(create).toHaveBeenCalledWith('Bücher');
      expect(next).toHaveBeenCalled();
      expect(store.categories().map((c) => c.name)).toEqual(['Bücher', 'Spielzeug']);
    });
  });

  describe('update', () => {
    it('calls the API and patches the entry in place', () => {
      getAll.mockReturnValue(of([category({ id: 'c1', name: 'Spielzeug', original: false })]));
      update.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.update('c1', 'Spielzeug Neu', true).subscribe();

      expect(update).toHaveBeenCalledWith('c1', 'Spielzeug Neu', true);
      expect(store.categories()).toEqual([
        { id: 'c1', name: 'Spielzeug Neu', original: true, articleCount: 0 },
      ]);
    });
  });

  describe('remove', () => {
    it('calls the API and removes the entry from the signal', () => {
      getAll.mockReturnValue(
        of([category({ id: 'c1', name: 'Spielzeug' }), category({ id: 'c2', name: 'Bücher' })]),
      );
      remove.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.remove('c1').subscribe();

      expect(remove).toHaveBeenCalledWith('c1');
      expect(store.categories().map((c) => c.id)).toEqual(['c2']);
    });
  });
});
