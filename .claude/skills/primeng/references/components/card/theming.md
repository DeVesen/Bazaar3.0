# Angular Card Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| header | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the header's DOM element. |
| body | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the body's DOM element. |
| subtitle | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the subtitle's DOM element. |
| title | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the title's DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| footer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the footer's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-card | Class name of the root element |
| p-card-header | Class name of the header element |
| p-card-body | Class name of the body element |
| p-card-caption | Class name of the caption element |
| p-card-title | Class name of the title element |
| p-card-subtitle | Class name of the subtitle element |
| p-card-content | Class name of the content element |
| p-card-footer | Class name of the footer element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| card.background | --p-card-background | Background of root |
| card.border.radius | --p-card-border-radius | Border radius of root |
| card.color | --p-card-color | Color of root |
| card.shadow | --p-card-shadow | Shadow of root |
| card.body.padding | --p-card-body-padding | Padding of body |
| card.body.gap | --p-card-body-gap | Gap of body |
| card.caption.gap | --p-card-caption-gap | Gap of caption |
| card.title.font.size | --p-card-title-font-size | Font size of title |
| card.title.font.weight | --p-card-title-font-weight | Font weight of title |
| card.subtitle.color | --p-card-subtitle-color | Color of subtitle |
| card.subtitle.font.size | --p-card-subtitle-font-size | Font size of subtitle |
| card.subtitle.font.weight | --p-card-subtitle-font-weight | Font weight of subtitle |

---
