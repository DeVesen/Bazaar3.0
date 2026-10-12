# Angular ContextMenu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| rootList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root list's DOM element. |
| submenu | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the submenu's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| submenuIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the submenu icon's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-contextmenu | Class name of the root element |
| p-contextmenu-root-list | Class name of the root list element |
| p-contextmenu-item | Class name of the item element |
| p-contextmenu-item-content | Class name of the item content element |
| p-contextmenu-item-link | Class name of the item link element |
| p-contextmenu-item-icon | Class name of the item icon element |
| p-contextmenu-item-label | Class name of the item label element |
| p-contextmenu-submenu-icon | Class name of the submenu icon element |
| p-contextmenu-submenu | Class name of the submenu element |
| p-contextmenu-separator | Class name of the separator element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| contextmenu.background | --p-contextmenu-background | Background of root |
| contextmenu.border.color | --p-contextmenu-border-color | Border color of root |
| contextmenu.color | --p-contextmenu-color | Color of root |
| contextmenu.border.radius | --p-contextmenu-border-radius | Border radius of root |
| contextmenu.shadow | --p-contextmenu-shadow | Shadow of root |
| contextmenu.transition.duration | --p-contextmenu-transition-duration | Transition duration of root |
| contextmenu.list.padding | --p-contextmenu-list-padding | Padding of list |
| contextmenu.list.gap | --p-contextmenu-list-gap | Gap of list |
| contextmenu.item.focus.background | --p-contextmenu-item-focus-background | Focus background of item |
| contextmenu.item.active.background | --p-contextmenu-item-active-background | Active background of item |
| contextmenu.item.color | --p-contextmenu-item-color | Color of item |
| contextmenu.item.focus.color | --p-contextmenu-item-focus-color | Focus color of item |
| contextmenu.item.active.color | --p-contextmenu-item-active-color | Active color of item |
| contextmenu.item.padding | --p-contextmenu-item-padding | Padding of item |
| contextmenu.item.border.radius | --p-contextmenu-item-border-radius | Border radius of item |
| contextmenu.item.gap | --p-contextmenu-item-gap | Gap of item |
| contextmenu.item.icon.color | --p-contextmenu-item-icon-color | Icon color of item |
| contextmenu.item.icon.focus.color | --p-contextmenu-item-icon-focus-color | Icon focus color of item |
| contextmenu.item.icon.active.color | --p-contextmenu-item-icon-active-color | Icon active color of item |
| contextmenu.item.icon.size | --p-contextmenu-item-icon-size | Icon size of item |
| contextmenu.item.label.font.weight | --p-contextmenu-item-label-font-weight | Font weight of item label |
| contextmenu.item.label.font.size | --p-contextmenu-item-label-font-size | Font size of item label |
| contextmenu.submenu.mobile.indent | --p-contextmenu-submenu-mobile-indent | Mobile indent of submenu |
| contextmenu.submenu.label.padding | --p-contextmenu-submenu-label-padding | Padding of submenu label |
| contextmenu.submenu.label.font.weight | --p-contextmenu-submenu-label-font-weight | Font weight of submenu label |
| contextmenu.submenu.label.font.size | --p-contextmenu-submenu-label-font-size | Font size of submenu label |
| contextmenu.submenu.label.background | --p-contextmenu-submenu-label-background | Background of submenu label |
| contextmenu.submenu.label.color | --p-contextmenu-submenu-label-color | Color of submenu label |
| contextmenu.submenu.icon.size | --p-contextmenu-submenu-icon-size | Size of submenu icon |
| contextmenu.submenu.icon.color | --p-contextmenu-submenu-icon-color | Color of submenu icon |
| contextmenu.submenu.icon.focus.color | --p-contextmenu-submenu-icon-focus-color | Focus color of submenu icon |
| contextmenu.submenu.icon.active.color | --p-contextmenu-submenu-icon-active-color | Active color of submenu icon |
| contextmenu.separator.border.color | --p-contextmenu-separator-border-color | Border color of separator |

---
