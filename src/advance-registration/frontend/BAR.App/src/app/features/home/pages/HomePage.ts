import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
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
  imports: [KpiTile, KpiGrid, ActivityHeatmap, Countdown, VerkaeuferNummer, MarkdownText, RouterLink],
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.scss'
})
export class HomePage {
  private readonly homeApi = inject(HomeApiService);
  private readonly publicInfo = inject(PublicInfoService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);

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

  readonly dropOffPhases = computed(() => {
    const i = this.info();
    if (!i?.dropOffFrom || !i.dropOffUntil) return [];
    return [
      { label: 'ABGABE-START', targetDate: new Date(i.dropOffFrom) },
      { label: 'ABGABE-ENDE', targetDate: new Date(i.dropOffUntil) }
    ];
  });

  readonly adminPhases = computed(() => {
    const i = this.info();
    if (!i) return [];
    return [
      { label: 'ANMELDESCHLUSS', targetDate: i.registrationDeadline ? new Date(i.registrationDeadline) : null },
      { label: 'ABGABE-START', targetDate: i.dropOffFrom ? new Date(i.dropOffFrom) : null },
      { label: 'ABGABE-ENDE', targetDate: i.dropOffUntil ? new Date(i.dropOffUntil) : null },
      { label: 'BASAR-START', targetDate: i.bazaarFrom ? new Date(i.bazaarFrom) : null },
      { label: 'BASAR-ENDE', targetDate: i.bazaarUntil ? new Date(i.bazaarUntil) : null }
    ].filter((phase): phase is { label: string; targetDate: Date } => phase.targetDate !== null);
  });
}
