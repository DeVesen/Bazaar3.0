import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { AuthService } from '../../../../core/auth/auth.service';
import { BootstrapApi } from '../../data/bootstrap-api';
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
import { Category, CategoriesApi } from '../../../categories/data/categories-api';

@Component({
  selector: 'app-setup-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    InputPasswordModule,
    InputTextModule,
    StepperModule,
  ],
  templateUrl: './setup-page.html',
  styleUrl: './setup-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupPage {
  private readonly bootstrapApi = inject(BootstrapApi);
  private readonly sellerTypesApi = inject(SellerTypesApi);
  private readonly brandsApi = inject(BrandsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Step 1 - Admin-Konto
  readonly username = signal('');
  readonly password = signal('');
  readonly passwordConfirm = signal('');
  readonly adminError = signal<string | null>(null);
  readonly adminAlreadySetUp = signal(false);
  readonly adminSaving = signal(false);
  readonly canSubmitAdmin = computed(
    () =>
      this.username().trim().length > 0 &&
      this.password().length >= 8 &&
      this.password() === this.passwordConfirm() &&
      !this.adminSaving(),
  );

  // Step 2 - Haendlertypen (Task 8)
  readonly sellerTypeName = signal('');
  readonly sellerTypeCommissionRate = signal(0);
  readonly sellerTypeItemFee = signal(0);
  readonly sellerTypes = signal<SellerType[]>([]);
  readonly sellerTypeSaving = signal(false);
  readonly sellerTypeError = signal<string | null>(null);
  readonly canAddSellerType = computed(() => this.sellerTypeName().trim().length > 0 && !this.sellerTypeSaving());
  readonly canProceedPastSellerTypes = computed(() => this.sellerTypes().length > 0);

  // Step 3 - Marken/Kategorien (Task 9)
  readonly brandName = signal('');
  readonly brands = signal<Brand[]>([]);
  readonly categoryName = signal('');
  readonly categories = signal<Category[]>([]);
  readonly masterDataError = signal<string | null>(null);

  submitAdmin(activateCallback: (step: number) => void): void {
    if (!this.canSubmitAdmin()) return;
    this.adminError.set(null);
    this.adminAlreadySetUp.set(false);
    this.adminSaving.set(true);
    this.bootstrapApi.bootstrapAdmin(this.username().trim(), this.password()).subscribe({
      next: ({ accessToken }) => {
        this.authService.login(accessToken);
        this.adminSaving.set(false);
        activateCallback(2);
      },
      error: (error: unknown) => {
        this.adminSaving.set(false);
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.adminError.set('Setup wurde bereits abgeschlossen. Bitte melde dich an.');
          this.adminAlreadySetUp.set(true);
        } else {
          this.adminError.set('Admin-Konto konnte nicht angelegt werden. Bitte erneut versuchen.');
        }
      },
    });
  }

  addSellerType(): void {
    if (!this.canAddSellerType()) return;
    this.sellerTypeError.set(null);
    this.sellerTypeSaving.set(true);
    this.sellerTypesApi
      .create(this.sellerTypeName().trim(), this.sellerTypeCommissionRate(), this.sellerTypeItemFee())
      .subscribe({
        next: (sellerType) => {
          this.sellerTypes.set([...this.sellerTypes(), sellerType]);
          this.sellerTypeName.set('');
          this.sellerTypeCommissionRate.set(0);
          this.sellerTypeItemFee.set(0);
          this.sellerTypeSaving.set(false);
        },
        error: () => {
          this.sellerTypeSaving.set(false);
          this.sellerTypeError.set('Verkäufer-Typ konnte nicht angelegt werden. Bitte Eingaben prüfen.');
        },
      });
  }

  addBrand(): void {
    const name = this.brandName().trim();
    if (!name) return;
    this.masterDataError.set(null);
    this.brandsApi.create(name).subscribe({
      next: (brand) => {
        this.brands.set([...this.brands(), brand]);
        this.brandName.set('');
      },
      error: () => this.masterDataError.set('Marke konnte nicht angelegt werden. Bitte erneut versuchen.'),
    });
  }

  addCategory(): void {
    const name = this.categoryName().trim();
    if (!name) return;
    this.masterDataError.set(null);
    this.categoriesApi.create(name).subscribe({
      next: (category) => {
        this.categories.set([...this.categories(), category]);
        this.categoryName.set('');
      },
      error: () => this.masterDataError.set('Kategorie konnte nicht angelegt werden. Bitte erneut versuchen.'),
    });
  }

  finish(): void {
    this.authService.logout();
    window.location.reload();
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
