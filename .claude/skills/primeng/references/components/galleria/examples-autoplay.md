# Angular Gallery Component — AutoPlay

## AutoPlay

A slideshow implementation is defined by adding circular and autoPlay properties.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <p-galleria [value]="images" [autoPlay]="true" [circular]="true" [responsiveOptions]="responsiveOptions" [numVisible]="5" [containerStyle]="{ 'max-width': '640px' }">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width: 100%; display: block" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <img [src]="item.thumbnailImageSrc" style="display: block" />
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule],
    providers: [PhotoService]
})
export class GalleriaAutoPlayDemo implements OnInit {
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
