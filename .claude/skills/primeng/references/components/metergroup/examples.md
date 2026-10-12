# Angular MeterGroup Component — Beispiele

## Basic

Visualizes multiple values as segmented horizontal bars.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupBasicDemo {
    value = [{ label: 'Space used', value: 15, color: 'var(--p-primary-color)' }];
}
```

## Color

MeterGroup supports custom color values. Use color property with hex, rgb, hsl, or hsla values.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupColorDemo {
    value = [
        { label: 'Violet', value: 12, color: 'var(--p-violet-500)' },
        { label: 'Emerald', value: 14, color: '#10B981' },
        { label: 'Rose', value: 10, color: 'rgb(244, 63, 94)' },
        { label: 'Blue', value: 8, color: '#3B82F6' },
        { label: 'Yellow', value: 10, color: '#EAB308' }
    ];
}
```

## Icon

Icons can be displayed next to the labels instead of the default marker.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupIconDemo {
    value = [
        { label: 'Apps', color: 'var(--p-violet-500)', value: 16, icon: 'pi pi-table' },
        { label: 'Messages', color: 'var(--p-emerald-500)', value: 8, icon: 'pi pi-inbox' },
        { label: 'Media', color: 'var(--p-amber-500)', value: 24, icon: 'pi pi-image' },
        { label: 'System', color: 'var(--p-blue-500)', value: 10, icon: 'pi pi-cog' }
    ];
}
```

## Label

The default orientation of the labels is horizontal, and the vertical alternative is available through the labelOrientation option.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" labelPosition="start" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupLabelDemo {
    value = [
        { label: 'Apps', color: 'var(--p-violet-500)', value: 16 },
        { label: 'Messages', color: 'var(--p-emerald-500)', value: 8 },
        { label: 'Media', color: 'var(--p-amber-500)', value: 24 },
        { label: 'System', color: 'var(--p-blue-500)', value: 10 }
    ];
}
```

## Min Max

Boundaries are configured with the min and max values whose defaults are 0 and 100 respectively.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" [max]="200" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupMinMaxDemo {
    value = [
        { label: 'Apps', color: 'var(--p-violet-500)', value: 16 },
        { label: 'Messages', color: 'var(--p-emerald-500)', value: 8 },
        { label: 'Media', color: 'var(--p-amber-500)', value: 24 },
        { label: 'System', color: 'var(--p-blue-500)', value: 10 }
    ];
}
```

## Multiple

Adding more items to the value array displays the meters in a group.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <p-metergroup [value]="value" class="max-w-md mx-auto" />
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupMultipleDemo {
    value = [
        { label: 'Apps', color: 'var(--p-violet-500)', value: 14 },
        { label: 'Messages', color: 'var(--p-emerald-500)', value: 12 },
        { label: 'Media', color: 'var(--p-amber-500)', value: 8 },
        { label: 'System', color: 'var(--p-blue-500)', value: 12 },
        { label: 'Documents', color: 'var(--p-gray-500)', value: 6 },
        { label: 'Cache', color: 'var(--p-cyan-500)', value: 11 },
        { label: 'Other', color: 'var(--p-pink-500)', value: 9 }
    ];
}
```

## Template

MeterGroup provides templating support for labels, meter items, and content around the meters.

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MeterGroupModule } from 'primeng/metergroup';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <p-metergroup [value]="value" labelPosition="start" class="max-w-sm mx-auto">
            <ng-template #label>
                <div class="flex flex-wrap gap-4">
                    @for (meterItem of value; track $index; let index = $index) {
                        <p-card class="flex-1 border border-surface shadow-none">
                            <div class="flex justify-between gap-8">
                                <div class="flex flex-col gap-1">
                                    <span class="text-surface-500 dark:text-surface-400 text-sm">{{ meterItem.label }}</span>
                                    <span class="font-bold text-lg">{{ meterItem.value }}%</span>
                                </div>
                                <span class="w-8 h-8 rounded-full inline-flex justify-center items-center text-center" [style]="{ 'background-color': meterItem.color1, color: '#ffffff' }">
                                    <i [class]="meterItem.icon"></i>
                                </span>
                            </div>
                        </p-card>
                    }
                </div>
            </ng-template>
            <ng-template #meter let-value let-class="class" let-width="size">
                <span [class]="class" [style]="{ background: 'linear-gradient(to right, ' + value.color1 + ', ' + value.color2 + ')', width: width }"></span>
            </ng-template>
            <ng-template #start let-totalPercent="totalPercent">
                <div class="flex justify-between mt-4 mb-2 relative">
                    <span class="text-sm">Storage</span>
                    <span [style]="{ width: totalPercent + '%' }" class="absolute text-right text-sm">{{ totalPercent }}%</span>
                    <span class="font-medium text-sm">1TB</span>
                </div>
            </ng-template>
            <ng-template #end>
                <div class="flex justify-between mt-4">
                    <button type="button" pButton [outlined]="true" size="small">Manage Storage</button>
                    <button type="button" pButton size="small">Update Plan</button>
                </div>
            </ng-template>
        </p-metergroup>
    `,
    standalone: true,
    imports: [CardModule, MeterGroupModule, ButtonModule]
})
export class MeterGroupTemplateDemo {
    value = [
        { label: 'Apps', color1: '#34d399', color2: '#fbbf24', value: 25, icon: 'pi pi-table' },
        { label: 'Messages', color1: '#fbbf24', color2: '#60a5fa', value: 15, icon: 'pi pi-inbox' },
        { label: 'Media', color1: '#60a5fa', color2: '#c084fc', value: 20, icon: 'pi pi-image' },
        { label: 'System', color1: '#c084fc', color2: '#c084fc', value: 10, icon: 'pi pi-cog' }
    ];
}
```

## Vertical

Layout of the MeterGroup is configured with the orientation property that accepts either horizontal or vertical as available options.

```typescript
import { Component } from '@angular/core';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
    template: `
        <div class="flex justify-center">
            <p-metergroup [value]="value" orientation="vertical" labelOrientation="vertical" [style]="{ height: '360px' }" />
        </div>
    `,
    standalone: true,
    imports: [MeterGroupModule]
})
export class MeterGroupVerticalDemo {
    value = [
        { label: 'Apps', color: 'var(--p-violet-500)', value: 24 },
        { label: 'Messages', color: 'var(--p-emerald-500)', value: 16 },
        { label: 'Media', color: 'var(--p-amber-500)', value: 24 },
        { label: 'System', color: 'var(--p-blue-500)', value: 12 }
    ];
}
```
