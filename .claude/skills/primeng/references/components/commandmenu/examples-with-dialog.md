# Angular CommandMenu Component — With Dialog

## With Dialog

CommandMenu can be used inside a Dialog to create a command palette experience. Press Ctrl+K (or Cmd+K on Mac) to open.

```typescript
import { Component } from '@angular/core';
import { Dialog, DialogModule } from 'primeng/dialog';
import { CommandMenuModule } from 'primeng/commandmenu';
import { MenuItem } from 'primeng/api';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <div class="flex items-center justify-center py-8">
            <span class="cursor-pointer" (click)="visible = true">
                Press
                <kbd class="bg-surface-100 dark:bg-surface-950 px-2 py-1 rounded-md border border-surface-200 dark:border-surface-700/50 text-sm ml-2"> CTRL/⌘ + K </kbd>
            </span>
        </div>
        <p-dialog [(visible)]="visible" [modal]="true" [showHeader]="false" styleClass="overflow-hidden max-w-md w-full" [dismissableMask]="true" [contentStyle]="{ padding: '0' }" (onShow)="onDialogShow()">
            <p-commandmenu [model]="commands" [(search)]="searchValue" placeholder="Search for commands..." class="w-full rounded-none border-none" (onSelect)="visible = false">
                <ng-template #emptyMessage let-search>
                    No results found for <span class="text-surface-900 dark:text-surface-0">"{{ search }}"</span>
                </ng-template>
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
        </p-dialog>
    `,
    standalone: true,
    imports: [DialogModule, CommandMenuModule, ArrowUp, ArrowDown]
})
export class CommandMenuWithDialogDemo {
    visible: boolean = false;

    searchValue: string = '';

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

    handleKeyboardEvent(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            event.stopPropagation();
            this.visible = !this.visible;
        }
    }

    onDialogShow() {
        this.commandmenu.focusInput();
    }
}
```
