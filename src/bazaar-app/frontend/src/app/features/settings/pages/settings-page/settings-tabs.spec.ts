import { DEFAULT_SETTINGS_TAB, SETTINGS_TABS, resolveSettingsTab } from './settings-tabs';

describe('settingsTabs', () => {
  it('SETTINGS_TABS_always_listsFourTabsInOrderWithCaptionAndIcon', () => {
    // Arrange & Act
    const tabs = SETTINGS_TABS.map((tab) => ({ value: tab.value, label: tab.label, icon: tab.icon }));

    // Assert
    expect(tabs).toEqual([
      { value: 'general', label: 'Basis-Einstellungen', icon: 'pi pi-cog' },
      { value: 'users', label: 'User', icon: 'pi pi-users' },
      { value: 'print', label: 'Beleg Druck', icon: 'pi pi-print' },
      { value: 'misc', label: 'Sonstiges', icon: 'pi pi-ellipsis-h' },
    ]);
  });

  it('DEFAULT_SETTINGS_TAB_always_isBasisEinstellungen', () => {
    // Arrange & Act
    const defaultTab = SETTINGS_TABS.find((tab) => tab.value === DEFAULT_SETTINGS_TAB);

    // Assert
    expect(defaultTab?.label).toBe('Basis-Einstellungen');
  });

  it('resolveSettingsTab_knownValue_returnsThatTab', () => {
    // Arrange
    const value = 'print';

    // Act
    const tab = resolveSettingsTab(value);

    // Assert
    expect(tab).toBe('print');
  });

  it('resolveSettingsTab_unknownValue_returnsGeneral', () => {
    // Arrange
    const value = 'xyz';

    // Act
    const tab = resolveSettingsTab(value);

    // Assert
    expect(tab).toBe('general');
  });

  it('resolveSettingsTab_missingValue_returnsGeneral', () => {
    // Arrange
    const value = null;

    // Act
    const tab = resolveSettingsTab(value);

    // Assert
    expect(tab).toBe('general');
  });
});
