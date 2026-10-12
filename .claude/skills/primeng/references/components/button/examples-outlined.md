# Angular Button Component — Outlined

## Outlined

Outlined buttons display a border without a background initially.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton variant="outlined">Primary</button>
            <button pButton variant="outlined" severity="secondary">Secondary</button>
            <!-- +6 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonOutlinedDemo {}
```
