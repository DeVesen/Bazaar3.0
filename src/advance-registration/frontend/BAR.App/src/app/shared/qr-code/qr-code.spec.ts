import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { QrCode } from './qr-code';

describe('QrCode', () => {
  let fixture: ComponentFixture<QrCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QrCode] }).compileComponents();
    fixture = TestBed.createComponent(QrCode);
  });

  it('renders an svg for a non-empty value', () => {
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
  });

  it('renders nothing for an empty value', () => {
    fixture.componentRef.setInput('value', '   ');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('shows the caption when set', () => {
    fixture.componentRef.setInput('value', 'a3f9c2d1');
    fixture.componentRef.setInput('caption', 'a3f9c2d1');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('a3f9c2d1');
  });
});
