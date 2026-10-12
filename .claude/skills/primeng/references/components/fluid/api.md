# Angular Fluid Component — API

Fluid is a layout component to make descendant components span full width of their container.

## Fluid

Fluid is a layout component to make descendant components span full width of their container.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, FluidPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

## Accessibility

Screen Reader Fluid does not require any roles and attributes. Keyboard Support Component does not include any interactive elements.
