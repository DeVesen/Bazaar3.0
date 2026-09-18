import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import {
  ArticleStatusPopup,
  ArticleStatusValue,
  ArticleTimestampsChange,
} from './article-status-popup';

const CREATED_ONLY: ArticleStatusValue = {
  createdAt: '2026-08-17T08:04:00',
  releasedAt: null,
  soldAt: null,
  returnedAt: null,
};

const RELEASED: ArticleStatusValue = {
  createdAt: '2026-08-17T08:04:00',
  releasedAt: '2026-08-17T08:12:00',
  soldAt: null,
  returnedAt: null,
};

const RELEASED_AND_SOLD: ArticleStatusValue = {
  createdAt: '2026-08-17T08:04:00',
  releasedAt: '2026-08-17T08:12:00',
  soldAt: '2026-08-17T14:22:00',
  returnedAt: null,
};

const RELEASED_AND_RETURNED: ArticleStatusValue = {
  createdAt: '2026-08-17T08:04:00',
  releasedAt: '2026-08-17T08:12:00',
  soldAt: null,
  returnedAt: '2026-08-18T09:00:00',
};

interface ConfirmConfig {
  message?: string;
  header?: string;
  key?: string;
  accept?: () => void;
  reject?: () => void;
}

async function setup(value: ArticleStatusValue, extra: Record<string, unknown> = {}) {
  await TestBed.configureTestingModule({
    imports: [ArticleStatusPopup],
    providers: [provideRouter([]), ConfirmationService],
  }).compileComponents();

  const fixture = TestBed.createComponent(ArticleStatusPopup);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('articleNumber', 1043);
  fixture.componentRef.setInput('value', value);
  for (const [key, val] of Object.entries(extra)) {
    fixture.componentRef.setInput(key, val);
  }

  const confirmationService = TestBed.inject(ConfirmationService);
  const confirmSpy = vi
    .spyOn(confirmationService, 'confirm')
    .mockImplementation(() => confirmationService);

  await fixture.whenStable();

  return {
    fixture,
    confirmSpy: confirmSpy as unknown as ReturnType<typeof vi.fn<(config: ConfirmConfig) => void>>,
  };
}

function text(fixture: { nativeElement: HTMLElement }): string {
  return fixture.nativeElement.textContent ?? '';
}

function iconButtons(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('p-button[icon]'));
}

describe('ArticleStatusPopup', () => {
  it('renders Erstellt Am and Abgerechnet Am with no action icons at all (AC-2)', async () => {
    const { fixture } = await setup(RELEASED, { settledAt: '2026-08-20T10:00:00Z' });

    expect(text(fixture)).toContain('Erstellt Am');
    expect(text(fixture)).toContain('Abgerechnet Am');
    // Only one row (Freigegeben Am) has a null-free value producing an icon among the
    // read-only-adjacent rows; assert the total icon-button count matches exactly the
    // three correctable rows (Freigegeben/Verkauft/Rückgegeben), never five.
    expect(iconButtons(fixture).length).toBe(3);
  });

  it('shows "—" for Abgerechnet Am when settledAt is null', async () => {
    const { fixture } = await setup(CREATED_ONLY);
    expect(text(fixture)).toContain('—');
  });

  describe('Setzen/Löschen icon presence per row', () => {
    it('shows Setzen (pi-plus) for all three rows when nothing is set', async () => {
      const { fixture } = await setup(CREATED_ONLY);
      const buttons = iconButtons(fixture);
      expect(buttons.length).toBe(3);
      expect(buttons.every((b) => b.getAttribute('icon') === 'pi pi-plus')).toBe(true);
    });

    it('shows Löschen (pi-trash) for Freigegeben Am once releasedAt is set', async () => {
      const { fixture } = await setup(RELEASED);
      const buttons = iconButtons(fixture);
      expect(buttons.length).toBe(3);
      const icons = buttons.map((b) => b.getAttribute('icon'));
      // releasedAt has a trash icon; soldAt/returnedAt are still null -> plus icons.
      expect(icons.filter((i) => i === 'pi pi-trash').length).toBe(1);
      expect(icons.filter((i) => i === 'pi pi-plus').length).toBe(2);
    });
  });

  describe('mutual exclusion (AC-4)', () => {
    it('disables the Setzen-icon for returnedAt when soldAt is set', async () => {
      const { fixture } = await setup(RELEASED_AND_SOLD);
      const component = fixture.componentInstance;
      expect(component.returnedSetDisabled()).toBe(true);
      expect(component.soldDeleteDisabled()).toBe(false);
    });

    it('disables the Setzen-icon for soldAt when returnedAt is set', async () => {
      const { fixture } = await setup(RELEASED_AND_RETURNED);
      const component = fixture.componentInstance;
      expect(component.soldSetDisabled()).toBe(true);
      expect(component.returnedDeleteDisabled()).toBe(false);
    });
  });

  describe('settlement lock (AC-5)', () => {
    it('disables all action icons and shows the hint with a link to /sellers', async () => {
      const { fixture } = await setup(RELEASED, { settlementLocked: true });
      const component = fixture.componentInstance;

      expect(component.releasedActionDisabled()).toBe(true);
      expect(component.soldSetDisabled()).toBe(true);
      expect(component.soldDeleteDisabled()).toBe(true);
      expect(component.returnedSetDisabled()).toBe(true);
      expect(component.returnedDeleteDisabled()).toBe(true);
      expect(text(fixture)).toContain('Abrechnung zuerst stornieren');
      expect(text(fixture)).toContain('Verkäufer-Seite');

      const link = fixture.nativeElement.querySelector('a[routerLink]');
      expect(link?.getAttribute('routerLink')).toBe('/sellers');
    });
  });

  describe('cascade confirmation on deleting releasedAt (AC-3)', () => {
    it('shows the cascade confirmation listing only the downstream field that has a value', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED_AND_SOLD);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onDeleteReleased();

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      const config = confirmSpy.mock.calls[0][0];
      expect(config.key).toBe('cascadeDelete');
      expect(config.message).toContain('Verkauft am 17.08.2026 14:22');
      expect(config.message).not.toContain('Rückgegeben am');
      expect(emitSpy).not.toHaveBeenCalled();

      config.accept?.();
      expect(emitSpy).toHaveBeenCalledWith({ releasedAt: null, soldAt: null, returnedAt: null });
    });

    it('lists returnedAt when that is the field with a value', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED_AND_RETURNED);
      fixture.componentInstance.onDeleteReleased();

      const config = confirmSpy.mock.calls[0][0];
      expect(config.message).toContain('Rückgegeben am 18.08.2026 09:00');
      expect(config.message).not.toContain('Verkauft am');
    });

    it('skips the confirmation entirely and clears releasedAt directly when no downstream field is set', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onDeleteReleased();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ releasedAt: null, soldAt: null, returnedAt: null });
    });
  });

  describe('manual sale warning (AC-6)', () => {
    it('shows the exact required warning text before setting soldAt from null', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onSetSold();

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      const config = confirmSpy.mock.calls[0][0];
      expect(config.key).toBe('manualSale');
      expect(config.message).toBe(
        'Dieser Verkauf entsteht ohne Kassenvorgang und fehlt in der Kassenabstimmung.',
      );
      expect(emitSpy).not.toHaveBeenCalled();

      config.accept?.();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      const payload = emitSpy.mock.calls[0][0] as ArticleTimestampsChange;
      expect(payload.releasedAt).toBe(RELEASED.releasedAt);
      expect(payload.returnedAt).toBeNull();
      expect(typeof payload.soldAt).toBe('string');
      expect(payload.soldAt).not.toBeNull();
    });
  });

  describe('timestampsChange payload shape', () => {
    it('emits the full replace payload (all three fields) when setting releasedAt', async () => {
      const { fixture } = await setup(CREATED_ONLY);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onSetReleased();

      expect(emitSpy).toHaveBeenCalledTimes(1);
      const payload = emitSpy.mock.calls[0][0] as ArticleTimestampsChange;
      expect(payload.soldAt).toBeNull();
      expect(payload.returnedAt).toBeNull();
      expect(typeof payload.releasedAt).toBe('string');
    });

    it('emits the full replace payload when setting returnedAt', async () => {
      const { fixture } = await setup(RELEASED);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onSetReturned();

      expect(emitSpy).toHaveBeenCalledTimes(1);
      const payload = emitSpy.mock.calls[0][0] as ArticleTimestampsChange;
      expect(payload.releasedAt).toBe(RELEASED.releasedAt);
      expect(payload.soldAt).toBeNull();
      expect(typeof payload.returnedAt).toBe('string');
    });

    it('emits the full replace payload when deleting soldAt directly, with no further cascade', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED_AND_SOLD);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onDeleteSold();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({
        releasedAt: RELEASED_AND_SOLD.releasedAt,
        soldAt: null,
        returnedAt: null,
      });
    });

    it('emits the full replace payload when deleting returnedAt directly, with no further cascade', async () => {
      const { fixture, confirmSpy } = await setup(RELEASED_AND_RETURNED);
      const emitSpy = vi.fn();
      fixture.componentInstance.timestampsChange.subscribe(emitSpy);

      fixture.componentInstance.onDeleteReturned();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({
        releasedAt: RELEASED_AND_RETURNED.releasedAt,
        soldAt: null,
        returnedAt: null,
      });
    });
  });

  it('emits visibleChange(false) on close', async () => {
    const { fixture } = await setup(CREATED_ONLY);
    const visibleChangeSpy = vi.fn();
    fixture.componentInstance.visibleChange.subscribe(visibleChangeSpy);

    fixture.componentInstance.onClose();

    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });
});
