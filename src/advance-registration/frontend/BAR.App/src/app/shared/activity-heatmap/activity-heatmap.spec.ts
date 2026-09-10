import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityHeatmap } from './activity-heatmap';

describe('ActivityHeatmap', () => {
  let fixture: ComponentFixture<ActivityHeatmap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActivityHeatmap] }).compileComponents();
    fixture = TestBed.createComponent(ActivityHeatmap);
    fixture.componentRef.setInput('events', [{ date: '2026-09-10', count: 7 }]);
    fixture.detectChanges();
  });

  it('renders 84 cells', () => {
    const cells = fixture.nativeElement.querySelectorAll('.activity-heatmap__cell');
    expect(cells.length).toBe(84);
  });

  it('renders inside a horizontally scrollable container', () => {
    const container = fixture.nativeElement.querySelector('.activity-heatmap');
    expect(getComputedStyle(container).overflowX).toBe('auto');
  });
});
