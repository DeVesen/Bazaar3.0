# Angular Timeline Component — Activity Feed

## Activity Feed

Display real-time activity streams with user avatars and contextual information.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { History } from '@primeicons/angular/history';
import { Minus } from '@primeicons/angular/minus';

@Component({
    template: `
        <div class="max-w-2xl">
            <div class="flex items-center gap-3 mb-6">
                <svg data-p-icon="history" [size]="16" class="text-surface-500" />
                <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">Recent Activity</span>
            </div>
            <p-timeline [value]="activities">
                <ng-template #opposite let-activity>
                    <span class="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap">{{ activity.time }}</span>
                </ng-template>
                <ng-template #marker let-activity>
                    <p-avatar [label]="activity.user.avatar" shape="circle" [class]="activity.user.color + ' text-white! text-xs! font-semibold!'" />
                </ng-template>
                <ng-template #content let-activity>
                    <div class="pb-6">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ activity.user.name }}</span>
                            <span class="text-surface-500 dark:text-surface-400">{{ activity.action }}</span>
                            <span class="font-medium text-primary">{{ activity.target }}</span>
                            @if (activity.repo) {
                                <span class="text-surface-500 dark:text-surface-400">to</span>
                                <code class="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-sm font-mono text-surface-700 dark:text-surface-300">{{ activity.repo }}</code>
                            }
                        </div>
                        @if (activity.description) {
                            <p class="mt-2! text-sm! text-surface-600 dark:text-surface-400">{{ activity.description }}</p>
                        }
                        @if (activity.details) {
                            <div class="mt-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                                <ul class="space-y-1">
                                    @for (detail of activity.details; track detail) {
                                        <li class="text-sm text-surface-600 dark:text-surface-400 font-mono flex items-start gap-2">
                                            <svg data-p-icon="minus" class="text-xs mt-1.5 text-surface-400" />
                                            {{ detail }}
                                        </li>
                                    }
                                </ul>
                            </div>
                        }
                    </div>
                </ng-template>
            </p-timeline>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, TimelineModule, History, Minus],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineActivityDemo {
    activities = [
        {
            id: 1,
            user: { name: 'Sarah Chen', avatar: 'SC', color: 'bg-violet-500!' },
            action: 'pushed',
            target: '3 commits',
            repo: 'main',
            time: '2 minutes ago',
            details: ['fix: resolve memory leak in useEffect', 'feat: add dark mode toggle', 'chore: update dependencies']
        },
        {
            id: 2,
            user: { name: 'Alex Kumar', avatar: 'AK', color: 'bg-blue-500!' },
            action: 'opened',
            target: 'pull request #142',
            repo: 'feature/auth',
            time: '15 minutes ago',
            description: 'Implement OAuth2 authentication flow'
        },
        {
            id: 3,
            user: { name: 'Maya Johnson', avatar: 'MJ', color: 'bg-emerald-500!' },
            action: 'commented on',
            target: 'issue #89',
            time: '1 hour ago',
            description: "I've investigated this bug and found the root cause. Working on a fix now."
        },
        {
            id: 4,
            user: { name: 'David Park', avatar: 'DP', color: 'bg-amber-500!' },
            action: 'merged',
            target: 'pull request #138',
            repo: 'main',
            time: '3 hours ago'
        },
        {
            id: 5,
            user: { name: 'Emma Wilson', avatar: 'EW', color: 'bg-rose-500!' },
            action: 'created',
            target: 'release v2.4.0',
            time: '5 hours ago',
            description: 'Performance improvements and bug fixes'
        }
    ];
}
```
