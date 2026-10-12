# PrimeNG - Pass Through

The Pass Through attributes is an API to customize the internal DOM Structure of the components.

## Basic

Each component has a special pt property to define an object with keys corresponding to the available DOM elements. Each value can either be a string, an object or a function that returns a string or an object to define the arbitrary properties to apply to the element such as styling, aria, data-* or custom attributes. If the value is a string or a function that returns a string, it is considered as a class definition and added to the class attribute of the element. Every component documentation has a dedicated section to document the available section names exposed via PT.

```typescript
import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';

@Component({
    template: `
        <div class="card">
            <p-panel header="Header" toggleable [pt]="pt">
                <p class="m-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed …(lange Zeile gekürzt)
                    consequat. Duis aute irure dolor in reprehenderit in volupta …(lange Zeile gekürzt)
                </p>
            </p-panel>
        </div>
    `,
    standalone: true,
    imports: [PanelModule]
})
export class GuidesPassthroughBasicDemo {}
```

## Global

PassThrough object can also be defined at a global level to apply all components in an application using the providePrimeNG provider. For example, with the configuration here all panel headers have the bg-primary style class and all autocomplete components have a fixed width. These settings can be overridden by a particular component as components pt property has higher precedence over global pt by default.

## Instance

In cases where you need to access the UI Component instance, define a component passthrough type that exposes the component instance or a function that receives a PassThroughContext as parameter.

## Lifecycle

Lifecycle hooks of components are exposed as pass through using the hooks property so that callback functions can be registered. Available callbacks are onBeforeInit , onInit , onChanges , onDoCheck , onAfterContentInit , onAfterContentChecked , onAfterViewInit , onAfterViewChecked and onDestroy . Refer to the Angular documentation for detailed information about lifecycle hooks.

## Pcprefix

A UI component may also use other UI components, in this case section names are prefixed with pc (Prime Component) to denote the PrimeNG component begin used. This distinguishes components from standard DOM elements and indicating the necessity for a nested structure. For example, the badge section is identified as pcBadge because the button component incorporates the badge component internally.

```typescript
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="card flex justify-center">
            <button
                type="button"
                pButton
                variant="outlined"
                severity="secondary"
                [pt]="{
                    root: 'px-3! py-2!',
                    icon: 'text-lg! text-violet-500! dark:text-violet-400!',
                    label: 'text-violet-500! dark:text-violet-400!',
                    pcBadge: {
                        root: 'bg-violet-500! dark:bg-violet-400! text-white! dark:text-black!'
                    }
                }"
            >
                <i class="pi pi-inbox"></i>
                Messages
                <p-badge value="2" />
            </button>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, ButtonModule]
})
export class GuidesPassthroughPcPrefixDemo {}
```

## Ptoptions

The ⁠ptOptions property determines how a component's local PassThrough configuration merges with the global PT configuration, as demonstrated in the following examples using both global and component-level settings. The mergeSections defines whether the sections from the main configuration gets added and the mergeProps controls whether to override or merge the defined props. Defaults are true for mergeSections and false for mergeProps . Global Configuration mergeSections: true, mergeProps: false (default) mergeSections: true, mergeProps: true mergeSections: false, mergeProps: true mergeSections: false, mergeProps: false

---
