# Angular Image Component — Beispiele

## Basic

Image is used as the native img element and supports all properties that the native element has. For multiple image, see Galleria.

```typescript
import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
    template: `
        <div class="flex justify-center">
            <p-image src="https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg" alt="Image" width="250" />
        </div>
    `,
    standalone: true,
    imports: [ImageModule]
})
export class ImageBasicDemo {}
```

## Preview

Preview mode displays a modal layer when the image is clicked that provides transformation options such as rotating and zooming.

```typescript
import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
    template: `
        <div class="flex justify-center">
            <p-image src="https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg" alt="Image" width="250" [preview]="true" />
        </div>
    `,
    standalone: true,
    imports: [ImageModule]
})
export class ImagePreviewDemo {}
```

## Previewimagesource

In case that you want to show different image on preview, you can set previewImageSrc attribute. It could come handy when wanted to use smaller image version at first and bigger one on preview.

```typescript
import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
    template: `
        <div class="flex justify-center">
            <p-image src="https://primefaces.org/cdn/primeng/images/galleria/galleria11.jpg" previewImageSrc="https://primefaces.org/cdn/primeng/images/galleria/galleria11.jpg" alt="Image" width="250" [preview]="true" />
        </div>
    `,
    standalone: true,
    imports: [ImageModule]
})
export class ImagePreviewImageSourceDemo {}
```

## Template

An eye icon is displayed by default when the image is hovered in preview mode. Use the indicator template for custom content.

```typescript
import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
    template: `
        <div class="flex justify-center">
            <p-image src="https://primefaces.org/cdn/primeng/images/galleria/galleria11.jpg" [preview]="true" alt="Image" width="250">
                <ng-template #indicator>
                    <i class="pi pi-search"></i>
                </ng-template>
                <ng-template #image>
                    <img src="https://primefaces.org/cdn/primeng/images/galleria/galleria11.jpg" alt="image" width="250" />
                </ng-template>
                <ng-template #preview let-style="style" let-previewCallback="previewCallback">
                    <img src="https://primefaces.org/cdn/primeng/images/galleria/galleria11.jpg" alt="image" [style]="style" (click)="previewCallback()" />
                </ng-template>
            </p-image>
        </div>
    `,
    standalone: true,
    imports: [ImageModule]
})
export class ImageTemplateDemo {}
```
