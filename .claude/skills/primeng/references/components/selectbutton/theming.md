# Angular SelectButton Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| pcToggleButton | ToggleButtonPassThrough | Used to pass attributes to the ToggleButton component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-selectbutton | Class name of the root element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| selectbutton.border.radius | --p-selectbutton-border-radius | Border radius of root |
| selectbutton.invalid.border.color | --p-selectbutton-invalid-border-color | Invalid border color of root |

---
