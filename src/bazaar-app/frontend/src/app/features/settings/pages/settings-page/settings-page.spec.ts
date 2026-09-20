import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SettingsPage } from './settings-page';
import { SettingsApi } from '../../data/settings-api';
import { ImportApi } from '../../data/import-api';
import { UsersApi } from '../../data/users-api';
// Same sanctioned cross-feature import as import-panel.ts itself (see that file's comment).
// eslint-disable-next-line boundaries/dependencies
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';

describe('SettingsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 })) } },
        { provide: ImportApi, useValue: { preview: vi.fn(), run: vi.fn() } },
        { provide: SellerTypesApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
        { provide: UsersApi, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        // Real ConfirmationService — see user-management.spec.ts's comment for why a bare
        // `useValue` mock crashes `p-confirmdialog`'s own constructor.
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('hosts app-settings-form', () => {
    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();

    const settingsForm = fixture.nativeElement.querySelector('app-settings-form');
    expect(settingsForm).not.toBeNull();
  });

  it('hosts app-import-panel', () => {
    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();

    const importPanel = fixture.nativeElement.querySelector('app-import-panel');
    expect(importPanel).not.toBeNull();
  });

  it('hosts app-user-management (Round-27 Task C wiring)', () => {
    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();

    const userManagement = fixture.nativeElement.querySelector('app-user-management');
    expect(userManagement).not.toBeNull();
  });
});
