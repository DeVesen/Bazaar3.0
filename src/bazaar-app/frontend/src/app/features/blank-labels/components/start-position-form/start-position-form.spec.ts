import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartPositionForm } from './start-position-form';

async function render(inputs: Record<string, unknown>): Promise<ComponentFixture<StartPositionForm>> {
  const fixture = TestBed.createComponent(StartPositionForm);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture;
}

describe('StartPositionForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StartPositionForm] }).compileComponents();
  });

  it('render_perSheet16_showsRangeHelp', async () => {
    // Arrange & Act
    const fixture = await render({ perSheet: 16 });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.start-position-form__help')?.textContent?.trim()).toBe(
      'Platz 1 bis 16, leer = Platz 1',
    );
  });

  it('render_error_showsItAtTheField', async () => {
    // Arrange & Act
    const fixture = await render({ perSheet: 16, text: '17', error: 'Platz 1 bis 16' });

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-error-for="startPosition"]')?.textContent?.trim()).toBe(
      'Platz 1 bis 16',
    );
  });

  it('input_seven_emitsTextChange', async () => {
    // Arrange
    const fixture = await render({ perSheet: 16 });
    const changes = vi.fn();
    fixture.componentInstance.textChange.subscribe(changes);
    const field = (fixture.nativeElement as HTMLElement).querySelector('#start-position') as HTMLInputElement;

    // Act
    field.value = '7';
    field.dispatchEvent(new Event('input'));

    // Assert
    expect(changes).toHaveBeenCalledWith('7');
  });
});
