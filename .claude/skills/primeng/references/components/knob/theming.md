# Angular Knob Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| host | PassThroughOption<HTMLElement, I> | Used to pass attributes to the host's DOM element. |
| svg | PassThroughOption<SVGElement, I> | Used to pass attributes to the SVG's DOM element. |
| range | PassThroughOption<SVGPathElement, I> | Used to pass attributes to the range's DOM element. |
| value | PassThroughOption<SVGPathElement, I> | Used to pass attributes to the value's DOM element. |
| text | PassThroughOption<SVGTextElement, I> | Used to pass attributes to the text's DOM element. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-knob | Class name of the root element |
| p-knob-range | Class name of the range element |
| p-knob-value | Class name of the value element |
| p-knob-text | Class name of the text element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| knob.transition.duration | --p-knob-transition-duration | Transition duration of root |
| knob.focus.ring.width | --p-knob-focus-ring-width | Focus ring width of root |
| knob.focus.ring.style | --p-knob-focus-ring-style | Focus ring style of root |
| knob.focus.ring.color | --p-knob-focus-ring-color | Focus ring color of root |
| knob.focus.ring.offset | --p-knob-focus-ring-offset | Focus ring offset of root |
| knob.focus.ring.shadow | --p-knob-focus-ring-shadow | Focus ring shadow of root |
| knob.value.background | --p-knob-value-background | Background of value |
| knob.range.background | --p-knob-range-background | Background of range |
| knob.text.color | --p-knob-text-color | Color of text |
| knob.text.font.size | --p-knob-text-font-size | Font size of text |
| knob.text.font.weight | --p-knob-text-font-weight | Font weight of text |

---
