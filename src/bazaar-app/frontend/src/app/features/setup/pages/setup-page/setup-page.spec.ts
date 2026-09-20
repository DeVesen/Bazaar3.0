import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
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

  beforeEach(async () => {
    bootstrapApi = { bootstrapAdmin: vi.fn() };
    authService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: bootstrapApi },
        { provide: AuthService, useValue: authService },
        { provide: SellerTypesApi, useValue: { create: vi.fn() } },
        { provide: BrandsApi, useValue: { create: vi.fn() } },
        { provide: CategoriesApi, useValue: { create: vi.fn() } },
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
});
