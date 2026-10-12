# Angular Button Component — Raised

## Raised

Raised buttons display a shadow to indicate elevation.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton raised>Primary</button>
            <button pButton raised severity="secondary">Secondary</button>
            <button pButton raised severity="success">Success</button>
            <!-- +5 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonRaisedDemo {}
```
