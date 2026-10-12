# Angular Rating Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| option | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the option's DOM element. |
| onIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the on icon's DOM element. |
| offIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the off icon's DOM element. |
| hiddenOptionInputContainer | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the hidden option input container's DOM element. |
| hiddenOptionInput | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the hidden option input's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-rating | Class name of the root element |
| p-rating-option | Class name of the option element |
| p-rating-on-icon | Class name of the on icon element |
| p-rating-off-icon | Class name of the off icon element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| rating.gap | --p-rating-gap | Gap of root |
| rating.transition.duration | --p-rating-transition-duration | Transition duration of root |
| rating.focus.ring.width | --p-rating-focus-ring-width | Focus ring width of root |
| rating.focus.ring.style | --p-rating-focus-ring-style | Focus ring style of root |
| rating.focus.ring.color | --p-rating-focus-ring-color | Focus ring color of root |
| rating.focus.ring.offset | --p-rating-focus-ring-offset | Focus ring offset of root |
| rating.focus.ring.shadow | --p-rating-focus-ring-shadow | Focus ring shadow of root |
| rating.icon.size | --p-rating-icon-size | Size of icon |
| rating.icon.color | --p-rating-icon-color | Color of icon |
| rating.icon.hover.color | --p-rating-icon-hover-color | Hover color of icon |
| rating.icon.active.color | --p-rating-icon-active-color | Active color of icon |

---
