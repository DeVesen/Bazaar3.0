# Angular AutoComplete Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| pcInputText | InputTextPassThrough | Used to pass attributes to the InputText component. |
| inputMultiple | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the input multiple's DOM element. |
| chipItem | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the chip item's DOM element. |
| pcChip | ChipPassThrough | Used to pass attributes to the Chip component. |
| chipIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the chip icon's DOM element. |
| inputChip | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the input chip's DOM element. |
| clearIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the clear icon's DOM element. |
| loader | PassThroughOption<SVGElement, I> | Used to pass attributes to the loader's DOM element. |
| dropdown | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the dropdown button's DOM element. |
| pcOverlay | OverlayPassThrough | Used to pass attributes to the Overlay component. |
| overlay | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the overlay's DOM element. |
| listContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the list container's DOM element. |
| pcScroller | VirtualScrollerPassThrough | Used to pass attributes to the Scroller component. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| optionGroup | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option group's DOM element. |
| option | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option's DOM element. |
| emptyMessage | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the empty message's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-autocomplete | Class name of the root element |
| p-autocomplete-input | Class name of the input element |
| p-autocomplete-input-multiple | Class name of the input multiple element |
| p-autocomplete-chip-item | Class name of the chip item element |
| p-autocomplete-chip | Class name of the chip element |
| p-autocomplete-chip-icon | Class name of the chip icon element |
| p-autocomplete-input-chip | Class name of the input chip element |
| p-autocomplete-loader | Class name of the loader element |
| p-autocomplete-dropdown | Class name of the dropdown element |
| p-autocomplete-overlay | Class name of the panel element |
| p-autocomplete-list | Class name of the list element |
| p-autocomplete-option-group | Class name of the option group element |
| p-autocomplete-option | Class name of the option element |
| p-autocomplete-empty-message | Class name of the empty message element |
| p-autocomplete-clear-icon | Class name of the clear icon |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| autocomplete.background | --p-autocomplete-background | Background of root |
| autocomplete.disabled.background | --p-autocomplete-disabled-background | Disabled background of root |
| autocomplete.filled.background | --p-autocomplete-filled-background | Filled background of root |
| autocomplete.filled.hover.background | --p-autocomplete-filled-hover-background | Filled hover background of root |
| autocomplete.filled.focus.background | --p-autocomplete-filled-focus-background | Filled focus background of root |
| autocomplete.border.color | --p-autocomplete-border-color | Border color of root |
| autocomplete.hover.border.color | --p-autocomplete-hover-border-color | Hover border color of root |
| autocomplete.focus.border.color | --p-autocomplete-focus-border-color | Focus border color of root |
| autocomplete.invalid.border.color | --p-autocomplete-invalid-border-color | Invalid border color of root |
| autocomplete.color | --p-autocomplete-color | Color of root |
| autocomplete.disabled.color | --p-autocomplete-disabled-color | Disabled color of root |
| autocomplete.placeholder.color | --p-autocomplete-placeholder-color | Placeholder color of root |
| autocomplete.invalid.placeholder.color | --p-autocomplete-invalid-placeholder-color | Invalid placeholder color of root |
| autocomplete.shadow | --p-autocomplete-shadow | Shadow of root |
| autocomplete.padding.x | --p-autocomplete-padding-x | Padding x of root |
| autocomplete.padding.y | --p-autocomplete-padding-y | Padding y of root |
| autocomplete.border.radius | --p-autocomplete-border-radius | Border radius of root |
| autocomplete.focus.ring.width | --p-autocomplete-focus-ring-width | Focus ring width of root |
| autocomplete.focus.ring.style | --p-autocomplete-focus-ring-style | Focus ring style of root |
| autocomplete.focus.ring.color | --p-autocomplete-focus-ring-color | Focus ring color of root |
| autocomplete.focus.ring.offset | --p-autocomplete-focus-ring-offset | Focus ring offset of root |
| autocomplete.focus.ring.shadow | --p-autocomplete-focus-ring-shadow | Focus ring shadow of root |
| autocomplete.transition.duration | --p-autocomplete-transition-duration | Transition duration of root |
| autocomplete.overlay.background | --p-autocomplete-overlay-background | Background of overlay |
| autocomplete.overlay.border.color | --p-autocomplete-overlay-border-color | Border color of overlay |
| autocomplete.overlay.border.radius | --p-autocomplete-overlay-border-radius | Border radius of overlay |
| autocomplete.overlay.color | --p-autocomplete-overlay-color | Color of overlay |
| autocomplete.overlay.shadow | --p-autocomplete-overlay-shadow | Shadow of overlay |
| autocomplete.list.padding | --p-autocomplete-list-padding | Padding of list |
| autocomplete.list.gap | --p-autocomplete-list-gap | Gap of list |
| autocomplete.option.focus.background | --p-autocomplete-option-focus-background | Focus background of option |
| autocomplete.option.selected.background | --p-autocomplete-option-selected-background | Selected background of option |
| autocomplete.option.selected.focus.background | --p-autocomplete-option-selected-focus-background | Selected focus background of option |
| autocomplete.option.color | --p-autocomplete-option-color | Color of option |
| autocomplete.option.focus.color | --p-autocomplete-option-focus-color | Focus color of option |
| autocomplete.option.selected.color | --p-autocomplete-option-selected-color | Selected color of option |
| autocomplete.option.selected.focus.color | --p-autocomplete-option-selected-focus-color | Selected focus color of option |
| autocomplete.option.padding | --p-autocomplete-option-padding | Padding of option |
| autocomplete.option.border.radius | --p-autocomplete-option-border-radius | Border radius of option |
| autocomplete.option.font.weight | --p-autocomplete-option-font-weight | Font weight of option |
| autocomplete.option.font.size | --p-autocomplete-option-font-size | Font size of option |
| autocomplete.option.group.background | --p-autocomplete-option-group-background | Background of option group |
| autocomplete.option.group.color | --p-autocomplete-option-group-color | Color of option group |
| autocomplete.option.group.font.weight | --p-autocomplete-option-group-font-weight | Font weight of option group |
| autocomplete.option.group.font.size | --p-autocomplete-option-group-font-size | Font size of option group |
| autocomplete.option.group.padding | --p-autocomplete-option-group-padding | Padding of option group |
| autocomplete.dropdown.width | --p-autocomplete-dropdown-width | Width of dropdown |
| autocomplete.dropdown.sm.width | --p-autocomplete-dropdown-sm-width | Sm width of dropdown |
| autocomplete.dropdown.lg.width | --p-autocomplete-dropdown-lg-width | Lg width of dropdown |
| autocomplete.dropdown.border.color | --p-autocomplete-dropdown-border-color | Border color of dropdown |
| autocomplete.dropdown.hover.border.color | --p-autocomplete-dropdown-hover-border-color | Hover border color of dropdown |
| autocomplete.dropdown.active.border.color | --p-autocomplete-dropdown-active-border-color | Active border color of dropdown |
| autocomplete.dropdown.border.radius | --p-autocomplete-dropdown-border-radius | Border radius of dropdown |
| autocomplete.dropdown.focus.ring.width | --p-autocomplete-dropdown-focus-ring-width | Focus ring width of dropdown |
| autocomplete.dropdown.focus.ring.style | --p-autocomplete-dropdown-focus-ring-style | Focus ring style of dropdown |
| autocomplete.dropdown.focus.ring.color | --p-autocomplete-dropdown-focus-ring-color | Focus ring color of dropdown |
| autocomplete.dropdown.focus.ring.offset | --p-autocomplete-dropdown-focus-ring-offset | Focus ring offset of dropdown |
| autocomplete.dropdown.focus.ring.shadow | --p-autocomplete-dropdown-focus-ring-shadow | Focus ring shadow of dropdown |
| autocomplete.dropdown.background | --p-autocomplete-dropdown-background | Background of dropdown |
| autocomplete.dropdown.hover.background | --p-autocomplete-dropdown-hover-background | Hover background of dropdown |
| autocomplete.dropdown.active.background | --p-autocomplete-dropdown-active-background | Active background of dropdown |
| autocomplete.dropdown.color | --p-autocomplete-dropdown-color | Color of dropdown |
| autocomplete.dropdown.hover.color | --p-autocomplete-dropdown-hover-color | Hover color of dropdown |
| autocomplete.dropdown.active.color | --p-autocomplete-dropdown-active-color | Active color of dropdown |
| autocomplete.chip.border.radius | --p-autocomplete-chip-border-radius | Border radius of chip |
| autocomplete.chip.focus.background | --p-autocomplete-chip-focus-background | Focus background of chip |
| autocomplete.chip.focus.color | --p-autocomplete-chip-focus-color | Focus color of chip |
| autocomplete.empty.message.padding | --p-autocomplete-empty-message-padding | Padding of empty message |

---
