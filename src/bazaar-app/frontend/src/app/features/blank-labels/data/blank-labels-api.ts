import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabelGraphic } from '../../../shared/components/label-sheet/label-graphic';
import { LabelSheetGeometry } from '../../../shared/components/label-sheet/label-geometry';
import { LabelElementSizes } from '../../../shared/components/label-sheet/label-layout';

export const SHEET_FORMATS_URL = '/api/label-sheet-formats';
export const PRINT_DEFAULTS_URL = '/api/label-print-defaults';
export const NAME_TAKEN_ERROR_CODE = 'label_sheet_format.name_taken';
export const LABEL_IMAGES_URL = '/api/label-images';
export const LIBRARY_FULL_ERROR_CODE = 'label_image.library_full';

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

/** Logo, Verkäufer-Symbol, Währungssymbol und Elementgrößen (mm) des letzten Drucks, wie im JSON-Vertrag. */
export interface LabelPrintDefaults {
  logo: LabelGraphic | null;
  sellerSymbol: LabelGraphic | null;
  currencySymbol: string;
  sizes: LabelElementSizes;
}

/** Bild der Bibliothek ohne Inhalt (Liste). */
export interface LabelImageSummary {
  id: string;
  name: string;
  mediaType: string;
  sizeBytes: number;
  createdAt: string;
}

/** Inhalt eines Bibliotheksbilds als Data-URL. */
export interface LabelImageContent {
  id: string;
  name: string;
  dataUrl: string;
}

export interface UploadLabelImageRequest {
  name: string;
  dataUrl: string;
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

  /** Neueste zuerst, ohne Bildinhalt. */
  getImages(): Observable<LabelImageSummary[]> {
    return this.http.get<LabelImageSummary[]>(LABEL_IMAGES_URL);
  }

  getImage(id: string): Observable<LabelImageContent> {
    return this.http.get<LabelImageContent>(`${LABEL_IMAGES_URL}/${encodeURIComponent(id)}`);
  }

  /** 201 für ein neues, 200 für ein inhaltsgleich vorhandenes Bild — beide liefern den Eintrag. */
  uploadImage(request: UploadLabelImageRequest): Observable<LabelImageSummary> {
    return this.http.post<LabelImageSummary>(LABEL_IMAGES_URL, request);
  }

  deleteImage(id: string): Observable<void> {
    return this.http.delete<void>(`${LABEL_IMAGES_URL}/${encodeURIComponent(id)}`);
  }
}
