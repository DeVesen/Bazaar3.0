import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { KpiTile } from './kpi-tile';

describe('KpiTile', () => {
  let fixture: ComponentFixture<KpiTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiTile] }).compileComponents();
    fixture = TestBed.createComponent(KpiTile);
  });

  it('shows label, value and subLabel', () => {
    fixture.componentRef.setInput('label', 'Meine Artikel');
    fixture.componentRef.setInput('value', 12);
    fixture.componentRef.setInput('subLabel', 'Stück');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Meine Artikel');
    expect(text).toContain('12');
    expect(text).toContain('Stück');
  });

  it('shows a dash when value is null', () => {
    fixture.componentRef.setInput('label', 'Leer');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('—');
  });

  it('applies a severity class when severity is set', () => {
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('value', 1);
    fixture.componentRef.setInput('severity', 'success');
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('.kpi-tile');
    expect(host.classList.contains('kpi-tile--success')).toBe(true);
  });
});
