# Angular FileUpload Component — Custom Upload

## Custom Upload

Uploading implementation can be overridden by enabling customUpload property and defining a custom upload handler.

```typescript
import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
    template: `
        <div class="flex flex-col items-center gap-6">
            <p-fileupload mode="basic" [customUpload]="true" [auto]="true" (uploadHandler)="onFileSelect($event)" chooseLabel="Browse" [chooseButtonProps]="{ severity: 'secondary', variant: 'outlined' }" />
            @if (imageSrc) {
                <img [src]="imageSrc" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
            }
        </div>
    `,
    standalone: true,
    imports: [FileUploadModule]
})
export class FileUploadCustomDemo {
    imageSrc: string | null = null;

    onFileSelect(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
                this.imageSrc = e.target.result;
            }
        };

        reader.readAsDataURL(file);
    }
}
```
