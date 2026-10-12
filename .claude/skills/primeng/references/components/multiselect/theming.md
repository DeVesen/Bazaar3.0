# Angular MultiSelect Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| labelContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the label container's DOM element. |
| label | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the label's DOM element. |
| clearIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the clear icon's DOM element. |
| chipItem | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the chip item's DOM element. |
| pcChip | ChipPassThrough | Used to pass attributes to the Chip component. |
| dropdown | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the dropdown's DOM element. |
| loadingIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the loading icon's DOM element. |
| dropdownIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the dropdown icon's DOM element. |
| overlay | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the overlay's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| pcHeaderCheckbox | CheckboxPassThrough | Used to pass attributes to the header checkbox component. |
| pcFilterContainer | IconFieldPassThrough | Used to pass attributes to the IconField component. |
| pcFilter | InputTextPassThrough | Used to pass attributes to the InputText component. |
| pcFilterIconContainer | InputIconPassThrough | Used to pass attributes to the InputIcon component. |
| filterIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the filter icon's DOM element. |
| listContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the list container's DOM element. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| optionGroup | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option group's DOM element. |
| option | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option's DOM element. |
| pcOptionCheckbox | CheckboxPassThrough | Used to pass attributes to the option checkbox component. |
| emptyMessage | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the empty message's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-multiselect | Class name of the root element |
| p-multiselect-label-container | Class name of the label container element |
| p-multiselect-label | Class name of the label element |
| p-multiselect-chip-item | Class name of the chip item element |
| p-multiselect-chip | Class name of the chip element |
| p-multiselect-chip-icon | Class name of the chip icon element |
| p-multiselect-dropdown | Class name of the dropdown element |
| p-multiselect-loading-icon | Class name of the loading icon element |
| p-multiselect-dropdown-icon | Class name of the dropdown icon element |
| p-multiselect-overlay | Class name of the overlay element |
| p-multiselect-header | Class name of the header element |
| p-multiselect-filter-container | Class name of the filter container element |
| p-multiselect-filter | Class name of the filter element |
| p-multiselect-list-container | Class name of the list container element |
| p-multiselect-list | Class name of the list element |
| p-multiselect-option-group | Class name of the option group element |
| p-multiselect-option | Class name of the option element |
| p-multiselect-empty-message | Class name of the empty message element |
| p-autocomplete-clear-icon | Class name of the clear icon |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| multiselect.background | --p-multiselect-background | Background of root |
| multiselect.disabled.background | --p-multiselect-disabled-background | Disabled background of root |
| multiselect.filled.background | --p-multiselect-filled-background | Filled background of root |
| multiselect.filled.hover.background | --p-multiselect-filled-hover-background | Filled hover background of root |
| multiselect.filled.focus.background | --p-multiselect-filled-focus-background | Filled focus background of root |
| multiselect.border.color | --p-multiselect-border-color | Border color of root |
| multiselect.hover.border.color | --p-multiselect-hover-border-color | Hover border color of root |
| multiselect.focus.border.color | --p-multiselect-focus-border-color | Focus border color of root |
| multiselect.invalid.border.color | --p-multiselect-invalid-border-color | Invalid border color of root |
| multiselect.color | --p-multiselect-color | Color of root |
| multiselect.disabled.color | --p-multiselect-disabled-color | Disabled color of root |
| multiselect.placeholder.color | --p-multiselect-placeholder-color | Placeholder color of root |
| multiselect.invalid.placeholder.color | --p-multiselect-invalid-placeholder-color | Invalid placeholder color of root |
| multiselect.shadow | --p-multiselect-shadow | Shadow of root |
| multiselect.padding.x | --p-multiselect-padding-x | Padding x of root |
| multiselect.padding.y | --p-multiselect-padding-y | Padding y of root |
| multiselect.border.radius | --p-multiselect-border-radius | Border radius of root |
| multiselect.focus.ring.width | --p-multiselect-focus-ring-width | Focus ring width of root |
| multiselect.focus.ring.style | --p-multiselect-focus-ring-style | Focus ring style of root |
| multiselect.focus.ring.color | --p-multiselect-focus-ring-color | Focus ring color of root |
| multiselect.focus.ring.offset | --p-multiselect-focus-ring-offset | Focus ring offset of root |
| multiselect.focus.ring.shadow | --p-multiselect-focus-ring-shadow | Focus ring shadow of root |
| multiselect.transition.duration | --p-multiselect-transition-duration | Transition duration of root |
| multiselect.sm.font.size | --p-multiselect-sm-font-size | Sm font size of root |
| multiselect.sm.padding.x | --p-multiselect-sm-padding-x | Sm padding x of root |
| multiselect.sm.padding.y | --p-multiselect-sm-padding-y | Sm padding y of root |
| multiselect.lg.font.size | --p-multiselect-lg-font-size | Lg font size of root |
| multiselect.lg.padding.x | --p-multiselect-lg-padding-x | Lg padding x of root |
| multiselect.lg.padding.y | --p-multiselect-lg-padding-y | Lg padding y of root |
| multiselect.font.weight | --p-multiselect-font-weight | Font weight of root |
| multiselect.font.size | --p-multiselect-font-size | Font size of root |
| multiselect.dropdown.width | --p-multiselect-dropdown-width | Width of dropdown |
| multiselect.dropdown.color | --p-multiselect-dropdown-color | Color of dropdown |
| multiselect.overlay.background | --p-multiselect-overlay-background | Background of overlay |
| multiselect.overlay.border.color | --p-multiselect-overlay-border-color | Border color of overlay |
| multiselect.overlay.border.radius | --p-multiselect-overlay-border-radius | Border radius of overlay |
| multiselect.overlay.color | --p-multiselect-overlay-color | Color of overlay |
| multiselect.overlay.shadow | --p-multiselect-overlay-shadow | Shadow of overlay |
| multiselect.list.padding | --p-multiselect-list-padding | Padding of list |
| multiselect.list.gap | --p-multiselect-list-gap | Gap of list |
| multiselect.list.header.padding | --p-multiselect-list-header-padding | Header padding of list |
| multiselect.option.focus.background | --p-multiselect-option-focus-background | Focus background of option |
| multiselect.option.selected.background | --p-multiselect-option-selected-background | Selected background of option |
| multiselect.option.selected.focus.background | --p-multiselect-option-selected-focus-background | Selected focus background of option |
| multiselect.option.color | --p-multiselect-option-color | Color of option |
| multiselect.option.focus.color | --p-multiselect-option-focus-color | Focus color of option |
| multiselect.option.selected.color | --p-multiselect-option-selected-color | Selected color of option |
| multiselect.option.selected.focus.color | --p-multiselect-option-selected-focus-color | Selected focus color of option |
| multiselect.option.selected.font.weight | --p-multiselect-option-selected-font-weight | Font weight of a selected option |
| multiselect.option.padding | --p-multiselect-option-padding | Padding of option |
| multiselect.option.border.radius | --p-multiselect-option-border-radius | Border radius of option |
| multiselect.option.gap | --p-multiselect-option-gap | Gap of option |
| multiselect.option.font.weight | --p-multiselect-option-font-weight | Font weight of option |
| multiselect.option.font.size | --p-multiselect-option-font-size | Font size of option |
| multiselect.option.group.background | --p-multiselect-option-group-background | Background of option group |
| multiselect.option.group.color | --p-multiselect-option-group-color | Color of option group |
| multiselect.option.group.font.weight | --p-multiselect-option-group-font-weight | Font weight of option group |
| multiselect.option.group.font.size | --p-multiselect-option-group-font-size | Font size of option group |
| multiselect.option.group.padding | --p-multiselect-option-group-padding | Padding of option group |
| multiselect.clear.icon.color | --p-multiselect-clear-icon-color | Color of clear icon |
| multiselect.chip.border.radius | --p-multiselect-chip-border-radius | Border radius of chip |
| multiselect.empty.message.padding | --p-multiselect-empty-message-padding | Padding of empty message |

---
