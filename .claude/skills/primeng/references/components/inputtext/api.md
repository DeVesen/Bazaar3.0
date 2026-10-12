# Angular InputText Component — API

InputText is an extension to standard input element with icons and theming.

## Input Text

InputText directive is an extension to standard input element with theming.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dt | object \| undefined | undefined | Defines scoped design tokens of the component. |
| unstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pt | PassThrough<I, InputTextPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the component. |
| ptOptions | PassThroughOptions \| undefined | undefined | Used to configure passthrough(pt) options of the component. |
| pInputTextPT | PassThrough<I, InputTextPassThroughOptions<I>> | undefined | Used to pass attributes to DOM elements inside the InputText component. |
| pInputTextUnstyled | boolean \| undefined | undefined | Indicates whether the component should be rendered without styles. |
| pSize | InputSize \| undefined | - | Defines the size of the component. |
| variant | InputVariant \| undefined | undefined | Specifies the input variant of the component. |
| fluid | boolean \| undefined | undefined | Spans 100% width of the container when enabled. |
| invalid | boolean \| undefined | false | When present, it specifies that the component should have invalid state style. |

## Accessibility

Screen Reader InputText component renders a native input element that implicitly includes any passed prop. Value to describe the component can either be provided via label tag combined with id prop or using aria-labelledby , aria-label props.
