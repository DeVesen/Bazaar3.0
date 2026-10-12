# Angular Gallery Component — Responsive

## Responsive

Galleria responsiveness is defined with the responsiveOptions property.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <p-galleria [value]="images" [responsiveOptions]="responsiveOptions" [containerStyle]="{ 'max-width': '640px' }" [numVisible]="7" [circular]="true">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width: 100%; display: block;" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <img [src]="item.thumbnailImageSrc" style="width: 100%; display: block;" />
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule],
    providers: [PhotoService]
})
export class GalleriaResponsiveDemo implements OnInit {
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
