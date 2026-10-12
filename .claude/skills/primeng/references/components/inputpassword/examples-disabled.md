# Angular InputPassword Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputPassword disabled placeholder="Disabled" />
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule]
})
export class InputPasswordDisabledDemo {}
```
