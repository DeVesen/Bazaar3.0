# Angular Toast Component — Life

## Life

A toast disappears after 3000ms by default, set the life option on either the message or toast to override this.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast [life]="10000" />
        <div class="flex justify-center gap-2">
            <button type="button" pButton (click)="showLife()">Show Life</button>
            <button type="button" pButton (click)="showLifeLong()">Show Life Long</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastLifeDemo {
    private messageService = inject(MessageService);

    showLife() {
        this.messageService.add({ severity: 'info', summary: 'Life', detail: 'I show for 10000ms' });
    }

    showLifeLong() {
        this.messageService.add({ severity: 'info', summary: 'Life', detail: 'I show for 20000ms', life: 20000 });
    }
}
```
