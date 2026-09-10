import { describe, it, expect } from 'vitest';
import { selectTimelinePhases, TimelinePhaseInput } from './select-timeline-phases';

const NOW = new Date('2026-09-09T12:00:00Z');

function phase(label: string, isoDate: string | null): TimelinePhaseInput {
  return { label, targetDate: isoDate === null ? null : new Date(isoDate) };
}

describe('selectTimelinePhases', () => {
  it('marks a phase whose targetDate is still in the future as upcoming, counting down to its own date', () => {
    const phases = [phase('Voranmeldeschluss', '2026-09-20T00:00:00Z')];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([{ label: 'Voranmeldeschluss', state: 'upcoming', countdownTarget: phases[0].targetDate }]);
  });

  it('marks a past phase as active when the next phase is still upcoming, counting down to the next phase', () => {
    const phases = [phase('Abgabe-Start', '2026-09-01T00:00:00Z'), phase('Abgabe-Ende', '2026-09-15T00:00:00Z')];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([
      { label: 'Abgabe-Start', state: 'active', countdownTarget: phases[1].targetDate },
      { label: 'Abgabe-Ende', state: 'upcoming', countdownTarget: phases[1].targetDate }
    ]);
  });

  it('marks a past phase as completed when there is no following phase', () => {
    const phases = [phase('Basar-Ende', '2026-09-01T00:00:00Z')];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([{ label: 'Basar-Ende', state: 'completed', countdownTarget: null }]);
  });

  it('marks a past phase as completed when the following phase has also passed', () => {
    const phases = [phase('Abgabe-Start', '2026-08-01T00:00:00Z'), phase('Abgabe-Ende', '2026-08-15T00:00:00Z')];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([
      { label: 'Abgabe-Start', state: 'completed', countdownTarget: null },
      { label: 'Abgabe-Ende', state: 'completed', countdownTarget: null }
    ]);
  });

  it('skips phases with a null targetDate entirely (AC-7)', () => {
    const phases = [phase('Voranmeldeschluss', null), phase('Basar-Start', '2026-09-20T00:00:00Z')];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([{ label: 'Basar-Start', state: 'upcoming', countdownTarget: phases[1].targetDate }]);
  });

  it('uses the next non-null phase for the active/next-target calculation, skipping a null phase in between', () => {
    const phases = [
      phase('Abgabe-Start', '2026-09-01T00:00:00Z'),
      phase('Zwischenschritt', null),
      phase('Abgabe-Ende', '2026-09-15T00:00:00Z')
    ];

    const result = selectTimelinePhases(phases, NOW);

    expect(result).toEqual([
      { label: 'Abgabe-Start', state: 'active', countdownTarget: phases[2].targetDate },
      { label: 'Abgabe-Ende', state: 'upcoming', countdownTarget: phases[2].targetDate }
    ]);
  });

  it('returns an empty array for an empty phase list', () => {
    expect(selectTimelinePhases([], NOW)).toEqual([]);
  });

  it('treats a targetDate exactly at now as already passed (not strictly in the future)', () => {
    const phases = [phase('Basar-Ende', NOW.toISOString())];

    expect(selectTimelinePhases(phases, NOW)).toEqual([{ label: 'Basar-Ende', state: 'completed', countdownTarget: null }]);
  });
});
