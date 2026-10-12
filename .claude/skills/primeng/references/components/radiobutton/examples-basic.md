# Angular RadioButton Component — Basic

## Basic

Selects a single option from a group of mutually exclusive choices.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <p-radiobutton inputId="ingredient-strawberry" name="fruit" value="strawberry" [(ngModel)]="ingredient" />
                    <label pLabel for="ingredient-strawberry" class="text-sm">🍓 Strawberry</label>
                </div>
                <div class="flex items-center gap-3">
                    <p-radiobutton inputId="ingredient-banana" name="fruit" value="banana" [(ngModel)]="ingredient" />
                    <label pLabel for="ingredient-banana" class="text-sm">🍌 Banana</label>
                </div>
                <div class="flex items-center gap-3">
                    <p-radiobutton inputId="ingredient-watermelon" name="fruit" value="watermelon" [(ngModel)]="ingredient" />
                    <label pLabel for="ingredient-watermelon" class="text-sm">🍉 Watermelon</label>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, LabelModule, FormsModule]
})
export class RadioButtonBasicDemo {
    ingredient: string | undefined;
}
```
