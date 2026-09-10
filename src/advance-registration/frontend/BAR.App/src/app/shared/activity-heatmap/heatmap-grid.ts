export interface HeatmapEntry {
  date: string; // ISO 'YYYY-MM-DD'
  count: number;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  date: string;
  count: number;
  level: HeatmapLevel;
}

const WEEKS = 12;
const DAYS_PER_WEEK = 7;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function levelFor(count: number): HeatmapLevel {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 1) return 1;
  return 0;
}

/** Grid rows: index 0 = Monday ... index 6 = Sunday. Columns: oldest week first, today's week last. */
export function buildHeatmapGrid(events: HeatmapEntry[], today: Date = new Date()): HeatmapCell[][] {
  const countsByDate = new Map(events.map((e) => [e.date, e.count]));

  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const isoWeekday = todayUtc.getUTCDay() === 0 ? 7 : todayUtc.getUTCDay(); // Mon=1..Sun=7
  const currentWeekMonday = new Date(todayUtc);
  currentWeekMonday.setUTCDate(todayUtc.getUTCDate() - (isoWeekday - 1));

  const gridStartMonday = new Date(currentWeekMonday);
  gridStartMonday.setUTCDate(currentWeekMonday.getUTCDate() - (WEEKS - 1) * DAYS_PER_WEEK);

  const grid: HeatmapCell[][] = Array.from({ length: DAYS_PER_WEEK }, () => []);

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const cellDate = new Date(gridStartMonday);
      cellDate.setUTCDate(gridStartMonday.getUTCDate() + week * DAYS_PER_WEEK + day);
      const iso = toIsoDate(cellDate);
      const count = countsByDate.get(iso) ?? 0;
      grid[day][week] = { date: iso, count, level: levelFor(count) };
    }
  }

  return grid;
}
