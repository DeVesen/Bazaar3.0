# Angular Dialog Component — Overlaysinside

## Overlaysinside

When dialog includes other components with overlays such as dropdown, the overlay part cannot exceed dialog boundaries due to overflow. In order to solve this, you can either append the overlay to the body by using appendTo property or allow overflow in dialog.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="showDialog()"><i class="pi pi-external-link"></i>Show</button>
            <p-dialog header="Header" [(visible)]="visible" [style]="{ width: '50vw' }">
                <div class="flex py-2 justify-center">
                    <p-select appendTo="body" [options]="cities" [(ngModel)]="selectedCity" placeholder="Select a City" optionLabel="name"></p-select>
                </div>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, SelectModule, ButtonModule, FormsModule]
})
export class DialogOverlaysInsideDemo implements OnInit {
    cities: City[] | undefined;

    selectedCity: City | undefined;

    visible: boolean = false;

    ngOnInit() {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
    }

    showDialog() {
        this.visible = true;
    }
}
```
