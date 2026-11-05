import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AVERY_16_GEOMETRY } from '../../shared/components/label-sheet/label-geometry';
import { BlankLabelsStore } from './blank-labels-store';
import { BlankLabelsApi, LabelImageSummary, SheetFormat } from './data/blank-labels-api';

function image(id: string, name: string): LabelImageSummary {
  return { id, name, mediaType: 'image/png', sizeBytes: 3, createdAt: '2026-11-05T10:00:00Z' };
}

function format(id: string, name: string, rows = 8): SheetFormat {
  return { ...AVERY_16_GEOMETRY, rows, id, name };
}

describe('BlankLabelsStore', () => {
  let api: {
    getFormats: ReturnType<typeof vi.fn>;
    saveFormat: ReturnType<typeof vi.fn>;
    deleteFormat: ReturnType<typeof vi.fn>;
    getImages: ReturnType<typeof vi.fn>;
    getImage: ReturnType<typeof vi.fn>;
    uploadImage: ReturnType<typeof vi.fn>;
    deleteImage: ReturnType<typeof vi.fn>;
  };
  let store: BlankLabelsStore;

  beforeEach(() => {
    api = {
      getFormats: vi.fn(),
      saveFormat: vi.fn(),
      deleteFormat: vi.fn(),
      getImages: vi.fn(),
      getImage: vi.fn(),
      uploadImage: vi.fn(),
      deleteImage: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: BlankLabelsApi, useValue: api }] });
    store = TestBed.inject(BlankLabelsStore);
  });

  it('loadImages_list_keepsOrderAndLoadsEachContentOnce', () => {
    // Arrange
    api.getImages.mockReturnValue(of([image('B', 'Neu'), image('A', 'Alt')]));
    api.getImage.mockImplementation((id: string) => of({ id, name: id, dataUrl: `data:image/png;base64,${id}` }));

    // Act
    store.loadImages();
    store.loadImages();

    // Assert
    expect(store.images().map((i) => i.id)).toEqual(['B', 'A']);
    expect(store.imageContents()).toEqual({ A: 'data:image/png;base64,A', B: 'data:image/png;base64,B' });
    expect(api.getImage).toHaveBeenCalledTimes(2);
  });

  it('loadImages_oneContentFails_otherImagesStillLoad', () => {
    // Arrange
    api.getImages.mockReturnValue(of([image('A', 'Alt'), image('B', 'Neu')]));
    api.getImage.mockImplementation((id: string) =>
      id === 'A' ? throwError(() => new Error('offline')) : of({ id, name: id, dataUrl: 'data:image/png;base64,B' }),
    );

    // Act
    store.loadImages();

    // Assert
    expect(store.images()).toHaveLength(2);
    expect(store.imageContents()).toEqual({ B: 'data:image/png;base64,B' });
  });

  it('loadImages_listFails_leavesEmptyList', () => {
    // Arrange
    api.getImages.mockReturnValue(throwError(() => new Error('offline')));

    // Act
    store.loadImages();

    // Assert
    expect(store.images()).toEqual([]);
  });

  it('uploadImage_newImage_isAddedFirstWithItsContentWithoutReload', () => {
    // Arrange
    api.getImages.mockReturnValue(of([image('A', 'Alt')]));
    api.getImage.mockReturnValue(of({ id: 'A', name: 'Alt', dataUrl: 'data:image/png;base64,A' }));
    store.loadImages();
    api.uploadImage.mockReturnValue(of(image('B', 'Neu')));

    // Act
    store.uploadImage({ name: 'Neu', dataUrl: 'data:image/png;base64,B' }).subscribe();

    // Assert
    expect(store.images().map((i) => i.id)).toEqual(['B', 'A']);
    expect(store.imageContents()['B']).toBe('data:image/png;base64,B');
    expect(api.getImage).toHaveBeenCalledTimes(1);
  });

  it('uploadImage_duplicateAlreadyInList_isNotAddedTwice', () => {
    // Arrange
    api.getImages.mockReturnValue(of([image('A', 'Alt')]));
    api.getImage.mockReturnValue(of({ id: 'A', name: 'Alt', dataUrl: 'data:image/png;base64,A' }));
    store.loadImages();
    api.uploadImage.mockReturnValue(of(image('A', 'Alt')));

    // Act
    store.uploadImage({ name: 'Alt', dataUrl: 'data:image/png;base64,A' }).subscribe();

    // Assert
    expect(store.images()).toHaveLength(1);
  });

  it('deleteImage_existingImage_removesListEntryAndContent', () => {
    // Arrange
    api.getImages.mockReturnValue(of([image('A', 'Alt'), image('B', 'Neu')]));
    api.getImage.mockImplementation((id: string) => of({ id, name: id, dataUrl: `data:image/png;base64,${id}` }));
    store.loadImages();
    api.deleteImage.mockReturnValue(of(undefined));

    // Act
    store.deleteImage('A').subscribe();

    // Assert
    expect(store.images().map((i) => i.id)).toEqual(['B']);
    expect(store.imageContents()).toEqual({ B: 'data:image/png;base64,B' });
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
