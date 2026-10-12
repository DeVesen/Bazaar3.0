# Angular InputTags Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| pcChip | PassThroughOption<ChipPassThrough, I> | Used to pass attributes to the Chip component. |
| chipIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the chip icon's DOM element. |
| pcAutoComplete | PassThroughOption<AutoCompletePassThrough, I> | Used to pass attributes to the AutoComplete component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-inputtags |  |
| p-inputtags-item |  |
| p-inputtags-input |  |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| inputtags.background | --p-inputtags-background | Background of root |
| inputtags.disabled.background | --p-inputtags-disabled-background | Disabled background of root |
| inputtags.filled.background | --p-inputtags-filled-background | Filled background of root |
| inputtags.filled.hover.background | --p-inputtags-filled-hover-background | Filled hover background of root |
| inputtags.filled.focus.background | --p-inputtags-filled-focus-background | Filled focus background of root |
| inputtags.border.color | --p-inputtags-border-color | Border color of root |
| inputtags.hover.border.color | --p-inputtags-hover-border-color | Hover border color of root |
| inputtags.focus.border.color | --p-inputtags-focus-border-color | Focus border color of root |
| inputtags.invalid.border.color | --p-inputtags-invalid-border-color | Invalid border color of root |
| inputtags.color | --p-inputtags-color | Color of root |
| inputtags.disabled.color | --p-inputtags-disabled-color | Disabled color of root |
| inputtags.shadow | --p-inputtags-shadow | Shadow of root |
| inputtags.padding.x | --p-inputtags-padding-x | Padding x of root |
| inputtags.padding.y | --p-inputtags-padding-y | Padding y of root |
| inputtags.border.radius | --p-inputtags-border-radius | Border radius of root |
| inputtags.focus.ring.width | --p-inputtags-focus-ring-width | Focus ring width of root |
| inputtags.focus.ring.style | --p-inputtags-focus-ring-style | Focus ring style of root |
| inputtags.focus.ring.color | --p-inputtags-focus-ring-color | Focus ring color of root |
| inputtags.focus.ring.offset | --p-inputtags-focus-ring-offset | Focus ring offset of root |
| inputtags.focus.ring.shadow | --p-inputtags-focus-ring-shadow | Focus ring shadow of root |
| inputtags.transition.duration | --p-inputtags-transition-duration | Transition duration of root |
| inputtags.gap | --p-inputtags-gap | Gap of root |
| inputtags.item.border.radius | --p-inputtags-item-border-radius | Border radius of item |

---
