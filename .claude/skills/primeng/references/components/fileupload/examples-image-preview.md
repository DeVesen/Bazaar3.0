# Angular FileUpload Component — Image Preview

## Image Preview

Grid-based image preview with thumbnails. Hover over images to reveal the remove button.

```typescript
import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { Plus } from '@primeicons/angular/plus';
import { Upload } from '@primeicons/angular/upload';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <p-fileupload #fu name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" [multiple]="true" accept="image/*" maxFileSize="1000000" mode="advanced" [pt]="{ root: { class: 'border-0!' } }">
            <ng-template #header let-files let-chooseCallback="chooseCallback" let-uploadCallback="uploadCallback">
                <div class="flex items-center gap-2">
                    <button type="button" pButton severity="secondary" variant="outlined" (click)="chooseCallback()">
                        <svg data-p-icon="plus"></svg>
                        Add Images
                    </button>
                    @if (files?.length > 0) {
                        <button type="button" pButton (click)="uploadCallback()">
                            <svg data-p-icon="upload"></svg>
                            Upload All
                        </button>
                    }
                </div>
            </ng-template>
            <ng-template #content let-files let-removeFileCallback="removeFileCallback">
                @if (files?.length > 0) {
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        @for (file of files; track $index; let i = $index) {
                            <div class="group relative rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
                                <img [src]="file.objectURL" [alt]="file.name" class="w-full h-32 object-cover" />
                                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" class="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 cursor-pointer border-0" (click)="removeFileCallback($event, i)">
                                        <svg data-p-icon="times"></svg>
                                    </button>
                                </div>
                                <div class="p-2">
                                    <div class="text-xs font-medium truncate">{{ file.name }}</div>
                                    <div class="text-xs text-muted-color">{{ formatSize(file.size) }}</div>
                                </div>
                            </div>
                        }
                    </div>
                }
            </ng-template>
            <ng-template #empty>
                <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-12 text-center">
                    <p class="text-muted-color m-0!">No images selected. Click "Add Images" to get started.</p>
                </div>
            </ng-template>
        </p-fileupload>
    `,
    standalone: true,
    imports: [FileUploadModule, ButtonModule, Plus, Upload, Times]
})
export class FileUploadImagePreviewDemo {
    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
```
