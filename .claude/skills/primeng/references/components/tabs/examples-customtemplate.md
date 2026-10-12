# Angular Tabs Component — Customtemplate

## Customtemplate

Use custom markup inside tabs and panels to build richer tab content.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';
import { User } from '@primeicons/angular/user';
import { CreditCard } from '@primeicons/angular/credit-card';
import { Cog } from '@primeicons/angular/cog';

@Component({
    template: `
        <p-tabs value="tab1" class="max-w-md mx-auto">
            <p-tablist>
                <p-tab value="tab1" class="flex items-center gap-2!">
                    <svg data-p-icon="user"></svg>
                    Account Info
                </p-tab>
                <p-tab value="tab2" class="flex items-center gap-2!">
                    <svg data-p-icon="credit-card"></svg>
                    Payment
                    <p-badge size="small" value="New" />
                </p-tab>
                <p-tab value="tab3" class="flex items-center gap-2!">
                    <svg data-p-icon="cog"></svg>
                    Preferences
                </p-tab>
            </p-tablist>
            <p-tabpanels>
                <p-tabpanel value="tab1">
                    <div>
                        <p class="mt-2 mb-8 text-surface-500">Update your personal information such as name, email address, and profile picture.</p>
                        <div class="space-y-4">
                            <div class="flex flex-col gap-1">
                                <label pLabel for="username">Username</label>
                                <input pInputText id="username" placeholder="john.doe" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label pLabel for="email">Email</label>
                                <input pInputText id="email" placeholder="john.doe&#64;example.com" />
                            </div>
                        </div>
                        <button type="button" pButton class="mt-8 w-fit">Save Changes</button>
                    </div>
                </p-tabpanel>
                <p-tabpanel value="tab2">
                    <div>
                        <p class="mt-2 mb-8 text-surface-500">Manage your subscription plan, view invoices, and update your payment method.</p>
                        <div class="space-y-4">
                            <div class="flex flex-col gap-1">
                                <label pLabel for="cardName">Cardholder Name</label>
                                <input pInputText id="cardName" placeholder="John Doe" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label pLabel for="cardNumber">Card Number</label>
                                <input pInputText id="cardNumber" placeholder="0000 0000 0000 0000" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label pLabel for="expiryDate">Expiry Date</label>
                                <input pInputText id="expiryDate" placeholder="MM/YY" />
                            </div>
                        </div>
                        <button type="button" pButton class="mt-8 w-fit">Update Payment</button>
                    </div>
                </p-tabpanel>
                <p-tabpanel value="tab3">
                    <div>
                        <p class="mt-2 mb-8 text-surface-500">Customize how the application looks and behaves to match your personal preferences.</p>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label pLabel for="darkMode">Dark Mode</label>
                                <p-toggleswitch inputId="darkMode" [(ngModel)]="darkMode" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label pLabel for="emailNotifications">Email Notifications</label>
                                <p-toggleswitch inputId="emailNotifications" [(ngModel)]="emailNotifications" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label pLabel for="desktopNotifications">Desktop Notifications</label>
                                <p-toggleswitch inputId="desktopNotifications" [(ngModel)]="desktopNotifications" />
                            </div>
                        </div>
                        <button type="button" pButton class="w-fit mt-8 ml-auto mr-0">Save Preferences</button>
                    </div>
                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>
    `,
    standalone: true,
    imports: [BadgeModule, TabsModule, ToggleSwitchModule, ButtonModule, InputTextModule, LabelModule, FormsModule, User, CreditCard, Cog]
})
export class TabsCustomTemplateDemo {
    darkMode: boolean = false;

    emailNotifications: boolean = true;

    desktopNotifications: boolean = false;
}
```
