# Angular Fluid Component — Beispiele

## Basic

Components with the fluid option like InputText have the ability to span the full width of their component. Enabling the fluid for each component individually may be cumbersome so wrap the content with Fluid instead for an easier alternative.

```typescript
import { Component } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div>
            <p-fluid>
                <label pLabel for="with-fluid" class="font-bold! mb-2 block">With Fluid</label>
                <input type="text" pInputText id="with-fluid" placeholder="Type..." />
            </p-fluid>
        </div>
    `,
    standalone: true,
    imports: [FluidModule, InputTextModule, LabelModule]
})
export class FluidBasicDemo {}
```

## Comparison

The fluid property can be enabled per component, or applied to a group of components by wrapping them with Fluid . A child component's own fluid property takes precedence over the container, as shown in the last sample.

```typescript
import { Component } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-col gap-6">
            <div>
                <label pLabel for="non-fluid" class="font-bold! mb-2 block">Non-Fluid</label>
                <input type="text" pInputText id="non-fluid" />
            </div>
            <div>
                <label pLabel for="fluid" class="font-bold! mb-2 block">Fluid Prop</label>
                <input type="text" pInputText id="fluid" fluid />
            </div>
            <p-fluid>
                <span class="font-bold mb-2 block">Fluid Container</span>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <input type="text" pInputText />
                    </div>
                    <div>
                        <input type="text" pInputText />
                    </div>
                    <div class="col-span-full">
                        <input type="text" pInputText />
                    </div>
                    <div>
                        <input type="text" pInputText [fluid]="false" placeholder="Non-Fluid" />
                    </div>
                </div>
            </p-fluid>
        </div>
    `,
    standalone: true,
    imports: [FluidModule, InputTextModule, LabelModule]
})
export class FluidComparisonDemo {}
```
