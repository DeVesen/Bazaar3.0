import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { PasswordStrengthMeter } from './password-strength-meter';

const EN_TRANSLATIONS = {
  passwordStrength: { weak: 'Weak', medium: 'Medium', strong: 'Strong' }
};

function createWithPassword(password: string) {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const fixture = TestBed.createComponent(PasswordStrengthMeter);
  fixture.componentRef.setInput('password', password);
  const emitted: string[] = [];
  fixture.componentInstance.level.subscribe((level) => emitted.push(level));
  fixture.detectChanges();
  return { fixture, emitted };
}

describe('PasswordStrengthMeter', () => {
  it('emits "schwach" and renders the red color for a weak password', () => {
    const { fixture, emitted } = createWithPassword('abc');

    expect(emitted).toContain('schwach');
    const progressbar = fixture.debugElement.query(By.css('p-progressbar'));
    expect(progressbar.componentInstance.color()).toBe('var(--p-red-500)');
  });

  it('emits "mittel" and renders the amber color for a medium password', () => {
    const { fixture, emitted } = createWithPassword('abcdefg1');

    expect(emitted).toContain('mittel');
    const progressbar = fixture.debugElement.query(By.css('p-progressbar'));
    expect(progressbar.componentInstance.color()).toBe('var(--p-amber-500)');
  });

  it('emits "stark" and renders the green color for a strong password', () => {
    const { fixture, emitted } = createWithPassword('Abcdefg1!!');

    expect(emitted).toContain('stark');
    const progressbar = fixture.debugElement.query(By.css('p-progressbar'));
    expect(progressbar.componentInstance.color()).toBe('var(--p-green-500)');
  });

  it('shows the English "Strong" label when the active language is English', () => {
    const { fixture } = createWithPassword('Abcdefg1!!');
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('en');
    fixture.detectChanges();

    const tag = fixture.debugElement.query(By.css('p-tag'));
    expect(tag.componentInstance.value()).toBe('Strong');
  });
});
