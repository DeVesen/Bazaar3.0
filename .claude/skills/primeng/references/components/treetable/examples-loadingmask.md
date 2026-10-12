# Angular TreeTable Component — Loadingmask

## Loadingmask

The loading property displays a mask layer to indicate busy state.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Refresh } from '@primeicons/angular/refresh';
import { Spinner } from '@primeicons/angular/spinner';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <div class="mb-3 flex items-center justify-between gap-3">
            <span class="text-sm text-surface-500 dark:text-surface-400">Click refresh to simulate a network fetch.</span>
            <button type="button" pButton size="small" [disabled]="loading" (click)="refresh()">
                <svg data-p-icon="refresh" />
                Refresh
            </button>
        </div>
        <p-treetable [value]="files" [loading]="loading" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #loadingicon>
                <div class="flex flex-col items-center gap-2 text-nowrap">
                    <svg data-p-icon="spinner" [size]="40" class="animate-spin text-primary" />
                    <span class="text-sm text-surface-600 dark:text-surface-300">Loading nodes…</span>
                </div>
            </ng-template>
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
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, ButtonModule, Refresh, Spinner, Folder, Image, Video, File],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableLoadingMaskDemo implements OnInit {
    files!: TreeNode[];

    loading: boolean = false;

    private nodeService = inject(NodeService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.nodeService.getTreeTableNodes().then((files) => {
            this.files = files.slice(0, 5);
            this.files[0].expanded = true;
        });
    }

    refresh() {
        this.loading = true;
        this.cd.markForCheck();

        setTimeout(() => {
            this.nodeService.getTreeTableNodes().then((files) => {
                this.files = files.slice(0, 5);
                this.files[0].expanded = true;
                this.loading = false;
                this.cd.markForCheck();
            });
        }, 1500);
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
