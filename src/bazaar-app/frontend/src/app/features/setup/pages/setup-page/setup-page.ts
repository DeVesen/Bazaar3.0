import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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

  // Step 1 - Admin-Konto
  readonly username = signal('');
  readonly password = signal('');
  readonly passwordConfirm = signal('');
  readonly adminError = signal<string | null>(null);
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
  readonly canAddSellerType = computed(() => this.sellerTypeName().trim().length > 0 && !this.sellerTypeSaving());
  readonly canProceedPastSellerTypes = computed(() => this.sellerTypes().length > 0);

  // Step 3 - Marken/Kategorien (Task 9)
  readonly brandName = signal('');
  readonly brands = signal<Brand[]>([]);
  readonly categoryName = signal('');
  readonly categories = signal<Category[]>([]);

  submitAdmin(activateCallback: (step: number) => void): void {
    if (!this.canSubmitAdmin()) return;
    this.adminError.set(null);
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
        } else {
          this.adminError.set('Admin-Konto konnte nicht angelegt werden. Bitte erneut versuchen.');
        }
      },
    });
  }

  addSellerType(): void {
    if (!this.canAddSellerType()) return;
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
        error: () => this.sellerTypeSaving.set(false),
      });
  }

  addBrand(): void {
    const name = this.brandName().trim();
    if (!name) return;
    this.brandsApi.create(name).subscribe((brand) => {
      this.brands.set([...this.brands(), brand]);
      this.brandName.set('');
    });
  }

  addCategory(): void {
    const name = this.categoryName().trim();
    if (!name) return;
    this.categoriesApi.create(name).subscribe((category) => {
      this.categories.set([...this.categories(), category]);
      this.categoryName.set('');
    });
  }

  finish(): void {
    this.authService.logout();
    window.location.reload();
  }
}
