import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomePage } from './HomePage';
import { HomeApiService } from '../home-api.service';
import { PublicInfoService } from '../../../core/public-info/public-info.service';
import { RoleService } from '../../../core/auth/role.service';
import { AuthService } from '../../../core/auth/auth.service';

const DE_TRANSLATIONS = {
  home: {
    untilBazaarLabel: 'Bis zum Basar',
    untilDropOffLabel: 'Bis zur Abgabe',
    noDeadlineSet: 'Noch kein Termin festgelegt',
    sellersLabel: 'Verkäufer',
    sellersSubLabel: 'Registriert',
    totalArticlesLabel: 'Artikel gesamt',
    articlesSubLabel: 'Artikel',
    categoriesLabel: 'Kategorien',
    brandsLabel: 'Marken',
    myArticlesLabel: 'Meine Artikel',
    piecesSubLabel: 'Stück',
    myConditionsLabel: 'Meine Konditionen',
    itemFeeUnit: '€ / Stück',
    totalFeeLabel: 'Abgabegebühr gesamt',
    currencySubLabel: '€',
    noArticlesYet: 'Noch keine Artikel erfasst.',
    registerArticlesNow: 'Jetzt Artikel erfassen'
  },
  login: {
    phaseRegistrationDeadline: 'Anmeldeschluss',
    phaseDropOffFrom: 'Abgabe ab',
    phaseDropOffUntil: 'Abgabe bis',
    phaseBazaarFrom: 'Basar ab',
    phaseBazaarUntil: 'Basar bis'
  },
  sellerNumber: { title: 'Meine Verkäufernummer', copy: 'Kopieren', hint: 'Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.', copied: '✓ Nummer kopiert' },
  countdown: { completed: 'Abgeschlossen', dayLabelSingular: 'Tag', dayLabelPlural: 'Tage' },
  activityHeatmap: {
    title: 'Aktivität — letzte 12 Wochen',
    less: 'Weniger',
    more: 'Mehr',
    weekdayMon: 'Mo',
    weekdayWed: 'Mi',
    weekdayFri: 'Fr',
    noActivity: 'Keine Aktivität',
    oneActivity: '1 Aktivität',
    activitiesCount: '{{count}} Aktivitäten'
  }
};

const EN_TRANSLATIONS = {
  home: {
    untilBazaarLabel: 'Until the bazaar',
    untilDropOffLabel: 'Until drop-off',
    noDeadlineSet: 'No date set yet',
    sellersLabel: 'Sellers',
    sellersSubLabel: 'Registered',
    totalArticlesLabel: 'Total articles',
    articlesSubLabel: 'Articles',
    categoriesLabel: 'Categories',
    brandsLabel: 'Brands',
    myArticlesLabel: 'My articles',
    piecesSubLabel: 'Items',
    myConditionsLabel: 'My conditions',
    itemFeeUnit: '€ / item',
    totalFeeLabel: 'Total drop-off fee',
    currencySubLabel: '€',
    noArticlesYet: 'No articles registered yet.',
    registerArticlesNow: 'Register articles now'
  },
  login: {
    phaseRegistrationDeadline: 'Registration deadline',
    phaseDropOffFrom: 'Drop-off from',
    phaseDropOffUntil: 'Drop-off until',
    phaseBazaarFrom: 'Bazaar from',
    phaseBazaarUntil: 'Bazaar until'
  },
  sellerNumber: { title: 'My seller number', copy: 'Copy', hint: 'Show this at the bazaar — staff will scan the code.', copied: '✓ Number copied' },
  countdown: { completed: 'Completed', dayLabelSingular: 'day', dayLabelPlural: 'days' },
  activityHeatmap: {
    title: 'Activity — last 12 weeks',
    less: 'Less',
    more: 'More',
    weekdayMon: 'Mo',
    weekdayWed: 'We',
    weekdayFri: 'Fr',
    noActivity: 'No activity',
    oneActivity: '1 activity',
    activitiesCount: '{{count}} activities'
  }
};

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

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', DE_TRANSLATIONS);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('de');

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

  it('renders all seller-view labels in English with no German residue', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Until drop-off');
    expect(text).toContain('My articles');
    expect(text).toContain('Items');
    expect(text).toContain('My conditions');
    expect(text).toContain('€ / item');
    expect(text).toContain('Total drop-off fee');
    expect(text).not.toMatch(/Bis zur Abgabe|Meine Artikel|Stück|Meine Konditionen|Abgabegebühr gesamt/);
  });

  it('renders all admin-view labels in English, including phase and empty-state text', () => {
    roleService.activeRole.mockReturnValue('admin');
    publicInfo.get.mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: ''
    }));
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Until the bazaar');
    expect(text).toContain('No date set yet');
    expect(text).toContain('Sellers');
    expect(text).toContain('Registered');
    expect(text).toContain('Total articles');
    expect(text).toContain('Categories');
    expect(text).toContain('Brands');
    expect(text).toContain('Activity — last 12 weeks');
    expect(text).not.toMatch(/Bis zum Basar|Noch kein Termin festgelegt|Verkäufer|Kategorien|Marken|Aktivität/);
  });

  it('shows a translated empty-state prompt when the seller has no articles yet', () => {
    homeApi.getSellerHome.mockReturnValue(of({ articleCount: 0, typeConditions: { commissionRate: 15, itemFee: 0.5 } }));
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No articles registered yet.');
    expect(text).toContain('Register articles now');
  });

  it('uses the translated phase labels for the countdown when set to English', () => {
    publicInfo.get.mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: '2026-10-05T08:00:00+02:00', dropOffUntil: '2026-10-05T18:00:00+02:00',
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: ''
    }));
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.componentInstance.dropOffPhases.map((p) => p.label)).toEqual(['Drop-off from', 'Drop-off until']);
  });
});
