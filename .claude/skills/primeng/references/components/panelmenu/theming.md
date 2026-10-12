# Angular PanelMenu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| panel | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the panel's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| headerContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header content's DOM element. |
| headerLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the header link's DOM element. |
| submenuIcon | PassThroughOption<SVGElement, I> | Used to pass attributes to the submenu icon's DOM element. |
| headerIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the header icon's DOM element. |
| headerLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the header label's DOM element. |
| contentContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the toggleable content's DOM element. |
| contentWrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the toggleable content's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the menu content's DOM element. |
| rootList | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the root list's DOM element. |
| submenu | PassThroughOption<HTMLUListElement, I> | Used to pass attributes to the submenu's DOM element. |
| item | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the item's DOM element. |
| itemContent | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item content's DOM element. |
| itemLink | PassThroughOption<HTMLAnchorElement, I> | Used to pass attributes to the item link's DOM element. |
| itemIcon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item icon's DOM element. |
| itemLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the item label's DOM element. |
| separator | PassThroughOption<HTMLLIElement, I> | Used to pass attributes to the separator's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-panelmenu | Class name of the root element |
| p-panelmenu-panel | Class name of the panel element |
| p-panelmenu-header | Class name of the header element |
| p-panelmenu-header-content | Class name of the header content element |
| p-panelmenu-header-link | Class name of the header link element |
| p-panelmenu-header-icon | Class name of the header icon element |
| p-panelmenu-header-label | Class name of the header label element |
| p-panelmenu-content-container | Class name of the content container element |
| p-panelmenu-content | Class name of the content element |
| p-panelmenu-root-list | Class name of the root list element |
| p-panelmenu-item | Class name of the item element |
| p-panelmenu-item-content | Class name of the item content element |
| p-panelmenu-item-link | Class name of the item link element |
| p-panelmenu-item-icon | Class name of the item icon element |
| p-panelmenu-item-label | Class name of the item label element |
| p-panelmenu-submenu-icon | Class name of the submenu icon element |
| p-panelmenu-submenu | Class name of the submenu element |
| p-menuitem-separator |  |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| panelmenu.gap | --p-panelmenu-gap | Gap of root |
| panelmenu.transition.duration | --p-panelmenu-transition-duration | Transition duration of root |
| panelmenu.panel.background | --p-panelmenu-panel-background | Background of panel |
| panelmenu.panel.border.color | --p-panelmenu-panel-border-color | Border color of panel |
| panelmenu.panel.border.width | --p-panelmenu-panel-border-width | Border width of panel |
| panelmenu.panel.color | --p-panelmenu-panel-color | Color of panel |
| panelmenu.panel.padding | --p-panelmenu-panel-padding | Padding of panel |
| panelmenu.panel.border.radius | --p-panelmenu-panel-border-radius | Border radius of panel |
| panelmenu.panel.first.border.width | --p-panelmenu-panel-first-border-width | First border width of panel |
| panelmenu.panel.first.top.border.radius | --p-panelmenu-panel-first-top-border-radius | First top border radius of panel |
| panelmenu.panel.last.border.width | --p-panelmenu-panel-last-border-width | Last border width of panel |
| panelmenu.panel.last.bottom.border.radius | --p-panelmenu-panel-last-bottom-border-radius | Last bottom border radius of panel |
| panelmenu.item.focus.background | --p-panelmenu-item-focus-background | Focus background of item |
| panelmenu.item.color | --p-panelmenu-item-color | Color of item |
| panelmenu.item.focus.color | --p-panelmenu-item-focus-color | Focus color of item |
| panelmenu.item.gap | --p-panelmenu-item-gap | Gap of item |
| panelmenu.item.padding | --p-panelmenu-item-padding | Padding of item |
| panelmenu.item.border.radius | --p-panelmenu-item-border-radius | Border radius of item |
| panelmenu.item.icon.color | --p-panelmenu-item-icon-color | Icon color of item |
| panelmenu.item.icon.focus.color | --p-panelmenu-item-icon-focus-color | Icon focus color of item |
| panelmenu.item.icon.size | --p-panelmenu-item-icon-size | Icon size of item |
| panelmenu.item.label.font.weight | --p-panelmenu-item-label-font-weight | Font weight of item label |
| panelmenu.item.label.font.size | --p-panelmenu-item-label-font-size | Font size of item label |
| panelmenu.submenu.indent | --p-panelmenu-submenu-indent | Indent of submenu |
| panelmenu.submenu.icon.color | --p-panelmenu-submenu-icon-color | Color of submenu icon |
| panelmenu.submenu.icon.focus.color | --p-panelmenu-submenu-icon-focus-color | Focus color of submenu icon |

---
