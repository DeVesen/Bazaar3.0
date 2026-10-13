import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

/**
 * Leaf-Wrapper: Ablagefläche für Drag & Drop und Klick mit Dateidialog. Meldet nur die gewählten Dateien —
 * Typ und Anzahl prüft der Aufrufer, damit er eigene Hinweise zeigen kann (PrimeNG `p-fileupload` filtert
 * ungültige Auswahl selbst und kennt diese Hinweise nicht).
 */
@Component({
  selector: 'app-file-dropzone',
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropzone {
  readonly accept = input<string>('');
  readonly disabled = input<boolean>(false);

  readonly filesChosen = output<File[]>();

  readonly dragOver = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  openFileDialog(): void {
    if (this.disabled()) return;
    this.fileInput().nativeElement.click();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    // Dieselbe Datei muss nach einer Ablehnung erneut wählbar sein.
    input.value = '';
    this.emitIfAny(files);
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) return;
    this.emitIfAny(Array.from(event.dataTransfer?.files ?? []));
  }

  private emitIfAny(files: File[]): void {
    if (files.length === 0) return;
    this.filesChosen.emit(files);
  }
}
