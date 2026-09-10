import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { buildHeatmapGrid, HeatmapEntry } from './heatmap-grid';

const WEEKDAY_LABELS = ['Mo', '', 'Mi', '', 'Fr', '', ''];

function formatTooltip(dateIso: string, count: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' }).format(date);
  const formattedDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
  const label = count === 0 ? 'Keine Aktivität' : count === 1 ? '1 Aktivität' : `${count} Aktivitäten`;
  return `${weekday}, ${formattedDate}\n${label}`;
}

@Component({
  selector: 'app-activity-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule],
  template: `
    <div class="activity-heatmap">
      <div class="activity-heatmap__header">
        <p class="activity-heatmap__title">Aktivität — letzte 12 Wochen</p>
        <div class="activity-heatmap__legend">
          <span>Weniger</span>
          @for (level of [0, 1, 2, 3, 4]; track level) {
            <span class="activity-heatmap__legend-cell activity-heatmap__cell--l{{ level }}"></span>
          }
          <span>Mehr</span>
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
  readonly events = input<HeatmapEntry[]>([]);

  readonly rows = computed(() => buildHeatmapGrid(this.events()));

  weekdayLabel(rowIndex: number): string {
    return WEEKDAY_LABELS[rowIndex] ?? '';
  }

  tooltipFor(date: string, count: number): string {
    return formatTooltip(date, count);
  }
}
