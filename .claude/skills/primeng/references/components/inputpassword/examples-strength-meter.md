# Angular InputPassword Component — Strength Meter

## Strength Meter

Visualize the overall password strength with an animated progress bar and a severity-based label that adapts as the password improves.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col gap-2 w-64">
                <input pInputPassword [(ngModel)]="value" placeholder="Enter password" />
                <div class="flex flex-col gap-2" [style.visibility]="strengthInfo ? 'visible' : 'hidden'">
                    <p-progressbar [value]="strengthInfo?.percent ?? 0" [showValue]="false" [style]="{ height: '6px' }" [color]="strengthInfo?.color" />
                    <div class="flex justify-end">
                        <p-tag [severity]="strengthInfo?.severity ?? 'info'" [value]="strengthInfo?.label ?? '—'" />
                    </div>
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ProgressBarModule, TagModule, InputPasswordModule, FormsModule]
})
export class InputPasswordStrengthDemo {
    value: string = '';

    get strengthInfo() {
        const level = this.getStrength(this.value);

        return level ? this.strengthMap[level] : null;
    }

    getStrength(value: string): string | null {
        if (!value) return null;

        let score = 0;

        if (value.length >= 8) score++;

        if (value.length >= 12) score++;

        if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;

        if (/[0-9]/.test(value)) score++;

        if (/[^a-zA-Z0-9]/.test(value)) score++;

        if (score <= 1) return 'weak';

        if (score <= 2) return 'medium';

        if (score <= 3) return 'strong';

        return 'very-strong';
    }
}
```
