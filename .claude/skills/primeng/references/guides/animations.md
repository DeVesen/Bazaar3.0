# Animations - PrimeNG

Various PrimeNG Components utilize native CSS animations to provide an enhanced user experience. The default animations are based on the best practices recommended by the usability experts. In case you need to customize the default animations, this documentation covers the entire set of built-in animations.

## Anchoredoverlays

Anchored overlays are the components that have a floating ui positioned relatively to another element such as Select, Popover. The enter and leave animations are defined with the .p-anchored-overlay-enter-active and .p-anchored-overlay-leave-active classes.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Popover } from 'primeng/popover';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="card flex justify-center">
            <p-select [options]="cities" [(ngModel)]="selectedCity" optionLabel="name" placeholder="Select a City" class="w-full md:w-56" />
        </div>
    `,
    styles: [
        `
            :host::ng-deep {
                .p-anchored-overlay-enter-active {
                    animation: demo-overlay-in 300ms ease-out;
                }

                .p-anchored-overlay-leave-active {
                    animation: demo-overlay-out 250ms ease-in;
                }
            }

            @keyframes demo-overlay-in {
                from {
                    opacity: 0;
                    transform: translateY(10%);
                }
            }

            @keyframes demo-overlay-out {
                to {
                    opacity: 0;
                    transform: translateY(10%);
                }
            }
        `
    ],
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class GuidesAnimationsAnchoredOverlaysDemo implements OnInit {
    cities: City[];

    selectedCity: City | undefined;

    ngOnInit() {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
    }
}
```

## Collapsibles

Collapsible components have a content that is toggleable including Accordion, Panel, Fieldset, Stepper and PanelMenu. The enter and leave animations are defined with the .p-collapsible-enter-active and .p-collapsible-leave-active classes. Header I Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Header II Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi. Header III Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.

## Dialog

Overlays such as Dialog and Drawer are positioned relative to the viewport and have their own animations. Show Update your information. Username Email Cancel Save

## Disable

Individual animations can be reduced and even disabled completely using the animation duration.

## Reference

List of class names of the CSS animations used by the components. Component Enter Class Leave Class Accordion .p-collapsible-enter-active .p-collapsible-leave-active AutoComplete .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active CascadeSelect .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active ColorPicker .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active ConfirmPopup .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active ContextMenu .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active DatePicker .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active Dialog .p-dialog-enter-active .p-dialog-leave-active Drawer .p-drawer-enter-active .p-drawer-leave-active Fieldset .p-collapsible-enter-active .p-collapsible-leave-active Galleria .p-galleria-enter-active .p-galleria-leave-active Image .p-image-original-enter-active .p-image-original-leave-active Menu .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active Message .p-message-enter-active .p-message-leave-active Modal Masks .p-overlay-mask-enter-active .p-overlay-mask-leave-active MultiSelect .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active Panel .p-collapsible-enter-active .p-collapsible-leave-active PanelMenu .p-collapsible-enter-active .p-collapsible-leave-active Password .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active Select .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active Stepper .p-collapsible-enter-active .p-collapsible-leave-active TieredMenu .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active TreeSelect .p-anchored-overlay-enter-active .p-anchored-overlay-leave-active

---
