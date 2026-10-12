# Angular TreeTable Component — Flexiblescroll

## Flexiblescroll

Flex scroll feature makes the scrollable viewport section dynamic instead of a fixed value so that it can grow or shrink relative to the parent size of the table. Click the button below to display a maximizable Dialog where data viewport adjusts itself according to the size changes.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Dialog, DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <button pButton (click)="dialogVisible = true"><i class="pi pi-external-link"></i> Show</button>
        <p-dialog [(visible)]="dialogVisible" header="Flex Scroll" [style]="{ width: '75vw' }" maximizable modal [contentStyle]="{ height: '300px' }">
            <ng-template #content>
                <p-treetable [value]="files" [scrollable]="true" scrollHeight="flex" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header>
                        <tr>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Type</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-rowNode let-rowData="rowData">
                        <tr [ttRow]="rowNode">
                            <td>
                                <div class="flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode" />
                                    @switch (rowData.type) {
                                        @case ('Folder') {
                                            <svg data-p-icon="folder" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                        }
                                        @case ('Picture') {
                                            <svg data-p-icon="image" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                        }
                                        @case ('Video') {
                                            <svg data-p-icon="video" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                        }
                                        @default {
                                            <svg data-p-icon="file" [size]="16" class="text-surface-500 dark:text-surface-400" />
                                        }
                                    }
                                    <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData.name }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData.size }}</span>
                            </td>
                            <td>
                                <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                            </td>
                        </tr>
                    </ng-template>
                </p-treetable>
            </ng-template>
            <ng-template #footer>
                <button pButton (click)="dialogVisible = false"><i class="pi pi-check"></i> Ok</button>
            </ng-template>
        </p-dialog>
    `,
    standalone: true,
    imports: [DialogModule, TagModule, TreeTableModule, ButtonModule, Folder, Image, Video, File],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableFlexibleScrollDemo implements OnInit {
    private nodeService = inject(NodeService);

    private cd = inject(ChangeDetectorRef);

    files!: TreeNode[];

    dialogVisible: boolean = false;

    ngOnInit() {
        this.nodeService.getFilesystem().then((files) => {
            this.files = files;
        });
    }

    getSeverity(type: string): 'info' | 'warn' | 'success' | 'secondary' {
        switch (type) {
            case 'Folder':
                return 'warn';
            case 'Document':
                return 'info';
            case 'Picture':
            case 'Video':
                return 'success';
            default:
                return 'secondary';
        }
    }
}
```
