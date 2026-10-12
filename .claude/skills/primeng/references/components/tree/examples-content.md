# Angular Tree Component — Content

## Content

Custom node content is rendered through the node template; the node exposes its children and expanded state so the right icon can be chosen.

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { FolderOpen } from '@primeicons/angular/folder-open';
import { Folder } from '@primeicons/angular/folder';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <p-tree [value]="nodes()" class="w-full md:w-120">
            <ng-template #node let-node>
                <span class="flex items-center gap-2">
                    @if (node.children?.length && node.expanded) {
                        <svg data-p-icon="folder-open" />
                    } @else if (node.children?.length) {
                        <svg data-p-icon="folder" />
                    } @else {
                        <svg data-p-icon="file" />
                    }
                    {{ node.label }}
                </span>
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [TreeModule, FolderOpen, Folder, File],
    providers: [NodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeContentDemo implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => {
            const stripIcons = (nodes: TreeNode[]) => {
                for (const node of nodes) {
                    delete node.icon;
                    if (node.children) stripIcons(node.children);
                }
            };
            stripIcons(data);
            data[0].expanded = true;
            this.nodes.set(data);
        });
    }
}
```
