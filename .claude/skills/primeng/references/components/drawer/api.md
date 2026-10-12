# Angular Drawer Component — API

Drawer is a panel component displayed as an overlay at the edges of the screen.

## Drawer

Sidebar is a panel component displayed as an overlay at the edges of the screen.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DrawerPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| blockScroll | boolean | - | Whether to block scrolling of the document when drawer is active. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| ariaCloseLabel | string \| undefined | - | Aria label of the close icon. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| modal | boolean | - | Whether an overlay mask is displayed behind the drawer. |
| closeButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the close button. |
| dismissible | boolean | - | Whether to dismiss drawer on click of the mask. |
| showCloseIcon | boolean | - | Whether to display the close icon. **(Deprecated)** |
| closeOnEscape | boolean | - | Specifies if pressing escape key should hide the drawer. |
| visible | boolean | false | The visible property is an input that determines the visibility of the component. |
| position | "left" \| "right" \| "bottom" \| "top" \| "full" | 'left' | Specifies the position of the drawer, valid values are "left", "right", "bottom" and "top". |
| fullScreen | boolean | false | Adds a close icon to the header to hide the dialog. |
| header | string \| undefined | - | Title content of the dialog. |
| maskStyle | { [klass: string]: any } \| null \| undefined | - | Style of the mask. |
| closable | boolean | true | Whether to display close button. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onShow | value: any | Callback to invoke when dialog is shown. |
| onHide | value: any | Callback to invoke when dialog is hidden. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| content | TemplateRef<void> \| undefined | Custom content template. |
| closeicon | TemplateRef<void> \| undefined | Custom close icon template. |
| headless | TemplateRef<void> \| undefined | Custom headless template to replace the entire drawer content. |

## Accessibility

Screen Reader Drawer component uses complementary role by default, since any attribute is passed to the root element aria role can be changed depending on your use case and additional attributes like aria-labelledby can be added. In addition aria-modal is added since focus is kept within the drawer when opened. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. Trigger element also requires aria-expanded and aria-controls to be handled explicitly. Overlay Keyboard Support Key Function tab Moves focus to the next the focusable element within the drawer. shift + tab Moves focus to the previous the focusable element within the drawer. escape Closes the dialog if closeOnEscape is true. Close Button Keyboard Support Key Function enter Closes the drawer. space Closes the drawer.
