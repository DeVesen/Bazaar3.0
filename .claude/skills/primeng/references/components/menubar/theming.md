# Angular Menubar Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| rootList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root list's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| submenuIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the submenu icon's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| button | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the mobile menu button's DOM element. |
| buttonIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the mobile menu button icon's DOM element. |
| submenu | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the submenu's DOM element. |
| start | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the start of the component. |
| end | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the end of the component. |
| pcBadge | BadgePassThrough | Used to pass attributes to Badge component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-menubar | Class name of the root element |
| p-menubar-start | Class name of the start element |
| p-menubar-button | Class name of the button element |
| p-menubar-root-list | Class name of the root list element |
| p-menubar-item | Class name of the item element |
| p-menubar-item-content | Class name of the item content element |
| p-menubar-item-link | Class name of the item link element |
| p-menubar-item-icon | Class name of the item icon element |
| p-menubar-item-label | Class name of the item label element |
| p-menubar-submenu-icon | Class name of the submenu icon element |
| p-menubar-submenu | Class name of the submenu element |
| p-menubar-separator | Class name of the separator element |
| p-menubar-end | Class name of the end element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| menubar.background | --p-menubar-background | Background of root |
| menubar.border.color | --p-menubar-border-color | Border color of root |
| menubar.border.radius | --p-menubar-border-radius | Border radius of root |
| menubar.color | --p-menubar-color | Color of root |
| menubar.gap | --p-menubar-gap | Gap of root |
| menubar.padding | --p-menubar-padding | Padding of root |
| menubar.transition.duration | --p-menubar-transition-duration | Transition duration of root |
| menubar.base.item.border.radius | --p-menubar-base-item-border-radius | Border radius of base item |
| menubar.base.item.padding | --p-menubar-base-item-padding | Padding of base item |
| menubar.item.focus.background | --p-menubar-item-focus-background | Focus background of item |
| menubar.item.active.background | --p-menubar-item-active-background | Active background of item |
| menubar.item.color | --p-menubar-item-color | Color of item |
| menubar.item.focus.color | --p-menubar-item-focus-color | Focus color of item |
| menubar.item.active.color | --p-menubar-item-active-color | Active color of item |
| menubar.item.padding | --p-menubar-item-padding | Padding of item |
| menubar.item.border.radius | --p-menubar-item-border-radius | Border radius of item |
| menubar.item.gap | --p-menubar-item-gap | Gap of item |
| menubar.item.icon.color | --p-menubar-item-icon-color | Icon color of item |
| menubar.item.icon.focus.color | --p-menubar-item-icon-focus-color | Icon focus color of item |
| menubar.item.icon.active.color | --p-menubar-item-icon-active-color | Icon active color of item |
| menubar.item.icon.size | --p-menubar-item-icon-size | Icon size of item |
| menubar.item.label.font.weight | --p-menubar-item-label-font-weight | Font weight of item label |
| menubar.item.label.font.size | --p-menubar-item-label-font-size | Font size of item label |
| menubar.submenu.padding | --p-menubar-submenu-padding | Padding of submenu |
| menubar.submenu.gap | --p-menubar-submenu-gap | Gap of submenu |
| menubar.submenu.background | --p-menubar-submenu-background | Background of submenu |
| menubar.submenu.border.color | --p-menubar-submenu-border-color | Border color of submenu |
| menubar.submenu.border.radius | --p-menubar-submenu-border-radius | Border radius of submenu |
| menubar.submenu.shadow | --p-menubar-submenu-shadow | Shadow of submenu |
| menubar.submenu.mobile.indent | --p-menubar-submenu-mobile-indent | Mobile indent of submenu |
| menubar.submenu.icon.size | --p-menubar-submenu-icon-size | Icon size of submenu |
| menubar.submenu.icon.color | --p-menubar-submenu-icon-color | Icon color of submenu |
| menubar.submenu.icon.focus.color | --p-menubar-submenu-icon-focus-color | Icon focus color of submenu |
| menubar.submenu.icon.active.color | --p-menubar-submenu-icon-active-color | Icon active color of submenu |
| menubar.separator.border.color | --p-menubar-separator-border-color | Border color of separator |
| menubar.mobile.button.border.radius | --p-menubar-mobile-button-border-radius | Border radius of mobile button |
| menubar.mobile.button.size | --p-menubar-mobile-button-size | Size of mobile button |
| menubar.mobile.button.color | --p-menubar-mobile-button-color | Color of mobile button |
| menubar.mobile.button.hover.color | --p-menubar-mobile-button-hover-color | Hover color of mobile button |
| menubar.mobile.button.hover.background | --p-menubar-mobile-button-hover-background | Hover background of mobile button |
| menubar.mobile.button.focus.ring.width | --p-menubar-mobile-button-focus-ring-width | Focus ring width of mobile button |
| menubar.mobile.button.focus.ring.style | --p-menubar-mobile-button-focus-ring-style | Focus ring style of mobile button |
| menubar.mobile.button.focus.ring.color | --p-menubar-mobile-button-focus-ring-color | Focus ring color of mobile button |
| menubar.mobile.button.focus.ring.offset | --p-menubar-mobile-button-focus-ring-offset | Focus ring offset of mobile button |
| menubar.mobile.button.focus.ring.shadow | --p-menubar-mobile-button-focus-ring-shadow | Focus ring shadow of mobile button |

---
