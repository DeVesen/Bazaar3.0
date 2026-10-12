# Angular Compare Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| item | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the item's DOM element. |
| handle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the handle's DOM element. |
| indicator | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the indicator's DOM element. |
| input | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the input's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-compare | Class name of the root element |
| p-compare-item | Class name of the item element |
| p-compare-handle | Class name of the handle element |
| p-compare-indicator | Class name of the indicator element |
| p-compare-input | Class name of the input element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| compare.border.radius | --p-compare-border-radius | Border radius of root |
| compare.handle.background | --p-compare-handle-background | Background of handle (track) |
| compare.handle.size | --p-compare-handle-size | Size of handle (thickness; width when vertical, height when horizontal) |
| compare.indicator.size | --p-compare-indicator-size | Size of indicator (square width and height) |
| compare.indicator.background | --p-compare-indicator-background | Background of indicator |
| compare.indicator.border.radius | --p-compare-indicator-border-radius | Border radius of indicator |
| compare.indicator.focus.ring.width | --p-compare-indicator-focus-ring-width | Focus ring width of indicator |
| compare.indicator.focus.ring.style | --p-compare-indicator-focus-ring-style | Focus ring style of indicator |
| compare.indicator.focus.ring.color | --p-compare-indicator-focus-ring-color | Focus ring color of indicator |
| compare.indicator.focus.ring.offset | --p-compare-indicator-focus-ring-offset | Focus ring offset of indicator |
| compare.indicator.icon.color | --p-compare-indicator-icon-color | Icon color of indicator |
| compare.indicator.icon.size | --p-compare-indicator-icon-size | Icon size of indicator |

---
