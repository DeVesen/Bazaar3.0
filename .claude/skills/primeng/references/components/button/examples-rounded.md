# Angular Button Component — Rounded

## Rounded

Rounded buttons have a circular border radius.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton rounded>Primary</button>
            <button pButton rounded severity="secondary">Secondary</button>
            <button pButton rounded severity="success">Success</button>
            <!-- +5 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonRoundedDemo {}
```
