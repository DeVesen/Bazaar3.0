# Angular ConfirmDialog Component — API

ConfirmDialog is backed by a service utilizing Observables to display confirmation windows easily that can be shared by multiple actions on the same component.

## Confirm Dialog

ConfirmDialog uses a Dialog UI that is integrated with the Confirmation API.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ConfirmDialogPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| header | string \| undefined | - | Title text of the dialog. |
| icon | string \| undefined | - | Icon to display next to message. |
| message | string \| undefined | - | Message of the confirmation. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the element. |
| styleClass | string \| undefined | - | Class of the element. |
| maskStyleClass | string \| undefined | - | Specify the CSS class(es) for styling the mask element |
| acceptIcon | string \| undefined | - | Icon of the accept button. |
| acceptLabel | string \| undefined | - | Label of the accept button. |
| closeAriaLabel | string \| undefined | - | Defines a string that labels the close button for accessibility. |
| acceptAriaLabel | string \| undefined | - | Defines a string that labels the accept button for accessibility. |
| acceptVisible | boolean | - | Visibility of the accept button. |
| rejectIcon | string \| undefined | - | Icon of the reject button. |
| rejectLabel | string \| undefined | - | Label of the reject button. |
| rejectAriaLabel | string \| undefined | - | Defines a string that labels the reject button for accessibility. |
| rejectVisible | boolean | - | Visibility of the reject button. |
| acceptButtonStyleClass | string \| undefined | - | Style class of the accept button. |
| rejectButtonStyleClass | string \| undefined | - | Style class of the reject button. |
| closeOnEscape | boolean | - | Specifies if pressing escape key should hide the dialog. |
| dismissableMask | boolean \| undefined | - | Specifies if clicking the modal background should hide the dialog. |
| blockScroll | boolean | - | Determines whether scrolling behavior should be blocked within the component. |
| rtl | boolean | - | When enabled dialog is displayed in RTL direction. |
| closable | boolean | - | Adds a close icon to the header to hide the dialog. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'body' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |
| key | string \| undefined | - | Optional key to match the key of confirm object, necessary to use when component tree has multiple confirm dialogs. |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| maskMotionOptions | MotionOptions \| undefined | - | The motion options for the mask. |
| focusTrap | boolean | - | When enabled, can only focus on elements inside the confirm dialog. |
| defaultFocus | "accept" \| "reject" \| "close" \| "none" | - | Element to receive the focus when the dialog gets visible. |
| breakpoints | Record<string, string> \| undefined | - | Object literal to define widths per screen size. |
| modal | boolean | - | Defines if background should be blocked when dialog is displayed. |
| visible | boolean | - | Current visible state as a boolean. |
| position | "center" \| "top" \| "bottom" \| "left" \| "right" \| "topleft" \| "topright" \| "bottomleft" \| "bottomright" | - | Allows getting the position of the component. |
| draggable | boolean | - | Enables dragging to change the position using header. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onHide | event: ConfirmEventType \| undefined | Callback to invoke when dialog is hidden. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Custom header template. |
| footer | TemplateRef<void> \| undefined | Custom footer template. |
| rejecticon | TemplateRef<void> \| undefined | Custom reject icon template. |
| accepticon | TemplateRef<void> \| undefined | Custom accept icon template. |
| message | TemplateRef<ConfirmDialogMessageTemplateContext> \| undefined | Custom message template. |
| icon | TemplateRef<void> \| undefined | Custom icon template. |
| headless | TemplateRef<ConfirmDialogHeadlessTemplateContext> \| undefined | Custom headless template. |

## Accessibility

Screen Reader ConfirmDialog component uses alertdialog role along with aria-labelledby referring to the header element however any attribute is passed to the root element so you may use aria-labelledby to override this default behavior. In addition aria-modal is added since focus is kept within the popup. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. When confirm function is used and a trigger is passed as a parameter, ConfirmDialog adds aria-expanded state attribute and aria-controls to the trigger so that the relation between the trigger and the popup is defined. If the dialog is controlled with the visible property aria-expanded and aria-controls need to be handled explicitly. Overlay Keyboard Support Key Function tab Moves focus to the next the focusable element within the popup. shift + tab Moves focus to the previous the focusable element within the popup. escape Closes the popup and moves focus to the trigger. Buttons Keyboard Support Key Function enter Triggers the action, closes the popup and moves focus to the trigger. space Triggers the action, closes the popup and moves focus to the trigger.
