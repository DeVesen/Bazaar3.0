import { describe, it, expect } from 'vitest';
import { selectActivePhase, CountdownPhase } from './select-active-phase';

const NOW = new Date('2026-09-09T12:00:00Z');

function phase(label: string, isoDate: string): CountdownPhase {
  return { label, targetDate: new Date(isoDate) };
}

describe('selectActivePhase', () => {
  it('returns the first phase whose targetDate is still in the future', () => {
    const phases = [
      phase('Anmeldeschluss', '2026-09-01T00:00:00Z'), // vergangen
      phase('Abgabe-Start', '2026-09-10T00:00:00Z'), // Zukunft → erwartet
      phase('Abgabe-Ende', '2026-09-15T00:00:00Z') // Zukunft
    ];

    const result = selectActivePhase(phases, NOW);

    expect(result).toEqual({ phase: phases[1], completed: false });
  });

  it('shows the last phase in completed state when all phases have passed', () => {
    const phases = [
      phase('Anmeldeschluss', '2026-08-01T00:00:00Z'),
      phase('Abgabe-Start', '2026-08-10T00:00:00Z'),
      phase('Abgabe-Ende', '2026-08-15T00:00:00Z')
    ];

    const result = selectActivePhase(phases, NOW);

    expect(result).toEqual({ phase: phases[2], completed: true });
  });

  it('returns null for an empty phase list', () => {
    expect(selectActivePhase([], NOW)).toBeNull();
  });

  it('handles a single future phase', () => {
    const phases = [phase('Basar', '2026-09-20T00:00:00Z')];

    expect(selectActivePhase(phases, NOW)).toEqual({ phase: phases[0], completed: false });
  });

  it('handles a single passed phase as completed', () => {
    const phases = [phase('Basar', '2026-09-01T00:00:00Z')];

    expect(selectActivePhase(phases, NOW)).toEqual({ phase: phases[0], completed: true });
  });

  it('treats a targetDate exactly at now as already passed (not strictly in the future)', () => {
    const phases = [phase('Basar', NOW.toISOString())];

    expect(selectActivePhase(phases, NOW)).toEqual({ phase: phases[0], completed: true });
  });
});
