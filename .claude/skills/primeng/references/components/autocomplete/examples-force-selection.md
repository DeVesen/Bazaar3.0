# Angular AutoComplete Component — Force-selection

## Force-selection

ForceSelection mode validates the manual input to check whether it also exists in the suggestions list, if not the input value is cleared to make sure the value passed to the model is always one of the suggestions.

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CountryService } from '@/service/countryservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete [(ngModel)]="selectedCountry" [forceSelection]="true …(lange Zeile gekürzt)
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, FormsModule],
    providers: [CountryService]
})
export class AutoCompleteForceSelectionDemo implements OnInit {
    private countryService = inject(CountryService);

    countries: any[] | undefined;

    selectedCountry: any;

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
