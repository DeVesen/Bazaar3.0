import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SettingsPage } from './settings-page';
import { SettingsApi } from '../../data/settings-api';

describe('SettingsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 })) } },
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('hosts app-settings-form', () => {
    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();

    const settingsForm = fixture.nativeElement.querySelector('app-settings-form');
    expect(settingsForm).not.toBeNull();
  });
});
