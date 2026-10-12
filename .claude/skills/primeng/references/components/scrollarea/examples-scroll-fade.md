# Angular Scroll Area Component — Scroll Fade

## Scroll Fade

The mask property adds a gradient fade effect at the scroll edges.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <div class="max-w-56 w-full mx-auto">
            <div class="text-surface-500 dark:text-surface-400 font-medium text-sm uppercase font-mono tracking-tight mb-2">Automobiles</div>
            <p-scrollarea class="h-72" [mask]="true">
                <p-scrollarea-viewport>
                    <p-scrollarea-content class="space-y-2">
                        @for (car of automobiles; track car.label) {
                            <span class="flex items-end gap-0.5">
                                <span class="text-sm hover:underline!">{{ car.label }}</span>
                                <span class="text-surface-500 text-[11px] font-mono mb-px tracking-tighter">({{ car.value }})</span>
                            </span>
                        }
                    </p-scrollarea-content>
                </p-scrollarea-viewport>
                <p-scrollarea-scrollbar orientation="vertical">
                    <p-scrollarea-handle />
                </p-scrollarea-scrollbar>
            </p-scrollarea>
        </div>
    `,
    standalone: true,
    imports: []
})
export class ScrollareaFadeDemo {
    automobiles = [
        { label: 'Audi', value: '200' },
        { label: 'BMW', value: '350' },
        { label: 'Mercedes-Benz', value: '420' },
        { label: 'Volkswagen', value: '510' },
        { label: 'Toyota', value: '610' },
        { label: 'Honda', value: '280' },
        { label: 'Hyundai', value: '390' },
        { label: 'Kia', value: '260' },
        { label: 'Ford', value: '470' },
        { label: 'Renault', value: '530' },
        { label: 'Peugeot', value: '410' },
        { label: 'Citroen', value: '190' },
        { label: 'Skoda', value: '360' },
        { label: 'Seat', value: '210' },
        { label: 'Opel', value: '440' },
        { label: 'Fiat', value: '620' },
        { label: 'Dacia', value: '380' },
        { label: 'Volvo', value: '140' },
        { label: 'Mazda', value: '120' },
        { label: 'Mitsubishi', value: '110' },
        { label: 'Nissan', value: '330' },
        { label: 'Subaru', value: '60' },
        { label: 'Suzuki', value: '170' },
        { label: 'Jeep', value: '95' },
        { label: 'Land Rover', value: '80' },
        { label: 'Porsche', value: '75' },
        { label: 'Ferrari', value: '12' },
        { label: 'Lamborghini', value: '9' },
        { label: 'Bentley', value: '15' },
        { label: 'Rolls-Royce', value: '6' },
        { label: 'Mini', value: '130' },
        { label: 'Tesla', value: '220' },
        { label: 'BYD', value: '55' },
        { label: 'Chery', value: '160' },
        { label: 'MG', value: '145' },
        { label: 'DS Automobiles', value: '40' },
        { label: 'Alfa Romeo', value: '50' },
        { label: 'Lancia', value: '8' },
        { label: 'Cadillac', value: '22' },
        { label: 'Chevrolet', value: '105' },
        { label: 'Dodge', value: '18' },
        { label: 'GMC', value: '14' },
        { label: 'Infiniti', value: '11' },
        { label: 'Acura', value: '7' },
        { label: 'Genesis', value: '35' },
        { label: 'Geely', value: '27' },
        { label: 'Proton', value: '19' },
        { label: 'Togg', value: '65' },
        { label: 'Rivian', value: '4' },
        { label: 'Lucid', value: '3' }
    ];
}
```
