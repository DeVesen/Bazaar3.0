# Angular Animate On Scroll Directive — API

AnimateOnScroll is used to apply animations to elements when entering or leaving the viewport during scrolling.

## Animate On Scroll

AnimateOnScroll is used to apply animations to elements when entering or leaving the viewport during scrolling.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| enterClass | string \| undefined | - | Selector to define the CSS class for enter animation. |
| leaveClass | string \| undefined | - | Selector to define the CSS class for leave animation. |
| root | HTMLElement \| null \| undefined | - | Specifies the root option of the IntersectionObserver API. |
| rootMargin | string \| undefined | - | Specifies the rootMargin option of the IntersectionObserver API. |
| threshold | number | - | Specifies the threshold option of the IntersectionObserver API |
| once | boolean | - | Whether the scroll event listener should be removed after initial run. |
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | any | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |

---

## Accessibility

Screen Reader AnimateOnScroll does not require any roles and attributes. Keyboard Support Component does not include any interactive elements.
