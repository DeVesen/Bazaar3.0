# Angular Panel Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| title | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the title's DOM element. |
| headerActions | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header actions' DOM element. |
| pcToggleButton | ButtonPassThrough | Used to pass attributes to the toggle button button's DOM element. |
| contentContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content container's DOM element. |
| contentWrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content wrapper DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| footer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the footer's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-panel | Class name of the root element |
| p-panel-header | Class name of the header element |
| p-panel-title | Class name of the title element |
| p-panel-header-actions | Class name of the header actions element |
| p-panel-toggle-button | Class name of the toggle button element |
| p-panel-content-container | Class name of the content container element |
| p-panel-content-wrapper | Class name of the content wrapper element |
| p-panel-content | Class name of the content element |
| p-panel-footer | Class name of the footer element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| panel.background | --p-panel-background | Background of root |
| panel.border.color | --p-panel-border-color | Border color of root |
| panel.color | --p-panel-color | Color of root |
| panel.border.radius | --p-panel-border-radius | Border radius of root |
| panel.header.background | --p-panel-header-background | Background of header |
| panel.header.color | --p-panel-header-color | Color of header |
| panel.header.padding | --p-panel-header-padding | Padding of header |
| panel.header.border.color | --p-panel-header-border-color | Border color of header |
| panel.header.border.width | --p-panel-header-border-width | Border width of header |
| panel.header.border.radius | --p-panel-header-border-radius | Border radius of header |
| panel.toggleable.header.padding | --p-panel-toggleable-header-padding | Padding of toggleable header |
| panel.title.font.weight | --p-panel-title-font-weight | Font weight of title |
| panel.title.font.size | --p-panel-title-font-size | Font size of title |
| panel.content.padding | --p-panel-content-padding | Padding of content |
| panel.footer.padding | --p-panel-footer-padding | Padding of footer |

---
