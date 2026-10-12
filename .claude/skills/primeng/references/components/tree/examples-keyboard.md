# Angular Tree Component — Keyboard

## Keyboard

Tree has full keyboard support; arrow keys navigate between nodes, right and left expand and collapse a node and space toggles the selection of the focused node.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { File } from '@primeicons/angular/file';

@Component({
    template: `
        <div class="flex flex-col gap-3 w-full md:w-120">
            <div class="flex items-center justify-between gap-3 p-3 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                <span class="text-sm text-surface-500 dark:text-surface-400">
                    <kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">↑</kbd>&nbsp;<kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">↓</kbd> navigate,&nbsp;<kbd
                        class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700"
                        >→</kbd
                    >
                    expand, <kbd class="px-1.5 py-0.5 text-xs rounded bg-surface …(lange Zeile gekürzt)
                </span>
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">Selected</span>
                    <p-badge [value]="selectedCount" [severity]="selectedCount ? 'info' : 'secondary'" />
                </div>
            </div>
            <p-tree [value]="nodes()" selectionMode="multiple" [(selection)]="selection" class="w-full">
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
            </p-tree>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, TreeModule, Folder, File],
    providers: [NodeService]
})
export class TreeKeyboardDemo implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    selection: TreeNode[] = [];

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => {
            data[0].expanded = true;
            this.nodes.set(data);
        });
    }

    get selectedCount() {
        return this.selection?.length ?? 0;
    }
}
```
