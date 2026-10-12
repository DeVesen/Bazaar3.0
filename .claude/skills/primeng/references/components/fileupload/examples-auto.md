# Angular FileUpload Component — Auto

## Auto

When auto property is enabled, a file gets uploaded instantly after selection.

```typescript
import { Component, inject } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-fileupload mode="basic" name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" accept="image/*" maxFileSize="1000000" (onUpload)="onUpload()" [auto]="true" chooseLabel="Browse" />
        </div>
    `,
    standalone: true,
    imports: [FileUploadModule],
    providers: [MessageService]
})
export class FileUploadAutoDemo {
    private messageService = inject(MessageService);

    onUpload() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }
}
```
