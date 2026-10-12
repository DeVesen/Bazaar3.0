# Angular Message Component — Life

## Life

Messages can disappear automatically by defined the life in milliseconds.

```typescript
import { Component, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-col items-center justify-center gap-4">
            <button type="button" pButton [disabled]="visible()" (click)="showMessage()">Show Message</button>
            @if (visible()) {
                <p-message [life]="3000" severity="success" icon="pi pi-check">Your account is now ready.</p-message>
            }
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ButtonModule]
})
export class MessageLifeDemo {
    visible = signal(false);

    showMessage() {
        this.visible.set(true);

        setTimeout(() => {
            this.visible.set(false);
        }, 3000);
    }
}
```
