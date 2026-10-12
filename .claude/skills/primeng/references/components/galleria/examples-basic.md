# Angular Gallery Component — Basic

## Basic

Galleria requires a value as a collection of images, item template for the higher resolution image and thumbnail template to display as a thumbnail.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <p-galleria [value]="images" [responsiveOptions]="responsiveOptions" [containerStyle]="{ 'max-width': '640px' }" [numVisible]="5">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width:100%" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <img [src]="item.thumbnailImageSrc" />
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule],
    providers: [PhotoService]
})
export class GalleriaBasicDemo implements OnInit {
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
