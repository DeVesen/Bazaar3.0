# Angular RadioButton Component — Invalid

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-radiobutton [(ngModel)]="value" [invalid]="!value" />
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, FormsModule]
})
export class RadioButtonInvalidDemo {
    value: boolean = false;
}
```
