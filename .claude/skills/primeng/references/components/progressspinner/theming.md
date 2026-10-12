# Angular ProgressSpinner Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| root | PassThroughOption<HTMLElement, I> | Used to pass attributes to the root's DOM element. |
| circle | PassThroughOption<SVGSVGElement, I> | Used to pass attributes to the circle SVG element. |
| circleTrack | PassThroughOption<SVGCircleElement, I> | Used to pass attributes to the circle track element. |
| circleRange | PassThroughOption<SVGCircleElement, I> | Used to pass attributes to the circle range element. |
| value | PassThroughOption<SVGTextElement, I> | Used to pass attributes to the value text element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-progressspinner | Class name of the root element |
| p-progressspinner-circle | Class name of the circle element |
| p-progressspinner-circle-track | Class name of the circle track element |
| p-progressspinner-circle-range | Class name of the circle range element |
| p-progressspinner-value | Class name of the value element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| progressspinner.color.one | --p-progressspinner-color-one | Color one of root |
| progressspinner.color.two | --p-progressspinner-color-two | Color two of root |
| progressspinner.color.three | --p-progressspinner-color-three | Color three of root |
| progressspinner.color.four | --p-progressspinner-color-four | Color four of root |

---
