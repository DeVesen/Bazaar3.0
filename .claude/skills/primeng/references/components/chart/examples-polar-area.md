# Angular Chart Component — Polar Area

## Polar Area

Polar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.

```typescript
import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
    template: `
        <div class="flex justify-center">
            <p-chart type="polarArea" [data]="data" [options]="options" class="w-full md:w-120" />
        </div>
    `,
    standalone: true,
    imports: [ChartModule]
})
export class ChartPolarAreaDemo implements OnInit {
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
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.data = {
                datasets: [
                    {
                        data: [11, 16, 7, 3, 14],
                        backgroundColor: [
                            documentStyle.getPropertyValue('--p-pink-500'),
                            documentStyle.getPropertyValue('--p-gray-500'),
                            <!-- +3 gleichartige Zeilen -->
                        ],
                        label: 'My dataset'
                    }
                ],
                labels: ['Pink', 'Gray', 'Orange', 'Purple', 'Cyan']
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
                            color: surfaceBorder
                        }
                    }
                }
            };
            this.cd.markForCheck();
        }
    }
}
```
