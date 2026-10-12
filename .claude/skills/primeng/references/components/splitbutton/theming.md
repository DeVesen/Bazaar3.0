# Angular SplitButton Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| pcButton | ButtonPassThrough | Used to pass attributes to the Button component. |
| pcDropdown | ButtonPassThrough | Used to pass attributes to the dropdown Button component. |
| pcMenu | MenuPassThrough | Used to pass attributes to the TieredMenu component. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-splitbutton | Class name of the root element |
| p-splitbutton-button | Class name of the button element |
| p-splitbutton-dropdown | Class name of the dropdown element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| splitbutton.border.radius | --p-splitbutton-border-radius | Border radius of root |
| splitbutton.rounded.border.radius | --p-splitbutton-rounded-border-radius | Rounded border radius of root |
| splitbutton.raised.shadow | --p-splitbutton-raised-shadow | Raised shadow of root |

---
