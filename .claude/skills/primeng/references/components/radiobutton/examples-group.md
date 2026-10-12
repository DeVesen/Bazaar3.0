# Angular RadioButton Component — Group

## Group

RadioButton is used as a controlled input with value and ngModel properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-wrap gap-4">
                <div class="flex items-center">
                    <p-radiobutton name="pizza" value="Cheese" [(ngModel)]="ingredient" inputId="ingredient1" />
                    <label pLabel for="ingredient1" class="text-sm ml-2">Cheese</label>
                </div>
                <div class="flex items-center">
                    <p-radiobutton name="pizza" value="Mushroom" [(ngModel)]="ingredient" inputId="ingredient2" />
                    <label pLabel for="ingredient2" class="text-sm ml-2">Mushroom</label>
                </div>
                <div class="flex items-center">
                    <p-radiobutton name="pizza" value="Pepper" [(ngModel)]="ingredient" inputId="ingredient3" />
                    <label pLabel for="ingredient3" class="text-sm ml-2">Pepper</label>
                </div>
                <div class="flex items-center">
                    <p-radiobutton name="pizza" value="Onion" [(ngModel)]="ingredient" inputId="ingredient4" />
                    <label pLabel for="ingredient4" class="text-sm ml-2">Onion</label>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, LabelModule, FormsModule]
})
export class RadioButtonGroupDemo {
    ingredient!: string;
}
```
