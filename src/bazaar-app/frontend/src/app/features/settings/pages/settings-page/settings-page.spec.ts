import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SettingsPage } from './settings-page';
import { SettingsForm } from '../../components/settings-form/settings-form';
import { PrintTextsForm } from '../../components/print-texts-form/print-texts-form';
import { ImportPanel } from '../../components/import-panel/import-panel';
import { SettingsApi } from '../../data/settings-api';
import { PrintTextsApi, emptyPrintTexts } from '../../data/print-texts-api';
import { ImportApi } from '../../data/import-api';
import { UsersApi } from '../../data/users-api';
import { DevToolsApi } from '../../data/dev-tools-api';
import { jsonFile, previewResultStub, selectEventFor } from '../../testing/import-preview.stub';
// Same sanctioned cross-feature import as import-panel.ts itself (see that file's comment).
// eslint-disable-next-line boundaries/dependencies
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';

const SETTINGS_URL = '/settings';
const LEAVE_TAB_CONFIRM_KEY = 'leaveSettingsTab';

describe('SettingsPage', () => {
  let isDevelopment: ReturnType<typeof vi.fn>;
  let confirmCalls: Confirmation[];

  beforeEach(async () => {
    isDevelopment = vi.fn().mockReturnValue(of(false));
    confirmCalls = [];

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'settings', component: SettingsPage }]),
        { provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000, releaseOnClose: true })), update: vi.fn() } },
        { provide: PrintTextsApi, useValue: { get: vi.fn().mockReturnValue(of(emptyPrintTexts())), update: vi.fn() } },
        { provide: ImportApi, useValue: { preview: vi.fn().mockReturnValue(of(previewResultStub())), run: vi.fn() } },
        { provide: SellerTypesApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
        { provide: UsersApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
        { provide: DevToolsApi, useValue: { isDevelopment } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        // Real ConfirmationService — `p-confirmdialog` subscribes to it in its own constructor,
        // a bare `useValue` mock would crash on render. `confirm()` is spied below.
        ConfirmationService,
      ],
    }).compileComponents();

    const confirmationService = TestBed.inject(ConfirmationService);
    vi.spyOn(confirmationService, 'confirm').mockImplementation((options: Confirmation) => {
      confirmCalls.push(options);
      return confirmationService;
    });
  });

  async function openSettings(url = SETTINGS_URL) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, SettingsPage);
    harness.detectChanges();
    await harness.fixture.whenStable();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  async function settle(harness: RouterTestingHarness): Promise<void> {
    await harness.fixture.whenStable();
    harness.detectChanges();
    await harness.fixture.whenStable();
  }

  function tabElements(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('p-tab'));
  }

  function tabLabels(el: HTMLElement): string[] {
    return tabElements(el).map((tab) => tab.textContent?.trim() ?? '');
  }

  function activeTabLabel(el: HTMLElement): string | undefined {
    return el.querySelector('p-tab[aria-selected="true"]')?.textContent?.trim();
  }

  function tabByLabel(el: HTMLElement, label: string): HTMLElement {
    const tab = tabElements(el).find((candidate) => candidate.textContent?.trim() === label);
    if (!tab) throw new Error(`Tab „${label}" nicht gefunden`);
    return tab;
  }

  function panelTagsOf(el: HTMLElement, selector: string): string[] {
    const panel = el.querySelector(selector)?.closest('p-tabpanel');
    return Array.from(panel?.children ?? []).map((child) => child.tagName.toLowerCase());
  }

  function childOf<T>(harness: RouterTestingHarness, type: Type<T>): T {
    return harness.fixture.debugElement.query(By.directive(type)).componentInstance as T;
  }

  it('template_openedWithoutTab_showsFourTabsInOrderWithBasisEinstellungenActive', async () => {
    // Arrange & Act
    const { el } = await openSettings();

    // Assert
    expect(tabLabels(el)).toEqual(['Basis-Einstellungen', 'User', 'Beleg Druck', 'Sonstiges']);
    expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
  });

  it('template_tabList_showsIconPerTab', async () => {
    // Arrange & Act
    const { el } = await openSettings();

    // Assert
    const icons = tabElements(el).map((tab) => tab.querySelector('i')?.className);
    expect(icons).toEqual(['pi pi-cog', 'pi pi-users', 'pi pi-print', 'pi pi-ellipsis-h']);
  });

  it('template_always_keepsPageTitleEinstellungen', async () => {
    // Arrange & Act
    const { el } = await openSettings();

    // Assert
    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Einstellungen');
  });

  it('template_basisEinstellungenTab_containsOnlyTheScanPauseForm', async () => {
    // Arrange & Act
    const { el } = await openSettings();

    // Assert
    expect(panelTagsOf(el, 'app-settings-form')).toEqual(['app-settings-form']);
  });

  it('template_userTab_containsOnlyTheUserManagement', async () => {
    // Arrange & Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=users`);

    // Assert
    expect(activeTabLabel(el)).toBe('User');
    expect(panelTagsOf(el, 'app-user-management')).toEqual(['app-user-management']);
  });

  it('template_belegDruckTab_containsOnlyThePrintTextsForm', async () => {
    // Arrange & Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=print`);

    // Assert
    expect(panelTagsOf(el, 'app-print-texts-form')).toEqual(['app-print-texts-form']);
  });

  it('template_sonstigesOutsideDevelopment_showsImportWithoutDatabaseReset', async () => {
    // Arrange
    isDevelopment.mockReturnValue(of(false));

    // Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

    // Assert
    expect(panelTagsOf(el, 'app-import-panel')).toEqual(['app-import-panel', 'app-dev-tools-panel']);
    expect(el.querySelector('.dev-tools-panel')).toBeNull();
    expect(el.textContent).not.toContain('Datenbank zurücksetzen');
  });

  it('template_sonstigesInDevelopment_showsImportAndDatabaseReset', async () => {
    // Arrange
    isDevelopment.mockReturnValue(of(true));

    // Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

    // Assert
    const importPanel = el.querySelector('app-import-panel');
    const resetTitle = el.querySelector('.dev-tools-panel__title');
    expect(importPanel).not.toBeNull();
    expect(resetTitle?.textContent?.trim()).toBe('Datenbank zurücksetzen');
    expect(resetTitle?.closest('p-tabpanel')).toBe(importPanel?.closest('p-tabpanel'));
  });

  it('template_anyMode_neverShowsEntwicklerWerkzeuge', async () => {
    // Arrange
    isDevelopment.mockReturnValue(of(true));

    // Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=misc`);

    // Assert
    expect(tabLabels(el)).not.toContain('Entwickler-Werkzeuge');
    expect(el.textContent).not.toContain('Entwickler-Werkzeuge');
  });

  it('onTabChange_noUnsavedChanges_switchesWithoutConfirmAndWritesTabIntoAddress', async () => {
    // Arrange
    const { harness, el } = await openSettings();

    // Act
    tabByLabel(el, 'Beleg Druck').click();

    // Assert
    await settle(harness);
    expect(confirmCalls).toHaveLength(0);
    expect(activeTabLabel(el)).toBe('Beleg Druck');
    expect(TestBed.inject(Router).url).toBe(`${SETTINGS_URL}?tab=print`);
  });

  it('template_reloadedWithPrintTab_keepsBelegDruckActive', async () => {
    // Arrange & Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=print`);

    // Assert
    expect(activeTabLabel(el)).toBe('Beleg Druck');
  });

  it('template_unknownTabInAddress_activatesBasisEinstellungen', async () => {
    // Arrange & Act
    const { el } = await openSettings(`${SETTINGS_URL}?tab=xyz`);

    // Assert
    expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
  });

  it('onTabChange_unsavedScanPause_asksWithBleibenAndVerwerfenAndStays', async () => {
    // Arrange
    const { harness, el } = await openSettings();
    childOf(harness, SettingsForm).onValueChange(5000);

    // Act
    tabByLabel(el, 'User').click();

    // Assert
    await settle(harness);
    expect(confirmCalls).toHaveLength(1);
    expect(confirmCalls[0]).toEqual(
      expect.objectContaining({
        key: LEAVE_TAB_CONFIRM_KEY,
        header: 'Ungespeicherte Änderungen',
        message: 'In diesem Tab gibt es ungespeicherte Änderungen. Beim Wechsel gehen sie verloren.',
        acceptLabel: 'Verwerfen',
        rejectLabel: 'Bleiben',
      }),
    );
    expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
    expect(TestBed.inject(Router).url).toBe(SETTINGS_URL);
  });

  it('onTabChange_unsavedPrintTexts_asksBeforeSwitching', async () => {
    // Arrange
    const { harness, el } = await openSettings(`${SETTINGS_URL}?tab=print`);
    childOf(harness, PrintTextsForm).onChange('abgabeBeleg', 'text1', 'Neu');

    // Act
    tabByLabel(el, 'Sonstiges').click();

    // Assert
    await settle(harness);
    expect(confirmCalls).toHaveLength(1);
    expect(activeTabLabel(el)).toBe('Beleg Druck');
  });

  it('onTabChange_confirmAnsweredBleiben_keepsTabAndInput', async () => {
    // Arrange
    const { harness, el } = await openSettings();
    const settingsForm = childOf(harness, SettingsForm);
    settingsForm.onValueChange(5000);
    tabByLabel(el, 'User').click();
    await settle(harness);

    // Act
    confirmCalls[0].reject?.();

    // Assert
    await settle(harness);
    expect(activeTabLabel(el)).toBe('Basis-Einstellungen');
    expect(settingsForm.scannerPauseMs()).toBe(5000);
    expect(TestBed.inject(Router).url).toBe(SETTINGS_URL);
  });

  it('onTabChange_confirmAnsweredVerwerfen_switchesAndRestoresSavedValue', async () => {
    // Arrange
    const { harness, el } = await openSettings();
    const settingsForm = childOf(harness, SettingsForm);
    settingsForm.onValueChange(5000);
    tabByLabel(el, 'User').click();
    await settle(harness);

    // Act
    confirmCalls[0].accept?.();

    // Assert
    await settle(harness);
    expect(activeTabLabel(el)).toBe('User');
    expect(TestBed.inject(Router).url).toBe(`${SETTINGS_URL}?tab=users`);
    expect(settingsForm.scannerPauseMs()).toBe(3000);
    expect(settingsForm.hasUnsavedChanges()).toBe(false);
  });

  it('onTabChange_openImportPreview_asksAndVerwerfenClosesThePreview', async () => {
    // Arrange
    const { harness, el } = await openSettings(`${SETTINGS_URL}?tab=misc`);
    const importPanel = childOf(harness, ImportPanel);
    importPanel.onFileSelect(selectEventFor(jsonFile()));
    tabByLabel(el, 'User').click();
    await settle(harness);

    // Act
    confirmCalls[0].accept?.();

    // Assert
    await settle(harness);
    expect(confirmCalls).toHaveLength(1);
    expect(importPanel.state()).toBe('empty');
    expect(activeTabLabel(el)).toBe('User');
  });
});
