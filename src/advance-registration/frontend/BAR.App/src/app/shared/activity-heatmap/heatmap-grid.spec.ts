import { describe, it, expect } from 'vitest';
import { buildHeatmapGrid } from './heatmap-grid';

describe('buildHeatmapGrid', () => {
  it('returns 7 rows (Mo-So) and 12 columns (weeks)', () => {
    const grid = buildHeatmapGrid([], new Date('2026-09-10T12:00:00Z'));

    expect(grid.length).toBe(7);
    for (const row of grid) {
      expect(row.length).toBe(12);
    }
  });

  it('starts the grid on the Monday 12 weeks back and ends today', () => {
    const today = new Date('2026-09-10T12:00:00Z'); // Thursday
    const grid = buildHeatmapGrid([], today);

    expect(grid[0][0].date).toBe('2026-06-22'); // Monday, 12 weeks back
    expect(grid[3][11].date).toBe('2026-09-10'); // Thursday, last column, today
  });

  it('maps a matching event date to the right cell with count', () => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([{ date: '2026-09-10', count: 7 }], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.count).toBe(7);
  });

  it('defaults missing days to count 0 and level 0', () => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.count).toBe(0);
    expect(cell.level).toBe(0);
  });

  it.each([
    [0, 0], [1, 1], [4, 1], [5, 2], [9, 2], [10, 3], [19, 3], [20, 4], [50, 4]
  ])('maps count %i to level %i', (count, level) => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([{ date: '2026-09-10', count }], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.level).toBe(level);
  });
});
