import { DestroyRef, effect, inject, signal } from '@angular/core';
import { InputAddon } from './input';

export type FieldMode = 'keyboard' | 'camera' | 'numpad';

const ACTIVE_ADDON_CLASS = 'app-input__addon--active';

/**
 * Addons für ein `app-input` mit Eingabemodi — Reihenfolge und Icons wie das Verkauf-Feld
 * (checkout-page.ts `inputAddons()`): Kamera, Nummernblock, Löschen, Übernehmen.
 */
export function fieldModeAddons(modes: readonly FieldMode[], active: FieldMode): InputAddon[] {
  const addons: InputAddon[] = [];
  if (modes.includes('camera')) {
    addons.push({
      type: 'icon',
      value: 'pi pi-camera',
      key: 'camera',
      class: active === 'camera' ? ACTIVE_ADDON_CLASS : undefined,
    });
  }
  if (modes.includes('numpad')) {
    addons.push({
      type: 'icon',
      value: 'pi pi-th-large',
      key: 'numpad',
      class: active === 'numpad' ? ACTIVE_ADDON_CLASS : undefined,
    });
  }
  addons.push({ type: 'icon', value: 'pi pi-times', key: 'clear' }, { type: 'icon', value: 'pi pi-reply', key: 'enter' });
  return addons;
}

/** Nummernblock-Taste auf den Feldwert anwenden (Muster checkout-page.ts `onNumpadKey`). */
export function applyNumpadKey(current: string, init: KeyboardEventInit): string {
  const key = init.key;
  if (key === 'Backspace') return current.slice(0, -1);
  if (key !== undefined && /^[0-9]$/.test(key)) return current + key;
  return current;
}

/**
 * Modus-Zustand eines `app-input` mit Kamera/Nummernblock (ersetzt die Modus-Logik von
 * `app-input-group` für Scan-Dialog und Verkäufersuche). Muss im Injection-Context entstehen
 * (Feld-Initializer einer Komponente), weil er `effect()` und `DestroyRef` nutzt.
 *
 * Kamera-verweigert-Erkennung 1:1 aus `input-group.ts` `checkCameraAccess()` übernommen — dort
 * sind auch die Grenzen dokumentiert (Permissions API nur in Chromium zuverlässig).
 */
export class FieldModeState {
  private readonly _active = signal<FieldMode>('keyboard');
  readonly active = this._active.asReadonly();
  readonly cameraDenied = signal(false);

  private previous: FieldMode = 'keyboard';
  private permissionStatus: PermissionStatus | undefined;

  constructor() {
    effect(() => {
      if (this._active() === 'camera') {
        this.cameraDenied.set(false);
        void this.checkCameraAccess();
      } else {
        this.teardownPermissionWatch();
      }
    });
    inject(DestroyRef).onDestroy(() => this.teardownPermissionWatch());
  }

  switchTo(mode: FieldMode): void {
    if (mode === 'camera' && this._active() !== 'camera') {
      this.previous = this._active();
    }
    this._active.set(mode);
  }

  toggle(mode: 'camera' | 'numpad'): void {
    this.switchTo(this._active() === mode ? 'keyboard' : mode);
  }

  /** Modus vor dem letzten Wechsel in die Kamera; `'keyboard'`, falls nie in der Kamera. */
  previousMode(): FieldMode {
    return this.previous;
  }

  private async checkCameraAccess(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.flagCameraDenied();
      return;
    }

    const permissions = navigator.permissions;
    if (!permissions?.query) return;

    try {
      const status = await permissions.query({ name: 'camera' as unknown as PermissionName });
      if (status.state === 'denied') {
        this.flagCameraDenied();
        return;
      }
      this.permissionStatus = status;
      status.onchange = () => {
        if (status.state === 'denied' && this._active() === 'camera') {
          this.flagCameraDenied();
        }
      };
    } catch {
      // Permissions API vorhanden, 'camera' aber nicht abfragbar — dokumentierte Grenze.
    }
  }

  private flagCameraDenied(): void {
    this.cameraDenied.set(true);
    this._active.set('keyboard');
  }

  private teardownPermissionWatch(): void {
    if (this.permissionStatus) {
      this.permissionStatus.onchange = null;
      this.permissionStatus = undefined;
    }
  }
}
