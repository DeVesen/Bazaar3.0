# Angular ToggleSwitch Component — Beispiele

## Basic

Toggles a boolean setting between enabled and disabled states.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    template: `
        <div class="flex justify-center items-center gap-2">
            <label for="switch">Off</label>
            <p-toggleswitch [(ngModel)]="checked" inputId="switch" />
            <label for="switch">On</label>
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule]
})
export class ToggleSwitchBasicDemo {
    checked: boolean = false;
}
```

## Customization

ToggleSwitch supports customization through the pt property. The appearance, including colors and other visual properties, can be modified by applying custom classes.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    template: `
        <div>
            <label for="custom" class="max-w-xs mx-auto flex items-start gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700 p-4 rounded-md transition-colors">
                <div class="flex flex-col gap-1 flex-1">
                    <span class="m-0 text-medium text-slate-900 dark:text-slate-50">Try Beta Features</span>
                    <span class="m-0 text-sm text-slate-400">Experience upcoming features before they&apos;re officially released.</span>
                </div>
                <p-toggleswitch
                    [(ngModel)]="checked"
                    inputId="custom"
                    [pt]="{
                        slider: { class: checked ? 'bg-blue-300! rounded-md!' : 'bg-slate-300! dark:bg-slate-600! rounded-md!' },
                        handle: { class: checked ? 'bg-blue-900!' : 'bg-slate-500!' }
                    }"
                />
            </label>
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule]
})
export class ToggleSwitchCustomizationDemo {
    checked: boolean = true;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    template: `
        <div class="flex justify-center">
            <p-toggleswitch [(ngModel)]="checked" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule]
})
export class ToggleSwitchDisabledDemo {
    checked: boolean = false;
}
```

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    template: `
        <div class="flex justify-center">
            <p-toggleswitch [(ngModel)]="checked" [invalid]="!checked" />
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule]
})
export class ToggleSwitchInvalidDemo {
    checked: boolean = false;
}
```

## Preselection

A controlled ToggleSwitch manages the checked state with ngModel and handles the change event manually.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    template: `
        <div class="flex justify-center items-center gap-2">
            <p-toggleswitch [(ngModel)]="checked" inputId="mode" />
            <label for="mode">Airplane Mode</label>
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule]
})
export class ToggleSwitchControlledDemo {
    checked: boolean = true;
}
```

## Template

The handle template is available to display custom content.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <p-toggleswitch [(ngModel)]="checked">
                <ng-template #handle let-checked="checked">
                    @if (checked) {
                        <svg data-p-icon="check" class="text-xs!" />
                    } @else {
                        <svg data-p-icon="times" class="text-xs!" />
                    }
                </ng-template>
            </p-toggleswitch>
        </div>
    `,
    standalone: true,
    imports: [ToggleSwitchModule, FormsModule, Check, Times]
})
export class ToggleSwitchTemplateDemo {
    checked: boolean = false;
}
```
