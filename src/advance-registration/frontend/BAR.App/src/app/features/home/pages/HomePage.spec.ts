import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomePage } from './HomePage';
import { HomeApiService } from '../home-api.service';
import { PublicInfoService } from '../../../core/public-info/public-info.service';
import { RoleService } from '../../../core/auth/role.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let homeApi: { getSellerHome: ReturnType<typeof vi.fn>; getAdminHome: ReturnType<typeof vi.fn> };
  let publicInfo: { get: ReturnType<typeof vi.fn> };
  let roleService: { activeRole: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    homeApi = {
      getSellerHome: vi.fn().mockReturnValue(of({ articleCount: 3, typeConditions: { commissionRate: 15, itemFee: 0.5 } })),
      getAdminHome: vi.fn().mockReturnValue(of({ sellerCount: 2, articleCount: 9, categoryCount: 4, brandCount: 6, heatmapData: [] }))
    };
    publicInfo = { get: vi.fn().mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: '2026-10-05T08:00:00+02:00', dropOffUntil: '2026-10-05T18:00:00+02:00',
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: 'Hinweistext'
    })) };
    roleService = { activeRole: vi.fn().mockReturnValue('seller') };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        { provide: HomeApiService, useValue: homeApi },
        { provide: PublicInfoService, useValue: publicInfo },
        { provide: RoleService, useValue: roleService },
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'a3f9c2d1', role: 'seller', exp: 9999999999 }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('loads seller data and shows the 4-column seller grid', () => {
    expect(homeApi.getSellerHome).toHaveBeenCalled();
    expect(homeApi.getAdminHome).not.toHaveBeenCalled();
    const grid = fixture.nativeElement.querySelector('.kpi-grid--c4');
    expect(grid).not.toBeNull();
  });

  it('shows the seller number card in seller mode', () => {
    expect(fixture.nativeElement.querySelector('app-verkaeufer-nummer')).not.toBeNull();
  });

  it('computes total drop-off fee as articleCount × itemFee', () => {
    expect(fixture.nativeElement.textContent).toContain('1.50');
  });

  it('switches to the 5-column admin grid with heatmap when role is admin', () => {
    roleService.activeRole.mockReturnValue('admin');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(homeApi.getAdminHome).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.kpi-grid--c5')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-activity-heatmap')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-verkaeufer-nummer')).toBeNull();
  });

  it('shows the info panel when infoText is set', () => {
    expect(fixture.nativeElement.querySelector('app-markdown-text')).not.toBeNull();
  });

  it('hides the info panel when infoText is empty', () => {
    publicInfo.get.mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: '   '
    }));
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-markdown-text')).toBeNull();
  });
});
