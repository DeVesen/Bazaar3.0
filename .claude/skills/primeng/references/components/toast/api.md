# Angular Toast Component — API

Toast is used to display messages in an overlay.

## Toast

Toast is used to display messages in an overlay.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ToastPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| key | string \| undefined | - | Key of the message in case message is targeted to a specific toast component. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| life | number | - | The default time to display messages for in milliseconds. |
| position | "top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right" \| "center" | - | Position of the toast in viewport. |
| mode | "stacked" \| "expanded" | 'stacked' | Layout mode of the toast.  `stacked`  collapses toasts into a stack that expands on hover/focus;  `expanded`  always renders every toast expanded. |
| stackGap | number | - | Gap between stacked toast items in pixels. |
| stackVisibleLimit | number | - | Maximum number of visible toasts in the stack. |
| preventOpenDuplicates | boolean | - | It does not add the new message if there is already a toast displayed with the same content |
| preventDuplicates | boolean | - | Displays only once a message with the same content. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| breakpoints | ToastBreakpoints \| undefined | - | Object literal to define styles per screen size. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onClose | event: ToastCloseEvent | Callback to invoke when a message is closed. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| message | TemplateRef<ToastMessageTemplateContext> \| undefined | Custom message template. |
| headless | TemplateRef<ToastHeadlessTemplateContext> \| undefined | Custom headless template. |

## Accessibility

Screen Reader Toast component use alert role that implicitly defines aria-live as "assertive" and aria-atomic as "true". Close element is a button with an aria-label that refers to the aria.close property of the locale API by default. Close Button Keyboard Support Key Function enter Closes the message. space Closes the message.
