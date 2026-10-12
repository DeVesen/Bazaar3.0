# Angular Fieldset Component — API

Fieldset is a grouping component with a content toggle feature.

## Fieldset

Fieldset is a grouping component with the optional content toggle feature.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, FieldsetPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| legend | string \| undefined | - | Header text of the fieldset. |
| toggleable | boolean | false | When specified, content can toggled by clicking the legend. |
| collapsed | boolean | - | Defines the initial state of content, supports one or two-way binding as well. |
| style | { [klass: string]: any } \| null \| undefined | - | Inline style of the component. |
| styleClass | string \| undefined | - | Style class of the component. |
| motionOptions | MotionOptions \| undefined | - | The motion options. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onBeforeToggle | event: FieldsetBeforeToggleEvent | Callback to invoke before panel toggle. |
| onAfterToggle | event: FieldsetAfterToggleEvent | Callback to invoke after panel toggle. |

### Templates

| Name | Type | Description |
|------|------|-------------|
| header | TemplateRef<void> \| undefined | Custom header template. |
| toggleicon | TemplateRef<FieldsetToggleIconTemplateContext> \| undefined | Custom toggler icon template. |
| expandicon | TemplateRef<void> \| undefined | Custom expand icon template. |
| collapseicon | TemplateRef<void> \| undefined | Custom collapse icon template. |
| content | TemplateRef<void> \| undefined | Custom content template. |

## Accessibility

Screen Reader Fieldset component uses the semantic fieldset element. When toggleable option is enabled, a clickable element with button role is included inside the legend element, this button has aria-controls to define the id of the content section along with aria-expanded for the visibility state. The value to read the button defaults to the value of the legend property and can be customized by defining an aria-label or aria-labelledby via the toggleButtonProps property. The content uses region , defines an id that matches the aria-controls of the content toggle button and aria-labelledby referring to the id of the header. Content Toggle Button Keyboard Support Key Function tab Moves focus to the next the focusable element in the page tab sequence. shift + tab Moves focus to the previous the focusable element in the page tab sequence. enter Toggles the visibility of the content. space Toggles the visibility of the content.
