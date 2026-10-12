# Angular Select Component — Basic

## Basic

Select is used as a controlled component with ngModel property along with an options collection. Label and value of an option are defined with the optionLabel and optionValue properties respectively. Note that, when options are simple primitive values such as a string array, no optionLabel and optionValue would be necessary.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface Language {
    label: string;
    value: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="languages" [(ngModel)]="selectedLanguage" optionLabel="label" optionValue="value" placeholder="Select a language" class="w-full md:w-56" />
        </div>
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectBasicDemo {
    languages: Language[] = [
        { label: 'English', value: 'en' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Español', value: 'es' },
        { label: 'Français', value: 'fr' },
        { label: 'Italiano', value: 'it' },
        { label: 'Türkçe', value: 'tr' },
        { label: '日本語', value: 'ja' },
        { label: '中文', value: 'zh' }
    ];

    selectedLanguage: string | undefined;
}
```
