import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BrandsStore } from './brands-store';
import { Brand, BrandsApi } from './data/brands-api';

function brand(overrides: Partial<Brand> = {}): Brand {
  return { id: 'b1', name: 'Nike', original: false, articleCount: 0, ...overrides };
}

describe('BrandsStore', () => {
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
      providers: [{ provide: BrandsApi, useValue: { getAll, create, update, remove } }],
    });
  });

  function createStore() {
    return TestBed.inject(BrandsStore);
  }

  describe('load', () => {
    it('populates brands sorted by name ascending', () => {
      getAll.mockReturnValue(
        of([brand({ id: 'b2', name: 'Zebra' }), brand({ id: 'b1', name: 'Adidas' })]),
      );
      const store = createStore();

      store.load();

      expect(store.brands().map((b) => b.name)).toEqual(['Adidas', 'Zebra']);
      expect(store.loading()).toBe(false);
    });

    it('sets loading to false on error', () => {
      getAll.mockReturnValue(throwError(() => new Error('boom')));
      const store = createStore();

      store.load();

      expect(store.loading()).toBe(false);
      expect(store.brands()).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls the API and inserts the new brand, re-sorted', () => {
      getAll.mockReturnValue(of([brand({ id: 'b1', name: 'Nike' })]));
      create.mockReturnValue(of(brand({ id: 'b2', name: 'Adidas' })));
      const store = createStore();
      store.load();

      const next = vi.fn();
      store.create('Adidas').subscribe(next);

      expect(create).toHaveBeenCalledWith('Adidas');
      expect(next).toHaveBeenCalled();
      expect(store.brands().map((b) => b.name)).toEqual(['Adidas', 'Nike']);
    });
  });

  describe('update', () => {
    it('calls the API and patches the entry in place', () => {
      getAll.mockReturnValue(of([brand({ id: 'b1', name: 'Nike', original: false })]));
      update.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.update('b1', 'Nike Neu', true).subscribe();

      expect(update).toHaveBeenCalledWith('b1', 'Nike Neu', true);
      expect(store.brands()).toEqual([
        { id: 'b1', name: 'Nike Neu', original: true, articleCount: 0 },
      ]);
    });
  });

  describe('remove', () => {
    it('calls the API and removes the entry from the signal', () => {
      getAll.mockReturnValue(
        of([brand({ id: 'b1', name: 'Nike' }), brand({ id: 'b2', name: 'Adidas' })]),
      );
      remove.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.remove('b1').subscribe();

      expect(remove).toHaveBeenCalledWith('b1');
      expect(store.brands().map((b) => b.id)).toEqual(['b2']);
    });
  });
});
