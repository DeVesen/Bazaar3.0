import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';
import { LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
import { GraphicPicker } from './graphic-picker';

async function render(value: LabelGraphic | null): Promise<ComponentFixture<GraphicPicker>> {
  const fixture = TestBed.createComponent(GraphicPicker);
  fixture.componentRef.setInput('label', 'Logo');
  fixture.componentRef.setInput('value', value);
  await fixture.whenStable();
  return fixture;
}

function iconButton(fixture: ComponentFixture<GraphicPicker>, key: string): HTMLButtonElement {
  return (fixture.nativeElement as HTMLElement).querySelector(`button[data-icon="${key}"]`) as HTMLButtonElement;
}

describe('GraphicPicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GraphicPicker] }).compileComponents();
  });

  it('click_starIcon_emitsStarIcon', async () => {
    // Arrange
    const fixture = await render(null);
    const changes = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changes);

    // Act
    iconButton(fixture, 'star').click();

    // Assert
    expect(changes).toHaveBeenCalledWith({ kind: 'icon', value: 'star' });
  });

  it('click_none_emitsNull', async () => {
    // Arrange
    const fixture = await render({ kind: 'icon', value: 'star' });
    const changes = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changes);

    // Act
    iconButton(fixture, 'none').click();

    // Assert
    expect(changes).toHaveBeenCalledWith(null);
  });

  it('selectedIconKey_starValue_returnsStar', async () => {
    // Arrange & Act
    const fixture = await render({ kind: 'icon', value: 'star' });

    // Assert
    expect(fixture.componentInstance.selectedIconKey()).toBe('star');
  });

  it('filesChosen_png_emitsFileChosen', async () => {
    // Arrange
    const fixture = await render(null);
    const files = vi.fn();
    fixture.componentInstance.fileChosen.subscribe(files);
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const dropzone = fixture.debugElement.query(By.directive(FileDropzone)).componentInstance as FileDropzone;

    // Act
    dropzone.filesChosen.emit([file]);

    // Assert
    expect(files).toHaveBeenCalledWith(file);
  });

  it('render_imageValue_showsCurrentImage', async () => {
    // Arrange & Act
    const fixture = await render({ kind: 'image', value: 'data:image/png;base64,AAAA' });

    // Assert
    const image = (fixture.nativeElement as HTMLElement).querySelector('.graphic-picker__current img');
    expect(image?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
  });
});
