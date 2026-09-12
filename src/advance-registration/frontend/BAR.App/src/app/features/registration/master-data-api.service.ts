import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { MasterDataItem, MasterDataResource } from '@shared/models/master-data-item';

export type { MasterDataItem, MasterDataResource };

/**
 * Duennes Read+Create-Gegenstueck zu MasterData/MasterDataApiService, fuer
 * das Autocomplete-Popup bei der Artikelerfassung (Registration). Eigene Kopie
 * statt geteiltem Service ueber die Abteilungsgrenze hinweg - Registration
 * importiert nie aus features/master-data (Cross-Feature-Import-Verbot gilt
 * abteilungsuebergreifend genauso wie innerhalb einer Abteilung). Beide
 * Seiten teilen sich nur die Datenform (@shared/models/master-data-item),
 * nicht die Service-Klasse.
 */
@Injectable({ providedIn: 'root' })
export class MasterDataApiService {
  private readonly http = inject(HttpClient);

  getAll(resource: MasterDataResource): Observable<MasterDataItem[]> {
    return this.http.get<MasterDataItem[]>(`/api/${resource}`);
  }

  create(resource: MasterDataResource, name: string): Observable<MasterDataItem> {
    return this.http.post<MasterDataItem>(`/api/${resource}`, { name });
  }
}
