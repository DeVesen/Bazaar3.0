# Angular Ripple Component — API

Ripple directive adds ripple effect to the host element.

## Ripple

Ripple directive adds ripple effect to the host element.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | any | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

## Accessibility

Screen Reader Ripple element has the aria-hidden attribute as true so that it gets ignored by the screen readers. Keyboard Support Component does not include any interactive elements.
