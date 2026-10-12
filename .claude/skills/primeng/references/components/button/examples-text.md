# Angular Button Component — Text

## Text

Text buttons are displayed as textual elements.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 justify-center">
            <button pButton variant="text">Primary</button>
            <button pButton variant="text" severity="secondary">Secondary</button>
            <!-- +6 gleichartige Zeilen -->
        </div>
    `,
    standalone: true,
    imports: [ButtonModule]
})
export class ButtonTextDemo {}
```
