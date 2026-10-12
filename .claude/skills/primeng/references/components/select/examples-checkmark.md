# Angular Select Component — Checkmark

## Checkmark

An alternative way to highlight the selected option is displaying a checkmark instead.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface Theme {
    label: string;
    value: string;
    icon: string;
    description: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="themes" [(ngModel)]="selectedTheme" [checkmark] …(lange Zeile gekürzt)
                <ng-template #selectedItem let-selectedOption>
                    <div class="flex items-center gap-2">
                        <span>{{ selectedOption.icon }}</span>
                        <span>{{ selectedOption.label }}</span>
                    </div>
                </ng-template>
                <ng-template let-theme #item>
                    <div class="flex items-center gap-3 py-1">
                        <span class="text-xl">{{ theme.icon }}</span>
                        <div class="flex flex-col">
                            <span class="font-medium">{{ theme.label }}</span>
                            <span class="text-xs text-surface-500">{{ theme.description }}</span>
                        </div>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectCheckMarkDemo {
    themes: Theme[] = [
        { label: 'Light', value: 'light', icon: '☀️', description: 'Clean and bright interface' },
        { label: 'Dark', value: 'dark', icon: '🌙', description: 'Easy on the eyes' },
        { label: 'System', value: 'system', icon: '💻', description: 'Match your device settings' },
        { label: 'High Contrast', value: 'high-contrast', icon: '◐', description: 'Maximum readability' }
    ];

    selectedTheme: Theme | undefined;
}
```
