# Angular FileUpload Component — Basic

## Basic

Select and upload files with drag-and-drop support.

```typescript
import { Component, inject } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-between">
            <div class="flex flex-wrap items-center gap-3">
                <p-fileupload #fu mode="basic" chooseLabel="Choose" name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" accept="image/*" [multiple]="true" maxFileSize="1000000" (onUpload)="onUpload()" />
            </div>
            <button type="button" pButton severity="secondary" (click)="fu.upload()">Upload</button>
        </div>
    `,
    standalone: true,
    imports: [FileUploadModule, ButtonModule],
    providers: [MessageService]
})
export class FileUploadBasicDemo {
    private messageService = inject(MessageService);

    onUpload() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }
}
```
