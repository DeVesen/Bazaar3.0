# Overlay API - PrimeNG — API

This API allows overlay components to be controlled from the PrimeNG. In this way, all overlay components in the application can have the same behavior.

## Overlay

This API allows overlay components to be controlled from the PrimeNG. In this way, all overlay components in the application can have the same behavior.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | any | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| visible | boolean | false | The visible property is an input that determines the visibility of the component. |
| mode | string \| undefined | null | The mode property is an input that determines the overlay mode type or string. |
| style | { [klass: string]: any } \| null \| undefined | null | The style property is an input that determines the style object for the component. |
| styleClass | string \| undefined | null | The styleClass property is an input that determines the CSS class(es) for the component. |
| contentStyle | { [klass: string]: any } \| null \| undefined | null | The contentStyle property is an input that determines the style object for the content of the component. |
| contentStyleClass | string \| undefined | null | The contentStyleClass property is an input that determines the CSS class(es) for the content of the component. |
| target | string \| null \| undefined | null | The target property is an input that specifies the target element or selector for the component. |
| autoZIndex | boolean \| undefined | false | The autoZIndex determines whether to automatically manage layering. Its default value is 'false'. |
| baseZIndex | number \| undefined | null | The baseZIndex is base zIndex value to use in layering. |
| listener | any | null | The listener property is an input that specifies the listener object for the component. |
| responsive | ResponsiveOverlayOptions \| undefined | null | It is the option used to determine in which mode it should appear according to the given media or breakpoint. |
| options | OverlayOptions \| undefined | null | The options property is an input that specifies the overlay options for the component. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| inline | boolean | false | Specifies whether the overlay should be rendered inline within the current component's template. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onBeforeShow | event: OverlayOnBeforeShowEvent | Callback to invoke before the overlay is shown. |
| onShow | event: OverlayOnShowEvent | Callback to invoke when the overlay is shown. |
| onBeforeHide | event: OverlayOnBeforeHideEvent | Callback to invoke before the overlay is hidden. |
| onHide | event: OverlayOnHideEvent | Callback to invoke when the overlay is hidden |
| onAnimationStart | event: MotionEvent & AnimationEvent | Callback to invoke when the animation is started. |
| onAnimationDone | event: MotionEvent & AnimationEvent | Callback to invoke when the animation is done. |
| onBeforeEnter | event: MotionEvent | Callback to invoke before the overlay enters. |
| onEnter | event: MotionEvent | Callback to invoke when the overlay enters. |
| onAfterEnter | event: MotionEvent | Callback to invoke after the overlay has entered. |
| onBeforeLeave | event: MotionEvent | Callback to invoke before the overlay leaves. |
| onLeave | event: MotionEvent | Callback to invoke when the overlay leaves. |
| onAfterLeave | event: MotionEvent | Callback to invoke after the overlay has left. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<OverlayContentTemplateContext> \| undefined | Content template of the component. |

## Accessibility

Screen Reader Overlay component uses dialog role and since any attribute is passed to the root element you may define attributes like aria-label or aria-labelledby to describe the popup contents. In addition aria-modal is added since focus is kept within the popup. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. Overlay adds aria-expanded state attribute and aria-controls to the trigger so that the relation between the trigger and the popup is defined. Overlay Keyboard Support When the popup gets opened, the first focusable element receives the focus and this can be customized by adding autofocus to an element within the popup. Key Function tab Moves focus to the next the focusable element within the popup. shift + tab Moves focus to the previous the focusable element within the popup. escape Closes the popup and moves focus to the trigger. Close Button Keyboard Support Key Function enter Closes the popup and moves focus to the trigger. space Closes the popup and moves focus to the trigger.
