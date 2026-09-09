import { Component, computed, effect, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AutocompleteCreate } from '../../../shared/autocomplete-create/autocomplete-create';
import { ArticlesApiService, ArticleResponse, CreateArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';

@Component({
  selector: 'app-artikel-dialog',
  imports: [
    FormsModule, DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule,
    InputNumberModule, ButtonModule, TextareaModule, TooltipModule, AutocompleteCreate
  ],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="mode() === 'create' ? 'Artikel anlegen' : 'Artikel bearbeiten'">
      <label>Artikelnummer</label>
      <input pInputText [value]="number()" [readonly]="true" />
      @if (mode() === 'create') {
        <p class="hint">wird beim Speichern endgültig vergeben</p>
      }

      <label>Bezeichnung</label>
      <input pInputText [(ngModel)]="nameModel" #nameInput />

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
          <button pButton type="button" severity="danger" [disabled]="saving()" (click)="deleteConfirmVisible.set(true)">Löschen</button>
        }
        <button pButton type="button" [text]="true" [disabled]="saving()" (click)="visible.set(false)">Abbrechen</button>
        @if (mode() === 'create') {
          <button pButton type="button" severity="secondary" [outlined]="true"
            [disabled]="!isValid() || saving()" [loading]="saving()"
            pTooltip="Artikel speichern und einen weiteren mit denselben Werten anlegen"
            (click)="saveAndCopy()">Speichern + kopieren</button>
        }
        <button pButton type="button" [disabled]="!isValid() || saving()" [loading]="saving()" (click)="save()">Speichern</button>
      </div>
    </p-dialog>

    <p-dialog [(visible)]="deleteConfirmVisibleModel" [modal]="true" header="Artikel wirklich löschen?">
      <button pButton type="button" [text]="true" (click)="deleteConfirmVisible.set(false)">Abbrechen</button>
      <button pButton type="button" severity="danger" (click)="confirmDelete()">Löschen</button>
    </p-dialog>

    <p-dialog [(visible)]="conflictDialogVisibleModel" [modal]="true" header="Artikelnummer bereits vergeben">
      <p>{{ conflictMessage() }}</p>
      <button pButton type="button" (click)="closeConflictDialog()">OK</button>
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
  readonly conflictDialogVisible = signal(false);
  readonly conflictMessage = signal('');

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly messageService = inject(MessageService);
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
  get conflictDialogVisibleModel() { return this.conflictDialogVisible(); }
  set conflictDialogVisibleModel(v: boolean) { this.conflictDialogVisible.set(v); }

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
    this.submit(false);
  }

  saveAndCopy(): void {
    this.submit(true);
  }

  private submit(andCopy: boolean): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const savedNumber = this.number();
    const payload = {
      name: this.name(), brand: this.brand(), category: this.category(), price: this.price()!,
      size: this.size() || undefined, color: this.color() || undefined, description: this.description() || undefined
    };

    const request: Observable<CreateArticleResponse> = this.mode() === 'create'
      ? this.articlesApi.create({ ...payload, expectedNumber: this.number() ?? undefined })
      : (this.articlesApi.update(this.article()!.id, payload) as Observable<CreateArticleResponse>);

    request.subscribe({
      next: (response: CreateArticleResponse) => {
        this.saving.set(false);
        this.saved.emit();

        if (!andCopy) {
          this.visible.set(false);
          return;
        }

        if (response.nextNumber === undefined) {
          this.visible.set(false);
          this.messageService.add({
            severity: 'warn', summary: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren'
          });
          return;
        }

        this.number.set(response.nextNumber);
        this.errorMessage.set(null);
        this.messageService.add({
          severity: 'success', summary: `✓ Artikel ${savedNumber} gespeichert — nächste Nummer: ${response.nextNumber}`
        });
        // AC-9 Fokus+Selektion auf Bezeichnung; `pristine`-Reset aus der Spec ist hier N/A
        // (dieser Dialog hat kein NgForm/FormGroup zum Zurücksetzen — reine Signal-Felder).
        queueMicrotask(() => this.nameInput()?.nativeElement.select());
      },
      error: (err: { status?: number; error?: { detail?: string; nextNumber?: number } }) => {
        this.saving.set(false);
        if (err.status === 409 && err.error?.nextNumber !== undefined) {
          this.conflictMessage.set(err.error.detail ?? '');
          this.conflictDialogVisible.set(true);
          this.number.set(err.error.nextNumber);
          return;
        }
        this.errorMessage.set(err.error?.detail ?? 'Speichern fehlgeschlagen');
      }
    });
  }

  closeConflictDialog(): void {
    this.conflictDialogVisible.set(false);
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
