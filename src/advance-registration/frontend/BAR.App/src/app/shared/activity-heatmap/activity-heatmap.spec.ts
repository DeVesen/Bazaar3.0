import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityHeatmap } from './activity-heatmap';

const DE_TRANSLATIONS = {
  activityHeatmap: {
    title: 'Aktivität — letzte 12 Wochen',
    less: 'Weniger',
    more: 'Mehr',
    weekdayMon: 'Mo',
    weekdayWed: 'Mi',
    weekdayFri: 'Fr',
    noActivity: 'Keine Aktivität',
    oneActivity: '1 Aktivität',
    activitiesCount: '{{count}} Aktivitäten'
  }
};

const EN_TRANSLATIONS = {
  activityHeatmap: {
    title: 'Activity — last 12 weeks',
    less: 'Less',
    more: 'More',
    weekdayMon: 'Mo',
    weekdayWed: 'We',
    weekdayFri: 'Fr',
    noActivity: 'No activity',
    oneActivity: '1 activity',
    activitiesCount: '{{count}} activities'
  }
};

describe('ActivityHeatmap', () => {
  let fixture: ComponentFixture<ActivityHeatmap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActivityHeatmap], providers: [provideTranslateService()] }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', DE_TRANSLATIONS);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('de');

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

  it('shows the German title and legend by default', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aktivität — letzte 12 Wochen');
    expect(text).toContain('Weniger');
    expect(text).toContain('Mehr');
  });

  it('switches title, legend and tooltip text to English when the language changes', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Activity — last 12 weeks');
    expect(text).toContain('Less');
    expect(text).toContain('More');
    expect(text).not.toMatch(/Aktivität|Weniger|Mehr/);

    expect(fixture.componentInstance.tooltipFor('2026-09-10', 7)).toContain('7 activities');
  });
});
