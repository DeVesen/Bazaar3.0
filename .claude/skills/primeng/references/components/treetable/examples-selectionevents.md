# Angular TreeTable Component — Selectionevents

## Selectionevents

TreeTable provides onNodeSelect and onNodeUnselect events to listen selection events.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { NodeService } from '@/service/nodeservice';
import { TreeNode, MessageService } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

interface NodeEvent {
    originalEvent?: Event;
    node?: TreeNode;
}

@Component({
    template: `
        <p-treetable [value]="files" selectionMode="single" [(selection)]="selec …(lange Zeile gekürzt)
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode" [ttSelectableRow]="rowNode">
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
    imports: [TagModule, TreeTableModule, Folder, Image, Video, File],
    providers: [NodeService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableSelectionEventsDemo implements OnInit {
    files!: TreeNode[];

    selectedNode!: TreeNode;

    private nodeService = inject(NodeService);

    private messageService = inject(MessageService);

    ngOnInit() {
        this.nodeService.getTreeTableNodes().then((files) => {
            this.files = files.slice(0, 5);
            this.files[0].expanded = true;
        });
    }

    nodeSelect(event: NodeEvent) {
        this.messageService.add({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
    }

    nodeUnselect(event: NodeEvent) {
        this.messageService.add({ severity: 'warn', summary: 'Node Unselected', detail: event.node.data.name });
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
