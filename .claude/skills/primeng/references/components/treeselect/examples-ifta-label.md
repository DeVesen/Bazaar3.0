# Angular TreeSelect Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel class="w-full md:w-80">
                <p-treeselect [(ngModel)]="selectedValue" inputId="t_file" [options]="nodes" class="w-full" />
                <label for="t_file">File</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectIftaLabelDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedValue: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
```
