# Angular ToggleButton Component — Beispiele

## Basic

Two-way binding to a boolean property is defined using the standard ngModel directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-togglebutton [(ngModel)]="checked" onLabel="On" offLabel="Off" class="w-24" />
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule]
})
export class ToggleButtonBasicDemo {
    checked: boolean = false;
}
```

## Customized

Use the icon template to customize what the component displays based on its internal state.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Lock } from '@primeicons/angular/lock';
import { LockOpen } from '@primeicons/angular/lock-open';
import { VolumeUp } from '@primeicons/angular/volume-up';
import { VolumeOff } from '@primeicons/angular/volume-off';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-center gap-4">
            <p-togglebutton [(ngModel)]="value1" onLabel="On" offLabel="Off" class="min-w-16" />
            <p-togglebutton [(ngModel)]="value2" onLabel="Locked" offLabel="Unlocked" class="min-w-29">
                <ng-template #icon let-checked>
                    @if (checked) {
                        <svg data-p-icon="lock" />
                    } @else {
                        <svg data-p-icon="lock-open" />
                    }
                </ng-template>
            </p-togglebutton>
            <p-togglebutton [(ngModel)]="value3" onLabel="Mute" offLabel="Unmute" class="min-w-26">
                <ng-template #icon let-checked>
                    @if (checked) {
                        <svg data-p-icon="volume-up" />
                    } @else {
                        <svg data-p-icon="volume-off" />
                    }
                </ng-template>
            </p-togglebutton>
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule, Lock, LockOpen, VolumeUp, VolumeOff],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleButtonCustomizedDemo {
    value1: boolean = false;

    value2: boolean = false;

    value3: boolean = false;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-togglebutton [(ngModel)]="checked" [disabled]="true" onLabel="Disabled" offLabel="Disabled" />
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleButtonDisabledDemo {
    checked: boolean = false;
}
```

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-togglebutton [(ngModel)]="checked" onLabel="On" offLabel="Off" fluid />
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule]
})
export class ToggleButtonFluidDemo {
    checked: boolean = false;
}
```

## Invalid

The invalid state is applied using the invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-togglebutton [(ngModel)]="checked" [invalid]="!checked" onLabel="Invalid" offLabel="Invalid" />
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleButtonInvalidDemo {
    checked: boolean = false;
}
```

## Sizes

ToggleButton provides small and large sizes as alternatives to the base.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    template: `
        <div class="flex flex-col items-center gap-2">
            <p-togglebutton [(ngModel)]="value1" onLabel="Small" offLabel="Small" size="small" class="min-w-16" />
            <p-togglebutton [(ngModel)]="value2" onLabel="Normal" offLabel="Normal" class="min-w-20" />
            <p-togglebutton [(ngModel)]="value3" onLabel="Large" offLabel="Large" size="large" class="min-w-28" />
        </div>
    `,
    standalone: true,
    imports: [ToggleButtonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleButtonSizesDemo {
    value1: boolean = false;

    value2: boolean = false;

    value3: boolean = false;
}
```
