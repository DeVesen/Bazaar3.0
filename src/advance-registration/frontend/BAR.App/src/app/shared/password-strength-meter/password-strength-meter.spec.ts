import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PasswordStrengthMeter } from './password-strength-meter';

function createWithPassword(password: string) {
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
});
