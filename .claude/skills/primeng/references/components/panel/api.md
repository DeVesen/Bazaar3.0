# Angular Panel Component — API

Panel is a container component with an optional content toggle feature.

## Panel

Panel is a container with the optional content toggle feature.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, PanelPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| toggleable | boolean | - | Defines if content of panel can be expanded and collapsed. |
| header | string \| undefined | - | Header text of the panel. |
| collapsed | boolean | - | Defines the initial state of panel content, supports one or two-way binding as well. |
| iconPos | "start" \| "end" \| "center" | - | Position of the icons. |
| showHeader | boolean | - | Specifies if header of panel cannot be displayed. |
| toggler | "icon" \| "header" | - | Specifies the toggler element to toggle the panel content. |
| toggleButtonProps | ButtonDirectiveOptions \| undefined | - | Configuration object forwarded to the toggle button. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onBeforeToggle | event: PanelBeforeToggleEvent | Callback to invoke before panel toggle. |
| onAfterToggle | event: PanelAfterToggleEvent | Callback to invoke after panel toggle. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Defines template option for header. |
| icon | TemplateRef<void> \| undefined | Defines template option for icon. |
| content | TemplateRef<void> \| undefined | Defines template option for content. |
| footer | TemplateRef<void> \| undefined | Defines template option for footer. |
| headericons | TemplateRef<PanelHeaderIconsTemplateContext> \| undefined | Defines template option for headerIcon. |

## Accessibility

Screen Reader Toggleable panels use a content toggle button at the header that has aria-controls to define the id of the content section along with aria-expanded for the visibility state. The value to read the button defaults to the value of the header property and can be customized by defining an aria-label or aria-labelledby via the toggleButtonProps property. The content uses region , defines an id that matches the aria-controls of the content toggle button and aria-labelledby referring to the id of the header. Content Toggle Button Keyboard Support Key Function tab Moves focus to the next the focusable element in the page tab sequence. shift + tab Moves focus to the previous the focusable element in the page tab sequence. enter Toggles the visibility of the content. space Toggles the visibility of the content.
