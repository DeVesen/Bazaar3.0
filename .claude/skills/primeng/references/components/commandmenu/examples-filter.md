# Angular CommandMenu Component — Filter

## Filter

A custom filter function can be provided with the filter property. The function receives the item and search term, and should return a score (0 means no match).

```typescript
import { Component } from '@angular/core';
import { CommandMenuModule } from 'primeng/commandmenu';
import { MenuItem } from 'primeng/api';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <p-commandmenu [model]="commands" [filter]="fuzzyFilter" placeholder="Search for commands..." class="mx-auto">
            <ng-template #emptyMessage>No results found.</ng-template>
            <ng-template #footer>
                <div class="flex items-center justify-end gap-3 w-full">
                    <span class="flex items-center gap-1 text-surface-500 text-xs">
                        <kbd class="bg-surface-100 dark:bg-surface-800 size-5 inline-flex items-center justify-center rounded border border-surface-200 dark:border-surface-700">
                            <svg data-p-icon="arrow-up"></svg>
                        </kbd>
                        <kbd class="bg-surface-100 dark:bg-surface-800 size-5 inline-flex items-center justify-center rounded border border-surface-200 dark:border-surface-700">
                            <svg data-p-icon="arrow-down"></svg>
                        </kbd>
                        Navigate
                    </span>
                    <span class="flex items-center gap-1 text-surface-500 text-xs">
                        <kbd class="bg-surface-100 dark:bg-surface-800 size-5 inline-flex items-center justify-center rounded border border-surface-200 dark:border-surface-700"> &#x21B5; </kbd>
                        Select
                    </span>
                </div>
            </ng-template>
        </p-commandmenu>
    `,
    standalone: true,
    imports: [CommandMenuModule, ArrowUp, ArrowDown]
})
export class CommandMenuFilterDemo {
    commands: MenuItem[] = [
        {
            label: 'Recents',
            items: [{ label: 'Check For Updates', keywords: ['check', 'updates'] …(lange Zeile gekürzt)
        },
        {
            label: 'Files',
            items: [
                { label: 'New File' },
                { label: 'New Folder' },
                { label: 'Save All' },
                { label: 'Change Theme' },
                { label: 'Run Task' },
                { label: 'Stop Task' },
                { label: 'Export Project' },
                { label: 'Import Project' },
                { label: 'Delete File' },
                { label: 'Duplicate File' }
            ]
        },
        {
            label: 'Source',
            items: [{ label: 'Git: Commit' }, { label: 'Git: Push' }, { label: ' …(lange Zeile gekürzt)
        },
        {
            label: 'Editor',
            items: [{ label: 'Align Left' }, { label: 'Align Center' }, { label: …(lange Zeile gekürzt)
        },
        {
            label: 'Navigation',
            items: [{ label: 'Go to Home' }, { label: 'Go Back' }, { label: 'Go Forward' }, { label: 'Open Explorer' }, { label: 'View Bookmarks' }, { label: 'Open Minimap' }]
        },
        {
            label: 'View',
            items: [{ label: 'Toggle Preview' }, { label: 'Maximize Window' }, { label: 'Minimize Window' }, { label: 'Grid View' }, { label: 'List View' }, { label: 'Light Mode' }, { label: 'Dark Mode' }]
        },
        {
            label: 'Tools',
            items: [{ label: 'Open Calculator' }, { label: 'Open Calendar' }, { label: 'Open Timer' }, { label: 'View Analytics' }, { label: 'View Trends' }, { label: 'Open Database' }]
        }
    ];

    fuzzyFilter(item: MenuItem, search: string): number {
        if (!search) return 1;

        const value = (item.label ?? '').toLowerCase();

        search = search.toLowerCase();

        let tIndex = 0;
        let sIndex = 0;
        let score = 0;

        while (tIndex < value.length && sIndex < search.length) {
            if (value[tIndex] === search[sIndex]) {
                score += 1;
                sIndex++;
            }

            tIndex++;
        }

        return sIndex === search.length ? score / value.length : 0;
    }
}
```
