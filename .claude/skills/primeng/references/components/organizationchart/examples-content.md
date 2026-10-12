# Angular Organization Chart Component — Content

## Content

The #node template customizes the node content. OrganizationChart still renders its own structure around it — the content is placed inside .p-organizationchart-node-content , and the built-in collapse button is preserved. The template receives the current OrgChartNode as its implicit context. The collapse indicator is customized with the #togglericon template, which receives the current expanded state — shown here with the plus and minus icons.

```typescript
import { Component } from '@angular/core';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Minus } from '@primeicons/angular/minus';
import { Plus } from '@primeicons/angular/plus';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <div class="flex items-center justify-center overflow-x-auto">
            <p-organization-chart [value]="data" [collapsible]="true" [(collapsedKeys)]="collapsedKeys">
                <ng-template #node let-node>
                    <div class="flex items-center gap-2">
                        <div class="size-9 rounded-md flex items-center justify-center shrink-0" [class]="node.data.accent">
                            <svg [pIcon]="node.data.icon" [size]="16" />
                        </div>
                        <div class="flex flex-col items-start gap-0.5">
                            <div class="text-sm font-semibold leading-none">{{ node.data.label }}</div>
                            <div class="text-xs leading-none opacity-75">{{ node.data.description }}</div>
                        </div>
                    </div>
                </ng-template>
                <ng-template #togglericon let-expanded>
                    @if (expanded) {
                        <svg data-p-icon="minus" />
                    } @else {
                        <svg data-p-icon="plus" />
                    }
                </ng-template>
            </p-organization-chart>
        </div>
    `,
    standalone: true,
    imports: [OrganizationChartModule, Minus, Plus, PIcon]
})
export class OrganizationChartContentDemo {
    collapsedKeys: OrganizationChartNodeKeys = {};

    data: OrgChartNode[] = [
        {
            key: '0',
            data: {
                label: 'AWS Cloud',
                description: 'us-east-1',
                icon: 'cloud',
                accent: 'bg-orange-500/10 text-orange-500'
            },
            children: [
                {
                    key: '0_0',
                    data: {
                        label: 'Compute',
                        description: 'Workloads & runtime',
                        icon: 'server',
                        accent: 'bg-sky-500/10 text-sky-500'
                    },
                    children: [
                        {
                            key: '0_0_0',
                            data: {
                                label: 'EC2',
                                description: 'Virtual servers',
                                icon: 'server',
                                accent: 'bg-sky-500/10 text-sky-500'
                            }
                        },
                        {
                            key: '0_0_1',
                            data: {
                                label: 'Lambda',
                                description: 'Serverless functions',
                                icon: 'bolt',
                                accent: 'bg-sky-500/10 text-sky-500'
                            }
                        }
                    ]
                },
                {
                    key: '0_1',
                    data: {
                        label: 'Storage',
                        description: 'Data persistence',
                        icon: 'database',
                        accent: 'bg-emerald-500/10 text-emerald-500'
                    },
                    children: [
                        {
                            key: '0_1_0',
                            data: {
                                label: 'S3',
                                description: 'Object storage',
                                icon: 'box',
                                accent: 'bg-emerald-500/10 text-emerald-500'
                            }
                        },
                        {
                            key: '0_1_1',
                            data: {
                                label: 'RDS',
                                description: 'Managed databases',
                                icon: 'database',
                                accent: 'bg-emerald-500/10 text-emerald-500'
                            }
                        }
                    ]
                },
                {
                    key: '0_2',
                    data: {
                        label: 'Networking',
                        description: 'Edge & access',
                        icon: 'globe',
                        accent: 'bg-violet-500/10 text-violet-500'
                    },
                    children: [
                        {
                            key: '0_2_0',
                            data: {
                                label: 'CloudFront',
                                description: 'Global CDN',
                                icon: 'globe',
                                accent: 'bg-violet-500/10 text-violet-500'
                            }
                        },
                        {
                            key: '0_2_1',
                            data: {
                                label: 'IAM',
                                description: 'Access policies',
                                icon: 'shield',
                                accent: 'bg-violet-500/10 text-violet-500'
                            }
                        }
                    ]
                }
            ]
        }
    ];
}
```
