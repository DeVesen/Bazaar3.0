# Angular ConfirmPopup Component — API

ConfirmPopup displays a confirmation overlay displayed relatively to its target.

## Confirm Popup

ConfirmPopup displays a confirmation overlay displayed relatively to its target.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, ConfirmPopupPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| key | string \| undefined | - | Optional key to match the key of confirm object, necessary to use when component tree has multiple confirm dialogs. |
| defaultFocus | "accept" \| "reject" \| "none" | - | Element to receive the focus when the popup gets visible, valid values are "accept", "reject", and "none". |
| autoZIndex | boolean | - | Whether to automatically manage layering. |
| baseZIndex | number | - | Base zIndex value to use in layering. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| visible | boolean \| undefined | - | Defines if the component is visible. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |
| appendTo | HTMLElement \| ElementRef \| TemplateRef<any> \| "self" \| "body" \| null \| undefined | 'body' | Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name). |

### Templates

| Name | Type | Description |
|------|------|-------------|
| content | TemplateRef<ConfirmPopupContentTemplateContext> \| undefined | Custom content template. |
| accepticon | TemplateRef<void> \| undefined | Custom accept icon template. |
| rejecticon | TemplateRef<void> \| undefined | Custom reject icon template. |
| headless | TemplateRef<ConfirmPopupHeadlessTemplateContext> \| undefined | Custom headless template. |

## Accessibility

Screen Reader ConfirmPopup component uses alertdialog role and since any attribute is passed to the root element you may define attributes like aria-label or aria-labelledby to describe the popup contents. In addition aria-modal is added since focus is kept within the popup. It is recommended to use a trigger component that can be accessed with keyboard such as a button, if not adding tabIndex would be necessary. ConfirmPopup adds aria-expanded state attribute and aria-controls to the trigger so that the relation between the trigger and the popup is defined. Overlay Keyboard Support When the popup gets opened, the first focusable element receives the focus and this can be customized by adding autofocus to an element within the popup. Key Function tab Moves focus to the next the focusable element within the popup. shift + tab Moves focus to the previous the focusable element within the popup. escape Closes the popup and moves focus to the trigger. Buttons Keyboard Support Key Function enter Triggers the action, closes the popup and moves focus to the trigger. space Triggers the action, closes the popup and moves focus to the trigger.
