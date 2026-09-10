import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { buildHeatmapGrid, HeatmapEntry } from './heatmap-grid';

const WEEKDAY_LABEL_KEYS = ['activityHeatmap.weekdayMon', '', 'activityHeatmap.weekdayWed', '', 'activityHeatmap.weekdayFri', '', ''];

@Component({
  selector: 'app-activity-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule, TranslatePipe],
  template: `
    <div class="activity-heatmap">
      <div class="activity-heatmap__header">
        <p class="activity-heatmap__title">{{ 'activityHeatmap.title' | translate }}</p>
        <div class="activity-heatmap__legend">
          <span>{{ 'activityHeatmap.less' | translate }}</span>
          @for (level of [0, 1, 2, 3, 4]; track level) {
            <span class="activity-heatmap__legend-cell activity-heatmap__cell--l{{ level }}"></span>
          }
          <span>{{ 'activityHeatmap.more' | translate }}</span>
        </div>
      </div>
      <div class="activity-heatmap__grid">
        @for (row of rows(); track $index; let rowIndex = $index) {
          <span class="activity-heatmap__weekday-label">{{ weekdayLabel(rowIndex) }}</span>
          @for (cell of row; track cell.date) {
            <span class="activity-heatmap__cell activity-heatmap__cell--l{{ cell.level }}"
                  [pTooltip]="tooltipFor(cell.date, cell.count)" tooltipPosition="top"></span>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .activity-heatmap { overflow-x: auto; }
    .activity-heatmap__header { display: flex; justify-content: space-between; align-items: center; }
    .activity-heatmap__title { font: 700 13px sans-serif; margin: 0; }
    .activity-heatmap__legend { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
    .activity-heatmap__legend-cell { width: 10px; height: 10px; border-radius: 2px; }
    .activity-heatmap__grid { display: grid; grid-template-columns: 20px repeat(12, 12px); gap: 3px; margin-top: 8px; min-width: 180px; }
    .activity-heatmap__weekday-label { font-size: 10px; color: var(--muted); align-self: center; }
    .activity-heatmap__cell { width: 12px; height: 12px; border-radius: 2px; }
    .activity-heatmap__cell--l0 { background: #ebedf0; }
    .activity-heatmap__cell--l1 { background: #9be9a8; }
    .activity-heatmap__cell--l2 { background: #40c463; }
    .activity-heatmap__cell--l3 { background: #30a14e; }
    .activity-heatmap__cell--l4 { background: #216e39; }
  `]
})
export class ActivityHeatmap {
  private readonly translate = inject(TranslateService);

  readonly events = input<HeatmapEntry[]>([]);

  readonly rows = computed(() => buildHeatmapGrid(this.events()));

  // Plain methods, not computed(): they call translate.instant()/Intl formatting based on the
  // current language and are re-invoked on every change-detection pass (triggered here by the
  // TranslatePipe usages in the template above), so they stay correct across language switches —
  // a computed() wrapping translate.instant() would freeze at the first-read language instead.
  weekdayLabel(rowIndex: number): string {
    const key = WEEKDAY_LABEL_KEYS[rowIndex];
    return key ? this.translate.instant(key) : '';
  }

  tooltipFor(date: string, count: number): string {
    return this.formatTooltip(date, count);
  }

  private locale(): string {
    return this.translate.currentLang() === 'en' ? 'en-US' : 'de-DE';
  }

  private formatTooltip(dateIso: string, count: number): string {
    const date = new Date(`${dateIso}T00:00:00Z`);
    const locale = this.locale();
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(date);
    const formattedDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
    const label =
      count === 0
        ? this.translate.instant('activityHeatmap.noActivity')
        : count === 1
          ? this.translate.instant('activityHeatmap.oneActivity')
          : this.translate.instant('activityHeatmap.activitiesCount', { count });
    return `${weekday}, ${formattedDate}\n${label}`;
  }
}
