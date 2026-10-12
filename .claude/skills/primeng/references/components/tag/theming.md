# Angular Tag Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the root's DOM element. |
| icon | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the icon's DOM element. |
| label | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the label's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-tag | Class name of the root element |
| p-tag-icon | Class name of the icon element |
| p-tag-label | Class name of the label element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| tag.font.size | --p-tag-font-size | Font size of root |
| tag.font.weight | --p-tag-font-weight | Font weight of root |
| tag.padding | --p-tag-padding | Padding of root |
| tag.gap | --p-tag-gap | Gap of root |
| tag.border.radius | --p-tag-border-radius | Border radius of root |
| tag.rounded.border.radius | --p-tag-rounded-border-radius | Rounded border radius of root |
| tag.icon.size | --p-tag-icon-size | Size of icon |
| tag.primary.background | --p-tag-primary-background | Background of primary |
| tag.primary.color | --p-tag-primary-color | Color of primary |
| tag.secondary.background | --p-tag-secondary-background | Background of secondary |
| tag.secondary.color | --p-tag-secondary-color | Color of secondary |
| tag.success.background | --p-tag-success-background | Background of success |
| tag.success.color | --p-tag-success-color | Color of success |
| tag.info.background | --p-tag-info-background | Background of info |
| tag.info.color | --p-tag-info-color | Color of info |
| tag.warn.background | --p-tag-warn-background | Background of warn |
| tag.warn.color | --p-tag-warn-color | Color of warn |
| tag.danger.background | --p-tag-danger-background | Background of danger |
| tag.danger.color | --p-tag-danger-color | Color of danger |
| tag.contrast.background | --p-tag-contrast-background | Background of contrast |
| tag.contrast.color | --p-tag-contrast-color | Color of contrast |

---
