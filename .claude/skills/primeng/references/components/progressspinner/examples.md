# Angular ProgressSpinner Component — Beispiele

## Indeterminate

An animated spinner indicating an indeterminate loading state is displayed by default when no value is provided.

```typescript
import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    template: `
        <div class="flex justify-center">
            <p-progress-spinner ariaLabel="loading" />
        </div>
    `,
    standalone: true,
    imports: [ProgressSpinnerModule]
})
export class ProgressSpinnerBasicDemo {}
```

## Custom

ProgressSpinner can be customized with styling property like strokeWidth and fill .

```typescript
import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    template: `
        <div class="flex justify-center">
            <p-progress-spinner strokeWidth="18" fill="transparent" animationDuration=".5s" [style]="{ width: '50px', height: '50px' }" />
        </div>
    `,
    standalone: true,
    imports: [ProgressSpinnerModule]
})
export class ProgressSpinnerCustomDemo {}
```

## Determinate

Set a numeric value property to display a determinate progress indicator with a track and range.

```typescript
import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    template: `
        <div class="flex justify-center">
            <p-progress-spinner [value]="75" />
        </div>
    `,
    standalone: true,
    imports: [ProgressSpinnerModule]
})
export class ProgressSpinnerDeterminateDemo {}
```
