# Angular IconField Component — API

IconField wraps an input and an icon.

## Icon Field

IconField wraps an input and an icon.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, IconFieldPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| iconPosition | "right" \| "left" | - | Position of the icon. |

## Accessibility

Screen Reader IconField and InputIcon does not require any roles and attributes. Keyboard Support Components does not include any interactive elements.
