import { Signal } from '@angular/core';

/** Kennung eines Tabs der Einstellungsseite, so wie sie im Query-Parameter `tab` steht. */
export type SettingsTab = 'general' | 'users' | 'print' | 'misc';

export interface SettingsTabDefinition {
  readonly value: SettingsTab;
  readonly label: string;
  readonly icon: string;
}

export const DEFAULT_SETTINGS_TAB: SettingsTab = 'general';

/** Reihenfolge = Reihenfolge der Tab-Leiste (docs/forge/2026-10-18-einstellungen-tabs/spec.md). */
export const SETTINGS_TABS: readonly SettingsTabDefinition[] = [
  { value: 'general', label: 'Basis-Einstellungen', icon: 'pi pi-cog' },
  { value: 'users', label: 'User', icon: 'pi pi-users' },
  { value: 'print', label: 'Beleg Druck', icon: 'pi pi-print' },
  { value: 'misc', label: 'Sonstiges', icon: 'pi pi-ellipsis-h' },
];

/** Fehlender oder unbekannter Query-Wert öffnet „Basis-Einstellungen". */
export function resolveSettingsTab(value: string | null): SettingsTab {
  const match = SETTINGS_TABS.find((tab) => tab.value === value);
  return match?.value ?? DEFAULT_SETTINGS_TAB;
}

/** Bereich eines Tabs, dessen ungespeicherte Eingaben beim Tab-Wechsel verworfen werden können. */
export interface DiscardableChanges {
  readonly hasUnsavedChanges: Signal<boolean>;
  discardChanges(): void;
}
