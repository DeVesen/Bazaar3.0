# Angular Fieldset Component — Pass Through, CSS-Klassen, Design Tokens

## Pass Through Options

| Name | Type | Description |
|------|------|-------------|
| root | PassThroughOption<HTMLFieldSetElement, I> | Used to pass attributes to the root's DOM element. |
| legend | PassThroughOption<HTMLLegendElement, I> | Used to pass attributes to the legend's DOM element. |
| toggleButton | PassThroughOption<HTMLButtonElement, I> | Used to pass attributes to the toggle button's DOM element. |
| toggleIcon | PassThroughOption<HTMLSpanElement \| SVGElement, I> | Used to pass attributes to the toggle icon's DOM element. |
| legendLabel | PassThroughOption<HTMLSpanElement, I> | Used to pass attributes to the legend label's DOM element. |
| contentContainer | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content container's DOM element. |
| contentWrapper | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content wrapper DOM element. |
| content | PassThroughOption<HTMLDivElement, I> | Used to pass attributes to the content's DOM element. |
| motion | MotionOptions | Used to pass options to the motion component/directive. |

## Theming

### CSS Classes

| Class | Description |
|-------|-------------|
| p-fieldset | Class name of the root element |
| p-fieldset-legend | Class name of the legend element |
| p-fieldset-legend-label | Class name of the legend label element |
| p-fieldset-toggle-icon | Class name of the toggle icon element |
| p-fieldset-content-container | Class name of the content container element |
| p-fieldset-content-wrapper | Class name of the content wrapper element |
| p-fieldset-content | Class name of the content element |

### Design Tokens

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| fieldset.background | --p-fieldset-background | Background of root |
| fieldset.border.color | --p-fieldset-border-color | Border color of root |
| fieldset.border.radius | --p-fieldset-border-radius | Border radius of root |
| fieldset.color | --p-fieldset-color | Color of root |
| fieldset.padding | --p-fieldset-padding | Padding of root |
| fieldset.transition.duration | --p-fieldset-transition-duration | Transition duration of root |
| fieldset.legend.background | --p-fieldset-legend-background | Background of legend |
| fieldset.legend.hover.background | --p-fieldset-legend-hover-background | Hover background of legend |
| fieldset.legend.color | --p-fieldset-legend-color | Color of legend |
| fieldset.legend.hover.color | --p-fieldset-legend-hover-color | Hover color of legend |
| fieldset.legend.border.radius | --p-fieldset-legend-border-radius | Border radius of legend |
| fieldset.legend.border.width | --p-fieldset-legend-border-width | Border width of legend |
| fieldset.legend.border.color | --p-fieldset-legend-border-color | Border color of legend |
| fieldset.legend.padding | --p-fieldset-legend-padding | Padding of legend |
| fieldset.legend.gap | --p-fieldset-legend-gap | Gap of legend |
| fieldset.legend.font.weight | --p-fieldset-legend-font-weight | Font weight of legend |
| fieldset.legend.font.size | --p-fieldset-legend-font-size | Font size of legend |
| fieldset.legend.focus.ring.width | --p-fieldset-legend-focus-ring-width | Focus ring width of legend |
| fieldset.legend.focus.ring.style | --p-fieldset-legend-focus-ring-style | Focus ring style of legend |
| fieldset.legend.focus.ring.color | --p-fieldset-legend-focus-ring-color | Focus ring color of legend |
| fieldset.legend.focus.ring.offset | --p-fieldset-legend-focus-ring-offset | Focus ring offset of legend |
| fieldset.legend.focus.ring.shadow | --p-fieldset-legend-focus-ring-shadow | Focus ring shadow of legend |
| fieldset.toggle.icon.color | --p-fieldset-toggle-icon-color | Color of toggle icon |
| fieldset.toggle.icon.hover.color | --p-fieldset-toggle-icon-hover-color | Hover color of toggle icon |
| fieldset.content.padding | --p-fieldset-content-padding | Padding of content |

---
