import { Component, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import type { AdminArticleResponse } from '../admin-articles-api.service';

@Component({
  selector: 'app-artikel-readonly-modal',
  imports: [DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule, ButtonModule],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" header="Artikel ansehen">
      @if (article(); as a) {
        <label>Verkäufer</label>
        <input pInputText [value]="a.seller.firstName + ' ' + a.seller.lastName + ' (#' + (a.seller.startNumber ?? '–') + ')'" [readonly]="true" />

        <label>Artikelnummer</label>
        <input pInputText [value]="a.number" [readonly]="true" />

        <label>Bezeichnung</label>
        <input pInputText [value]="a.name" [readonly]="true" />

        <label>Kategorie</label>
        <input pInputText [value]="a.category" [readonly]="true" />

        <label>Marke</label>
        <input pInputText [value]="a.brand" [readonly]="true" />

        <label>Größe</label>
        <input pInputText [value]="a.size ?? ''" [readonly]="true" />

        <label>Farbe</label>
        <input pInputText [value]="a.color ?? ''" [readonly]="true" />

        <label>Preis</label>
        <p-inputgroup>
          <input pInputText [value]="a.price" [readonly]="true" />
          <p-inputgroup-addon>€</p-inputgroup-addon>
        </p-inputgroup>

        <label>Beschreibung</label>
        <input pInputText [value]="a.description ?? ''" [readonly]="true" />
      }

      <div class="footer">
        <button pButton type="button" data-testid="close-button" (click)="visible.set(false)">Schließen</button>
      </div>
    </p-dialog>
  `
})
export class ArtikelReadonlyModal {
  readonly visible = model<boolean>(false);
  readonly article = input<AdminArticleResponse | null>(null);

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }
}
