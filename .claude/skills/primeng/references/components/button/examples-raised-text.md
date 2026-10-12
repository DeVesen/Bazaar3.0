# Angular Button Component — Raised Text

## Raised Text

Text buttons can be displayed as raised for elevation.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton variant="text" raised>Primary</button>
            <button pButton variant="text" raised severity="secondary">Secondary</button>
            <!-- +6 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonRaisedTextDemo {}
```
