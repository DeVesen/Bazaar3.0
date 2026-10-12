# Angular Tree Component — Loadingskeleton

## Loadingskeleton

Skeleton placeholders can be rendered for each row while the data is being fetched by displaying a set of empty nodes with a custom node template.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Refresh } from '@primeicons/angular/refresh';
import { Folder } from '@primeicons/angular/folder';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <div class="w-full md:w-120 flex flex-col gap-3">
            <button type="button" pButton size="small" [disabled]="loading()" class="self-end" (click)="refresh()">
                <svg data-p-icon="refresh" />
                Refresh
            </button>
            <p-tree [value]="loading() ? placeholders : nodes()" class="w-full">
                <ng-template #node let-node>
                    <span class="flex items-center gap-2">
                        @if (loading()) {
                            <p-skeleton shape="circle" size="1rem" />
                            <p-skeleton width="10rem" borderRadius="4px" />
                        } @else {
                            @if (node.children?.length) {
                                <svg data-p-icon="folder" />
                            } @else {
                                <svg data-p-icon="file" />
                            }
                            {{ node.label }}
                        }
                    </span>
                </ng-template>
            </p-tree>
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule, TreeModule, ButtonModule, Refresh, Folder, File],
    providers: [NodeService]
})
export class TreeLoadingSkeletonDemo implements OnInit {
    nodes = signal<TreeNode[]>(undefined);

    loading = signal(false);

    placeholders: TreeNode[] = Array.from({ length: 6 }, (_, i) => ({ key: `skeleton-${i}`, label: '', leaf: true }));

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
