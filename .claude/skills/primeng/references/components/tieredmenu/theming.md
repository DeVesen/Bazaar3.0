# Angular TieredMenu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| rootList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root list's DOM element. |
| submenu | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the submenu's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| submenuIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the submenu icon's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-tieredmenu | Class name of the root element |
| p-tieredmenu-start | Class name of the start element |
| p-tieredmenu-root-list | Class name of the root list element |
| p-tieredmenu-item | Class name of the item element |
| p-tieredmenu-item-content | Class name of the item content element |
| p-tieredmenu-item-link | Class name of the item link element |
| p-tieredmenu-item-icon | Class name of the item icon element |
| p-tieredmenu-item-label | Class name of the item label element |
| p-tieredmenu-submenu-icon | Class name of the submenu icon element |
| p-tieredmenu-submenu | Class name of the submenu element |
| p-tieredmenu-separator | Class name of the separator element |
| p-tieredmenu-end | Class name of the end element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| tieredmenu.background | --p-tieredmenu-background | Background of root |
| tieredmenu.border.color | --p-tieredmenu-border-color | Border color of root |
| tieredmenu.color | --p-tieredmenu-color | Color of root |
| tieredmenu.border.radius | --p-tieredmenu-border-radius | Border radius of root |
| tieredmenu.shadow | --p-tieredmenu-shadow | Shadow of root |
| tieredmenu.transition.duration | --p-tieredmenu-transition-duration | Transition duration of root |
| tieredmenu.list.padding | --p-tieredmenu-list-padding | Padding of list |
| tieredmenu.list.gap | --p-tieredmenu-list-gap | Gap of list |
| tieredmenu.item.focus.background | --p-tieredmenu-item-focus-background | Focus background of item |
| tieredmenu.item.active.background | --p-tieredmenu-item-active-background | Active background of item |
| tieredmenu.item.color | --p-tieredmenu-item-color | Color of item |
| tieredmenu.item.focus.color | --p-tieredmenu-item-focus-color | Focus color of item |
| tieredmenu.item.active.color | --p-tieredmenu-item-active-color | Active color of item |
| tieredmenu.item.padding | --p-tieredmenu-item-padding | Padding of item |
| tieredmenu.item.border.radius | --p-tieredmenu-item-border-radius | Border radius of item |
| tieredmenu.item.gap | --p-tieredmenu-item-gap | Gap of item |
| tieredmenu.item.icon.color | --p-tieredmenu-item-icon-color | Icon color of item |
| tieredmenu.item.icon.focus.color | --p-tieredmenu-item-icon-focus-color | Icon focus color of item |
| tieredmenu.item.icon.active.color | --p-tieredmenu-item-icon-active-color | Icon active color of item |
| tieredmenu.item.icon.size | --p-tieredmenu-item-icon-size | Icon size of item |
| tieredmenu.item.label.font.weight | --p-tieredmenu-item-label-font-weight | Font weight of item label |
| tieredmenu.item.label.font.size | --p-tieredmenu-item-label-font-size | Font size of item label |
| tieredmenu.submenu.mobile.indent | --p-tieredmenu-submenu-mobile-indent | Mobile indent of submenu |
| tieredmenu.submenu.icon.size | --p-tieredmenu-submenu-icon-size | Size of submenu icon |
| tieredmenu.submenu.icon.color | --p-tieredmenu-submenu-icon-color | Color of submenu icon |
| tieredmenu.submenu.icon.focus.color | --p-tieredmenu-submenu-icon-focus-color | Focus color of submenu icon |
| tieredmenu.submenu.icon.active.color | --p-tieredmenu-submenu-icon-active-color | Active color of submenu icon |
| tieredmenu.separator.border.color | --p-tieredmenu-separator-border-color | Border color of separator |

---
