# Angular Tabs Component — Selectonfocus

## Selectonfocus

Set selectOnFocus to activate tabs on focus.

```typescript
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
    template: `
        <p-tabs value="tab1" [selectOnFocus]="true">
            <p-tablist>
                @for (tab of tabs; track tab.id) {
                    <p-tab [value]="tab.id">{{ tab.title }}</p-tab>
                }
            </p-tablist>
            <p-tabpanels>
                @for (tab of tabs; track tab.id) {
                    <p-tabpanel [value]="tab.id">
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
export class TabsSelectonfocusDemo {
    tabs = [
        { id: 'tab1', title: 'Account Info', content: 'Update your personal information such as name, email address, and profile picture.' },
        { id: 'tab2', title: 'Payment', content: 'Manage your subscription plan, view invoices, and update your payment method.' },
        { id: 'tab3', title: 'Preferences', content: 'Customize how the application looks and behaves to match your personal preferences.' }
    ];
}
```
