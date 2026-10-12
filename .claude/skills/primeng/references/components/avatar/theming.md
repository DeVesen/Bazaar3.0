# Angular Avatar Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| label | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the label's DOM element. |
| icon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the icon's DOM element. |
| image | PassThroughOption<HTMLImageElement, I> | Used to pass attributes to the image's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-avatar | Class name of the root element |
| p-avatar-label | Class name of the label element |
| p-avatar-icon | Class name of the icon element |
| p-avatar-image | Container element in image mode |
| p-avatar-circle | Container element with a circle shape |
| p-avatar-lg | Container element with a large size |
| p-avatar-xl | Container element with an xlarge size |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| avatar.width | --p-avatar-width | Width of root |
| avatar.height | --p-avatar-height | Height of root |
| avatar.font.weight | --p-avatar-font-weight | Font weight of root |
| avatar.font.size | --p-avatar-font-size | Font size of root |
| avatar.background | --p-avatar-background | Background of root |
| avatar.color | --p-avatar-color | Color of root |
| avatar.border.radius | --p-avatar-border-radius | Border radius of root |
| avatar.icon.size | --p-avatar-icon-size | Size of icon |
| avatar.group.border.color | --p-avatar-group-border-color | Border color of group |
| avatar.group.offset | --p-avatar-group-offset | Offset of group |
| avatar.lg.width | --p-avatar-lg-width | Width of lg |
| avatar.lg.height | --p-avatar-lg-height | Height of lg |
| avatar.lg.font.size | --p-avatar-lg-font-size | Font size of lg |
| avatar.lg.icon.size | --p-avatar-lg-icon-size | Icon size of lg |
| avatar.lg.group.offset | --p-avatar-lg-group-offset | Group offset of lg |
| avatar.xl.width | --p-avatar-xl-width | Width of xl |
| avatar.xl.height | --p-avatar-xl-height | Height of xl |
| avatar.xl.font.size | --p-avatar-xl-font-size | Font size of xl |
| avatar.xl.icon.size | --p-avatar-xl-icon-size | Icon size of xl |
| avatar.xl.group.offset | --p-avatar-xl-group-offset | Group offset of xl |

---
