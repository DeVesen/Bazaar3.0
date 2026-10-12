# Angular RadioButton Component — Sizes

## Sizes

RadioButton provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <p-radiobutton [(ngModel)]="size" inputId="size_small" name="size" value="Small" size="small" />
                    <label pLabel for="size_small" class="text-sm">Small</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton [(ngModel)]="size" inputId="size_normal" name="size" value="Normal" />
                    <label pLabel for="size_normal">Normal</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton [(ngModel)]="size" inputId="size_large" name="size" value="Large" size="large" />
                    <label pLabel for="size_large" class="text-lg!">Large</label>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, LabelModule, FormsModule]
})
export class RadioButtonSizesDemo {
    size: string = 'Normal';
}
```
