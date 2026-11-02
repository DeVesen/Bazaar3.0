import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AVERY_16_GEOMETRY } from '../../shared/components/label-sheet/label-geometry';
import { BlankLabelsStore } from './blank-labels-store';
import { BlankLabelsApi, SheetFormat } from './data/blank-labels-api';

function format(id: string, name: string, rows = 8): SheetFormat {
  return { ...AVERY_16_GEOMETRY, rows, id, name };
}

describe('BlankLabelsStore', () => {
  let api: { getFormats: ReturnType<typeof vi.fn>; saveFormat: ReturnType<typeof vi.fn>; deleteFormat: ReturnType<typeof vi.fn> };
  let store: BlankLabelsStore;

  beforeEach(() => {
    api = { getFormats: vi.fn(), saveFormat: vi.fn(), deleteFormat: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: BlankLabelsApi, useValue: api }] });
    store = TestBed.inject(BlankLabelsStore);
  });

  it('loadFormats_unsorted_keepsThemSortedByName', () => {
    // Arrange
    api.getFormats.mockReturnValue(of([format('B', 'Zweckform'), format('A', 'Avery 16er')]));

    // Act
    store.loadFormats();

    // Assert
    expect(store.formats().map((f) => f.name)).toEqual(['Avery 16er', 'Zweckform']);
  });

  it('saveFormat_newFormat_addsItSorted', () => {
    // Arrange
    api.getFormats.mockReturnValue(of([format('B', 'Zweckform')]));
    store.loadFormats();
    api.saveFormat.mockReturnValue(of(format('A', 'Avery 12er', 6)));

    // Act
    store.saveFormat({ ...AVERY_16_GEOMETRY, rows: 6, name: 'Avery 12er', overwrite: false }).subscribe();

    // Assert
    expect(store.formats().map((f) => f.name)).toEqual(['Avery 12er', 'Zweckform']);
  });

  it('saveFormat_overwrittenFormat_replacesItById', () => {
    // Arrange
    api.getFormats.mockReturnValue(of([format('A', 'Avery 12er', 8)]));
    store.loadFormats();
    api.saveFormat.mockReturnValue(of(format('A', 'Avery 12er', 6)));

    // Act
    store.saveFormat({ ...AVERY_16_GEOMETRY, rows: 6, name: 'Avery 12er', overwrite: true }).subscribe();

    // Assert
    expect(store.formats()).toEqual([format('A', 'Avery 12er', 6)]);
  });

  it('deleteFormat_existingId_removesIt', () => {
    // Arrange
    api.getFormats.mockReturnValue(of([format('A', 'Avery 12er')]));
    store.loadFormats();
    api.deleteFormat.mockReturnValue(of(undefined));

    // Act
    store.deleteFormat('A').subscribe();

    // Assert
    expect(store.formats()).toEqual([]);
  });
});
