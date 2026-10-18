import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Subject, of, throwError } from 'rxjs';
import { SettingsForm } from './settings-form';
import { SettingsApi } from '../../data/settings-api';
import { InputGroup } from '../../../../shared/components/input-group/input-group';

describe('SettingsForm', () => {
  let get: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    get = vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 }));
    update = vi.fn();
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [SettingsForm],
      providers: [
        { provide: SettingsApi, useValue: { get, update } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
      ],
    }).compileComponents();
  });

  function createForm() {
    const fixture = TestBed.createComponent(SettingsForm);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('formats the help text range with German thousands grouping', () => {
    const { component } = createForm();

    expect(component.helpText).toContain('500–15.000 ms');
  });

  it('loads and displays the current value on init', () => {
    get.mockReturnValue(of({ scannerPauseMs: 4500 }));
    const { component } = createForm();

    expect(get).toHaveBeenCalled();
    expect(component.scannerPauseMs()).toBe(4500);
  });

  it('clicking Speichern with a valid value calls SettingsApi.update and shows the success toast', () => {
    update.mockReturnValue(of(undefined));
    const { component } = createForm();
    component.onValueChange(5000);

    component.onSave();

    expect(update).toHaveBeenCalledWith(5000);
    expect(component.saving()).toBe(false);
    expect(component.fieldError()).toBeNull();
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: '✓ Einstellungen gespeichert' }),
    );
  });

  it('a 400 response shows a field error and does not show the success toast', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { scannerPauseMs: ['Muss zwischen 500 und 15000 liegen.'] } },
    });
    update.mockReturnValue(throwError(() => error));
    const { component } = createForm();
    component.onValueChange(100);

    component.onSave();

    expect(component.fieldError()).toBe('Muss zwischen 500 und 15000 liegen.');
    expect(component.saving()).toBe(false);
    expect(messageServiceAdd).not.toHaveBeenCalled();
  });

  it('a non-400 error shows the generic error toast', () => {
    const error = new HttpErrorResponse({ status: 500 });
    update.mockReturnValue(throwError(() => error));
    const { component } = createForm();
    component.onValueChange(5000);

    component.onSave();

    expect(component.saving()).toBe(false);
    expect(component.fieldError()).toBeNull();
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Einstellungen konnten nicht gespeichert werden',
      }),
    );
  });

  it('disables the Speichern button while a save request is in flight', () => {
    update.mockReturnValue(new Subject<void>());
    const { component } = createForm();
    expect(component.saving()).toBe(false);

    component.onSave();

    expect(component.saving()).toBe(true);
  });

  it('hasUnsavedChanges_valueChangedButNotSaved_isTrue', () => {
    // Arrange
    const { component } = createForm();

    // Act
    component.onValueChange(5000);

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('hasUnsavedChanges_freshlyLoaded_isFalse', () => {
    // Arrange & Act
    const { component } = createForm();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('onSave_validValueSaved_leavesNoUnsavedChanges', () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = createForm();
    component.onValueChange(5000);

    // Act
    component.onSave();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('onSave_400Response_keepsUnsavedChanges', () => {
    // Arrange
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { scannerPauseMs: ['Muss zwischen 500 und 15000 liegen.'] } },
    });
    update.mockReturnValue(throwError(() => error));
    const { component } = createForm();
    component.onValueChange(100);

    // Act
    component.onSave();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('discardChanges_unsavedValueWithFieldError_restoresLastSavedValueAndClearsError', () => {
    // Arrange
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { scannerPauseMs: ['Muss zwischen 500 und 15000 liegen.'] } },
    });
    update.mockReturnValue(throwError(() => error));
    const { fixture, component } = createForm();
    const inputGroup = fixture.debugElement.query(By.directive(InputGroup)).componentInstance as InputGroup;
    const applyExternalValue = vi.spyOn(inputGroup, 'applyExternalValue');
    component.onValueChange(100);
    component.onSave();

    // Act
    component.discardChanges();

    // Assert
    expect(component.scannerPauseMs()).toBe(3000);
    expect(component.fieldError()).toBeNull();
    expect(component.hasUnsavedChanges()).toBe(false);
    expect(applyExternalValue).toHaveBeenCalledWith('3000');
  });

  it('discardChanges_saveInFlight_keepsInputAndStaysConsistentAfterResponse', () => {
    // Arrange
    const response = new Subject<void>();
    update.mockReturnValue(response);
    const { component } = createForm();
    component.onValueChange(5000);
    component.onSave();
    component.discardChanges();

    // Act
    response.next();

    // Assert
    expect(component.scannerPauseMs()).toBe(5000);
    expect(component.hasUnsavedChanges()).toBe(false);
  });
});
