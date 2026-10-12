# Angular Label Component — API

Label provides accessible text labels for form controls. Use the for attribute to link the label to a form control by its id.

## Label

Label directive is an extension to standard label element with theming.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, LabelPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

## Accessibility

Screen Reader Label renders a native label element. Use the for attribute to associate it with a form control id, or wrap the form control inside the label. Keyboard Support Component does not include any interactive elements.
