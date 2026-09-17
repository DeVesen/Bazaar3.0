import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { LoginPage } from './login-page';
import { AuthService } from '../../../../core/auth/auth.service';

describe('LoginPage', () => {
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    login = vi.fn();
    navigateByUrl = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    }).compileComponents();
  });

  it('calls authService.login with the token and navigates to /intake on success', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();

    fixture.componentInstance.onSubmit({ username: 'erika', password: 'geheim123' });
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ username: 'erika', password: 'geheim123' });
    req.flush({ accessToken: 'token-abc' });

    expect(login).toHaveBeenCalledWith('token-abc');
    expect(navigateByUrl).toHaveBeenCalledWith('/intake');
    httpMock.verify();
  });

  it('sets the error message and does not navigate on 401', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();

    fixture.componentInstance.onSubmit({ username: 'erika', password: 'falsch' });
    const req = httpMock.expectOne('/api/auth/login');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.errorMessage()).toBe('Ungültige Anmeldedaten');
    expect(login).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
    httpMock.verify();
  });
});
