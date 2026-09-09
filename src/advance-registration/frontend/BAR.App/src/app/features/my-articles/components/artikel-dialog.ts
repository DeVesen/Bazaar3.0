import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AutocompleteCreate } from '../../../shared/autocomplete-create/autocomplete-create';
import { ArticlesApiService, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';

@Component({
  selector: 'app-artikel-dialog',
  imports: [
    FormsModule, DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule,
    InputNumberModule, ButtonModule, TextareaModule, AutocompleteCreate
  ],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="mode() === 'create' ? 'Artikel anlegen' : 'Artikel bearbeiten'">
      <label>Artikelnummer</label>
      <input pInputText [value]="number()" [readonly]="true" />
      @if (mode() === 'create') {
        <p class="hint">wird beim Speichern endgültig vergeben</p>
      }

      <label>Bezeichnung</label>
      <input pInputText [(ngModel)]="nameModel" />

      <label>Kategorie</label>
      <app-autocomplete-create [items]="categories()" [(value)]="categoryModel" [createFn]="createCategoryFn" (itemCreated)="categoryCreated.emit($event)" />

      <label>Marke</label>
      <app-autocomplete-create [items]="brands()" [(value)]="brandModel" [createFn]="createBrandFn" (itemCreated)="brandCreated.emit($event)" />

      <label>Größe</label>
      <input pInputText [(ngModel)]="sizeModel" />

      <label>Farbe</label>
      <input pInputText [(ngModel)]="colorModel" />

      <label>Preis</label>
      <p-inputgroup>
        <p-inputnumber [(ngModel)]="priceModel" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" />
        <p-inputgroup-addon>€</p-inputgroup-addon>
      </p-inputgroup>

      <label>Beschreibung</label>
      <textarea pTextarea [(ngModel)]="descriptionModel"></textarea>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <div class="footer">
        @if (mode() === 'edit') {
          <button pButton type="button" severity="danger" (click)="deleteConfirmVisible.set(true)">Löschen</button>
        }
        <button pButton type="button" [text]="true" (click)="visible.set(false)">Abbrechen</button>
        <button pButton type="button" [disabled]="!isValid() || saving()" (click)="save()">Speichern</button>
      </div>
    </p-dialog>

    <p-dialog [(visible)]="deleteConfirmVisibleModel" [modal]="true" header="Artikel wirklich löschen?">
      <button pButton type="button" [text]="true" (click)="deleteConfirmVisible.set(false)">Abbrechen</button>
      <button pButton type="button" severity="danger" (click)="confirmDelete()">Löschen</button>
    </p-dialog>
  `
})
export class ArtikelDialog {
  private readonly articlesApi = inject(ArticlesApiService);

  readonly visible = model<boolean>(false);
  readonly mode = input.required<'create' | 'edit'>();
  readonly article = input<ArticleResponse | null>(null);
  readonly initialNumber = input<number | null>(null);
  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();

  readonly saved = output<void>();
  readonly deleted = output<void>();
  readonly brandCreated = output<MasterDataItem>();
  readonly categoryCreated = output<MasterDataItem>();

  readonly number = signal<number | null>(null);
  readonly name = signal('');
  readonly brand = signal('');
  readonly category = signal('');
  readonly size = signal('');
  readonly color = signal('');
  readonly price = signal<number | null>(null);
  readonly description = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly deleteConfirmVisible = signal(false);

  private readonly masterDataApi = inject(MasterDataApiService);
  readonly createBrandFn = (name: string) => this.masterDataApi.create('brands', name);
  readonly createCategoryFn = (name: string) => this.masterDataApi.create('categories', name);

  readonly isValid = computed(() =>
    this.name().trim() !== '' && this.brand().trim() !== '' && this.category().trim() !== '' &&
    this.price() !== null && this.price()! > 0);

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }
  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); }
  get brandModel() { return this.brand(); }
  set brandModel(v: string) { this.brand.set(v); }
  get categoryModel() { return this.category(); }
  set categoryModel(v: string) { this.category.set(v); }
  get sizeModel() { return this.size(); }
  set sizeModel(v: string) { this.size.set(v); }
  get colorModel() { return this.color(); }
  set colorModel(v: string) { this.color.set(v); }
  get priceModel() { return this.price(); }
  set priceModel(v: number | null) { this.price.set(v); }
  get descriptionModel() { return this.description(); }
  set descriptionModel(v: string) { this.description.set(v); }
  get deleteConfirmVisibleModel() { return this.deleteConfirmVisible(); }
  set deleteConfirmVisibleModel(v: boolean) { this.deleteConfirmVisible.set(v); }

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.errorMessage.set(null);

      if (this.mode() === 'create') {
        this.number.set(this.initialNumber());
        this.name.set(''); this.brand.set(''); this.category.set('');
        this.size.set(''); this.color.set(''); this.price.set(null); this.description.set('');
      } else {
        const a = this.article();
        if (!a) return;
        this.number.set(a.number);
        this.name.set(a.name); this.brand.set(a.brand); this.category.set(a.category);
        this.size.set(a.size ?? ''); this.color.set(a.color ?? '');
        this.price.set(a.price); this.description.set(a.description ?? '');
      }
    });
  }

  save(): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const payload = {
      name: this.name(), brand: this.brand(), category: this.category(), price: this.price()!,
      size: this.size() || undefined, color: this.color() || undefined, description: this.description() || undefined
    };

    const request = this.mode() === 'create'
      ? this.articlesApi.create({ ...payload, expectedNumber: this.number() ?? undefined })
      : this.articlesApi.update(this.article()!.id, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Speichern fehlgeschlagen');
      }
    });
  }

  confirmDelete(): void {
    const a = this.article();
    if (!a) return;
    this.articlesApi.delete(a.id).subscribe({
      next: () => {
        this.deleteConfirmVisible.set(false);
        this.deleted.emit();
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.errorMessage.set(err.error?.detail ?? 'Löschen fehlgeschlagen');
      }
    });
  }

}
