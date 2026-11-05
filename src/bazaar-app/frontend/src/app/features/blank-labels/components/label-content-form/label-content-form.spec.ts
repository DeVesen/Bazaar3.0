import { ComponentFixture, TestBed } from '@angular/core/testing';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { By } from '@angular/platform-browser';
import { INITIAL_CONTENT_TEXTS } from '../../model/label-content-rules';
import { GraphicPicker } from '../graphic-picker/graphic-picker';
import { LabelContentFieldChange, LabelContentForm } from './label-content-form';

async function render(inputs: Record<string, unknown> = {}): Promise<ComponentFixture<LabelContentForm>> {
  const fixture = TestBed.createComponent(LabelContentForm);
  fixture.componentRef.setInput('texts', INITIAL_CONTENT_TEXTS);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture;
}

function fieldInput(fixture: ComponentFixture<LabelContentForm>, field: string): HTMLInputElement {
  return (fixture.nativeElement as HTMLElement).querySelector(`input[data-field="${field}"]`) as HTMLInputElement;
}

function pickers(fixture: ComponentFixture<LabelContentForm>): GraphicPicker[] {
  return fixture.debugElement.queryAll(By.directive(GraphicPicker)).map((debug) => debug.componentInstance as GraphicPicker);
}

describe('LabelContentForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelContentForm] }).compileComponents();
  });

  it('render_firstOpen_showsEmptyNumbersEuroAndNoGraphics', async () => {
    // Arrange & Act
    const fixture = await render();

    // Assert
    expect(fieldInput(fixture, 'startNumber').value).toBe('');
    expect(fieldInput(fixture, 'count').value).toBe('');
    expect(fieldInput(fixture, 'currencySymbol').value).toBe('€');
    expect(pickers(fixture).map((picker) => picker.value())).toEqual([null, null]);
  });

  it('render_errorsAtStartNumberAndCount_showsBothErrors', async () => {
    // Arrange & Act
    const fixture = await render({ errors: { startNumber: 'Pflichtfeld', count: 'Pflichtfeld' } });

    // Assert
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-error-for="startNumber"]')?.textContent?.trim()).toBe('Pflichtfeld');
    expect(root.querySelector('[data-error-for="count"]')?.textContent?.trim()).toBe('Pflichtfeld');
  });

  it('render_always_showsSizeFieldsAfterCurrencyAndBeforeGraphicPickers', async () => {
    // Arrange & Act
    const fixture = await render();

    // Assert
    const root = fixture.nativeElement as HTMLElement;
    const fields = Array.from(root.querySelectorAll('input[data-field]')).map((input) => input.getAttribute('data-field'));
    expect(fields).toEqual(['startNumber', 'count', 'currencySymbol', 'qrCodeSize', 'sellerSymbolSize', 'numberHeight', 'currencyHeight']);
    const labels = Array.from(root.querySelectorAll('.label-content-form__field label')).map((label) => label.textContent?.trim());
    expect(labels.slice(3)).toEqual([
      'Größe QR-Code (mm)',
      'Größe Verkäufer-Symbol (mm)',
      'Höhe Artikel-Nummer (mm)',
      'Höhe Währungssymbol (mm)',
    ]);
    expect(fieldInput(fixture, 'qrCodeSize').value).toBe('21,5');
    const lastSizeField = fieldInput(fixture, 'currencyHeight');
    const firstPicker = root.querySelector('app-graphic-picker') as HTMLElement;
    expect(lastSizeField.compareDocumentPosition(firstPicker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(['qrCodeSize', 'sellerSymbolSize', 'numberHeight', 'currencyHeight'])(
    'render_errorAt%s_showsErrorAtThatFieldOnly',
    async (field) => {
      // Arrange
      const message = 'Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle';

      // Act
      const fixture = await render({ errors: { [field]: message } });

      // Assert
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector(`[data-error-for="${field}"]`)?.textContent?.trim()).toBe(message);
      expect(root.querySelectorAll('[data-error-for]')).toHaveLength(1);
    },
  );

  it('input_qrCodeSize18_emitsFieldChange', async () => {
    // Arrange
    const fixture = await render();
    const changes: LabelContentFieldChange[] = [];
    outputToObservable(fixture.componentInstance.fieldChange).subscribe((change) => changes.push(change));
    const qrCodeSize = fieldInput(fixture, 'qrCodeSize');

    // Act
    qrCodeSize.value = '18';
    qrCodeSize.dispatchEvent(new Event('input'));

    // Assert
    expect(changes).toEqual([{ field: 'qrCodeSize', text: '18' }]);
  });

  it('input_startNumber1000_emitsFieldChange', async () => {
    // Arrange
    const fixture = await render();
    const changes = vi.fn();
    fixture.componentInstance.fieldChange.subscribe(changes);
    const startNumber = fieldInput(fixture, 'startNumber');

    // Act
    startNumber.value = '1000';
    startNumber.dispatchEvent(new Event('input'));

    // Assert
    expect(changes).toHaveBeenCalledWith({ field: 'startNumber', text: '1000' });
  });

  it('pickIcon_sellerSymbolPicker_emitsSellerSymbolChange', async () => {
    // Arrange
    const fixture = await render();
    const changes = vi.fn();
    fixture.componentInstance.sellerSymbolChange.subscribe(changes);
    const [sellerSymbolPicker] = pickers(fixture);

    // Act
    sellerSymbolPicker.valueChange.emit({ kind: 'icon', value: 'heart' });

    // Assert
    expect(changes).toHaveBeenCalledWith({ kind: 'icon', value: 'heart' });
  });

  it('chooseFile_logoPicker_emitsImageChosenForLogo', async () => {
    // Arrange
    const fixture = await render();
    const choices = vi.fn();
    fixture.componentInstance.imageChosen.subscribe(choices);
    const [, logoPicker] = pickers(fixture);
    const file = new File(['x'], 'logo.png', { type: 'image/png' });

    // Act
    logoPicker.fileChosen.emit(file);

    // Assert
    expect(choices).toHaveBeenCalledWith({ target: 'logo', file });
  });

  it('selectLibraryImage_logoPicker_emitsLogoChangeWithImage', async () => {
    // Arrange
    const fixture = await render();
    const changes = vi.fn();
    fixture.componentInstance.logoChange.subscribe(changes);
    const [, logoPicker] = pickers(fixture);

    // Act
    logoPicker.imageSelected.emit({ kind: 'image', value: 'data:image/png;base64,AAAA' });

    // Assert
    expect(changes).toHaveBeenCalledWith({ kind: 'image', value: 'data:image/png;base64,AAAA' });
  });

  it('requestDelete_libraryImage_emitsImageDeleteRequestedWithId', async () => {
    // Arrange
    const fixture = await render();
    const requests = vi.fn();
    fixture.componentInstance.imageDeleteRequested.subscribe(requests);
    const [sellerSymbolPicker] = pickers(fixture);

    // Act
    sellerSymbolPicker.imageDeleteRequested.emit('LIM00001');

    // Assert
    expect(requests).toHaveBeenCalledWith('LIM00001');
  });

  it('render_libraryImages_passedToBothPickers', async () => {
    // Arrange
    const libraryImages = [{ id: 'A', name: 'Sonne', dataUrl: 'data:image/png;base64,AAAA' }];

    // Act
    const fixture = await render({ libraryImages });

    // Assert
    expect(pickers(fixture).map((picker) => picker.libraryImages())).toEqual([libraryImages, libraryImages]);
  });
});
