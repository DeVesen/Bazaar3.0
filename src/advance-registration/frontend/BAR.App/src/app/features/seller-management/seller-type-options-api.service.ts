import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { SellerTypeOption } from '@shared/models/seller-type-option';

export type { SellerTypeOption };

/**
 * Duenne Read-only-Anlaufstelle fuer die Verkaeufer-Typ-Auswahl in den
 * Verkaeufer-Anlegen/Bearbeiten-Dialogen. Eigene Kopie statt geteiltem
 * Service ueber die Abteilungsgrenze hinweg - SellerManagement
 * importiert nie aus features/master-data (Cross-Feature-Import-Verbot).
 * Geteilt wird nur die Datenform (@shared/models/seller-type-option), nicht
 * die Service-Klasse.
 */
@Injectable({ providedIn: 'root' })
export class SellerTypeOptionsApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SellerTypeOption[]> {
    return this.http.get<SellerTypeOption[]>('/api/seller-types');
  }
}
