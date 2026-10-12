# Angular Popover Component — API

Popover is a container component that can overlay other components on page.

## Popover

Popover is a container component that can overlay other components on page.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, PopoverPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| ariaLabel | string \| undefined | - | Defines a string that labels the input for accessibility. |
| ariaLabelledBy | string \| undefined | - | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| dismissable | boolean | - | Enables to hide the overlay when outside is clicked. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'body' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| ariaCloseLabel | string \| undefined | - | Aria label of the close icon. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| focusOnShow | boolean | - | When enabled, first button receives focus on show. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onShow | value: any | Callback to invoke when an overlay becomes visible. |
| onHide | value: any | Callback to invoke when an overlay gets hidden. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<PopoverContentTemplateContext> \| undefined | Custom content template. |

### Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| toggle | event: any, target: any | void | Toggles the visibility of the panel. |
| show | event: any, target: any | void | Displays the panel. |
| hide |  | void | Hides the panel. |

## Accessibility

Screen Reader Popover component uses dialog role and since any attribute is passed to the root element you may define attributes like aria-label or aria-labelledby to describe the popup contents. In addition aria-modal is added since focus is kept within the popup. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. Popover adds aria-expanded state attribute and aria-controls to the trigger so that the relation between the trigger and the popup is defined. Popover Keyboard Support When the popup gets opened, the first focusable element receives the focus and this can be customized by adding autofocus to an element within the popup. Key Function tab Moves focus to the next the focusable element within the popup. shift + tab Moves focus to the previous the focusable element within the popup. escape Closes the popup and moves focus to the trigger. Close Button Keyboard Support Key Function enter Closes the popup and moves focus to the trigger. space Closes the popup and moves focus to the trigger.
