# Angular Dialog Component — Full Screen

## Full Screen

A full screen Dialog can be achieved by sizing the component to the viewport with utility classes such as w-screen and h-screen .

```typescript
import { Component } from '@angular/core';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Photo } from '@/domain/photo';
import { Image } from '@primeicons/angular/image';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="visible = true">View Gallery</button>
            <p-dialog [(visible)]="visible" [modal]="true" header="Photo Gallery" styleClass="w-screen! h-screen! max-h-screen! rounded-none!">
                <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        @for (i of photos; track i) {
                            <div class="aspect-square rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <svg data-p-icon="image" class="text-2xl text-surface-400" />
                            </div>
                        }
                    </div>
                    <p class="text-sm text-surface-500 dark:text-surface-400 mt-0 mb-0">Showing 18 of 64 photos</p>
                </div>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, Image]
})
export class DialogFullScreenDemo {
    visible: boolean = false;

    photos = Array.from({ length: 18 }, (_, i) => i);
}
```
