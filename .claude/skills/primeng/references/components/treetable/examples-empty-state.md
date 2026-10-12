# Angular TreeTable Component — Empty State

## Empty State

Use the emptymessage template for a custom empty-state view.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { Folder } from '@primeicons/angular/folder';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <p-treetable [value]="[]" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 50%">Name</th>
                    <th style="width: 20%">Size</th>
                    <th style="width: 30%">Type</th>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="3">
                        <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                            <div class="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <svg data-p-icon="folder" [size]="28" class="text-surface-400 dark:text-surface-500" />
                            </div>
                            <div>
                                <p class="m-0 font-semibold text-surface-900 dark:text-surface-0">No folders yet</p>
                                <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">Create your first folder to start building a tree.</p>
                            </div>
                            <button type="button" pButton size="small">
                                <svg data-p-icon="plus" />
                                New Folder
                            </button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TreeTableModule, ButtonModule, Folder, Plus],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableEmptyStateDemo {}
```
