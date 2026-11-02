import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BlankLabelsApi, LabelPrintDefaults, SaveSheetFormatRequest, SheetFormat } from './data/blank-labels-api';

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
}
