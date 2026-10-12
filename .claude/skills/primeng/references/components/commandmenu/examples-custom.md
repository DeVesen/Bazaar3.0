# Angular CommandMenu Component — Custom

## Custom

Custom content can be displayed for each item using the item template.

```typescript
import { Component } from '@angular/core';
import { CommandMenuModule } from 'primeng/commandmenu';
import { MenuItem } from 'primeng/api';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <p-commandmenu [model]="commands" placeholder="Search for commands..." class="mx-auto">
            <ng-template #item let-item>
                <div class="p-menu-item-link flex items-center gap-3.5 w-full">
                    <span [class]="'w-5 h-5 rounded-md flex items-center justify-center text-white ' + item.color">
                        <i [class]="'pi ' + item.icon + ' text-xs font-bold'"></i>
                    </span>
                    <span class="text-sm">{{ item.label }}</span>
                    <span class="opacity-50 ml-auto text-sm">{{ item.category }}</span>
                </div>
            </ng-template>
            <ng-template #emptyMessage>No results found</ng-template>
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
export class CommandMenuCustomDemo {
    commands: MenuItem[] = [
        {
            label: 'Recents',
            items: [
                { icon: 'pi-refresh', label: 'Check For Updates', category: 'Command', color: 'bg-[linear-gradient(rgb(245,83,84),rgb(235,70,70))]', keywords: ['check', 'updates'] },
                { icon: 'pi-cog', label: 'Open Settings', category: 'Command', color: 'bg-[linear-gradient(rgb(96,165,250),rgb(59,130,246))]' },
                { icon: 'pi-search', label: 'Search Files', category: 'Command', color: 'bg-[linear-gradient(rgb(167,139,250),rgb(139,92,246))]' },
                { icon: 'pi-terminal', label: 'Open Terminal', category: 'View', color: 'bg-[linear-gradient(rgb(148,163,184),rgb(100,116,139))]' },
                { icon: 'pi-history', label: 'View History', category: 'View', color: 'bg-[linear-gradient(rgb(192,132,252),rgb(168,85,247))]', keywords: ['history', 'recent'] },
                { icon: 'pi-comments', label: 'Open Chat', category: 'Communication', color: 'bg-[linear-gradient(rgb(34,211,238),rgb(6,182,212))]' }
            ]
        },
        {
            label: 'Files',
            items: [
                { icon: 'pi-file', label: 'New File', category: 'File', color: 'bg-[linear-gradient(rgb(52,211,153),rgb(16,185,129))]' },
                { icon: 'pi-folder', label: 'New Folder', category: 'File', color: 'bg-[linear-gradient(rgb(251,191,36),rgb(245,158,11))]' },
                { icon: 'pi-save', label: 'Save All', category: 'File', color: 'bg-[linear-gradient(rgb(34,197,94),rgb(22,163,74))]' },
                { icon: 'pi-palette', label: 'Change Theme', category: 'Appearance', color: 'bg-[linear-gradient(rgb(251,146,60),rgb(249,115,22))]' },
                { icon: 'pi-play', label: 'Run Task', category: 'Command', color: 'bg-[linear-gradient(rgb(34,197,94),rgb(21,128,61))]' },
                { icon: 'pi-stop', label: 'Stop Task', category: 'Command', color: 'bg-[linear-gradient(rgb(239,68,68),rgb(220,38,38))]' },
                { icon: 'pi-file-export', label: 'Export Project', category: 'File', color: 'bg-[linear-gradient(rgb(147,51,234),rgb(126,34,206))]' },
                { icon: 'pi-file-import', label: 'Import Project', category: 'File', color: 'bg-[linear-gradient(rgb(99,102,241),rgb(79,70,229))]' },
                { icon: 'pi-trash', label: 'Delete File', category: 'File', color: 'bg-[linear-gradient(rgb(239,68,68),rgb(185,28,28))]' },
                { icon: 'pi-copy', label: 'Duplicate File', category: 'File', color: 'bg-[linear-gradient(rgb(156,163,175),rgb(107,114,128))]' }
            ]
        },
        {
            label: 'Source',
            items: [
                { icon: 'pi-git', label: 'Git: Commit', category: 'Source Control', color: 'bg-[linear-gradient(rgb(249,115,22),rgb(234,88,12))]' },
                { icon: 'pi-upload', label: 'Git: Push', category: 'Source Control', color: 'bg-[linear-gradient(rgb(14,165,233),rgb(2,132,199))]' },
                { icon: 'pi-download', label: 'Git: Pull', category: 'Source Control', color: 'bg-[linear-gradient(rgb(59,130,246),rgb(37,99,235))]' },
                { icon: 'pi-users', label: 'Switch Account', category: 'Account', color: 'bg-[linear-gradient(rgb(236,72,153),rgb(219,39,119))]' },
                { icon: 'pi-book', label: 'Open Documentation', category: 'Help', color: 'bg-[linear-gradient(rgb(147,197,253),rgb(96,165,250))]' },
                { icon: 'pi-sync', label: 'Git: Sync', category: 'Source Control', color: 'bg-[linear-gradient(rgb(74,222,128),rgb(34,197,94))]' },
                { icon: 'pi-code-branch', label: 'Git: Create Branch', category: 'Source Control', color: 'bg-[linear-gradient(rgb(251,146,60),rgb(249,115,22))]' },
                { icon: 'pi-tag', label: 'Git: Create Tag', category: 'Source Control', color: 'bg-[linear-gradient(rgb(196,181,253),rgb(167,139,250))]' }
            ]
        },
        {
            label: 'Editor',
            items: [
                { icon: 'pi-align-left', label: 'Align Left', category: 'Editor', color: 'bg-[linear-gradient(rgb(147,197,253),rgb(59,130,246))]' },
                { icon: 'pi-align-center', label: 'Align Center', category: 'Editor', color: 'bg-[linear-gradient(rgb(147,197,253),rgb(59,130,246))]' },
                { icon: 'pi-align-right', label: 'Align Right', category: 'Editor', color: 'bg-[linear-gradient(rgb(147,197,253),rgb(59,130,246))]' },
                { icon: 'pi-bold', label: 'Toggle Bold', category: 'Editor', color: 'bg-[linear-gradient(rgb(30,41,59),rgb(15,23,42))]' },
                { icon: 'pi-italic', label: 'Toggle Italic', category: 'Editor', color: 'bg-[linear-gradient(rgb(71,85,105),rgb(51,65,85))]' },
                { icon: 'pi-link', label: 'Insert Link', category: 'Editor', color: 'bg-[linear-gradient(rgb(59,130,246),rgb(37,99,235))]' },
                { icon: 'pi-image', label: 'Insert Image', category: 'Editor', color: 'bg-[linear-gradient(rgb(168,85,247),rgb(147,51,234))]' },
                { icon: 'pi-list', label: 'Insert List', category: 'Editor', color: 'bg-[linear-gradient(rgb(34,197,94),rgb(22,163,74))]' }
            ]
        },
        {
            label: 'Navigation',
            items: [
                { icon: 'pi-home', label: 'Go to Home', category: 'Navigation', color: 'bg-[linear-gradient(rgb(96,165,250),rgb(59,130,246))]' },
                { icon: 'pi-arrow-left', label: 'Go Back', category: 'Navigation', color: 'bg-[linear-gradient(rgb(148,163,184),rgb(100,116,139))]' },
                { icon: 'pi-arrow-right', label: 'Go Forward', category: 'Navigation', color: 'bg-[linear-gradient(rgb(148,163,184),rgb(100,116,139))]' },
                { icon: 'pi-compass', label: 'Open Explorer', category: 'Navigation', color: 'bg-[linear-gradient(rgb(251,191,36),rgb(245,158,11))]' },
                { icon: 'pi-bookmark', label: 'View Bookmarks', category: 'Navigation', color: 'bg-[linear-gradient(rgb(249,115,22),rgb(234,88,12))]' },
                { icon: 'pi-map', label: 'Open Minimap', category: 'Navigation', color: 'bg-[linear-gradient(rgb(52,211,153),rgb(16,185,129))]' }
            ]
        },
        {
            label: 'View',
            items: [
                { icon: 'pi-eye', label: 'Toggle Preview', category: 'View', color: 'bg-[linear-gradient(rgb(147,51,234),rgb(126,34,206))]' },
                { icon: 'pi-window-maximize', label: 'Maximize Window', category: 'View', color: 'bg-[linear-gradient(rgb(100,116,139),rgb(71,85,105))]' },
                { icon: 'pi-window-minimize', label: 'Minimize Window', category: 'View', color: 'bg-[linear-gradient(rgb(148,163,184),rgb(100,116,139))]' },
                { icon: 'pi-th-large', label: 'Grid View', category: 'View', color: 'bg-[linear-gradient(rgb(34,197,94),rgb(22,163,74))]' },
                { icon: 'pi-bars', label: 'List View', category: 'View', color: 'bg-[linear-gradient(rgb(59,130,246),rgb(37,99,235))]' },
                { icon: 'pi-sun', label: 'Light Mode', category: 'View', color: 'bg-[linear-gradient(rgb(253,224,71),rgb(250,204,21))]' },
                { icon: 'pi-moon', label: 'Dark Mode', category: 'View', color: 'bg-[linear-gradient(rgb(30,41,59),rgb(15,23,42))]' }
            ]
        },
        {
            label: 'Tools',
            items: [
                { icon: 'pi-calculator', label: 'Open Calculator', category: 'Tools', color: 'bg-[linear-gradient(rgb(148,163,184),rgb(100,116,139))]' },
                { icon: 'pi-calendar', label: 'Open Calendar', category: 'Tools', color: 'bg-[linear-gradient(rgb(96,165,250),rgb(59,130,246))]' },
                { icon: 'pi-clock', label: 'Open Timer', category: 'Tools', color: 'bg-[linear-gradient(rgb(251,146,60),rgb(249,115,22))]' },
                { icon: 'pi-chart-bar', label: 'View Analytics', category: 'Tools', color: 'bg-[linear-gradient(rgb(34,197,94),rgb(22,163,74))]' },
                { icon: 'pi-chart-line', label: 'View Trends', category: 'Tools', color: 'bg-[linear-gradient(rgb(59,130,246),rgb(37,99,235))]' },
                { icon: 'pi-database', label: 'Open Database', category: 'Tools', color: 'bg-[linear-gradient(rgb(168,85,247),rgb(147,51,234))]' }
            ]
        }
    ];
}
```
