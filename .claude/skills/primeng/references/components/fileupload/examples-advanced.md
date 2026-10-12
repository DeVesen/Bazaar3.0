# Angular FileUpload Component — Advanced

## Advanced

Advanced uploader provides dragdrop support, multi file uploads, auto uploading, progress tracking and validations.

```typescript
import { Component, inject } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-fileupload name="demo[]" url="https://www.primefaces.org/cdn/api/uplo …(lange Zeile gekürzt)
            <ng-template #empty>
                <div>Drag and drop files to here to upload.</div>
            </ng-template>
        </p-fileupload>
    `,
    standalone: true,
    imports: [FileUploadModule],
    providers: [MessageService]
})
export class FileUploadAdvancedDemo {
    private messageService = inject(MessageService);

    onUpload() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }
}
```
