# Angular InputPassword Component — Fluid

## Fluid

Fluid spans the full width of the container.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <input pInputPassword [fluid]="true" [(ngModel)]="value" />
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule]
})
export class InputPasswordFluidDemo {
    value: string = '';
}
```
