# Angular Listbox Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| pcCheckbox | any | Used to pass attributes to the Checkbox component. |
| pcFilterContainer | any | Used to pass attributes to the IconField component. |
| pcFilter | any | Used to pass attributes to the filter input's DOM element. |
| pcFilterIconContainer | any | Used to pass attributes to the InputIcon component. |
| filterIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the filter icon's DOM element. |
| hiddenFilterResult | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden filter result's DOM element. |
| listContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the list container's DOM element. |
| virtualScroller | any | Used to pass attributes to the VirtualScroller component. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| optionGroup | PassThroughOption<HTMLLIElement, I, ListBoxContext> | Used to pass attributes to the option group's DOM element. |
| option | PassThroughOption<HTMLLIElement, I, ListBoxContext> | Used to pass attributes to the option's DOM element. |
| optionCheckIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the option check icon's DOM element. |
| optionBlankIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the option blank icon's DOM element. |
| emptyMessage | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the empty message's DOM element. |
| hiddenEmptyMessage | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden empty message's DOM element. |
| hiddenSelectedMessage | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden selected message's DOM element. |
| hiddenFirstFocusableEl | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the first hidden focusable element. |
| hiddenLastFocusableEl | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the last hidden focusable element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-listbox | Class name of the root element |
| p-listbox-header | Class name of the header element |
| p-listbox-filter | Class name of the filter element |
| p-listbox-list-container | Class name of the list container element |
| p-listbox-list | Class name of the list element |
| p-listbox-option-group | Class name of the option group element |
| p-listbox-option | Class name of the option element |
| p-listbox-option-check-icon | Class name of the option check icon element |
| p-listbox-option-blank-icon | Class name of the option blank icon element |
| p-listbox-empty-message | Class name of the empty message element |
| p-listbox-drag-preview | Class name of the multi-selection drag preview container |
| p-listbox-drag-preview-more | Class name of the overflow row in the multi-selection drag preview |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| listbox.background | --p-listbox-background | Background of root |
| listbox.disabled.background | --p-listbox-disabled-background | Disabled background of root |
| listbox.border.color | --p-listbox-border-color | Border color of root |
| listbox.invalid.border.color | --p-listbox-invalid-border-color | Invalid border color of root |
| listbox.color | --p-listbox-color | Color of root |
| listbox.disabled.color | --p-listbox-disabled-color | Disabled color of root |
| listbox.shadow | --p-listbox-shadow | Shadow of root |
| listbox.border.radius | --p-listbox-border-radius | Border radius of root |
| listbox.transition.duration | --p-listbox-transition-duration | Transition duration of root |
| listbox.list.padding | --p-listbox-list-padding | Padding of list |
| listbox.list.gap | --p-listbox-list-gap | Gap of list |
| listbox.list.header.padding | --p-listbox-list-header-padding | Header padding of list |
| listbox.option.focus.background | --p-listbox-option-focus-background | Focus background of option |
| listbox.option.selected.background | --p-listbox-option-selected-background | Selected background of option |
| listbox.option.selected.focus.background | --p-listbox-option-selected-focus-background | Selected focus background of option |
| listbox.option.color | --p-listbox-option-color | Color of option |
| listbox.option.focus.color | --p-listbox-option-focus-color | Focus color of option |
| listbox.option.selected.color | --p-listbox-option-selected-color | Selected color of option |
| listbox.option.selected.focus.color | --p-listbox-option-selected-focus-color | Selected focus color of option |
| listbox.option.selected.font.weight | --p-listbox-option-selected-font-weight | Font weight of a selected option |
| listbox.option.padding | --p-listbox-option-padding | Padding of option |
| listbox.option.border.radius | --p-listbox-option-border-radius | Border radius of option |
| listbox.option.striped.background | --p-listbox-option-striped-background | Striped background of option |
| listbox.option.font.weight | --p-listbox-option-font-weight | Font weight of option |
| listbox.option.font.size | --p-listbox-option-font-size | Font size of option |
| listbox.option.group.background | --p-listbox-option-group-background | Background of option group |
| listbox.option.group.color | --p-listbox-option-group-color | Color of option group |
| listbox.option.group.font.weight | --p-listbox-option-group-font-weight | Font weight of option group |
| listbox.option.group.font.size | --p-listbox-option-group-font-size | Font size of option group |
| listbox.option.group.padding | --p-listbox-option-group-padding | Padding of option group |
| listbox.checkmark.color | --p-listbox-checkmark-color | Color of checkmark |
| listbox.checkmark.gutter.start | --p-listbox-checkmark-gutter-start | Gutter start of checkmark |
| listbox.checkmark.gutter.end | --p-listbox-checkmark-gutter-end | Gutter end of checkmark |
| listbox.empty.message.padding | --p-listbox-empty-message-padding | Padding of empty message |

---
