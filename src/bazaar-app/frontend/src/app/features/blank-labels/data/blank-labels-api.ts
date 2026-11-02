import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabelGraphic } from '../../../shared/components/label-sheet/label-graphic';
import { LabelSheetGeometry } from '../../../shared/components/label-sheet/label-geometry';

export const SHEET_FORMATS_URL = '/api/label-sheet-formats';
export const PRINT_DEFAULTS_URL = '/api/label-print-defaults';
export const NAME_TAKEN_ERROR_CODE = 'label_sheet_format.name_taken';

/** Gespeichertes Bogenformat, flach wie im JSON-Vertrag. */
export interface SheetFormat extends LabelSheetGeometry {
  id: string;
  name: string;
}

export interface SaveSheetFormatRequest extends LabelSheetGeometry {
  name: string;
  /** true nach bestätigtem „Überschreiben?"; sonst antwortet ein vergebener Name mit 409. */
  overwrite: boolean;
}

/** Logo, Verkäufer-Symbol und Währungssymbol des letzten Drucks. */
export interface LabelPrintDefaults {
  logo: LabelGraphic | null;
  sellerSymbol: LabelGraphic | null;
  currencySymbol: string;
}

@Injectable({ providedIn: 'root' })
export class BlankLabelsApi {
  private readonly http = inject(HttpClient);

  getFormats(): Observable<SheetFormat[]> {
    return this.http.get<SheetFormat[]>(SHEET_FORMATS_URL);
  }

  saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat> {
    return this.http.post<SheetFormat>(SHEET_FORMATS_URL, request);
  }

  deleteFormat(id: string): Observable<void> {
    return this.http.delete<void>(`${SHEET_FORMATS_URL}/${encodeURIComponent(id)}`);
  }

  getDefaults(): Observable<LabelPrintDefaults> {
    return this.http.get<LabelPrintDefaults>(PRINT_DEFAULTS_URL);
  }

  saveDefaults(defaults: LabelPrintDefaults): Observable<void> {
    return this.http.put<void>(PRINT_DEFAULTS_URL, defaults);
  }
}
