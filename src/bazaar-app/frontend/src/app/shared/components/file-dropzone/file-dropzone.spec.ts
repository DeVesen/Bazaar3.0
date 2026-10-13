import { TestBed } from '@angular/core/testing';
import { FileDropzone } from './file-dropzone';

function createFile(name: string): File {
  return new File(['x'], name);
}

function dropEvent(files: File[]): Event {
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  return event;
}

describe('FileDropzone', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileDropzone] }).compileComponents();
  });

  async function createZone() {
    const fixture = TestBed.createComponent(FileDropzone);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const chosen = vi.fn();
    fixture.componentInstance.filesChosen.subscribe(chosen);
    return { fixture, host, chosen };
  }

  it('onDrop_OneFile_EmitsFilesChosenWithThatFile', async () => {
    // Arrange
    const { host, chosen } = await createZone();
    const file = createFile('artikel.csv');

    // Act
    host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent([file]));

    // Assert
    expect(chosen).toHaveBeenCalledWith([file]);
  });

  it('onDrop_TwoFiles_EmitsBothFiles', async () => {
    // Arrange
    const { host, chosen } = await createZone();
    const files = [createFile('a.csv'), createFile('b.csv')];

    // Act
    host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent(files));

    // Assert
    expect(chosen).toHaveBeenCalledWith(files);
  });

  it('onDrop_WhileDisabled_EmitsNothing', async () => {
    // Arrange
    const { fixture, host, chosen } = await createZone();
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    // Act
    host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent([createFile('a.csv')]));

    // Assert
    expect(chosen).not.toHaveBeenCalled();
  });

  it('onInputChange_FileSelectedInDialog_EmitsFilesChosen', async () => {
    // Arrange
    const { host, chosen } = await createZone();
    const file = createFile('artikel.xlsx');
    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    // Act
    input.dispatchEvent(new Event('change'));

    // Assert
    expect(chosen).toHaveBeenCalledWith([file]);
  });

  it('onInputChange_NoFileSelected_EmitsNothing', async () => {
    // Arrange
    const { host, chosen } = await createZone();
    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [], configurable: true });

    // Act
    input.dispatchEvent(new Event('change'));

    // Assert
    expect(chosen).not.toHaveBeenCalled();
  });

  it('render_AcceptInput_SetsAcceptAttributeOnFileInput', async () => {
    // Arrange
    const { fixture, host } = await createZone();

    // Act
    fixture.componentRef.setInput('accept', '.xlsx,.xls,.csv');
    await fixture.whenStable();

    // Assert
    expect(host.querySelector('input[type="file"]')?.getAttribute('accept')).toBe('.xlsx,.xls,.csv');
  });

  it('onDragOver_FileOverZone_MarksZoneActive', async () => {
    // Arrange
    const { fixture, host } = await createZone();

    // Act
    host.querySelector('.file-dropzone')!.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    // Assert
    expect(host.querySelector('.file-dropzone--active')).not.toBeNull();
  });
});
