# Angular Button Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button pButton disabled>Submit</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonDisabledDemo {}
```
