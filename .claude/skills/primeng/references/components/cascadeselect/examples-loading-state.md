# Angular CascadeSelect Component — Loading State

## Loading State

Loading state can be used loading property.

```typescript
import { Component } from '@angular/core';
import { CascadeSelectModule } from 'primeng/cascadeselect';

@Component({
    template: `
        <div class="flex justify-center">
            <p-cascadeselect [loading]="true" [style]="{ minWidth: '14rem' }" placeholder="Loading..." />
        </div>
    `,
    standalone: true,
    imports: [CascadeSelectModule]
})
export class CascadeSelectLoadingDemo {}
```
