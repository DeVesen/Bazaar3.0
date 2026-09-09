/** Aufgeschlüsselte Restzeit bis zu einem Zieldatum (siehe docs/components/countdown/component.md §3). */
export interface RemainingTime {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/**
 * Berechnet die Restzeit bis `targetDate` ab `now`. Liegt `targetDate` in der Vergangenheit
 * (oder ist die Phase bereits abgeschlossen), wird `0` in allen Feldern zurückgegeben — es gibt
 * keinen Wechsel in negative Werte (component.md AC-2).
 */
export function computeRemainingTime(targetDate: Date, now: Date = new Date()): RemainingTime {
  const remainingMs = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

/** 2-stellig mit führender Null (component.md §4: HH/MM/SS). */
export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Tage ohne führende Null, Singular/Plural-bewusst: `1 Tag` vs. `X Tage` (component.md §4, AC-6). */
export function formatDaysLabel(days: number): string {
  return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
}

/** Datum im deutschen Format `EEEE, dd.MM.yyyy`, z. B. „Samstag, 05.09.2026" (component.md §4). */
export function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
