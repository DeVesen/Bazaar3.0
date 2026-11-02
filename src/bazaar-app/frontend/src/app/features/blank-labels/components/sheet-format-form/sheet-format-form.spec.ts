import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVERY_16_GEOMETRY } from '../../../../shared/components/label-sheet/label-geometry';
import { textsFromGeometry } from '../../model/sheet-format-rules';
import { SheetFormatForm } from './sheet-format-form';

async function render(inputs: Record<string, unknown> = {}): Promise<ComponentFixture<SheetFormatForm>> {
  const fixture = TestBed.createComponent(SheetFormatForm);
  fixture.componentRef.setInput('texts', textsFromGeometry(AVERY_16_GEOMETRY));
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture;
}

function fieldInput(fixture: ComponentFixture<SheetFormatForm>, field: string): HTMLInputElement {
  return (fixture.nativeElement as HTMLElement).querySelector(`input[data-field="${field}"]`) as HTMLInputElement;
}

function button(fixture: ComponentFixture<SheetFormatForm>, label: string): HTMLButtonElement {
  const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('p-button button'));
  return buttons.find((candidate) => candidate.textContent?.includes(label)) as HTMLButtonElement;
}

describe('SheetFormatForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SheetFormatForm] }).compileComponents();
  });

  it('render_avery16Texts_showsAllTwelveFieldsWithTheirValues', async () => {
    // Arrange & Act
    const fixture = await render({ perSheet: 16 });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('input[data-field]')).toHaveLength(12);
    expect(fieldInput(fixture, 'sheetWidth').value).toBe('210');
    expect(fieldInput(fixture, 'marginTop').value).toBe('8,5');
    expect(fieldInput(fixture, 'columns').value).toBe('2');
    expect(fieldInput(fixture, 'rows').value).toBe('8');
  });

  it('render_perSheet16_showsComputedCountAsText', async () => {
    // Arrange & Act
    const fixture = await render({ perSheet: 16 });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.sheet-format-form__per-sheet')?.textContent?.trim()).toBe(
      '16 Etiketten pro Seite',
    );
  });

  it('input_columns3_emitsFieldChange', async () => {
    // Arrange
    const fixture = await render();
    const changes = vi.fn();
    fixture.componentInstance.fieldChange.subscribe(changes);
    const columns = fieldInput(fixture, 'columns');

    // Act
    columns.value = '3';
    columns.dispatchEvent(new Event('input'));

    // Assert
    expect(changes).toHaveBeenCalledWith({ field: 'columns', text: '3' });
  });

  it('render_errorAtColumns_showsErrorAtThatField', async () => {
    // Arrange & Act
    const fixture = await render({ errors: { columns: 'Etiketten passen nicht in die Bogenbreite' } });

    // Assert
    const error = (fixture.nativeElement as HTMLElement).querySelector('[data-error-for="columns"]');
    expect(error?.textContent?.trim()).toBe('Etiketten passen nicht in die Bogenbreite');
  });

  it('render_canSaveFalse_disablesSave', async () => {
    // Arrange & Act
    const fixture = await render({ canSave: false });

    // Assert
    expect(button(fixture, 'Speichern').disabled).toBe(true);
  });

  it('click_saveWhenAllowed_emitsSave', async () => {
    // Arrange
    const fixture = await render({ canSave: true });
    const saves = vi.fn();
    fixture.componentInstance.save.subscribe(saves);

    // Act
    button(fixture, 'Speichern').click();

    // Assert
    expect(saves).toHaveBeenCalledTimes(1);
  });

  it('render_noSelectedFormat_disablesDelete', async () => {
    // Arrange & Act
    const fixture = await render({ selectedFormatId: null });

    // Assert
    expect(button(fixture, 'Löschen').disabled).toBe(true);
  });

  it('render_nameError_showsItBelowName', async () => {
    // Arrange & Act
    const fixture = await render({ nameError: 'Höchstens 50 Zeichen' });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-error-for="name"]')?.textContent?.trim()).toBe(
      'Höchstens 50 Zeichen',
    );
  });
});
