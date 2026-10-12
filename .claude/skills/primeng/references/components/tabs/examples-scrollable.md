# Angular Tabs Component — Scrollable

## Scrollable

Enable scrollable to navigate long tab lists with previous and next buttons.

```typescript
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
    template: `
        <p-tabs value="0" scrollable>
            <p-tablist>
                @for (tab of scrollableTabs; track tab.value) {
                    <p-tab [value]="tab.value">{{ tab.title }}</p-tab>
                }
            </p-tablist>
            <p-tabpanels>
                @for (tab of scrollableTabs; track tab.value) {
                    <p-tabpanel [value]="tab.value">
                        <h2 class="text-lg font-bold">{{ tab.title }}</h2>
                        <p class="text-surface-500 mt-1">{{ tab.content }}</p>
                    </p-tabpanel>
                }
            </p-tabpanels>
        </p-tabs>
    `,
    standalone: true,
    imports: [TabsModule]
})
export class TabsScrollableDemo {
    scrollableTabs = Array.from({ length: 50 }, (_, i) => {
        const start = i % sentences.length;
        const content = Array.from({ length: 4 }, (_, j) => sentences[(start + j) % sentences.length]).join(' ');

        return { title: `Tab ${i + 1}`, value: `${i}`, content };
    });
}
```
