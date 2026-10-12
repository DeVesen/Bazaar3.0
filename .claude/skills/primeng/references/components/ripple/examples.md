# Angular Ripple Component — Beispiele

## Custom

Styling Demo Content.

```typescript
import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';

@Component({
    template: `
        <div class="flex flex-col gap-4 items-center">
            <span class="text-sm"
                >Ripple option at the
                <span class="mx-1 h-8 w-8 rounded-border inline-flex items-center justify-center bg-primary text-primary-contrast"><i class="pi pi-palette"></i></span>
                configurator needs to be turned on for the demo.</span
            >
            <div class="flex justify-center gap-2">
                <div pRipple class="box" style="border: 1px solid rgba(75, 175, 80, 0.3); --p-ripple-background: rgba(75, 175, 80, 0.3)">Green</div>
                <div pRipple class="box" style="border: 1px solid rgba(255, 193, 6, 0.3); --p-ripple-background: rgba(255, 193, 6, 0.3)">Orange</div>
                <div pRipple class="box" style="border: 1px solid rgba(156, 39, 176, 0.3); --p-ripple-background: rgba(156, 39, 176, 0.3)">Purple</div>
            </div>
        </div>
    `,
    styles: [
        `
            :host {
                .box {
                    padding: 1.75rem;
                    border-radius: 10px;
                    background: var(--p-content-background);
                    font-size: 0.875rem;
                    width: 110px;
                    text-align: center;
                }
            }
        `
    ],
    standalone: true,
    imports: [RippleModule]
})
export class RippleCustomDemo {}
```

## Default

Default Demo Content.

```typescript
import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <span class="text-sm"
                >Ripple option at the
                <span class="mx-1 h-8 w-8 rounded-border inline-flex items-center justify-center bg-primary text-primary-contrast"><i class="pi pi-palette"></i></span>
                configurator needs to be turned on for the demo.</span
            >
            <div pRipple class="ripple-box">Default</div>
        </div>
    `,
    styles: [
        `
            :host {
                .ripple-box {
                    display: flex;
                    user-select: none;
                    justify-content: center;
                    align-items: center;
                    padding: 2.625rem;
                    font-weight: bold;
                    font-size: 0.875rem;
                    background: var(--p-content-background);
                    border: 1px solid var(--p-content-border-color);
                    border-radius: var(--p-content-border-radius);
                }
            }
        `
    ],
    standalone: true,
    imports: [RippleModule]
})
export class RippleDefaultDemo {}
```
