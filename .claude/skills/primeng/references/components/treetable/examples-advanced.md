# Angular TreeTable Component — Advanced

## Advanced

Sort, filter (per-column + global), and cell editing composed in a single tree.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { InputTextModule } from 'primeng/inputtext';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Search } from '@primeicons/angular/search';
import { Folder } from '@primeicons/angular/folder';
import { Image } from '@primeicons/angular/image';
import { Video } from '@primeicons/angular/video';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <div class="mb-3 flex justify-end">
            <p-iconfield class="w-full sm:max-w-xs">
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input type="text" pInputText pSize="small" placeholder="Keyword search" (input)="tt.filterGlobal($event.target.value, 'contains')" class="w-full" />
            </p-iconfield>
        </div>
        <p-treetable #tt [value]="files" [globalFilterFields]="['name', 'type']" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header>
                <tr>
                    <th ttSortableColumn="name">Name <p-treetable-sort-icon field="name" /></th>
                    <th ttSortableColumn="size">Size <p-treetable-sort-icon field="size" /></th>
                    <th ttSortableColumn="type">Type <p-treetable-sort-icon field="type" /></th>
                </tr>
                <tr>
                    <th>
                        <input pInputText pSize="small" type="text" placeholder="Search name..." (input)="tt.filter($event.target.value, 'name', 'contains')" class="w-full" />
                    </th>
                    <th></th>
                    <th>
                        <p-select [options]="typeOptions" (onChange)="tt.filter($event.value, 'type', 'equals')" placeholder="Any" [showClear]="true" size="small" class="w-full" />
                    </th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td ttEditableColumn>
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
                            <p-treetable-cell-editor>
                                <ng-template #input>
                                    <input pInputText pSize="small" type="text" [(ngModel)]="rowData.name" class="w-full" />
                                </ng-template>
                                <ng-template #output>
                                    <span [class]="rowData.type === 'Folder' ? 'font-medium' : ''">{{ rowData.name }}</span>
                                </ng-template>
                            </p-treetable-cell-editor>
                        </div>
                    </td>
                    <td ttEditableColumn>
                        <p-treetable-cell-editor>
                            <ng-template #input>
                                <input pInputText pSize="small" type="text" [(ngModel)]="rowData.size" class="w-full" />
                            </ng-template>
                            <ng-template #output>
                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ rowData.size }}</span>
                            </ng-template>
                        </p-treetable-cell-editor>
                    </td>
                    <td>
                        <p-tag [value]="rowData.type" [severity]="getSeverity(rowData.type)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="3">No data found.</td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [SelectModule, IconFieldModule, InputIconModule, TagModule, TreeTableModule, InputTextModule, FormsModule, Search, Folder, Image, Video, File],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableAdvancedDemo implements OnInit {
    files!: TreeNode[];

    typeOptions = ['Folder', 'Document', 'Text', 'Picture', 'Video'];

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getTreeTableNodes().then((files) => {
            this.files = files.slice(0, 6);
            this.files[0].expanded = true;
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
