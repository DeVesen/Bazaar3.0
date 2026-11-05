import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  BlankLabelsApi,
  LabelImageSummary,
  LabelPrintDefaults,
  SaveSheetFormatRequest,
  SheetFormat,
  UploadLabelImageRequest,
} from './data/blank-labels-api';

function sortedByName(formats: SheetFormat[]): SheetFormat[] {
  return [...formats].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Feature-Store des Etiketten-Vordrucks: hält die Bogenformate des Auswahlfelds nach Name
 * sortiert. Schreibende Aufrufe geben das `Observable` zurück, damit die Seite auf Erfolg und
 * Fehler (z. B. 409 → „Überschreiben?") selbst reagiert.
 */
@Injectable({ providedIn: 'root' })
export class BlankLabelsStore {
  private readonly api = inject(BlankLabelsApi);

  readonly formats = signal<SheetFormat[]>([]);

  loadFormats(): void {
    this.api.getFormats().subscribe({
      next: (formats) => this.formats.set(sortedByName(formats)),
      error: () => this.formats.set([]),
    });
  }

  /** Ein überschriebenes Format behält seine Id und ersetzt den bisherigen Eintrag. */
  saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat> {
    return this.api
      .saveFormat(request)
      .pipe(tap((saved) => this.formats.set(sortedByName([...this.formats().filter((f) => f.id !== saved.id), saved]))));
  }

  deleteFormat(id: string): Observable<void> {
    return this.api.deleteFormat(id).pipe(tap(() => this.formats.set(this.formats().filter((f) => f.id !== id))));
  }

  loadDefaults(): Observable<LabelPrintDefaults> {
    return this.api.getDefaults();
  }

  saveDefaults(defaults: LabelPrintDefaults): Observable<void> {
    return this.api.saveDefaults(defaults);
  }

  /** Bilder der Bibliothek, neueste zuerst. */
  readonly images = signal<LabelImageSummary[]>([]);
  /** Data-URLs der Vorschaubilder je Id; fehlt eine Id, lädt oder scheiterte ihr Bild. */
  readonly imageContents = signal<Record<string, string>>({});
  private readonly requestedImageIds = new Set<string>();

  /** Lädt die Liste und die Inhalte jedes Bilds einmal; ein Fehler bei einem Bild betrifft nur dieses. */
  loadImages(): void {
    this.api.getImages().subscribe({
      next: (images) => {
        this.images.set(images);
        images.forEach((image) => this.loadImageContent(image.id));
      },
      error: () => this.images.set([]),
    });
  }

  /** Ein inhaltsgleich vorhandenes Bild (Duplikat) ersetzt seinen Eintrag, statt doppelt zu erscheinen. */
  uploadImage(request: UploadLabelImageRequest): Observable<LabelImageSummary> {
    return this.api.uploadImage(request).pipe(
      tap((saved) => {
        this.images.set([saved, ...this.images().filter((image) => image.id !== saved.id)]);
        this.requestedImageIds.add(saved.id);
        this.imageContents.update((contents) => ({ ...contents, [saved.id]: request.dataUrl }));
      }),
    );
  }

  deleteImage(id: string): Observable<void> {
    return this.api.deleteImage(id).pipe(
      tap(() => {
        this.images.set(this.images().filter((image) => image.id !== id));
        this.requestedImageIds.delete(id);
        this.imageContents.update((contents) => Object.fromEntries(Object.entries(contents).filter(([contentId]) => contentId !== id)));
      }),
    );
  }

  private loadImageContent(id: string): void {
    if (this.requestedImageIds.has(id)) return;
    this.requestedImageIds.add(id);
    this.api.getImage(id).subscribe({
      next: (image) => this.imageContents.update((contents) => ({ ...contents, [id]: image.dataUrl })),
      error: () => this.requestedImageIds.delete(id),
    });
  }
}
