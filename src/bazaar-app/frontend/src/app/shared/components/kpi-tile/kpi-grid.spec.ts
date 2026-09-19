import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { KpiGrid } from './kpi-grid';

@Component({
  selector: 'app-kpi-grid-host',
  imports: [KpiGrid],
  template: `
    <app-kpi-grid [columns]="columns">
      <div class="projected-child">A</div>
      <div class="projected-child">B</div>
    </app-kpi-grid>
  `,
})
class KpiGridHost {
  columns: 3 | 4 | 5 | 6 = 3;
}

describe('KpiGrid', () => {
  it('projects its children as-is', async () => {
    await TestBed.configureTestingModule({ imports: [KpiGridHost] }).compileComponents();
    const fixture = TestBed.createComponent(KpiGridHost);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('.projected-child').length).toBe(2);
  });

  it('defaults to 3 columns when columns is not set', async () => {
    await TestBed.configureTestingModule({ imports: [KpiGrid] }).compileComponents();
    const fixture = TestBed.createComponent(KpiGrid);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.kpi-grid--c3')).not.toBeNull();
  });

  it.each([3, 4, 5, 6] as const)('applies kpi-grid--c%s for columns=%s', async (columns) => {
    await TestBed.configureTestingModule({ imports: [KpiGrid] }).compileComponents();
    const fixture = TestBed.createComponent(KpiGrid);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector(`.kpi-grid--c${columns}`)).not.toBeNull();
  });
});
