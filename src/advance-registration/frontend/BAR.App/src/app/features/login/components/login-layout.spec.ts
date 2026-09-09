import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginLayout } from './login-layout';

@Component({
  imports: [LoginLayout],
  template: `<app-login-layout><div info data-testid="info-slot"></div><div form data-testid="form-slot"></div></app-login-layout>`
})
class HostComponent {}

describe('LoginLayout', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects both info and form slots', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="info-slot"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="form-slot"]')).not.toBeNull();
  });
});
