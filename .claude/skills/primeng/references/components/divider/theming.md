# Angular Divider Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-divider | Class name of the root element |
| p-divider-content | Class name of the content element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| divider.border.color | --p-divider-border-color | Border color of root |
| divider.content.background | --p-divider-content-background | Background of content |
| divider.content.color | --p-divider-content-color | Color of content |
| divider.horizontal.margin | --p-divider-horizontal-margin | Margin of horizontal |
| divider.horizontal.padding | --p-divider-horizontal-padding | Padding of horizontal |
| divider.horizontal.content.padding | --p-divider-horizontal-content-padding | Content padding of horizontal |
| divider.vertical.margin | --p-divider-vertical-margin | Margin of vertical |
| divider.vertical.padding | --p-divider-vertical-padding | Padding of vertical |
| divider.vertical.content.padding | --p-divider-vertical-content-padding | Content padding of vertical |

---
