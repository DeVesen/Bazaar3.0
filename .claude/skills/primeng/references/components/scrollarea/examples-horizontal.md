# Angular Scroll Area Component — Horizontal

## Horizontal

ScrollArea supports horizontal scrolling for content that extends beyond the horizontal viewport.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { PhotoService } from '@/service/photoservice';
import { Photo } from '@/domain/photo';

@Component({
    template: `
        <div class="flex justify-center">
            <p-scrollarea class="max-w-md mx-auto">
                <p-scrollarea-viewport class="p-3.5!">
                    <p-scrollarea-content>
                        <div class="flex gap-4 min-w-max">
                            @for (image of images; track $index) {
                                <figure class="shrink-0">
                                    <img [src]="image.itemImageSrc" [alt]="image.title" class="w-72 h-40 object-cover rounded-sm" />
                                    <figcaption class="mt-2 text-xs">
                                        <span class="opacity-60">Photo by</span> <span class="font-medium">{{ image.title }}</span>
                                    </figcaption>
                                </figure>
                            }
                        </div>
                    </p-scrollarea-content>
                </p-scrollarea-viewport>
                <p-scrollarea-scrollbar orientation="horizontal">
                    <p-scrollarea-handle />
                </p-scrollarea-scrollbar>
            </p-scrollarea>
        </div>
    `,
    standalone: true,
    imports: [],
    providers: [PhotoService]
})
export class ScrollareaHorizontalDemo implements OnInit {
    images: any[] = [];

    private photoService = inject(PhotoService);

    ngOnInit() {
        this.photoService.getImages().then((data) => (this.images = data));
    }
}
```
