import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Countdown } from './countdown';
import { CountdownPhase } from './select-active-phase';

function create(phases: CountdownPhase[]) {
  const fixture = TestBed.createComponent(Countdown);
  fixture.componentRef.setInput('variant', 'timeline');
  fixture.componentRef.setInput('phases', phases);
  fixture.detectChanges();
  return fixture;
}

describe('Countdown - timeline variant', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a live countdown to its own targetDate for an upcoming phase', () => {
    const fixture = create([{ label: 'Voranmeldeschluss', targetDate: new Date('2026-09-11T12:00:00Z') }]);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Voranmeldeschluss');
    expect(text).toContain('2 Tage');
    expect(text).toContain('00:00:00');
  });

  it('shows a live countdown to the next phase for a phase that is running (läuft)', () => {
    const fixture = create([
      { label: 'Abgabe-Start', targetDate: new Date('2026-09-01T00:00:00Z') },
      { label: 'Abgabe-Ende', targetDate: new Date('2026-09-11T12:00:00Z') }
    ]);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2 Tage');
    expect(text).toContain('00:00:00');
  });

  it('shows "Abgeschlossen" for a completed phase with no following phase', () => {
    const fixture = create([{ label: 'Basar-Ende', targetDate: new Date('2026-09-01T00:00:00Z') }]);

    expect(fixture.nativeElement.textContent).toContain('Abgeschlossen');
  });

  it('renders one row per phase', () => {
    const fixture = create([
      { label: 'Voranmeldeschluss', targetDate: new Date('2026-09-01T00:00:00Z') },
      { label: 'Abgabe-Start', targetDate: new Date('2026-09-20T00:00:00Z') }
    ]);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Voranmeldeschluss');
    expect(text).toContain('Abgabe-Start');
  });
});

describe('Countdown - kpi variant', () => {
  let fixture: ComponentFixture<Countdown>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the kpi variant with the kpi host class', async () => {
    await TestBed.configureTestingModule({ imports: [Countdown] }).compileComponents();
    fixture = TestBed.createComponent(Countdown);
    fixture.componentRef.setInput('variant', 'kpi');
    fixture.componentRef.setInput('phases', [{ label: 'BIS ZUM BASAR', targetDate: new Date('2026-09-13T10:00:00Z') }]);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('.countdown--kpi');
    expect(host).not.toBeNull();
    expect(host.textContent).toContain('BIS ZUM BASAR');
  });
});
