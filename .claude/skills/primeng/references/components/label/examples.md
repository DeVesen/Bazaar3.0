# Angular Label Component — Beispiele

## Basic

An accessible label element associated with a form control.

```typescript
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap justify-center">
            <div class="flex flex-col gap-2 w-full max-w-sm">
                <label pLabel for="username">Username</label>
                <input pInputText id="username" placeholder="Enter username" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, LabelModule]
})
export class LabelBasicDemo {}
```

## Disabled

Label reflects the disabled state of an associated control automatically when the control and label are peers or when the container has data-disabled .

```typescript
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-col items-start max-w-3xs w-full mx-auto gap-6">
            <div class="flex flex-col gap-2 w-full">
                <label pLabel for="account-id">Account ID</label>
                <input pInputText id="account-id" value="ACC-2026-0042" disabled />
            </div>
            <div [attr.data-disabled]="true" class="flex flex-col gap-2 w-full">
                <label pLabel for="api-key">API Key</label>
                <span>
                    <input pInputText id="api-key" value="sk_live_***************" disabled fluid />
                </span>
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, LabelModule]
})
export class LabelDisabledDemo {}
```

## Required

You can display required indicators in the label content while keeping the input semantics with required or aria-required .

```typescript
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';
import { Envelope } from '@primeicons/angular/envelope';

@Component({
    template: `
        <div class="flex flex-wrap justify-center">
            <div class="flex flex-col gap-2 w-full max-w-sm">
                <label pLabel for="email" class="font-medium">
                    <svg data-p-icon="envelope" />
                    <span>Email</span>
                    <span aria-hidden="true">*</span>
                </label>
                <input pInputText id="email" type="email" placeholder="name@example.com" required aria-required="true" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, LabelModule, Envelope]
})
export class LabelRequiredDemo {}
```

## Wrapper

Label can wrap a form control to associate them implicitly without for . Useful for card-style selectable options.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap justify-center">
            <div class="flex flex-col w-full max-w-3xs gap-2">
                @for (plan of plans; track plan.id) {
                    <label pLabel [class]="'flex items-start gap-3 p-3 rounded-md border cursor-pointer ' + (selected === plan.id ? 'border-primary' : 'border-surface')">
                        <p-radiobutton name="plan" [value]="plan.id" [(ngModel)]="selected" />
                        <div class="flex flex-col gap-0.5">
                            <span class="font-medium">{{ plan.name }}</span>
                            <span class="text-xs text-surface-500">{{ plan.description }}</span>
                        </div>
                    </label>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, LabelModule, FormsModule]
})
export class LabelWrapperDemo {
    selected: string = 'pro';

    plans = [
        { id: 'starter', name: 'Starter', description: 'For solo developers.' },
        { id: 'pro', name: 'Pro', description: 'For growing teams.' },
        { id: 'enterprise', name: 'Enterprise', description: 'For large organizations.' }
    ];
}
```
