# Angular InputPassword Component — Requirements

## Requirements

Password requirements checklist with real-time validation feedback.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';
import { CheckCircle } from '@primeicons/angular/check-circle';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col gap-2 w-64">
                <input pInputPassword [(ngModel)]="value" placeholder="Enter password" />
                <ul class="flex flex-col gap-2 list-none ms-1 my-1 p-0">
                    @for (req of requirements; track req.id) {
                        <li class="flex items-center gap-2 text-sm transition-all duration-300">
                            <svg data-p-icon="check-circle" [class]="'transition-all duration-300 ease-out ' + (req.test(value) ? 'text-green-500 scale-110 opacity-100' : 'text-surface-400 scale-90 opacity-70')"></svg>
                            <span
                                [class]="
                                    'transition-all duration-300 ease-out ' + (r …(lange Zeile gekürzt)
                                "
                            >
                                {{ req.label }}
                            </span>
                        </li>
                    }
                </ul>
            </div>
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule, CheckCircle]
})
export class InputPasswordRequirementsDemo {
    value: string = '';

    requirements = [
        { id: 'minLength', label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
        { id: 'uppercase', label: 'Contains uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
        { id: 'lowercase', label: 'Contains lowercase letter', test: (v: string) => /[a-z]/.test(v) },
        { id: 'number', label: 'Contains number', test: (v: string) => /[0-9]/.test(v) },
        { id: 'symbol', label: 'Contains special character', test: (v: string) => /[^a-zA-Z0-9]/.test(v) }
    ];
}
```
