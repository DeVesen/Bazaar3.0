# Angular Dock Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| listContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the list container's DOM element. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-dock | Class name of the root element |
| p-dock-list-container | Class name of the list container element |
| p-dock-list | Class name of the list element |
| p-dock-item | Class name of the item element |
| p-dock-item-content | Class name of the item content element |
| p-dock-item-link | Class name of the item link element |
| p-dock-item-icon | Class name of the item icon element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| dock.background | --p-dock-background | Background of root |
| dock.border.color | --p-dock-border-color | Border color of root |
| dock.padding | --p-dock-padding | Padding of root |
| dock.border.radius | --p-dock-border-radius | Border radius of root |
| dock.item.border.radius | --p-dock-item-border-radius | Border radius of item |
| dock.item.padding | --p-dock-item-padding | Padding of item |
| dock.item.size | --p-dock-item-size | Size of item |
| dock.item.focus.ring.width | --p-dock-item-focus-ring-width | Focus ring width of item |
| dock.item.focus.ring.style | --p-dock-item-focus-ring-style | Focus ring style of item |
| dock.item.focus.ring.color | --p-dock-item-focus-ring-color | Focus ring color of item |
| dock.item.focus.ring.offset | --p-dock-item-focus-ring-offset | Focus ring offset of item |
| dock.item.focus.ring.shadow | --p-dock-item-focus-ring-shadow | Focus ring shadow of item |

---
