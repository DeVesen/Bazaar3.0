# Angular Compare Component — Template

## Template

Compare is not limited to images — any content can be placed inside the items for creative comparisons.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Code } from '@primeicons/angular/code';

@Component({
    template: `
        <p-compare class="relative w-full max-w-md mx-auto h-80">
            <p-compare-item position="before">
                <div class="size-full bg-purple-100 dark:bg-purple-900/50 p-6 flex items-center justify-center">
                    <div class="w-full max-w-xs rounded-xl border bg-white dark:bg-purple-900 border-purple-100 dark:border-purple-800 p-5 space-y-4">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <p-avatar shape="circle" class="w-10 h-10">
                                    <img class="filter hue-rotate-260 saturate-150" src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" />
                                </p-avatar>
                                <div>
                                    <div class="font-medium text-purple-950 dark:text-purple-50">Amy Elsner</div>
                                    <div class="text-sm text-purple-600 dark:text-purple-400">Developer</div>
                                </div>
                            </div>
                            <p-tag class="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200">Pro</p-tag>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-purple-600 dark:text-purple-400">Storage</span>
                                <span class="text-purple-950 dark:text-purple-50">7.2 GB / 10 GB</span>
                            </div>
                            <p-progressbar [value]="72" [showValue]="false" class="h-2 [&_.p-progressbar-indicator]:bg-purple-500 [&_.p-progressbar-track]:bg-purple-100 dark:[&_.p-progressbar-track]:bg-purple-800" />
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button pButton severity="help" class="flex-1">Upgrade</button>
                            <button pButton severity="help" variant="outlined">Settings</button>
                        </div>
                    </div>
                </div>
            </p-compare-item>
            <p-compare-item position="after">
                <div class="size-full bg-primary-100 dark:bg-primary-900/50 p-6 flex items-center justify-center">
                    <div class="w-full max-w-xs rounded-xl border bg-white dark:bg-primary-900 border-primary-100 dark:border-primary-800 p-5 space-y-4">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <p-avatar shape="circle" class="w-10 h-10">
                                    <img src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" />
                                </p-avatar>
                                <div>
                                    <div class="font-medium text-primary-950 dark:text-primary-50">Amy Elsner</div>
                                    <div class="text-sm text-primary-600 dark:text-primary-400">Developer</div>
                                </div>
                            </div>
                            <p-tag class="bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200">Pro</p-tag>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-primary-600 dark:text-primary-400">Storage</span>
                                <span class="text-primary-950 dark:text-primary-50">7.2 GB / 10 GB</span>
                            </div>
                            <p-progressbar [value]="72" [showValue]="false" class="h-2 [&_.p-progressbar-indicator]:bg-primary [&_.p-progressbar-track]:bg-primary-100 dark:[&_.p-progressbar-track]:bg-primary-800" />
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button pButton class="flex-1">Upgrade</button>
                            <button pButton variant="outlined">Settings</button>
                        </div>
                    </div>
                </div>
            </p-compare-item>
            <p-compare-handle>
                <p-compare-indicator class="group flex items-center justify-center border border-surface">
                    <svg data-p-icon="code" class="group-data-[orientation=vertical]:rotate-90" />
                </p-compare-indicator>
            </p-compare-handle>
        </p-compare>
    `,
    standalone: true,
    imports: [AvatarModule, ProgressBarModule, TagModule, ButtonModule, Code]
})
export class CompareTemplateDemo {}
```
