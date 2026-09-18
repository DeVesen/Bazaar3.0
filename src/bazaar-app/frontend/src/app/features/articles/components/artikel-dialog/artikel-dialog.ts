import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { RoleService } from '../../../../core/auth/role.service';
// Cross-feature import, read-only: `CategoriesApi.getAll()` populates the category dropdown.
// Sanctioned per spec.md's Round-15 §Frontend note ("hier nur lesend importiert") — same
// precedent as `verkaeufer-dialog.ts`'s `SellerTypesApi` import and `articles-page.ts`'s own
// Brands/Categories imports.
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';

/**
 * Article Stammfelder as edited by this dialog (see `UpdateArticleRequest` in Task 5's
 * `articles-api.ts`) — `brand`/`category` are the master-data NAMES (not ids), matching
 * `ArticleListItem`/`UpdateArticleRequest`'s string shape and `articles-page.ts`'s own
 * Brand/Category filter dropdowns (`optionValue="name"`-equivalent). The article number and
 * seller are fixed and never part of this shape — see `articleNumber` input below.
 */
export interface ArtikelFormValue {
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
}

export type ArtikelFormResult = ArtikelFormValue;

/**
 * Field-level messages for a `400` validation response from the backend, matching
 * `SellerDialogServerErrors`'s pattern from `verkaeufer-dialog.ts`.
 */
export interface ArtikelDialogServerErrors {
  name?: string;
  brand?: string;
  category?: string;
  price?: string;
}

@Component({
  selector: 'app-artikel-dialog',
  imports: [
    FormsModule,
    RouterLink,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './artikel-dialog.html',
  styleUrl: './artikel-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtikelDialog {
  private readonly roleService = inject(RoleService);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly brandsApi = inject(BrandsApi);
  private readonly confirmationService = inject(ConfirmationService);

  readonly visible = input.required<boolean>();
  /** Read-only display value, not part of the editable form or the `save` payload — the
   * article number is never editable (api/articles.md §4). */
  readonly articleNumber = input.required<number>();
  readonly initialValue = input<ArtikelFormValue | null>(null);
  /**
   * Client-side convenience lock mirroring the article's server-enforced state — the server
   * is the actual authority (`article.sold`/`settlement.locked` domain exceptions, Tasks 1/4).
   * `'none'`: fully editable. `'sold'`: price disabled with a hint. `'settled'`: every field
   * disabled plus a banner. The PARENT computes this from the row's `soldAt`/settlement state;
   * this dialog only reacts to it.
   */
  readonly locked = input<'none' | 'sold' | 'settled'>('none');
  /** Disables the save button while the caller's actual API call is in flight. */
  readonly saving = input<boolean>(false);
  /** Server-side validation messages to render under the affected field. */
  readonly serverErrors = input<ArtikelDialogServerErrors | null>(null);
  /** Message for a failed delete, fed back in by the caller so this dialog can display it
   * without closing (mirrors `verkaeufer-dialog.ts`'s `deleteError`). */
  readonly deleteError = input<string | null>(null);

  readonly visibleChange = output<boolean>();
  readonly save = output<ArtikelFormResult>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();
  readonly deleteRequested = output<void>();

  readonly isAdmin = this.roleService.isAdmin;

  readonly categoriesList = signal<Category[]>([]);
  readonly brandsList = signal<Brand[]>([]);

  readonly name = signal('');
  readonly brand = signal('');
  readonly category = signal('');
  readonly price = signal(0);
  readonly size = signal('');
  readonly color = signal('');
  readonly description = signal('');

  readonly dialogTitle = computed(() => `Artikel #${this.articleNumber()} bearbeiten`);

  readonly isSold = computed(() => this.locked() === 'sold');
  readonly isSettled = computed(() => this.locked() === 'settled');
  /** All fields disabled — settlement lock overrides everything, including the price field's
   * own `'sold'`-only disable. */
  readonly fieldsDisabled = computed(() => this.isSettled());
  readonly priceDisabled = computed(() => this.isSettled() || this.isSold());

  /** Visible only when unlocked AND the user is admin — `locked` already encodes both
   * "soldAt is set" (`'sold'`) and the settlement lock (`'settled'`), both of which hide
   * delete per spec.md. */
  readonly canDelete = computed(
    () => this.isAdmin() && this.locked() !== 'sold' && this.locked() !== 'settled',
  );

  readonly canSave = computed(
    () =>
      this.name().trim().length > 0 &&
      this.category().length > 0 &&
      this.brand().length > 0 &&
      this.price() > 0 &&
      this.locked() === 'none' &&
      !this.saving(),
  );

  constructor() {
    this.categoriesApi.getAll().subscribe((categories) => this.categoriesList.set(categories));
    this.brandsApi.getAll().subscribe((brands) => this.brandsList.set(brands));

    effect(() => {
      if (!this.visible()) return;

      const initial = this.initialValue();
      this.name.set(initial?.name ?? '');
      this.brand.set(initial?.brand ?? '');
      this.category.set(initial?.category ?? '');
      this.price.set(initial?.price ?? 0);
      this.size.set(initial?.size ?? '');
      this.color.set(initial?.color ?? '');
      this.description.set(initial?.description ?? '');
    });
  }

  onSave(): void {
    if (!this.canSave()) return;
    this.save.emit({
      name: this.name().trim(),
      brand: this.brand(),
      category: this.category(),
      price: this.price(),
      size: this.size().trim() || null,
      color: this.color().trim() || null,
      description: this.description().trim() || null,
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onDeleteClick(): void {
    this.confirmationService.confirm({
      key: 'deleteArticle',
      header: 'Artikel löschen',
      message: `Artikel '#${this.articleNumber()} ${this.name()}' wirklich löschen?`,
      accept: () => {
        this.deleteRequested.emit();
      },
    });
  }
}
