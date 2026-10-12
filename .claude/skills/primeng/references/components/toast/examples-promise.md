# Angular Toast Component — Promise

## Promise

A sticky loading toast can be shown while an async task runs, then removed and replaced with a success or error toast based on the result.

```typescript
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-center gap-4">
            <p-toast key="promise" />
            <button type="button" pButton outlined (click)="runPromise()">Run promise</button>
        </div>
    `,
    standalone: true,
    imports: [ToastModule, ButtonModule],
    providers: [MessageService]
})
export class ToastPromiseDemo {
    private messageService = inject(MessageService);

    fakeApiCall() {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.5) {
                    resolve('Success!');
                } else {
                    reject(new Error('Something went wrong'));
                }
            }, 2000);
        });
    }

    runPromise() {
        this.messageService.add({
            severity: 'secondary',
            summary: 'Please wait...',
            detail: 'Your request is being processed. This may take a moment.',
            icon: 'pi pi-spinner pi-spin',
            key: 'promise',
            sticky: true
        });

        this.fakeApiCall()
            .then((result) => {
                this.messageService.clear('promise');
                setTimeout(() => {
                    this.messageService.add({ severity: 'success', summary: 'Success!', detail: `${result}. Everything went smoothly. Thank you for your patience.`, key: 'promise', life: 3000 });
                }, 300);
            })
            .catch((error) => {
                this.messageService.clear('promise');
                setTimeout(() => {
                    this.messageService.add({ severity: 'error', summary: 'Oops, …(lange Zeile gekürzt)
                }, 300);
            });
    }
}
```
