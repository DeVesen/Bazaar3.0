# Angular Dialog Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the root's DOM element. |
| mask | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the mask's DOM element. |
| resizeHandle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the resize handle's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| title | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the title's DOM element. |
| headerActions | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header actions' DOM element. |
| pcMaximizeButton | ButtonPassThrough | Used to pass attributes to the maximize Button component. |
| pcCloseButton | ButtonPassThrough | Used to pass attributes to the close Button component. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| footer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the footer's DOM element. |
| motion | MotionOptions | Used to pass motion options for the dialog animation. |
| maskMotion | MotionOptions | Used to pass motion options for the mask animation. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-dialog-mask | Class name of the mask element |
| p-dialog | Class name of the root element |
| p-dialog-header | Class name of the header element |
| p-dialog-title | Class name of the title element |
| p-dialog-header-actions | Class name of the header actions element |
| p-dialog-maximize-button | Class name of the maximize button element |
| p-dialog-close-button | Class name of the close button element |
| p-dialog-content | Class name of the content element |
| p-dialog-footer | Class name of the footer element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| dialog.background | --p-dialog-background | Background of root |
| dialog.border.color | --p-dialog-border-color | Border color of root |
| dialog.color | --p-dialog-color | Color of root |
| dialog.border.radius | --p-dialog-border-radius | Border radius of root |
| dialog.shadow | --p-dialog-shadow | Shadow of root |
| dialog.header.padding | --p-dialog-header-padding | Padding of header |
| dialog.header.gap | --p-dialog-header-gap | Gap of header |
| dialog.title.font.size | --p-dialog-title-font-size | Font size of title |
| dialog.title.font.weight | --p-dialog-title-font-weight | Font weight of title |
| dialog.content.padding | --p-dialog-content-padding | Padding of content |
| dialog.footer.padding | --p-dialog-footer-padding | Padding of footer |
| dialog.footer.gap | --p-dialog-footer-gap | Gap of footer |

---
