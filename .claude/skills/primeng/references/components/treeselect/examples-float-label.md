# Angular TreeSelect Component — Float Label

## Float Label

A floating label appears on top of the input field when focused. Visit FloatLabel documentation for more information.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel class="w-full md:w-80">
                <p-treeselect [(ngModel)]="value1" inputId="over_label" [options]="nodes" class="w-full" />
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel class="w-full md:w-80" variant="in">
                <p-treeselect [(ngModel)]="value2" inputId="in_label" [options]="nodes" class="w-full" />
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel class="w-full md:w-80" variant="on">
                <p-treeselect [(ngModel)]="value3" inputId="on_label" [options]="nodes" class="w-full" />
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectFloatLabelDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    value1: any;

    value2: any;

    value3: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
