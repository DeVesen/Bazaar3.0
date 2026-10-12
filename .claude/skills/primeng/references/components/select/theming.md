# Angular Select Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the root's DOM element. |
| label | PassThroughOption<HTMLInputElement \| HTMLSpanElement, I> | Used to pass attributes to the label's DOM element. |
| clearIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the clear icon's DOM element. |
| dropdown | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the dropdown's DOM element. |
| loadingIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the loading icon's DOM element. |
| dropdownIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the dropdown icon's DOM element. |
| pcOverlay | OverlayPassThrough | Used to pass attributes to the Overlay component. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| pcFilterContainer | IconFieldPassThrough | Used to pass attributes to the filter container's DOM element. |
| pcFilter | InputTextPassThrough | Used to pass attributes to the filter input's DOM element. |
| pcFilterIconContainer | InputIconPassThrough | Used to pass attributes to the filter icon container's DOM element. |
| filterIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the filter icon's DOM element. |
| listContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the list container's DOM element. |
| virtualScroller | VirtualScrollerPassThrough | Used to pass attributes to the VirtualScroller component. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| optionGroup | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option group's DOM element. |
| optionGroupLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the option group label's DOM element. |
| option | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the option's DOM element. |
| optionCheckIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the option check icon's DOM element. |
| optionBlankIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the option blank icon's DOM element. |
| optionLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the option label's DOM element. |
| emptyMessage | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the empty message's DOM element. |
| hiddenFirstFocusableEl | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden first focusable element's DOM element. |
| hiddenFilterResult | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden filter result's DOM element. |
| hiddenEmptyMessage | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden empty message's DOM element. |
| hiddenSelectedMessage | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden selected message's DOM element. |
| hiddenLastFocusableEl | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden last focusable element's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-select | Class name of the root element |
| p-select-label | Class name of the label element |
| p-select-clear-icon | Class name of the clear icon element |
| p-select-dropdown | Class name of the dropdown element |
| p-select-loading-icon | Class name of the loadingicon element |
| p-select-dropdown-icon | Class name of the dropdown icon element |
| p-select-overlay | Class name of the overlay element |
| p-select-header | Class name of the header element |
| p-select-filter | Class name of the filter element |
| p-select-list-container | Class name of the list container element |
| p-select-list | Class name of the list element |
| p-select-option-group | Class name of the option group element |
| p-select-option-group-label | Class name of the option group label element |
| p-select-option | Class name of the option element |
| p-select-option-label | Class name of the option label element |
| p-select-option-check-icon | Class name of the option check icon element |
| p-select-option-blank-icon | Class name of the option blank icon element |
| p-select-empty-message | Class name of the empty message element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| select.background | --p-select-background | Background of root |
| select.disabled.background | --p-select-disabled-background | Disabled background of root |
| select.filled.background | --p-select-filled-background | Filled background of root |
| select.filled.hover.background | --p-select-filled-hover-background | Filled hover background of root |
| select.filled.focus.background | --p-select-filled-focus-background | Filled focus background of root |
| select.border.color | --p-select-border-color | Border color of root |
| select.hover.border.color | --p-select-hover-border-color | Hover border color of root |
| select.focus.border.color | --p-select-focus-border-color | Focus border color of root |
| select.invalid.border.color | --p-select-invalid-border-color | Invalid border color of root |
| select.color | --p-select-color | Color of root |
| select.disabled.color | --p-select-disabled-color | Disabled color of root |
| select.placeholder.color | --p-select-placeholder-color | Placeholder color of root |
| select.invalid.placeholder.color | --p-select-invalid-placeholder-color | Invalid placeholder color of root |
| select.shadow | --p-select-shadow | Shadow of root |
| select.padding.x | --p-select-padding-x | Padding x of root |
| select.padding.y | --p-select-padding-y | Padding y of root |
| select.border.radius | --p-select-border-radius | Border radius of root |
| select.focus.ring.width | --p-select-focus-ring-width | Focus ring width of root |
| select.focus.ring.style | --p-select-focus-ring-style | Focus ring style of root |
| select.focus.ring.color | --p-select-focus-ring-color | Focus ring color of root |
| select.focus.ring.offset | --p-select-focus-ring-offset | Focus ring offset of root |
| select.focus.ring.shadow | --p-select-focus-ring-shadow | Focus ring shadow of root |
| select.transition.duration | --p-select-transition-duration | Transition duration of root |
| select.sm.font.size | --p-select-sm-font-size | Sm font size of root |
| select.sm.padding.x | --p-select-sm-padding-x | Sm padding x of root |
| select.sm.padding.y | --p-select-sm-padding-y | Sm padding y of root |
| select.lg.font.size | --p-select-lg-font-size | Lg font size of root |
| select.lg.padding.x | --p-select-lg-padding-x | Lg padding x of root |
| select.lg.padding.y | --p-select-lg-padding-y | Lg padding y of root |
| select.font.weight | --p-select-font-weight | Font weight of root |
| select.font.size | --p-select-font-size | Font size of root |
| select.dropdown.width | --p-select-dropdown-width | Width of dropdown |
| select.dropdown.color | --p-select-dropdown-color | Color of dropdown |
| select.overlay.background | --p-select-overlay-background | Background of overlay |
| select.overlay.border.color | --p-select-overlay-border-color | Border color of overlay |
| select.overlay.border.radius | --p-select-overlay-border-radius | Border radius of overlay |
| select.overlay.color | --p-select-overlay-color | Color of overlay |
| select.overlay.shadow | --p-select-overlay-shadow | Shadow of overlay |
| select.list.padding | --p-select-list-padding | Padding of list |
| select.list.gap | --p-select-list-gap | Gap of list |
| select.list.header.padding | --p-select-list-header-padding | Header padding of list |
| select.option.focus.background | --p-select-option-focus-background | Focus background of option |
| select.option.selected.background | --p-select-option-selected-background | Selected background of option |
| select.option.selected.focus.background | --p-select-option-selected-focus-background | Selected focus background of option |
| select.option.color | --p-select-option-color | Color of option |
| select.option.focus.color | --p-select-option-focus-color | Focus color of option |
| select.option.selected.color | --p-select-option-selected-color | Selected color of option |
| select.option.selected.focus.color | --p-select-option-selected-focus-color | Selected focus color of option |
| select.option.selected.font.weight | --p-select-option-selected-font-weight | Font weight of a selected option |
| select.option.padding | --p-select-option-padding | Padding of option |
| select.option.border.radius | --p-select-option-border-radius | Border radius of option |
| select.option.font.weight | --p-select-option-font-weight | Font weight of option |
| select.option.font.size | --p-select-option-font-size | Font size of option |
| select.option.group.background | --p-select-option-group-background | Background of option group |
| select.option.group.color | --p-select-option-group-color | Color of option group |
| select.option.group.font.weight | --p-select-option-group-font-weight | Font weight of option group |
| select.option.group.font.size | --p-select-option-group-font-size | Font size of option group |
| select.option.group.padding | --p-select-option-group-padding | Padding of option group |
| select.clear.icon.color | --p-select-clear-icon-color | Color of clear icon |
| select.checkmark.color | --p-select-checkmark-color | Color of checkmark |
| select.checkmark.gutter.start | --p-select-checkmark-gutter-start | Gutter start of checkmark |
| select.checkmark.gutter.end | --p-select-checkmark-gutter-end | Gutter end of checkmark |
| select.empty.message.padding | --p-select-empty-message-padding | Padding of empty message |

---
