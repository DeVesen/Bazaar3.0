# Angular Tabs Component — Basic

## Basic

Organizes content into selectable, horizontally laid out sections.

```typescript
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

@Component({
    template: `
        <p-tabs value="tab1">
            <p-tablist>
                <p-tab value="tab1">Account Info</p-tab>
                <p-tab value="tab2">Payment</p-tab>
                <p-tab value="tab3">Preferences</p-tab>
            </p-tablist>
            <p-tabpanels>
                <p-tabpanel value="tab1">
                    <h2 class="text-lg font-bold">Account Info</h2>
                    <p class="text-surface-500 mt-1">Update your personal information such as name, email address, and profile picture.</p>
                </p-tabpanel>
                <p-tabpanel value="tab2">
                    <h2 class="text-lg font-bold">Payment</h2>
                    <p class="text-surface-500 mt-1">Manage your subscription plan, view invoices, and update your payment method.</p>
                </p-tabpanel>
                <p-tabpanel value="tab3">
                    <h2 class="text-lg font-bold">Preferences</h2>
                    <p class="text-surface-500 mt-1">Customize how the application looks and behaves to match your personal preferences.</p>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>
    `,
    standalone: true,
    imports: [TabsModule]
})
export class TabsBasicDemo {}
```
