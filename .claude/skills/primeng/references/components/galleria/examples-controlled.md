# Angular Gallery Component — Controlled

## Controlled

Galleria can be controlled programmatically using the activeIndex property.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <div class="mb-4">
            <button type="button" pButton iconOnly (click)="prev()"><i class="pi pi-minus"></i></button>
            <button type="button" pButton iconOnly severity="secondary" class="ml-2" (click)="next()"><i class="pi pi-plus"></i></button>
        </div>
        <p-galleria [value]="images" [responsiveOptions]="responsiveOptions" [containerStyle]="{ 'max-width': '640px' }" [numVisible]="5" [activeIndex]="activeIndex">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width: 100%;" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <img [src]="item.thumbnailImageSrc" />
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule, ButtonModule],
    providers: [PhotoService]
})
export class GalleriaControlledDemo implements OnInit {
    private photoService = inject(PhotoService);

    images: any[] = [];

    _activeIndex: number = 2;

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

    get activeIndex(): number {
        return this._activeIndex;
    }

    set activeIndex(newValue) {
        if (this.images && 0 <= newValue && newValue <= this.images.length - 1) {
            this._activeIndex = newValue;
        }
    }

    next() {
        this.activeIndex++;
    }

    prev() {
        this.activeIndex--;
    }
}
```
