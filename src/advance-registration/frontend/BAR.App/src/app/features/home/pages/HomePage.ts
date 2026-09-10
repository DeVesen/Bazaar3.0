import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { KpiTile } from '../../../shared/kpi-tile/kpi-tile';
import { KpiGrid } from '../../../shared/kpi-tile/kpi-grid';
import { ActivityHeatmap } from '../../../shared/activity-heatmap/activity-heatmap';
import { Countdown } from '../../../shared/countdown/countdown';
import { VerkaeuferNummer } from '../../../shared/verkaeufer-nummer/verkaeufer-nummer';
import { MarkdownText } from '../../../shared/markdown-text/markdown-text';
import { HomeApiService, SellerHomeResponse, AdminHomeResponse } from '../home-api.service';
import { PublicInfoService } from '../../../core/public-info/public-info.service';
import { RoleService } from '../../../core/auth/role.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiTile, KpiGrid, ActivityHeatmap, Countdown, VerkaeuferNummer, MarkdownText, RouterLink, TranslatePipe],
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.scss'
})
export class HomePage {
  private readonly homeApi = inject(HomeApiService);
  private readonly publicInfo = inject(PublicInfoService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly isAdminView = computed(() => this.roleService.activeRole() === 'admin');
  readonly sellerId = computed(() => this.authService.currentUser()?.sub ?? '');

  readonly info = toSignal(this.publicInfo.get(), { initialValue: null });

  readonly showInfoPanel = computed(() => (this.info()?.infoText ?? '').trim().length > 0);

  private readonly isAdminView$ = toObservable(this.isAdminView);

  private readonly sellerHome = toSignal<SellerHomeResponse | null>(
    this.isAdminView$.pipe(switchMap((isAdmin) => (isAdmin ? of(null) : this.homeApi.getSellerHome()))),
    { initialValue: null }
  );

  private readonly adminHome = toSignal<AdminHomeResponse | null>(
    this.isAdminView$.pipe(switchMap((isAdmin) => (isAdmin ? this.homeApi.getAdminHome() : of(null)))),
    { initialValue: null }
  );

  readonly articleCount = computed(() => this.sellerHome()?.articleCount ?? null);
  readonly commissionRate = computed(() => this.sellerHome()?.typeConditions.commissionRate ?? null);
  readonly itemFee = computed(() => this.sellerHome()?.typeConditions.itemFee ?? null);
  readonly totalFee = computed(() => {
    const count = this.articleCount();
    const fee = this.itemFee();
    return count === null || fee === null ? null : (count * fee).toFixed(2);
  });

  readonly adminSellerCount = computed(() => this.adminHome()?.sellerCount ?? null);
  readonly adminArticleCount = computed(() => this.adminHome()?.articleCount ?? null);
  readonly adminCategoryCount = computed(() => this.adminHome()?.categoryCount ?? null);
  readonly adminBrandCount = computed(() => this.adminHome()?.brandCount ?? null);
  readonly heatmapEvents = computed(() => this.adminHome()?.heatmapData ?? []);

  // Plain getters, not computed(): translate.instant() is an untracked plain method call that
  // computed()'s dependency graph cannot see, so a computed() wrapping it would freeze the phase
  // labels at whatever language was active on first read (see Task 17 note on countdown.ts —
  // that computed() stayed safe only because a periodic tick signal forces re-evaluation every
  // second regardless; info() here only changes once per API response, not on language switch,
  // so that exception does not apply). These getters instead re-run on every change-detection
  // pass, which the TranslatePipe usages elsewhere in HomePage.html already trigger on language
  // change, so the labels stay correct when the user switches locale.
  get dropOffPhases(): { label: string; targetDate: Date }[] {
    const i = this.info();
    if (!i?.dropOffFrom || !i.dropOffUntil) return [];
    return [
      { label: this.translate.instant('login.phaseDropOffFrom'), targetDate: new Date(i.dropOffFrom) },
      { label: this.translate.instant('login.phaseDropOffUntil'), targetDate: new Date(i.dropOffUntil) }
    ];
  }

  get adminPhases(): { label: string; targetDate: Date }[] {
    const i = this.info();
    if (!i) return [];
    return [
      { label: this.translate.instant('login.phaseRegistrationDeadline'), targetDate: i.registrationDeadline ? new Date(i.registrationDeadline) : null },
      { label: this.translate.instant('login.phaseDropOffFrom'), targetDate: i.dropOffFrom ? new Date(i.dropOffFrom) : null },
      { label: this.translate.instant('login.phaseDropOffUntil'), targetDate: i.dropOffUntil ? new Date(i.dropOffUntil) : null },
      { label: this.translate.instant('login.phaseBazaarFrom'), targetDate: i.bazaarFrom ? new Date(i.bazaarFrom) : null },
      { label: this.translate.instant('login.phaseBazaarUntil'), targetDate: i.bazaarUntil ? new Date(i.bazaarUntil) : null }
    ].filter((phase): phase is { label: string; targetDate: Date } => phase.targetDate !== null);
  }
}
