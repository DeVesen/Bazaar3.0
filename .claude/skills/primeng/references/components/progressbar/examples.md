# Angular ProgressBar Component — Beispiele

## Basic

Reflects the completion percentage of an ongoing process.

```typescript
import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <p-progressbar [value]="50" />
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule]
})
export class ProgressBarBasicDemo {}
```

## Dynamic

Value is reactive so updating it dynamically changes the bar as well.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <div class="text-color font-medium text-sm mb-2">Uploading Files</div>
            <p-progressbar [value]="value" />
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule]
})
export class ProgressBarDynamicDemo implements OnInit {
    value: number = 0;

    interval: any;

    private cd = inject(ChangeDetectorRef);

    private ngZone = inject(NgZone);

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.interval = setInterval(() => {
                this.ngZone.run(() => {
                    const newValue = Math.round(this.value + Math.random() * 40 + 1);
                    if (newValue >= 100) {
                        this.value = 100;
                        clearInterval(this.interval);
                    } else {
                        this.value = newValue;
                    }
                });
            }, 2000);
        });
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
```

## Indeterminate

For progresses with no value to track, set the mode property to indeterminate .

```typescript
import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <p-progressbar mode="indeterminate" [style]="{ height: '6px' }" />
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule]
})
export class ProgressBarIndeterminateDemo {}
```

## As Steps

Steps are used to display a progress with multiple steps.

```typescript
import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <div class="mb-3 font-medium text-sm">{{ orderProgress[step].status }}</div>
            <p-progressbar [value]="stepValue" />
            <div class="flex items-center justify-between mt-6">
                <button type="button" pButton [rounded]="true" variant="text" severity="contrast" (click)="prevStep()" [disabled]="step === 0">Previous</button>
                <button type="button" pButton [rounded]="true" variant="text" severity="contrast" (click)="nextStep()" [disabled]="step === orderProgress.length - 1">Next</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule, ButtonModule]
})
export class ProgressBarStepsDemo {
    orderProgress = [{ status: 'Place Order' }, { status: 'Order Placed' }, { status: 'Processing' }, { status: 'Shipped' }, { status: 'Delivered' }];

    step: number = 1;

    get stepValue(): number {
        return (this.step / (this.orderProgress.length - 1)) * 100;
    }

    nextStep() {
        this.step = Math.min(this.step + 1, this.orderProgress.length - 1);
    }

    prevStep() {
        this.step = Math.max(this.step - 1, 0);
    }
}
```

## Template

The displayed value can be formatted freely and the bar restyled through passthrough; here several bars share the same animated progress with different formatters.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { Steps } from 'primeng/steps';

@Component({
    template: `
        <div class="max-w-sm mx-auto space-y-8">
            <div>
                <div class="flex items-center justify-between mb-3 text-sm">
                    <span class="font-medium">Basic Percentage</span>
                    <span>{{ basicLabel() }}</span>
                </div>
                <p-progressbar [value]="percent()" [showValue]="false" [pt]="{ root: 'h-1.5! rounded-full!', value: 'bg-blue-600! rounded-full!' }" />
            </div>
            <div>
                <div class="flex items-center justify-between mb-3 text-sm">
                    <span class="font-medium">File Size Progress</span>
                    <span>{{ fileSizeLabel() }}</span>
                </div>
                <p-progressbar [value]="percent()" [showValue]="false" [pt]="{ root: 'h-1.5! rounded-full!', value: 'bg-emerald-600! rounded-full!' }" />
            </div>
            <div>
                <div class="flex items-center justify-between mb-3 text-sm">
                    <span class="font-medium">Time Remaining</span>
                    <span>{{ timeLabel() }}</span>
                </div>
                <p-progressbar [value]="percent()" [showValue]="false" [pt]="{ root: 'h-1.5! rounded-full!', value: 'bg-purple-600! rounded-full!' }" />
            </div>
            <div>
                <div class="flex items-center justify-between mb-3 text-sm">
                    <span class="font-medium">Upload Status Steps</span>
                    <span>{{ statusLabel() }}</span>
                </div>
                <p-progressbar [value]="percent()" [showValue]="false" [pt]="{ root: 'h-1.5! rounded-full!', value: 'bg-orange-600! rounded-full!' }" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule]
})
export class ProgressBarTemplateDemo implements OnInit {
    uploadedFileSize = signal(0);

    maxFileSize: number = 5000;

    interval: any;

    percent = computed(() => (this.uploadedFileSize() / this.maxFileSize) * 100);

    basicLabel = computed(() => `${this.percent().toFixed(1)}%`);

    fileSizeLabel = computed(() => `${this.formatFileSize((this.percent() / 100) * this.maxFileSize)} / ${this.formatFileSize(this.maxFileSize)}`);

    timeLabel = computed(() => {
        const remaining = ((this.maxFileSize - this.uploadedFileSize()) / 200).toFixed(0);

        return `${this.percent().toFixed(0)}% (${remaining}s remaining)`;
    });

    statusLabel = computed(() => {
        const v = this.percent();

        if (v < 40) return 'Preparing file...';
        else if (v < 60) return 'Uploading file...';
        else if (v < 99) return 'Finalizing...';
        else return 'Upload complete';
    });

    ngOnInit() {
        this.interval = setInterval(() => {
            const newValue = this.uploadedFileSize() + Math.floor(Math.random() * 200) + 1;
            this.uploadedFileSize.set(newValue >= this.maxFileSize ? this.maxFileSize : newValue);
        }, 500);
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes.toFixed(2) + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
}
```
