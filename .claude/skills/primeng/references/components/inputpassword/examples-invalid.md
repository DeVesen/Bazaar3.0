# Angular InputPassword Component — Invalid

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <input pInputPassword [(ngModel)]="value1" [invalid]="!value1" placeholder="Password" />
            <input pInputPassword variant="filled" [(ngModel)]="value2" [invalid]="!value2" placeholder="Password" />
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule]
})
export class InputPasswordInvalidDemo {
    value1: string = '';

    value2: string = '';
}
```
