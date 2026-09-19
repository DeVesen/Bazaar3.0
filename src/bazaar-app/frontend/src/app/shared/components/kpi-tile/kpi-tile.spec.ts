import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { KpiTile } from './kpi-tile';

describe('KpiTile', () => {
  async function createFixture() {
    await TestBed.configureTestingModule({
      imports: [KpiTile],
    }).compileComponents();

    return TestBed.createComponent(KpiTile);
  }

  it('renders label, value and subLabel', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Gesamt Artikel');
    fixture.componentRef.setInput('value', 1234);
    fixture.componentRef.setInput('subLabel', 'Stück');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-tile__label')?.textContent?.trim()).toBe('Gesamt Artikel');
    expect(host.querySelector('.kpi-tile__value')?.textContent?.trim()).toBe('1234');
    expect(host.querySelector('.kpi-tile__sub-label')?.textContent?.trim()).toBe('Stück');
  });

  it('does not render a subLabel element when subLabel is empty', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Gesamt Artikel');
    fixture.componentRef.setInput('value', 1234);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-tile__sub-label')).toBeNull();
  });

  it('shows "—" when value is null (AC-4)', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Gesamt Artikel');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-tile__value')?.textContent?.trim()).toBe('—');
  });

  it('shows "—" when value is not provided at all (AC-4)', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Gesamt Artikel');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-tile__value')?.textContent?.trim()).toBe('—');
  });

  it.each([
    ['success', 'kpi-tile--success'],
    ['warning', 'kpi-tile--warning'],
    ['danger', 'kpi-tile--danger'],
    ['info', 'kpi-tile--info'],
  ] as const)('applies the %s severity class', async (severity, expectedClass) => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Im Verkauf');
    fixture.componentRef.setInput('value', 89);
    fixture.componentRef.setInput('severity', severity);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector(`.${expectedClass}`)).not.toBeNull();
  });

  it('applies no severity accent class when severity is null', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Im Verkauf');
    fixture.componentRef.setInput('value', 89);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-tile--success')).toBeNull();
    expect(host.querySelector('.kpi-tile--warning')).toBeNull();
    expect(host.querySelector('.kpi-tile--danger')).toBeNull();
    expect(host.querySelector('.kpi-tile--info')).toBeNull();
  });
});
