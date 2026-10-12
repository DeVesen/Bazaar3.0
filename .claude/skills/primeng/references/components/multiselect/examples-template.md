# Angular MultiSelect Component — Template

## Template

Available options and the selected options support customization with item and selecteditems templates respectively. In addition, header, footer and filter sections can be templated as well.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { Country } from '@/domain/customer';

interface Country {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-multiselect [options]="countries" [(ngModel)]="selectedCountries" placeholder="Select Countries" optionLabel="name" class="w-full md:w-80" display="chip">
                <ng-template let-country #item>
                    <div class="flex items-center gap-2">
                        <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + country.code.toLowerCase()" style="width: 18px" />
                        <div>{{ country.name }}</div>
                    </div>
                </ng-template>
                <ng-template #dropdownicon>
                    <i class="pi pi-map"></i>
                </ng-template>
                <ng-template #filtericon>
                    <i class="pi pi-map-marker"></i>
                </ng-template>
                <ng-template #header>
                    <div class="font-medium px-3 py-2">Available Countries</div>
                </ng-template>
                <ng-template #footer>
                    <div class="p-3 flex justify-between">
                        <button type="button" pButton severity="secondary" text size="small"><i class="pi pi-plus"></i> Add New</button>
                        <button type="button" pButton severity="danger" text size="small"><i class="pi pi-times"></i> Remove All</button>
                    </div>
                </ng-template>
            </p-multiselect>
        </div>
    `,
    standalone: true,
    imports: [MultiSelectModule, ButtonModule, FormsModule]
})
export class MultiSelectTemplateDemo implements OnInit {
    countries!: Country[];

    selectedCountries!: Country[];

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
