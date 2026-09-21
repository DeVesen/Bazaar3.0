import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SetupPage } from './setup-page';
import { BootstrapApi } from '../../data/bootstrap-api';

describe('SetupPage - Admin step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { completeSetup: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
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

  it('allows submit once username/password/confirmation are valid', () => {
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('changeme1');
    expect(component.canSubmitAdmin()).toBe(true);
  });

  it('starts with the password fields masked', () => {
    expect(component.passwordMask()).toBe(true);
    expect(component.passwordConfirmMask()).toBe(true);
  });
});

describe('SetupPage - Seller types step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { completeSetup: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('cannot proceed with zero seller types', () => {
    expect(component.canProceedPastSellerTypes()).toBe(false);
  });

  it('adds a seller type locally (no API call) and allows proceeding afterwards', () => {
    component.sellerTypeName.set('Kleidung');
    component.sellerTypeCommissionRate.set(10);
    component.sellerTypeItemFee.set(0.5);

    component.addSellerType();

    expect(component.sellerTypes()).toEqual([{ name: 'Kleidung', commissionRate: 10, itemFee: 0.5 }]);
    expect(component.sellerTypeName()).toBe('');
    expect(component.canProceedPastSellerTypes()).toBe(true);
  });

  it('rejects a duplicate seller type name', () => {
    component.sellerTypeName.set('Kleidung');
    component.addSellerType();
    component.sellerTypeName.set('kleidung');

    component.addSellerType();

    expect(component.sellerTypes().length).toBe(1);
    expect(component.sellerTypeError()).toBeTruthy();
  });
});

describe('SetupPage - finish', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let bootstrapApi: { completeSetup: ReturnType<typeof vi.fn> };
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    bootstrapApi = { completeSetup: vi.fn() };
    navigateByUrl = vi.fn();

    await TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: bootstrapApi },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('splits the brand/category textareas into lines and posts the whole wizard payload', () => {
    bootstrapApi.completeSetup.mockReturnValue(of(undefined));
    component.username.set('admin');
    component.password.set('changeme1');
    component.sellerTypes.set([{ name: 'Kleidung', commissionRate: 10, itemFee: 0.5 }]);
    component.brandNamesText.set('Nike\n\n  Adidas  \n');
    component.categoryNamesText.set('Schuhe\nJacken');

    component.finish();

    expect(bootstrapApi.completeSetup).toHaveBeenCalledWith({
      username: 'admin',
      password: 'changeme1',
      sellerTypes: [{ name: 'Kleidung', commissionRate: 10, itemFee: 0.5 }],
      brandNames: ['Nike', 'Adidas'],
      categoryNames: ['Schuhe', 'Jacken'],
    });
  });

  it('de-duplicates brand/category lines case-insensitively before submitting', () => {
    bootstrapApi.completeSetup.mockReturnValue(of(undefined));
    component.brandNamesText.set('Nike\nADIDAS\nnike\nAdidas');
    component.categoryNamesText.set('Schuhe\nschuhe\nJacken');

    component.finish();

    expect(bootstrapApi.completeSetup).toHaveBeenCalledWith(
      expect.objectContaining({
        brandNames: ['Nike', 'ADIDAS'],
        categoryNames: ['Schuhe', 'Jacken'],
      }),
    );
  });

  it('navigates to /login on success', () => {
    bootstrapApi.completeSetup.mockReturnValue(of(undefined));

    component.finish();

    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('shows a conflict message when setup was already completed', () => {
    bootstrapApi.completeSetup.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { errorCode: 'bootstrap.already_done' } }),
      ),
    );

    component.finish();

    expect(component.submitError()).toContain('bereits abgeschlossen');
    expect(component.setupAlreadyDone()).toBe(true);
    expect(component.submitting()).toBe(false);
  });

  it('shows the server-provided reason for any other conflict (e.g. a duplicate name)', () => {
    bootstrapApi.completeSetup.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errorCode: 'category.name_taken', detail: 'Kategorie existiert bereits' },
          }),
      ),
    );

    component.finish();

    expect(component.submitError()).toBe('Kategorie existiert bereits');
    expect(component.setupAlreadyDone()).toBe(false);
  });

  it('shows a generic error message when the server gives no detail', () => {
    bootstrapApi.completeSetup.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.finish();

    expect(component.submitError()).toBeTruthy();
    expect(component.setupAlreadyDone()).toBe(false);
  });

  it('navigates to /login when the login link is used after a conflict', () => {
    component.goToLogin();

    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
