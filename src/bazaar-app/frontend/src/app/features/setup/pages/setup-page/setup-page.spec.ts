import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SetupPage } from './setup-page';
import { BootstrapApi } from '../../data/bootstrap-api';
import { AuthService } from '../../../../core/auth/auth.service';
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { BrandsApi } from '../../../brands/data/brands-api';
import { CategoriesApi } from '../../../categories/data/categories-api';

describe('SetupPage - Admin step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let bootstrapApi: { bootstrapAdmin: ReturnType<typeof vi.fn> };
  let authService: { login: ReturnType<typeof vi.fn> };
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    bootstrapApi = { bootstrapAdmin: vi.fn() };
    authService = { login: vi.fn() };
    navigateByUrl = vi.fn();

    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: bootstrapApi },
        { provide: AuthService, useValue: authService },
        { provide: SellerTypesApi, useValue: { create: vi.fn() } },
        { provide: BrandsApi, useValue: { create: vi.fn() } },
        { provide: CategoriesApi, useValue: { create: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('rejects submit when password and confirmation differ', () => {
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('different1');
    expect(component.canSubmitAdmin()).toBe(false);
  });

  it('logs in and advances to step 2 on successful bootstrap', () => {
    bootstrapApi.bootstrapAdmin.mockReturnValue(of({ accessToken: 'token-123' }));
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('changeme1');
    const activateCallback = vi.fn();

    component.submitAdmin(activateCallback);

    expect(authService.login).toHaveBeenCalledWith('token-123');
    expect(activateCallback).toHaveBeenCalledWith(2);
    expect(component.adminError()).toBeNull();
  });

  it('shows a conflict message when setup was already completed', () => {
    bootstrapApi.bootstrapAdmin.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('changeme1');

    component.submitAdmin(vi.fn());

    expect(component.adminError()).toContain('bereits abgeschlossen');
    expect(component.adminAlreadySetUp()).toBe(true);
  });

  it('navigates to /login when the login link is used after a conflict', () => {
    component.goToLogin();

    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });
});

describe('SetupPage - Seller types step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let sellerTypesApi: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sellerTypesApi = { create: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { bootstrapAdmin: vi.fn() } },
        { provide: AuthService, useValue: { login: vi.fn() } },
        { provide: SellerTypesApi, useValue: sellerTypesApi },
        { provide: BrandsApi, useValue: { create: vi.fn() } },
        { provide: CategoriesApi, useValue: { create: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('cannot proceed with zero seller types', () => {
    expect(component.canProceedPastSellerTypes()).toBe(false);
  });

  it('adds a seller type and allows proceeding afterwards', () => {
    sellerTypesApi.create.mockReturnValue(
      of({ id: 'ST1', name: 'Kleidung', commissionRate: 10, itemFee: 0.5, sellerCount: 0 }),
    );
    component.sellerTypeName.set('Kleidung');
    component.sellerTypeCommissionRate.set(10);
    component.sellerTypeItemFee.set(0.5);

    component.addSellerType();

    expect(sellerTypesApi.create).toHaveBeenCalledWith('Kleidung', 10, 0.5);
    expect(component.sellerTypes()).toEqual([
      { id: 'ST1', name: 'Kleidung', commissionRate: 10, itemFee: 0.5, sellerCount: 0 },
    ]);
    expect(component.sellerTypeName()).toBe('');
    expect(component.canProceedPastSellerTypes()).toBe(true);
  });

  it('sets an error message when adding a seller type fails', () => {
    sellerTypesApi.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    component.sellerTypeName.set('Kleidung');

    component.addSellerType();

    expect(component.sellerTypeError()).toBeTruthy();
    expect(component.sellerTypes()).toEqual([]);
  });
});

describe('SetupPage - Brands/categories step and finish', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let brandsApi: { create: ReturnType<typeof vi.fn> };
  let categoriesApi: { create: ReturnType<typeof vi.fn> };
  let authService: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let reloadSpy: ReturnType<typeof vi.fn>;
  let originalLocation: Location;

  beforeEach(async () => {
    brandsApi = { create: vi.fn() };
    categoriesApi = { create: vi.fn() };
    authService = { login: vi.fn(), logout: vi.fn() };
    reloadSpy = vi.fn();

    // Mock window.location.reload
    // Important: capture the original Location object before replacing it so it can be restored
    // in afterEach. This prevents cross-file leakage (see zxing-browser.mock.ts for precedent).
    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { ...originalLocation, reload: reloadSpy };

    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { bootstrapAdmin: vi.fn() } },
        { provide: AuthService, useValue: authService },
        { provide: SellerTypesApi, useValue: { create: vi.fn() } },
        { provide: BrandsApi, useValue: brandsApi },
        { provide: CategoriesApi, useValue: categoriesApi },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Explicitly restore the original Location object to prevent cross-file leakage to other specs
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('adds a brand and clears the input', () => {
    brandsApi.create.mockReturnValue(
      of({ id: 'B1', name: 'Nike', original: true, articleCount: 0 }),
    );
    component.brandName.set('Nike');

    component.addBrand();

    expect(brandsApi.create).toHaveBeenCalledWith('Nike');
    expect(component.brands()).toEqual([{ id: 'B1', name: 'Nike', original: true, articleCount: 0 }]);
    expect(component.brandName()).toBe('');
  });

  it('adds a category and clears the input', () => {
    categoriesApi.create.mockReturnValue(
      of({ id: 'C1', name: 'Schuhe', original: true, articleCount: 0 }),
    );
    component.categoryName.set('Schuhe');

    component.addCategory();

    expect(categoriesApi.create).toHaveBeenCalledWith('Schuhe');
    expect(component.categories()).toEqual([{ id: 'C1', name: 'Schuhe', original: true, articleCount: 0 }]);
    expect(component.categoryName()).toBe('');
  });

  it('sets an error message when adding a brand fails', () => {
    brandsApi.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    component.brandName.set('Nike');

    component.addBrand();

    expect(component.masterDataError()).toBeTruthy();
    expect(component.brands()).toEqual([]);
  });

  it('sets an error message when adding a category fails', () => {
    categoriesApi.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    component.categoryName.set('Schuhe');

    component.addCategory();

    expect(component.masterDataError()).toBeTruthy();
    expect(component.categories()).toEqual([]);
  });

  it('finish logs out and reloads the page', () => {
    component.finish();

    expect(authService.logout).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });
});
