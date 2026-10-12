# Angular MegaMenu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| start | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the start's DOM element. |
| button | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the button's DOM element. |
| buttonIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the button icon's DOM element. |
| rootList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root list's DOM element. |
| submenuLabel | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the submenu label's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| submenuIcon | PassThroughOption<HTMLElement, I> | Used to pass attributes to the submenu icon's DOM element. |
| overlay | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the overlay's DOM element. |
| grid | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the grid's DOM element. |
| column | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the column's DOM element. |
| submenu | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the submenu's DOM element. |
| end | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the end's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-megamenu | Class name of the root element |
| p-megamenu-start | Class name of the start element |
| p-megamenu-button | Class name of the button element |
| p-megamenu-root-list | Class name of the root list element |
| p-megamenu-submenu-item | Class name of the submenu item element |
| p-megamenu-item | Class name of the item element |
| p-megamenu-item-content | Class name of the item content element |
| p-megamenu-item-link | Class name of the item link element |
| p-megamenu-item-icon | Class name of the item icon element |
| p-megamenu-item-label | Class name of the item label element |
| p-megamenu-submenu-icon | Class name of the submenu icon element |
| p-megamenu-panel | Class name of the panel element |
| p-megamenu-grid | Class name of the grid element |
| p-megamenu-submenu | Class name of the submenu element |
| p-megamenu-submenu-item-label | Class name of the submenu item label element |
| p-megamenu-separator | Class name of the separator element |
| p-megamenu-end | Class name of the end element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| megamenu.background | --p-megamenu-background | Background of root |
| megamenu.border.color | --p-megamenu-border-color | Border color of root |
| megamenu.border.radius | --p-megamenu-border-radius | Border radius of root |
| megamenu.color | --p-megamenu-color | Color of root |
| megamenu.gap | --p-megamenu-gap | Gap of root |
| megamenu.vertical.orientation.padding | --p-megamenu-vertical-orientation-padding | Vertical orientation padding of root |
| megamenu.vertical.orientation.gap | --p-megamenu-vertical-orientation-gap | Vertical orientation gap of root |
| megamenu.horizontal.orientation.padding | --p-megamenu-horizontal-orientation-padding | Horizontal orientation padding of root |
| megamenu.horizontal.orientation.gap | --p-megamenu-horizontal-orientation-gap | Horizontal orientation gap of root |
| megamenu.transition.duration | --p-megamenu-transition-duration | Transition duration of root |
| megamenu.base.item.border.radius | --p-megamenu-base-item-border-radius | Border radius of base item |
| megamenu.base.item.padding | --p-megamenu-base-item-padding | Padding of base item |
| megamenu.item.focus.background | --p-megamenu-item-focus-background | Focus background of item |
| megamenu.item.active.background | --p-megamenu-item-active-background | Active background of item |
| megamenu.item.color | --p-megamenu-item-color | Color of item |
| megamenu.item.focus.color | --p-megamenu-item-focus-color | Focus color of item |
| megamenu.item.active.color | --p-megamenu-item-active-color | Active color of item |
| megamenu.item.padding | --p-megamenu-item-padding | Padding of item |
| megamenu.item.border.radius | --p-megamenu-item-border-radius | Border radius of item |
| megamenu.item.gap | --p-megamenu-item-gap | Gap of item |
| megamenu.item.icon.color | --p-megamenu-item-icon-color | Icon color of item |
| megamenu.item.icon.focus.color | --p-megamenu-item-icon-focus-color | Icon focus color of item |
| megamenu.item.icon.active.color | --p-megamenu-item-icon-active-color | Icon active color of item |
| megamenu.item.icon.size | --p-megamenu-item-icon-size | Icon size of item |
| megamenu.item.label.font.weight | --p-megamenu-item-label-font-weight | Font weight of item label |
| megamenu.item.label.font.size | --p-megamenu-item-label-font-size | Font size of item label |
| megamenu.overlay.padding | --p-megamenu-overlay-padding | Padding of overlay |
| megamenu.overlay.background | --p-megamenu-overlay-background | Background of overlay |
| megamenu.overlay.border.color | --p-megamenu-overlay-border-color | Border color of overlay |
| megamenu.overlay.border.radius | --p-megamenu-overlay-border-radius | Border radius of overlay |
| megamenu.overlay.color | --p-megamenu-overlay-color | Color of overlay |
| megamenu.overlay.shadow | --p-megamenu-overlay-shadow | Shadow of overlay |
| megamenu.overlay.gap | --p-megamenu-overlay-gap | Gap of overlay |
| megamenu.submenu.padding | --p-megamenu-submenu-padding | Padding of submenu |
| megamenu.submenu.gap | --p-megamenu-submenu-gap | Gap of submenu |
| megamenu.submenu.label.padding | --p-megamenu-submenu-label-padding | Padding of submenu label |
| megamenu.submenu.label.font.weight | --p-megamenu-submenu-label-font-weight | Font weight of submenu label |
| megamenu.submenu.label.font.size | --p-megamenu-submenu-label-font-size | Font size of submenu label |
| megamenu.submenu.label.background | --p-megamenu-submenu-label-background | Background of submenu label |
| megamenu.submenu.label.color | --p-megamenu-submenu-label-color | Color of submenu label |
| megamenu.submenu.icon.size | --p-megamenu-submenu-icon-size | Size of submenu icon |
| megamenu.submenu.icon.color | --p-megamenu-submenu-icon-color | Color of submenu icon |
| megamenu.submenu.icon.focus.color | --p-megamenu-submenu-icon-focus-color | Focus color of submenu icon |
| megamenu.submenu.icon.active.color | --p-megamenu-submenu-icon-active-color | Active color of submenu icon |
| megamenu.separator.border.color | --p-megamenu-separator-border-color | Border color of separator |
| megamenu.mobile.button.border.radius | --p-megamenu-mobile-button-border-radius | Border radius of mobile button |
| megamenu.mobile.button.size | --p-megamenu-mobile-button-size | Size of mobile button |
| megamenu.mobile.button.color | --p-megamenu-mobile-button-color | Color of mobile button |
| megamenu.mobile.button.hover.color | --p-megamenu-mobile-button-hover-color | Hover color of mobile button |
| megamenu.mobile.button.hover.background | --p-megamenu-mobile-button-hover-background | Hover background of mobile button |
| megamenu.mobile.button.focus.ring.width | --p-megamenu-mobile-button-focus-ring-width | Focus ring width of mobile button |
| megamenu.mobile.button.focus.ring.style | --p-megamenu-mobile-button-focus-ring-style | Focus ring style of mobile button |
| megamenu.mobile.button.focus.ring.color | --p-megamenu-mobile-button-focus-ring-color | Focus ring color of mobile button |
| megamenu.mobile.button.focus.ring.offset | --p-megamenu-mobile-button-focus-ring-offset | Focus ring offset of mobile button |
| megamenu.mobile.button.focus.ring.shadow | --p-megamenu-mobile-button-focus-ring-shadow | Focus ring shadow of mobile button |

---
