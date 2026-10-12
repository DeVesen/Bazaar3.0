# Angular Tree Component — Lazy

## Lazy

Lazy loading is demonstrated in this example where nodes are loaded on demand when a node is expanded.

```typescript
import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { Spinner } from '@primeicons/angular/spinner';
import { MinusCircle } from '@primeicons/angular/minus-circle';
import { PlusCircle } from '@primeicons/angular/plus-circle';
import { File } from '@primeicons/angular/file';
import { FolderOpen } from '@primeicons/angular/folder-open';
import { Folder } from '@primeicons/angular/folder';

@Component({
    template: `
        <p-tree class="w-full md:w-120" [value]="nodes()" loadingMode="icon" (onNodeExpand)="onNodeExpand($event)">
            <ng-template #togglericon let-expanded let-loading="loading">
                @if (loading) {
                    <svg data-p-icon="spinner" class="animate-spin" />
                } @else if (expanded) {
                    <svg data-p-icon="minus-circle" />
                } @else {
                    <svg data-p-icon="plus-circle" />
                }
            </ng-template>
            <ng-template #node let-node>
                <span class="flex items-center">
                    @if (node.leaf) {
                        <svg data-p-icon="file" class="mr-2" />
                    } @else if (node.expanded) {
                        <svg data-p-icon="folder-open" class="mr-2" />
                    } @else {
                        <svg data-p-icon="folder" class="mr-2" />
                    }
                    <span>{{ node.label }}</span>
                </span>
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [TreeModule, Spinner, MinusCircle, PlusCircle, File, FolderOpen, Folder],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeLazyDemo implements OnInit {
    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodes.set(this.createLazyNodes());
        setTimeout(() => {
            this.nodes.set(this.nodes().map((node) => ({ ...node, loading: false })));
        }, 2000);
    }

    private createLazyNodes(): TreeNode[] {
        return [
            { key: '0', label: 'Node 0', leaf: false, loading: true },
            { key: '1', label: 'Node 1', leaf: false, loading: true },
            { key: '2', label: 'Node 2', leaf: false, loading: true }
        ];
    }

    onNodeExpand(event: any) {
        if (!event.node.children) {
            event.node.loading = true;

            setTimeout(() => {
                const _nodes = this.nodes();
                let _node = { ...event.node };

                _node.children = [
                    { key: `${_node.key}-0`, label: `Lazy ${_node.label} - 0` },
                    { key: `${_node.key}-1`, label: `Lazy ${_node.label} - 1` },
                    { key: `${_node.key}-2`, label: `Lazy ${_node.label} - 2` }
                ];
                _node.loading = false;

                const key = parseInt(_node.key, 10);

                _nodes[key] = _node;
                this.nodes.set([..._nodes]);
            }, 1000);
        }
    }
}
```
