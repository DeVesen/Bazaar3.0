# Angular Breadcrumb Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| list | PassThroughOption<HTMLOListElement, I> | Used to pass attributes to the list's DOM element. |
| homeItem | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the home item's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement \| SVGElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| separatorIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the separator icon's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-breadcrumb | Class name of the root element |
| p-breadcrumb-list | Class name of the list element |
| p-breadcrumb-home-item | Class name of the home item element |
| p-breadcrumb-separator | Class name of the separator element |
| p-breadcrumb-item | Class name of the item element |
| p-breadcrumb-item-link | Class name of the item link element |
| p-breadcrumb-item-icon | Class name of the item icon element |
| p-breadcrumb-item-label | Class name of the item label element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| breadcrumb.padding | --p-breadcrumb-padding | Padding of root |
| breadcrumb.background | --p-breadcrumb-background | Background of root |
| breadcrumb.gap | --p-breadcrumb-gap | Gap of root |
| breadcrumb.transition.duration | --p-breadcrumb-transition-duration | Transition duration of root |
| breadcrumb.item.color | --p-breadcrumb-item-color | Color of item |
| breadcrumb.item.hover.color | --p-breadcrumb-item-hover-color | Hover color of item |
| breadcrumb.item.border.radius | --p-breadcrumb-item-border-radius | Border radius of item |
| breadcrumb.item.gap | --p-breadcrumb-item-gap | Gap of item |
| breadcrumb.item.icon.color | --p-breadcrumb-item-icon-color | Icon color of item |
| breadcrumb.item.icon.hover.color | --p-breadcrumb-item-icon-hover-color | Icon hover color of item |
| breadcrumb.item.icon.size | --p-breadcrumb-item-icon-size | Icon size of item icon |
| breadcrumb.item.label.font.weight | --p-breadcrumb-item-label-font-weight | Font weight of item label |
| breadcrumb.item.label.font.size | --p-breadcrumb-item-label-font-size | Font size of item label |
| breadcrumb.item.focus.ring.width | --p-breadcrumb-item-focus-ring-width | Focus ring width of item |
| breadcrumb.item.focus.ring.style | --p-breadcrumb-item-focus-ring-style | Focus ring style of item |
| breadcrumb.item.focus.ring.color | --p-breadcrumb-item-focus-ring-color | Focus ring color of item |
| breadcrumb.item.focus.ring.offset | --p-breadcrumb-item-focus-ring-offset | Focus ring offset of item |
| breadcrumb.item.focus.ring.shadow | --p-breadcrumb-item-focus-ring-shadow | Focus ring shadow of item |
| breadcrumb.separator.color | --p-breadcrumb-separator-color | Color of separator |

---
