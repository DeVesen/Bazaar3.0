# Angular Gallery Component — Caption

## Caption

Description of an image is specified with the caption template.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <p-galleria [value]="images" [responsiveOptions]="responsiveOptions" [containerStyle]="{ 'max-width': '640px' }" [numVisible]="5">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width: 100%; display: block;" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <img [src]="item.thumbnailImageSrc" style="display: block;" />
            </ng-template>
            <ng-template #caption let-item>
                <div class="text-lg mb-2 font-bold">{{ item.title }}</div>
                <p class="text-white text-sm">{{ item.alt }}</p>
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule],
    providers: [PhotoService]
})
export class GalleriaCaptionDemo implements OnInit {
    private photoService = inject(PhotoService);

    images: any[] = [];

    responsiveOptions: any[] = [
        {
            breakpoint: '1300px',
            numVisible: 4
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

    ngOnInit() {
        this.photoService.getImages().then((images) => (this.images = images));
    }
}
```
