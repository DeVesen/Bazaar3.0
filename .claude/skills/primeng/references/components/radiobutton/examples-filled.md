# Angular RadioButton Component — Filled

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-radiobutton [(ngModel)]="checked" variant="filled" />
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, FormsModule]
})
export class RadioButtonFilledDemo {
    checked: boolean = false;
}
```
