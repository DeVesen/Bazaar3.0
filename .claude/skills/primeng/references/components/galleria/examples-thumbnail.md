# Angular Gallery Component — Thumbnail

## Thumbnail

Galleria can be controlled programmatically using the activeIndex property.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleriaModule } from 'primeng/galleria';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PhotoService } from '@/service/photoservice';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 mb-7">
            @for (option of positionOptions; track $index) {
                <div class="flex items-center">
                    <p-radiobutton [name]="option.label" [value]="option.value" [(ngModel)]="position" [inputId]="option.label" />
                    <label [for]="option.label" class="ml-2 text-sm"> {{ option.label }} </label>
                </div>
            }
        </div>
        <p-galleria [value]="images()" [thumbnailsPosition]="position" [responsiveOptions]="responsiveOptions" [containerStyle]="{ 'max-width': '640px' }" [numVisible]="5">
            <ng-template #item let-item>
                <img [src]="item.itemImageSrc" style="width: 100%; display: block" />
            </ng-template>
            <ng-template #thumbnail let-item>
                <div class="grid gap-4 justify-center">
                    <img [src]="item.thumbnailImageSrc" style="width: 100%; display: block" />
                </div>
            </ng-template>
        </p-galleria>
    `,
    standalone: true,
    imports: [GalleriaModule, RadioButtonModule, FormsModule],
    providers: [PhotoService]
})
export class GalleriaThumbnailDemo implements OnInit {
    private photoService = inject(PhotoService);

    images = signal<any[]>([]);

    positionOptions = [
        {
            label: 'Bottom',
            value: 'bottom'
        },
        {
            label: 'Top',
            value: 'top'
        },
        {
            label: 'Left',
            value: 'left'
        },
        {
            label: 'Right',
            value: 'right'
        }
    ];

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
        this.photoService.getImages().then((images) => this.images.set(images));
    }
}
```
