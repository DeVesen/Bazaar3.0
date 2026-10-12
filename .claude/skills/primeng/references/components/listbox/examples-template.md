# Angular Listbox Component — Template

## Template

For custom content support define a template named item where the default local template variable refers to an option.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { Country } from '@/domain/customer';

interface Country {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-listbox [options]="countries" [(ngModel)]="selectedCountry" optionLabel="name" class="w-full md:w-56">
                <ng-template #item let-country>
                    <div class="flex items-center gap-2">
                        <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + country.code.toLowerCase()" style="width: 18px" />
                        <div>{{ country.name }}</div>
                    </div>
                </ng-template>
            </p-listbox>
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, FormsModule]
})
export class ListboxTemplateDemo implements OnInit {
    countries!: Country[];

    selectedCountry!: Country;

    ngOnInit() {
        this.countries = [
            { name: 'Australia', code: 'AU' },
            { name: 'Brazil', code: 'BR' },
            { name: 'China', code: 'CN' },
            { name: 'Egypt', code: 'EG' },
            { name: 'France', code: 'FR' },
            { name: 'Germany', code: 'DE' },
            { name: 'India', code: 'IN' },
            { name: 'Japan', code: 'JP' },
            { name: 'Spain', code: 'ES' },
            { name: 'United States', code: 'US' }
        ];
    }
}
```
