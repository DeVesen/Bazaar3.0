# Angular Tree Component — Loading

## Loading

While data is being fetched, a loading overlay with a spinner can be displayed over the Tree by enabling the loading property.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Tree, TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Refresh } from '@primeicons/angular/refresh';
import { Folder } from '@primeicons/angular/folder';
import { File } from '@primeicons/angular/file';
import { Spinner } from '@primeicons/angular/spinner';

@Component({
    template: `
        <div class="w-full md:w-120 flex flex-col gap-3">
            <button type="button" pButton size="small" [disabled]="loading()" class="self-end" (click)="refresh()">
                <svg data-p-icon="refresh" />
                Refresh
            </button>
            <p-tree [value]="nodes()" [loading]="loading()" class="w-full">
                <ng-template #node let-node>
                    <span class="flex items-center gap-2">
                        @if (node.children?.length) {
                            <svg data-p-icon="folder" />
                        } @else {
                            <svg data-p-icon="file" />
                        }
                        {{ node.label }}
                    </span>
                </ng-template>
                <ng-template #loadingicon>
                    <svg data-p-icon="spinner" [size]="32" class="animate-spin text-primary" />
                </ng-template>
            </p-tree>
        </div>
    `,
    standalone: true,
    imports: [TreeModule, ButtonModule, Refresh, Folder, File, Spinner],
    providers: [NodeService]
})
export class TreeLoadingDemo implements OnInit {
    nodes = signal<TreeNode[]>(undefined);

    loading = signal(false);

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => {
            data[0].expanded = true;
            this.nodes.set(data);
        });
    }

    refresh() {
        this.loading.set(true);
        setTimeout(() => this.loading.set(false), 2000);
    }
}
```
