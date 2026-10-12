# Angular Select Component — Template

## Template

Both the selected option and the options list can be templated to provide customizated representation. Use selectedItem template to customize the selected label display and the item template to change the content of the options in the select panel. In addition when grouping is enabled, group template is available to customize the option groups. All templates get the option instance as the default local template variable.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="countries" [(ngModel)]="selectedCountry" optionLabel="name" placeholder="Select a country" class="w-full md:w-56">
                <ng-template #selectedItem let-selectedOption>
                    @if (selectedOption) {
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + selectedOption.code.toLowerCase()" style="width: 18px" />
                            <div>{{ selectedOption.name }}</div>
                        </div>
                    }
                </ng-template>
                <ng-template let-country #item>
                    <div class="flex items-center gap-2">
                        <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + country.code.toLowerCase()" style="width: 18px" />
                        <div>{{ country.name }}</div>
                    </div>
                </ng-template>
                <ng-template #dropdownicon>
                    <i class="pi pi-map"></i>
                </ng-template>
                <ng-template #header>
                    <div class="font-medium p-3">Available Countries</div>
                </ng-template>
                <ng-template #footer>
                    <div class="p-3">
                        <button type="button" pButton fluid severity="secondary" text size="small"><i class="pi pi-plus"></i> Add New</button>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, ButtonModule, FormsModule]
})
export class SelectTemplateDemo implements OnInit {
    countries: any[] | undefined;

    selectedCountry: string | undefined;

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
