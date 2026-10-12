# Angular Chip Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| image | PassThroughOption<HTMLImageElement, I> | Used to pass attributes to the image's DOM element. |
| icon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the icon's DOM element. |
| label | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the label's DOM element. |
| removeIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the remove icon's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-chip | Class name of the root element |
| p-chip-image | Class name of the image element |
| p-chip-icon | Class name of the icon element |
| p-chip-label | Class name of the label element |
| p-chip-remove-icon | Class name of the remove icon element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| chip.border.radius | --p-chip-border-radius | Border radius of root |
| chip.padding.x | --p-chip-padding-x | Padding x of root |
| chip.padding.y | --p-chip-padding-y | Padding y of root |
| chip.gap | --p-chip-gap | Gap of root |
| chip.transition.duration | --p-chip-transition-duration | Transition duration of root |
| chip.background | --p-chip-background | Background of root |
| chip.focus.background | --p-chip-focus-background | Focus background of root |
| chip.color | --p-chip-color | Color of root |
| chip.image.width | --p-chip-image-width | Width of image |
| chip.image.height | --p-chip-image-height | Height of image |
| chip.icon.size | --p-chip-icon-size | Size of icon |
| chip.icon.color | --p-chip-icon-color | Color of icon |
| chip.label.font.weight | --p-chip-label-font-weight | Font weight of label |
| chip.label.font.size | --p-chip-label-font-size | Font size of label |
| chip.remove.icon.size | --p-chip-remove-icon-size | Size of remove icon |
| chip.remove.icon.focus.ring.width | --p-chip-remove-icon-focus-ring-width | Focus ring width of remove icon |
| chip.remove.icon.focus.ring.style | --p-chip-remove-icon-focus-ring-style | Focus ring style of remove icon |
| chip.remove.icon.focus.ring.color | --p-chip-remove-icon-focus-ring-color | Focus ring color of remove icon |
| chip.remove.icon.focus.ring.offset | --p-chip-remove-icon-focus-ring-offset | Focus ring offset of remove icon |
| chip.remove.icon.focus.ring.shadow | --p-chip-remove-icon-focus-ring-shadow | Focus ring shadow of remove icon |
| chip.remove.icon.color | --p-chip-remove-icon-color | Color of remove icon |

---
