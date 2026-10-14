import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RoleService } from '../../../../core/auth/role.service';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
// Cross-feature import, read-only: `CategoriesApi.getAll()` populates the category dropdown.
// Sanctioned per spec.md's Round-15 §Frontend note ("hier nur lesend importiert") — same
// precedent as `verkaeufer-dialog.ts`'s `SellerTypesApi` import and `articles-page.ts`'s own
// Brands/Categories imports.
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
import { ArticlesApi } from '../../data/articles-api';

/**
 * Article Stammfelder as edited by this dialog (see `UpdateArticleRequest` in `articles-api.ts`)
 * — `brand`/`category` are the master-data NAMES (not ids), matching
 * `ArticleListItem`/`UpdateArticleRequest`'s string shape and `articles-page.ts`'s own
 * Brand/Category filter dropdowns (`optionValue="name"`-equivalent). The seller is fixed and
 * never part of this shape; `number` is editable (free or the article's own number).
 */
export interface ArtikelFormValue {
  number: number;
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
  number?: string;
  name?: string;
  brand?: string;
  category?: string;
  price?: string;
}

const MAX_ARTICLE_NUMBER = 2147483646;
const ARTICLE_NUMBER_FORMAT_ERROR = 'Artikelnummer muss eine ganze Zahl ab 1 sein.';

/** Whole number from 1 to `int` max minus 1 (so "highest + 1" never overflows), else `null` (empty, 0, negative, text). */
function parseArticleNumber(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const value = Number(trimmed);
  return value >= 1 && value <= MAX_ARTICLE_NUMBER ? value : null;
}

function numberTakenMessage(number: number): string {
  return `Artikelnummer ${number} ist bereits vergeben.`;
}

@Component({
  selector: 'app-artikel-dialog',
  imports: [
    FormsModule,
    RouterLink,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    AutocompleteCreate,
    InputGroup,
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
  private readonly articlesApi = inject(ArticlesApi);

  readonly visible = input.required<boolean>();
  /** The number the article currently carries — used for the title, the delete confirmation
   * and to detect a change. The editable value lives in `numberText`. */
  readonly articleNumber = input.required<number>();
  /** Id of the edited article — lets the on-blur lookup recognise a hit on the article itself. */
  readonly articleId = input<string>('');
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

  /**
   * `input-group`'s price variant has no reactive `value` input as of Round-16 (checked
   * `input-group.ts` before wiring, per Task 4 brief) — its own `priceValue` signal is only
   * writable via user interaction or the imperative `applyExternalValue()` method. This
   * `viewChild` lets the seeding effect below push `initialValue().price` into the rendered
   * component when the dialog opens for an existing article, mirroring what the removed
   * `p-inputnumber`'s `[ngModel]="price()"` binding did for free.
   */
  private readonly priceInputGroup = viewChild(InputGroup);

  readonly categoriesList = signal<Category[]>([]);
  readonly brandsList = signal<Brand[]>([]);
  readonly categoryNames = computed(() => this.categoriesList().map((category) => category.name));
  readonly brandNames = computed(() => this.brandsList().map((brand) => brand.name));

  readonly name = signal('');
  readonly brand = signal('');
  readonly category = signal('');
  readonly price = signal(0);
  readonly size = signal('');
  readonly color = signal('');
  readonly description = signal('');

  readonly numberText = signal('');
  readonly parsedNumber = computed(() => parseArticleNumber(this.numberText()));
  /** Number a blur lookup found at ANOTHER article; only counts while it is still entered. */
  private readonly takenNumber = signal<number | null>(null);
  /** Number that was entered when the server last rejected the save with a number error. */
  private readonly rejectedNumber = signal<number | null>(null);

  readonly numberTaken = computed(
    () => this.takenNumber() !== null && this.takenNumber() === this.parsedNumber(),
  );
  private readonly serverNumberError = computed(() =>
    this.rejectedNumber() === this.parsedNumber() ? (this.serverErrors()?.number ?? null) : null,
  );
  readonly numberError = computed<string | null>(() => {
    const parsed = this.parsedNumber();
    if (parsed === null) return ARTICLE_NUMBER_FORMAT_ERROR;
    if (this.numberTaken()) return numberTakenMessage(parsed);
    return this.serverNumberError();
  });
  readonly showLabelHint = computed(() => {
    const parsed = this.parsedNumber();
    return parsed !== null && parsed !== this.articleNumber() && this.numberError() === null;
  });

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
      this.parsedNumber() !== null &&
      !this.numberTaken() &&
      this.name().trim().length > 0 &&
      this.category().length > 0 &&
      this.brand().length > 0 &&
      this.price() > 0 &&
      !this.isSettled() &&
      !this.saving(),
  );

  constructor() {
    this.categoriesApi.getAll().subscribe((categories) => this.categoriesList.set(categories));
    this.brandsApi.getAll().subscribe((brands) => this.brandsList.set(brands));

    effect(() => {
      if (!this.visible()) return;

      const initial = this.initialValue();
      this.numberText.set(String(initial?.number ?? this.articleNumber()));
      this.takenNumber.set(null);
      this.name.set(initial?.name ?? '');
      this.brand.set(initial?.brand ?? '');
      this.category.set(initial?.category ?? '');
      this.price.set(initial?.price ?? 0);
      this.size.set(initial?.size ?? '');
      this.color.set(initial?.color ?? '');
      this.description.set(initial?.description ?? '');
    });

    // Separate from the seeding effect above: deliberately does NOT read `price()` (only the
    // input's own initial-value dependencies), so a user typing into `input-group` — which
    // round-trips through `onPriceChange()` back into the `price` signal — never re-triggers
    // this and fights the user's own input. Re-syncs display to `initialValue()` whenever the
    // dialog (re)opens or the `input-group` view becomes available.
    effect(() => {
      if (!this.visible()) return;
      const inputGroup = this.priceInputGroup();
      if (!inputGroup) return;
      const initial = this.initialValue();
      inputGroup.applyExternalValue(String(initial?.price ?? 0));
    });

    effect(() => {
      if (!this.serverErrors()?.number) return;
      this.rejectedNumber.set(untracked(() => this.parsedNumber()));
    });
  }

  onPriceChange(value: string | number): void {
    this.price.set(typeof value === 'number' ? value : Number(value));
  }

  /**
   * Frontend pre-check on leaving the field: `404` means free, a hit on another article marks
   * the number taken. Any other failure is ignored — the server decides on save.
   */
  onNumberBlur(): void {
    const number = this.parsedNumber();
    if (number === null || number === this.articleNumber()) {
      this.takenNumber.set(null);
      return;
    }

    this.articlesApi.getByNumber(number).subscribe({
      next: (owner) => this.takenNumber.set(owner.id === this.articleId() ? null : number),
      error: () => this.takenNumber.set(null),
    });
  }

  onCategoryCreated(name: string): void {
    this.categoriesApi.create(name).subscribe({
      next: (created) => {
        this.categoriesList.update((list) => [...list, created]);
        this.category.set(created.name);
      },
      error: (error: unknown) => {
        // 409: someone else created the same name a moment ago (serverseitige
        // Duplikatprüfung, spec.md Nachtrag) — a race, not a failure for this dialog. Refresh
        // the list so the now-existing entry is selectable, and land on the typed name.
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.categoriesApi.getAll().subscribe((categories) => {
            this.categoriesList.set(categories);
            this.category.set(name);
          });
        }
      },
    });
  }

  onBrandCreated(name: string): void {
    this.brandsApi.create(name).subscribe({
      next: (created) => {
        this.brandsList.update((list) => [...list, created]);
        this.brand.set(created.name);
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.brandsApi.getAll().subscribe((brands) => {
            this.brandsList.set(brands);
            this.brand.set(name);
          });
        }
      },
    });
  }

  onSave(): void {
    const number = this.parsedNumber();
    if (!this.canSave() || number === null) return;
    this.save.emit({
      number,
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
