# Angular Dialog Component — API

Dialog is a container to display content in an overlay window.

## Dialog

Dialog is a container to display content in an overlay window.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, DialogPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| header | string \| undefined | - | Title text of the dialog. |
| draggable | boolean | - | Enables dragging to change the position using header. |
| resizable | boolean | - | Enables resizing of the content. |
| contentStyle | { [klass: string]: any } \| null \| undefined | - | Style of the content section. |
| contentStyleClass | string \| undefined | - | Style class of the content. |
| modal | boolean | - | Defines if background should be blocked when dialog is displayed. |
| closeOnEscape | boolean | - | Specifies if pressing escape key should hide the dialog. |
| dismissableMask | boolean | - | Specifies if clicking the modal background should hide the dialog. |
| rtl | boolean | - | When enabled dialog is displayed in RTL direction. |
| closable | boolean | - | Adds a close icon to the header to hide the dialog. |
| breakpoints | Record<string, string> \| undefined | - | Object literal to define widths per screen size. |
| styleClass | string \| undefined | - | Style class of the component. |
| maskStyleClass | string \| undefined | - | Style class of the mask. |
| maskStyle | { [klass: string]: any } \| null \| undefined | - | Style of the mask. |
| showHeader | boolean | - | Whether to show the header or not. |
| blockScroll | boolean | - | Whether background scroll should be blocked when dialog is visible. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| minX | number | - | Minimum value for the left coordinate of dialog in dragging. |
| minY | number | - | Minimum value for the top coordinate of dialog in dragging. |
| focusOnShow | boolean | - | When enabled, first focusable element receives focus on show. |
| maximizable | boolean | - | Whether the dialog can be displayed full screen. |
| keepInViewport | boolean | - | Keeps dialog in the viewport. |
| focusTrap | boolean | - | When enabled, can only focus on elements inside the dialog. |
| maskMotionOptions | MotionOptions \| undefined | - | The motion options for the mask. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| closeIcon | string \| undefined | - | Name of the close icon. |
| closeAriaLabel | string \| undefined | - | Defines a string that labels the close button for accessibility. |
| closeTabindex | string | - | Index of the close button in tabbing order. |
| minimizeIcon | string \| undefined | - | Name of the minimize icon. |
| maximizeIcon | string \| undefined | - | Name of the maximize icon. |
| closeButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the underlying button. |
| maximizeButtonProps | ButtonDirectiveOptions | - | Configuration object forwarded to the underlying button. |
| visible | boolean | - | Specifies the visibility of the dialog. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| position | DialogPosition \| undefined | - | Position of the dialog, options are "center", "top", "bottom", "left", "right", "topleft", "topright", "bottomleft" or "bottomright". |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'self' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| role | value: string | Role attribute of html element. |
| onShow | value: any | Callback to invoke when dialog is shown. |
| onHide | value: any | Callback to invoke when dialog is hidden. |
| onResizeInit | event: MouseEvent | Callback to invoke when dialog resizing is initiated. |
| onResizeEnd | event: MouseEvent | Callback to invoke when dialog resizing is completed. |
| onDragStart | event: MouseEvent | Callback to invoke when dialog dragging is initiated. |
| onDragEnd | event: DragEvent | Callback to invoke when dialog dragging is completed. |
| onMaximize | value: { maximized: boolean \| undefined } | Callback to invoke when dialog maximized or unmaximized. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<DialogHeaderTemplateContext> \| undefined | Custom header template. |
| content | TemplateRef<void> \| undefined | Custom content template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| closeicon | TemplateRef<void> \| undefined | Custom close icon template. |
| maximizeicon | TemplateRef<void> \| undefined | Custom maximize icon template. |
| minimizeicon | TemplateRef<void> \| undefined | Custom minimize icon template. |
| headless | TemplateRef<void> \| undefined | Custom headless template. |

## Accessibility

Screen Reader Dialog component uses dialog role along with aria-labelledby referring to the header element however any attribute is passed to the root element so you may use aria-labelledby to override this default behavior. In addition aria-modal is added since focus is kept within the popup. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. Trigger element also requires aria-expanded and aria-controls to be handled explicitly. Close element is a button with an aria-label that refers to the aria.close property of the locale API by default, you may use closeButtonProps to customize the element and override the default aria-label . Maximize element is a button with an aria-label that refers to the aria.maximizeLabel and aria.minimizeLabel property of the locale API. It cannot be customized using the maximizeButtonProps . Overlay Keyboard Support Key Function tab Moves focus to the next the focusable element within the dialog. shift + tab Moves focus to the previous the focusable element within the dialog. escape Closes the dialog if closeOnEscape is true. Close Button Keyboard Support Key Function enter Closes the dialog. space Closes the dialog.
