# Angular Chart Component — Radar

## Radar

A radar chart is a graphical method of displaying multivariate data in the form of a two-dimensional chart of three or more quantitative variables represented on axes starting from the same point.

```typescript
import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
    template: `
        <div class="flex justify-center">
            <p-chart type="radar" [data]="data" [options]="options" class="w-full md:w-120" />
        </div>
    `,
    standalone: true,
    imports: [ChartModule]
})
export class ChartRadarDemo implements OnInit {
    private cd = inject(ChangeDetectorRef);

    data: any;

    options: any;

    platformId = inject(PLATFORM_ID);

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');

            this.data = {
                labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
                datasets: [
                    {
                        label: 'My First dataset',
                        borderColor: documentStyle.getPropertyValue('--p-gray-400'),
                        pointBackgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
                        pointBorderColor: documentStyle.getPropertyValue('--p-gray-400'),
                        pointHoverBackgroundColor: textColor,
                        pointHoverBorderColor: documentStyle.getPropertyValue('--p-gray-400'),
                        data: [65, 59, 90, 81, 56, 55, 40]
                    },
                    {
                        label: 'My Second dataset',
                        borderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                        pointBackgroundColor: documentStyle.getPropertyValue('--p-cyan-400'),
                        pointBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                        pointHoverBackgroundColor: textColor,
                        pointHoverBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                        data: [28, 48, 40, 19, 96, 27, 100]
                    }
                ]
            };

            this.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    r: {
                        grid: {
                            color: textColorSecondary
                        }
                    }
                }
            };
        }

        this.cd.markForCheck();
    }
}
```
