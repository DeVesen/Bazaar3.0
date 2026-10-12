# Angular CommandMenu Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| input | PassThroughOption<HTMLInputElement, I> | Used to pass attributes to the input's DOM element. |
| pcMenu | MenuPassThrough | Used to pass attributes to the Menu component. |
| emptyMessage | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the empty message's DOM element. |
| footer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the footer's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-commandmenu | Class name of the root element |
| p-commandmenu-header | Class name of the header element |
| p-commandmenu-input | Class name of the input element |
| p-commandmenu-empty-message | Class name of the empty message element |
| p-commandmenu-footer | Class name of the footer element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| commandmenu.background | --p-commandmenu-background | Background of root |
| commandmenu.border.color | --p-commandmenu-border-color | Border color of root |
| commandmenu.border.radius | --p-commandmenu-border-radius | Border radius of root |
| commandmenu.height | --p-commandmenu-height | Height of root |
| commandmenu.header.padding | --p-commandmenu-header-padding | Padding of header |
| commandmenu.header.background | --p-commandmenu-header-background | Background of header |
| commandmenu.header.border.color | --p-commandmenu-header-border-color | Border color of header |
| commandmenu.input.padding | --p-commandmenu-input-padding | Padding of input |
| commandmenu.input.font.size | --p-commandmenu-input-font-size | Font size of input |
| commandmenu.input.font.weight | --p-commandmenu-input-font-weight | Font weight of input |
| commandmenu.input.color | --p-commandmenu-input-color | Color of input |
| commandmenu.input.placeholder.color | --p-commandmenu-input-placeholder-color | Placeholder color of input |
| commandmenu.list.padding | --p-commandmenu-list-padding | Padding of list |
| commandmenu.empty.padding | --p-commandmenu-empty-padding | Padding of empty |
| commandmenu.empty.color | --p-commandmenu-empty-color | Color of empty |
| commandmenu.footer.padding | --p-commandmenu-footer-padding | Padding of footer |
| commandmenu.footer.background | --p-commandmenu-footer-background | Background of footer |
| commandmenu.footer.border.color | --p-commandmenu-footer-border-color | Border color of footer |

---
