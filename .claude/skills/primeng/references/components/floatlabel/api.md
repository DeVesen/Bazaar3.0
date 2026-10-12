# Angular Float Label Component — API

FloatLabel appears on top of the input field when focused.

## Float Label

FloatLabel appears on top of the input field when focused.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, FloatLabelPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| variant | "in" \| "over" \| "on" | - | Defines the positioning of the label relative to the input. |

## Accessibility

Screen Reader FloatLabel does not require any roles and attributes. Keyboard Support Component does not include any interactive elements.
