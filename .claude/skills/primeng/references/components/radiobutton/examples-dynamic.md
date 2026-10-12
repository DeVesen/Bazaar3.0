# Angular RadioButton Component — Dynamic

## Dynamic

RadioButtons can be generated using a list of values.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-wrap gap-4">
                @for (category of categories; track category.key) {
                    <div class="flex items-center gap-2">
                        <p-radiobutton [inputId]="category.key" name="category" [value]="category.key" [(ngModel)]="selectedCategory" />
                        <label pLabel [for]="category.key" class="text-sm">{{ category.name }}</label>
                    </div>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, LabelModule, FormsModule]
})
export class RadioButtonDynamicDemo {
    selectedCategory: string | undefined;

    categories = [
        { name: 'Accounting', key: 'A' },
        { name: 'Marketing', key: 'M' },
        { name: 'Production', key: 'P' },
        { name: 'Research', key: 'R' }
    ];
}
```
