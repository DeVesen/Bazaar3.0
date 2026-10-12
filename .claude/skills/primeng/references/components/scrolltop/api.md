# Angular Scroll Top Component — API

ScrollTop gets displayed after a certain scroll position and used to navigates to the top of the page quickly.

## Scroll Top

ScrollTop gets displayed after a certain scroll position and used to navigates to the top of the page quickly.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ScrollTopPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| styleClass | string \| undefined | - | Class of the element. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the element. |
| target | "window" \| "parent" | - | Target of the ScrollTop. |
| threshold | number | - | Defines the threshold value of the vertical scroll position of the target to toggle the visibility. |
| _icon | string \| undefined | - | Name of the icon or JSX.Element for icon. |
| behavior | "auto" \| "smooth" | - | Defines the scrolling behavior, "smooth" adds an animation and "auto" scrolls with a jump. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| buttonAriaLabel | string \| undefined | - | Establishes a string value that labels the scroll-top button. |
| buttonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the underlying button. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| icon | TemplateRef<ScrollTopIconTemplateContext> \| undefined | Custom icon template. |

## Accessibility

Screen Reader ScrollTop uses a button element with an aria-label that refers to the aria.scrollTop property of the locale API by default, you may use your own aria roles and attributes as any valid attribute is passed to the button element implicitly.
