# Angular CascadeSelect Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { CascadeSelectModule } from 'primeng/cascadeselect';

@Component({
    template: `
        <div class="flex justify-center">
            <p-cascadeselect [disabled]="true" placeholder="Disabled" [style]="{ minWidth: '14rem' }" />
        </div>
    `,
    standalone: true,
    imports: [CascadeSelectModule]
})
export class CascadeSelectDisabledDemo {}
```
