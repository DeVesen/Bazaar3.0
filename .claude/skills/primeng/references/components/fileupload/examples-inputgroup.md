# Angular FileUpload Component — InputGroup

## InputGroup

FileUpload can be placed inside an InputGroup as an addon to combine it with other form controls.

```typescript
import { Component, signal } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Upload } from '@primeicons/angular/upload';
import { CloudUpload } from '@primeicons/angular/cloud-upload';
import { Tag } from '@primeicons/angular/tag';

@Component({
    template: `
        <div class="flex flex-col gap-4 max-w-md mx-auto">
            <p-inputgroup>
                <p-inputgroup-addon>Upload</p-inputgroup-addon>
                <p-inputgroup-addon>
                    <p-fileupload
                        mode="basic"
                        accept="image/*"
                        [maxFileSize]="1000000"
                        [chooseLabel]="label1()"
                        [chooseButtonProps]="{ severity: 'secondary', variant: 'text', styleClass: 'flex-1 justify-start' }"
                        (onSelect)="onFileSelect($event, label1)"
                    >
                        <ng-template #chooseicon><svg data-p-icon="upload" /></ng-template>
                        <ng-template #filelabel></ng-template>
                    </p-fileupload>
                </p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>
                    <p-fileupload
                        mode="basic"
                        accept="image/*"
                        [maxFileSize]="1000000"
                        [chooseLabel]="label2()"
                        [chooseButtonProps]="{ severity: 'secondary', variant: 'text', styleClass: 'flex-1 justify-start' }"
                        (onSelect)="onFileSelect($event, label2)"
                    >
                        <ng-template #chooseicon><svg data-p-icon="upload" /></ng-template>
                        <ng-template #filelabel></ng-template>
                    </p-fileupload>
                </p-inputgroup-addon>
                <p-inputgroup-addon>
                    <button type="button" pButton severity="secondary" variant="text" iconOnly>
                        <svg data-p-icon="cloud-upload" />
                    </button>
                </p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>
                    <svg data-p-icon="tag" />
                </p-inputgroup-addon>
                <input pInputText placeholder="Label" />
                <p-inputgroup-addon>
                    <p-fileupload mode="basic" accept="image/*" [maxFileSize]="1000000" [chooseLabel]="label3()" [chooseButtonProps]="{ severity: 'secondary', variant: 'text' }" (onSelect)="onFileSelect($event, label3)">
                        <ng-template #chooseicon><svg data-p-icon="upload" /></ng-template>
                        <ng-template #filelabel></ng-template>
                    </p-fileupload>
                </p-inputgroup-addon>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [FileUploadModule, InputGroupModule, InputGroupAddonModule, ButtonModule, InputTextModule, Upload, CloudUpload, Tag]
})
export class FileUploadInputGroupDemo {
    label1 = signal('Choose file');

    label2 = signal('Choose file');

    label3 = signal('Browse');

    onFileSelect(event: FileSelectEvent, label: ReturnType<typeof signal<string>>) {
        const files: File[] = event.currentFiles || [];

        if (files.length) {
            label.set(files.map((f) => f.name).join(', '));
        }
    }
}
```
