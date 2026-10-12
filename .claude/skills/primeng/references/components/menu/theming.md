# Angular Menu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| start | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the start's DOM element. |
| list | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the list's DOM element. |
| submenuLabel | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the submenu label's DOM element (non-toggleable group headers). |
| submenuList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the nested submenu list's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| itemSubmenuIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the item submenu toggle icon's DOM element (toggleable items). |
| end | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the end's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-menu | Class name of the root element |
| p-menu-start | Class name of the start element |
| p-menu-list | Class name of the list element |
| p-menu-submenu-label | Class name of the submenu label element (non-toggleable group headers) |
| p-menu-submenu-list | Class name of the nested submenu list element |
| p-menu-separator | Class name of the separator element |
| p-menu-end | Class name of the end element |
| p-menu-item | Class name of the item element |
| p-menu-item-content | Class name of the item content element |
| p-menu-item-link | Class name of the item link element |
| p-menu-item-icon | Class name of the item icon element |
| p-menu-item-label | Class name of the item label element |
| p-menu-item-submenu-icon | Class name of the item submenu toggle icon element (toggleable items) |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| menu.background | --p-menu-background | Background of root |
| menu.border.color | --p-menu-border-color | Border color of root |
| menu.color | --p-menu-color | Color of root |
| menu.border.radius | --p-menu-border-radius | Border radius of root |
| menu.shadow | --p-menu-shadow | Shadow of root |
| menu.transition.duration | --p-menu-transition-duration | Transition duration of root |
| menu.list.padding | --p-menu-list-padding | Padding of list |
| menu.list.gap | --p-menu-list-gap | Gap of list |
| menu.item.focus.background | --p-menu-item-focus-background | Focus background of item |
| menu.item.color | --p-menu-item-color | Color of item |
| menu.item.focus.color | --p-menu-item-focus-color | Focus color of item |
| menu.item.padding | --p-menu-item-padding | Padding of item |
| menu.item.border.radius | --p-menu-item-border-radius | Border radius of item |
| menu.item.gap | --p-menu-item-gap | Gap of item |
| menu.item.icon.color | --p-menu-item-icon-color | Icon color of item |
| menu.item.icon.focus.color | --p-menu-item-icon-focus-color | Icon focus color of item |
| menu.item.icon.size | --p-menu-item-icon-size | Icon size of item |
| menu.item.label.font.weight | --p-menu-item-label-font-weight | Font weight of item label |
| menu.item.label.font.size | --p-menu-item-label-font-size | Font size of item label |
| menu.submenu.label.padding | --p-menu-submenu-label-padding | Padding of submenu label |
| menu.submenu.label.font.weight | --p-menu-submenu-label-font-weight | Font weight of submenu label |
| menu.submenu.label.font.size | --p-menu-submenu-label-font-size | Font size of submenu label |
| menu.submenu.label.background | --p-menu-submenu-label-background | Background of submenu label |
| menu.submenu.label.color | --p-menu-submenu-label-color | Color of submenu label |
| menu.submenu.icon.size | --p-menu-submenu-icon-size | Size of submenu icon |
| menu.submenu.icon.color | --p-menu-submenu-icon-color | Color of submenu icon |
| menu.submenu.icon.focus.color | --p-menu-submenu-icon-focus-color | Focus color of submenu icon |
| menu.separator.border.color | --p-menu-separator-border-color | Border color of separator |

---
