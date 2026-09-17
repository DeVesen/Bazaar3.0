import { TestBed } from '@angular/core/testing';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
    }).compileComponents();
  });

  it('renders the username and password fields', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#login-username')).not.toBeNull();
    expect(compiled.querySelector('#login-password')).not.toBeNull();
  });

  it('emits submitted with the current username/password on submit', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    const component = fixture.componentInstance;
    const submittedSpy = vi.fn();
    component.submitted.subscribe(submittedSpy);
    await fixture.whenStable();

    component.username.set('erika');
    component.password.set('geheim123');
    component.onSubmit();

    expect(submittedSpy).toHaveBeenCalledWith({ username: 'erika', password: 'geheim123' });
  });

  it('toggles mask() when the eye icon is clicked', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component.mask()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelectorAll('p-inputicon')[2] as HTMLElement;
    toggle.click();
    await fixture.whenStable();

    expect(component.mask()).toBe(false);
  });

  it('shows the error message text when errorMessage is set', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.componentRef.setInput('errorMessage', 'Ungültige Anmeldedaten');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ungültige Anmeldedaten');
  });

  it('hides the error message when errorMessage is null', async () => {
    const fixture = TestBed.createComponent(LoginForm);
    fixture.componentRef.setInput('errorMessage', null);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-form__error')).toBeNull();
  });
});
