# Angular Tabs Component — Lazy

## Lazy

By default, inactive tab's content is rendered (but hidden). You can use the lazy input (either globally on Tabs or individually on a TabPanel ) to change this behavior so that content is only rendered when the tab becomes active. If a lazy tab contains complex components that should only be initialized when the tab is activated, you should wrap the content inside: &lt;ng-template #content&gt;your content&lt;/ng-template&gt; .

```typescript
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
    template: `
        <p-tabs lazy value="0">
            <p-tablist>
                <p-tab value="0">Header I</p-tab>
                <p-tab value="1">Header II</p-tab>
                <p-tab value="2">Header III</p-tab>
            </p-tablist>
            <p-tabpanels>
                <p-tabpanel value="0">
                    <p class="m-0 text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, …(lange Zeile gekürzt)
                        consequat. Duis aute irure dolor in reprehenderit in vol …(lange Zeile gekürzt)
                        laborum.
                    </p>
                </p-tabpanel>
                <p-tabpanel value="1">
                    <p class="m-0 text-sm">
                        Sed ut perspiciatis unde omnis iste natus error sit volu …(lange Zeile gekürzt)
                        enim ipsam voluptatem quia voluptas sit aspernatur aut o …(lange Zeile gekürzt)
                    </p>
                </p-tabpanel>
                <p-tabpanel value="2">
                    <ng-template #content>Complex components that should only be initialized when the tab becomes active</ng-template>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>
    `,
    standalone: true,
    imports: [TabsModule]
})
export class TabsLazyDemo {}
```
