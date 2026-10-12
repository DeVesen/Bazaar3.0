# Angular InputPassword Component — Popover

## Popover

Combine a visibility toggle, strength meter, and requirements checklist into a fully custom password creation with Popover component.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Popover, PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { InputPasswordModule } from 'primeng/inputpassword';
import { Eye } from '@primeicons/angular/eye';
import { EyeSlash } from '@primeicons/angular/eye-slash';
import { Shield } from '@primeicons/angular/shield';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col gap-2">
                <p-iconfield>
                    <input pInputPassword [(ngModel)]="value" [(mask)]="mask" placeholder="Create a password" (focus)="op.show($event)" (blur)="op.hide()" />
                    <p-inputicon (click)="mask = !mask" style="cursor: pointer">
                        @if (mask) {
                            <svg data-p-icon="eye"></svg>
                        } @else {
                            <svg data-p-icon="eye-slash"></svg>
                        }
                    </p-inputicon>
                </p-iconfield>
                <p-popover #op>
                    <div class="flex flex-col gap-3 w-72">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <svg data-p-icon="shield" style="width: 1.25rem; height: 1.25rem"></svg>
                                <span class="font-semibold text-sm">Password Strength</span>
                            </div>
                            <p-tag [severity]="severity" [value]="label || '—'" [style.visibility]="label ? 'visible' : 'hidden'" />
                        </div>
                        <p-progressbar [value]="score" [showValue]="false" [style]="{ height: '6px' }" [color]="color" />
                        <ul class="flex flex-col gap-2 list-none m-0 p-0">
                            @for (rule of rules; track rule.id) {
                                <li class="flex items-center gap-2 text-xs">
                                    @if (rule.test(value)) {
                                        <svg data-p-icon="check" class="text-green-500"></svg>
                                    } @else {
                                        <svg data-p-icon="times" class="text-red-400"></svg>
                                    }
                                    <span [class]="rule.test(value) ? 'text-surface-500' : 'text-surface-700'">{{ rule.label }}</span>
                                </li>
                            }
                        </ul>
                    </div>
                </p-popover>
            </div>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, PopoverModule, ProgressBarModule, TagModule, InputPasswordModule, FormsModule, Eye, EyeSlash, Shield, Check, Times]
})
export class InputPasswordPopoverDemo {
    value: string = '';

    mask: boolean = true;

    rules = [
        { id: 'length', label: 'At least 12 characters long', test: (v: string) => v.length >= 12, weight: 20 },
        { id: 'uppercase', label: 'Contains uppercase letter', test: (v: string) => /[A-Z]/.test(v), weight: 20 },
        { id: 'lowercase', label: 'Contains lowercase letter', test: (v: string) => /[a-z]/.test(v), weight: 20 },
        { id: 'number', label: 'Contains number', test: (v: string) => /[0-9]/.test(v), weight: 20 },
        { id: 'special', label: 'Contains special character (!@#$...)', test: (v: string) => /[^a-zA-Z0-9]/.test(v), weight: 20 }
    ];

    get score(): number {
        if (!this.value) return 0;

        return this.rules.reduce((acc, rule) => acc + (rule.test(this.value) ? rule.weight : 0), 0);
    }

    get severity(): 'danger' | 'warn' | 'info' | 'success' {
        if (this.score <= 20) return 'danger';

        if (this.score <= 40) return 'warn';

        if (this.score <= 60) return 'info';

        return 'success';
    }

    get color(): string {
        switch (this.severity) {
            case 'danger':
                return 'var(--p-red-500)';
            case 'warn':
                return 'var(--p-amber-500)';
            case 'info':
                return 'var(--p-blue-500)';
            case 'success':
                return 'var(--p-green-500)';
        }
    }

    get label(): string {
        if (this.score === 0) return '';

        if (this.score <= 20) return 'Too Weak';

        if (this.score <= 40) return 'Weak';

        if (this.score <= 60) return 'Fair';

        if (this.score <= 80) return 'Strong';

        return 'Very Strong';
    }
}
```
