# Angular Textarea Component — API

Textarea adds styling and autoResize functionality to standard textarea element.

## Textarea

Textarea adds styling and autoResize functionality to standard textarea element.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, TextareaPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| pTextareaPT | PassThrough<I, TextareaPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the Textarea component. |
| pTextareaUnstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| autoResize | boolean | - | When present, textarea size changes as being typed. |
| pSize | InputSize \| undefined | - | Defines the size of the component. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| invalid | boolean | false | When present, it specifies that the component should have invalid state style. |

### Emits

| Name | Parameters | Description |
|------|------------|-------------|
| onResize | event: {} \| Event | Callback to invoke on textarea resize. |

## Accessibility

Screen Reader Textarea component renders a native textarea element that implicitly includes any passed prop. Value to describe the component can either be provided via label tag combined with id prop or using aria-labelledby , aria-label props.
