# Angular FileUpload Component — Dropzone

## Dropzone

A custom dropzone can be built with the content and empty templates. Files are added by dragging them onto the area or by clicking to browse, and the selected files are managed with the removeFileCallback .

```typescript
import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CloudUpload } from '@primeicons/angular/cloud-upload';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <p-fileupload
            #fu
            name="demo[]"
            url="https://www.primefaces.org/cdn/api/upload.php"
            [multiple]="true"
            accept="image/*"
            [maxFileSize]="1000000"
            mode="advanced"
            [pt]="{ root: { class: 'border-0! bg-transparent!' }, header: { class: 'hidden!' }, content: { class: 'border-2! border-dashed! border-surface-200! dark:border-surface-700! rounded-xl! p-8!' } }"
        >
            <ng-template #content let-files let-removeFileCallback="removeFileCallback" let-messages="messages">
                @if (messages?.length) {
                    <div class="flex flex-col gap-2">
                        @for (msg of messages; track $index) {
                            <p-message [severity]="msg.severity">{{ msg.text }}</p-message>
                        }
                    </div>
                }
                @if (files.length) {
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-color">{{ files.length }} file(s) selected</span>
                            <div class="flex items-center gap-2">
                                <button type="button" pButton variant="text" size="small" (click)="fu.upload()">Upload</button>
                                <button type="button" pButton variant="text" size="small" severity="danger" (click)="fu.clear()">Clear all</button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            @for (file of files; track file.name + file.size; let i = $index) {
                                <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                                    <div class="flex items-center gap-3">
                                        <svg data-p-icon="cloud-upload" class="text-primary shrink-0" />
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium">{{ file.name }}</span>
                                            <span class="text-xs text-muted-color">{{ formatSize(file.size) }}</span>
                                        </div>
                                    </div>
                                    <button type="button" pButton iconOnly variant="text" severity="secondary" size="small" rounded (click)="removeFileCallback($event, i)">
                                        <svg data-p-icon="times" />
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                }
            </ng-template>
            <ng-template #empty>
                <div class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer" (click)="fu.choose()">
                    <svg data-p-icon="cloud-upload" [size]="48" class="text-muted-color" />
                    <div class="text-center">
                        <p class="text-lg font-medium mt-0 mb-1">Drop files here</p>
                        <p class="text-sm text-muted-color m-0">or click to browse</p>
                    </div>
                </div>
            </ng-template>
        </p-fileupload>
    `,
    standalone: true,
    imports: [FileUploadModule, MessageModule, ButtonModule, CloudUpload, Times]
})
export class FileUploadDropzoneDemo {
    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
```
