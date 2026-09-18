import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SellerTypesStore } from './seller-types-store';
import { SellerType, SellerTypesApi } from './data/seller-types-api';

function sellerType(overrides: Partial<SellerType> = {}): SellerType {
  return { id: 't1', name: 'Standard', commissionRate: 10, itemFee: 0.5, sellerCount: 0, ...overrides };
}

describe('SellerTypesStore', () => {
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
      providers: [{ provide: SellerTypesApi, useValue: { getAll, create, update, remove } }],
    });
  });

  function createStore() {
    return TestBed.inject(SellerTypesStore);
  }

  describe('load', () => {
    it('populates sellerTypes sorted by name ascending', () => {
      getAll.mockReturnValue(
        of([sellerType({ id: 't2', name: 'Zubehör' }), sellerType({ id: 't1', name: 'Bücher' })]),
      );
      const store = createStore();

      store.load();

      expect(store.sellerTypes().map((s) => s.name)).toEqual(['Bücher', 'Zubehör']);
      expect(store.loading()).toBe(false);
    });

    it('sets loading to false on error', () => {
      getAll.mockReturnValue(throwError(() => new Error('boom')));
      const store = createStore();

      store.load();

      expect(store.loading()).toBe(false);
      expect(store.sellerTypes()).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls the API and inserts the new seller type, re-sorted', () => {
      getAll.mockReturnValue(of([sellerType({ id: 't1', name: 'Spielzeug' })]));
      create.mockReturnValue(of(sellerType({ id: 't2', name: 'Bücher' })));
      const store = createStore();
      store.load();

      const next = vi.fn();
      store.create('Bücher', 12, 1).subscribe(next);

      expect(create).toHaveBeenCalledWith('Bücher', 12, 1);
      expect(next).toHaveBeenCalled();
      expect(store.sellerTypes().map((s) => s.name)).toEqual(['Bücher', 'Spielzeug']);
    });
  });

  describe('update', () => {
    it('calls the API and patches the entry in place', () => {
      getAll.mockReturnValue(
        of([sellerType({ id: 't1', name: 'Spielzeug', commissionRate: 10, itemFee: 0.5 })]),
      );
      update.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.update('t1', 'Spielzeug Neu', 15, 1).subscribe();

      expect(update).toHaveBeenCalledWith('t1', 'Spielzeug Neu', 15, 1);
      expect(store.sellerTypes()).toEqual([
        { id: 't1', name: 'Spielzeug Neu', commissionRate: 15, itemFee: 1, sellerCount: 0 },
      ]);
    });
  });

  describe('remove', () => {
    it('calls the API and removes the entry from the signal', () => {
      getAll.mockReturnValue(
        of([sellerType({ id: 't1', name: 'Spielzeug' }), sellerType({ id: 't2', name: 'Bücher' })]),
      );
      remove.mockReturnValue(of(undefined));
      const store = createStore();
      store.load();

      store.remove('t1').subscribe();

      expect(remove).toHaveBeenCalledWith('t1');
      expect(store.sellerTypes().map((s) => s.id)).toEqual(['t2']);
    });
  });
});
