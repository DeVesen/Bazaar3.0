import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { KpiGrid } from './kpi-grid';

@Component({
  imports: [KpiGrid],
  template: `<app-kpi-grid [columns]="5"><div class="probe">A</div></app-kpi-grid>`
})
class HostComponent {}

describe('KpiGrid', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('applies the columns class and projects content', () => {
    const grid = fixture.nativeElement.querySelector('.kpi-grid');
    expect(grid.classList.contains('kpi-grid--c5')).toBe(true);
    expect(fixture.nativeElement.querySelector('.probe').textContent).toBe('A');
  });
});
