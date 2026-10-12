# Angular Button Component — Severity

## Severity

The severity property defines the variant of a button.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton>Primary</button>
            <button pButton severity="secondary">Secondary</button>
            <button pButton severity="success">Success</button>
            <!-- +5 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonSeverityDemo {}
```
