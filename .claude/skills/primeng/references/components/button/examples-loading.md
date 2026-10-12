# Angular Button Component — Loading

## Loading

Indicate a busy state by setting disabled and rendering a spinner icon as a child while the request is pending.

```typescript
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Spinner } from '@primeicons/angular/spinner';
import { Check } from '@primeicons/angular/check';

@Component({
    template: `
        <div class="flex justify-center gap-4 flex-wrap">
            <button pButton [disabled]="loading()" (click)="load()">
                @if (loading()) {
                    <svg data-p-icon="spinner" class="animate-spin"></svg>
                    Loading...
                } @else {
                    <svg data-p-icon="check"></svg>
                    Search
                }
            </button>
            <button pButton iconOnly [disabled]="loading()" (click)="load()" aria-label="Search">
                @if (loading()) {
                    <svg data-p-icon="spinner" class="animate-spin"></svg>
                } @else {
                    <svg data-p-icon="check"></svg>
                }
            </button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, Spinner, Check]
})
export class ButtonLoadingDemo {
    loading = signal(false);

    load() {
        this.loading.set(true);

        setTimeout(() => {
            this.loading.set(false);
        }, 2000);
    }
}
```
