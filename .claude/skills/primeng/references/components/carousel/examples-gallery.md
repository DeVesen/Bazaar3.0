# Angular Carousel Component — Gallery

## Gallery

Two carousels synchronized via slide input to create a gallery with thumbnail navigation.

```typescript
import { Component, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
    template: `
        <div class="mt-8 mb-16">
            <div class="max-w-2xl mx-auto">
                <p-carousel align="center" [slide]="selectedImage()" (onSlideChange)="onSlideChange($event)">
                    <p-carousel-content class="h-99">
                        @for (image of images; track image; let i = $index) {
                            <p-carousel-item class="basis-full!">
                                <img [attr.draggable]="false" [src]="image" [alt]="'Image ' + (i + 1)" class="h-full w-full object-cover select-none" />
                            </p-carousel-item>
                        }
                    </p-carousel-content>
                </p-carousel>
                <p-carousel class="mt-3" [spacing]="8" align="center" [slide]="selectedImage()">
                    <p-carousel-content class="h-22.5">
                        @for (image of images; track image; let i = $index) {
                            <p-carousel-item class="cursor-pointer basis-1/4! transition-opacity" [class.opacity-60]="selectedImage() !== i" [class.hover:opacity-40]="selectedImage() !== i" (click)="selectImage(i)">
                                <img [attr.draggable]="false" [src]="image" [alt]="'Image ' + (i + 1)" class="h-full w-full object-cover select-none" />
                            </p-carousel-item>
                        }
                    </p-carousel-content>
                </p-carousel>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CarouselModule]
})
export class CarouselGalleryDemo {
    images = images;

    selectedImage = signal(0);

    selectImage(index: number) {
        this.selectedImage.set(index);
    }

    onSlideChange(event: { value: number }) {
        this.selectedImage.set(event.value);
    }
}
```
