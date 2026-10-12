# Angular AutoComplete Component — Template

## Template

AutoComplete offers multiple templates for customization through templating.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CountryService } from '@/service/countryservice';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete [(ngModel)]="selectedCountryAdvanced" [suggestions]="filteredCountries" (completeMethod)="filterCountry($event)" optionLabel="name" inputStyleClass="w-full md:w-56" scrollHeight="14rem">
                <ng-template let-country #item>
                    <div class="flex items-center gap-2">
                        <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + country.code.toLowerCase()" style="width: 18px" />
                        <div>{{ country.name }}</div>
                    </div>
                </ng-template>
                <ng-template #header>
                    <div class="font-medium px-3 py-2">Available Countries</div>
                </ng-template>
                <ng-template #footer>
                    <div class="px-3 py-3">
                        <button type="button" pButton fluid severity="secondary" text size="small"><svg data-p-icon="plus" />Add New</button>
                    </div>
                </ng-template>
            </p-autocomplete>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, ButtonModule, FormsModule, Plus],
    providers: [CountryService]
})
export class AutoCompleteTemplateDemo implements OnInit {
    private countryService = inject(CountryService);

    countries: any[] | undefined;

    selectedCountryAdvanced: any[] | undefined;

    filteredCountries: any[] | undefined;

    ngOnInit() {
        this.countryService.getCountries().then((countries) => {
            this.countries = countries;
        });
    }

    filterCountry(event: AutoCompleteCompleteEvent) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < (this.countries as any[]).length; i++) {
            let country = (this.countries as any[])[i];

            if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(country);
            }
        }

        this.filteredCountries = filtered;
    }
}
```
